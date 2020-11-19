const fs = require('fs');
const { proxyFetch } = require('./Fetch');
const { Api, JsonRpc, Numeric } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');
const { TextEncoder, TextDecoder } = require('util');
const Serialize = require('eosjs/dist/eosjs-serialize');
const ecc = require('eosjs-ecc')
const check = require('check-types');

class AggregionBlockchainUtility {

    constructor(api) {
        this.api = api;
    }

    async serializeAbi(text) {
        let json = JSON.parse(text);
        const buffer = new Serialize.SerialBuffer({
            textEncoder: this.api.textEncoder,
            textDecoder: this.api.textDecoder,
        });
        const abiDefinitions = this.api.abiTypes.get('abi_def');
        json = abiDefinitions.fields.reduce(
            (acc, { name: fieldName }) =>
                Object.assign(acc, { [fieldName]: acc[fieldName] || [] }),
            json,
        );
        abiDefinitions.serialize(buffer, json);
        return Buffer.from(buffer.asUint8Array()).toString('hex');
    }

};

const requests = {

    newaccount: function (creator, name, owner, active) {
        return {
            creator: creator,
            name: name,
            owner: {
                threshold: 1,
                keys: [{
                    key: owner,
                    weight: 1
                }],
                accounts: [],
                waits: []
            },
            active: {
                threshold: 1,
                keys: [{
                    key: active,
                    weight: 1
                }],
                accounts: [],
                waits: []
            }
        };
    },

    delegatebw: function (from, receiver, net, cpu, transfer) {
        return {
            from: from,
            receiver: receiver,
            stake_net_quantity: net,
            stake_cpu_quantity: cpu,
            transfer: transfer,
        };
    },

    buyrambytes: function (payer, receiver, bytes) {
        return {
            payer: payer,
            receiver: receiver,
            bytes: bytes
        };
    }
};


class AggregionBlockchain {


    constructor(nodeUrl, privateKeys, debug = false, maxTransactionAttempt = 4) {
        check.assert.nonEmptyString(nodeUrl, 'node url must be specified');
        this.debug = debug;
        this.maxTransactionAttempt = maxTransactionAttempt;
        this.signatureProvider = new JsSignatureProvider(privateKeys);
        this.rpc = new JsonRpc(nodeUrl, { fetch: proxyFetch() });
        this.api = new Api({ rpc: this.rpc, signatureProvider: this.signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
        this.utility = new AggregionBlockchainUtility(this.api);
    }

    static async createKeyPair() {
        const privateKey = await ecc.randomKey();
        return {
            privateKey,
            publicKey: ecc.privateToPublic(privateKey)
        };
    }

    async getAccount(name) {
        return await this.rpc.get_account(name);
    }

    async addPrivateKey(privateKey) {
        const legacyPublicKey = ecc.PrivateKey.fromString(privateKey).toPublic();
        const publicKey = Numeric.convertLegacyPublicKey(legacyPublicKey.toString());
        this.signatureProvider.keys.set(publicKey, privateKey);
        this.signatureProvider.availableKeys.push(publicKey);
    }

    async getScopes(contractAccount, tableName = null) {
        let result = {
            rows: []
        };
        let lowerBound = null;
        while (true) {
            const part = await this.rpc.fetch('/v1/chain/get_table_by_scope', { code: contractAccount, table: tableName, lower_bound: lowerBound });
            if (!part)
                break;
            const rows = part.rows.filter(s => !s.table.match("^.{12}[0-9]$"));
            result.rows.push(...rows);
            lowerBound = part.next_key;
            if (!part.more)
                break;
        }
        return result;
    }

    async getTableRows(contractAccount, tableName, scopeName, primaryKeyValue = null) {
        let result = {
            rows: []
        };
        let lowerBound = primaryKeyValue;
        let upperBound = primaryKeyValue;
        while (true) {
            const part = await this.rpc.get_table_rows({
                code: contractAccount,
                scope: scopeName,
                table: tableName,
                lower_bound: lowerBound,
                upper_bound: upperBound,
                limit: '-1'
            });
            result.rows.push(...part.rows);
            lowerBound = part.next_key;
            if (!part.more)
                break;
        }
        return result;
    }

    async getTableRowsByIndex(contractAccount, tableName, scopeName, indexPosition, keyType, fromKey, toKey) {
        let result = {
            rows: []
        };
        let lowerBound = fromKey;
        let upperBound = toKey;
        while (true) {
            const part = await this.rpc.fetch('/v1/chain/get_table_rows', {
                code: contractAccount,
                scope: scopeName,
                table: tableName,
                index_position: indexPosition,
                key_type: keyType,
                lower_bound: lowerBound,
                upper_bound: upperBound,
                json: true,
                limit: '-1'
            });
            result.rows.push(...part.rows);
            lowerBound = part.next_key;
            if (!part.more)
                break;
        }
        return result;
    }

    createAction(contract, name, req, permission) {
        let [actorName, permissionLevel] = permission.split('@');
        return {
            account: contract,
            name: name,
            authorization: [{ actor: actorName, permission: permissionLevel }],
            data: req,
        };
    }

    async pushTransaction(actions) {
        let attempt = 0;
        while (true) {
            try {
                const txinfo = await this.api.transact({
                    actions: actions
                }, { blocksBehind: 1, expireSeconds: 30 });
                if (this.debug) {
                    txinfo.processed.action_traces.forEach(trace => {
                        if (trace.console) {
                            console.error(trace.console);
                        }
                    });
                }
                break;
            }
            catch (exc) {
                if (this.debug) {
                    console.error(exc.message);
                }
                const deadline = exc.message.match("deadline.*exceeded");
                if (attempt < this.maxTransactionAttempt && deadline) {
                    attempt++;
                    continue;
                }
                throw exc;
            }
        }
    }

    async pushAction(contract, name, req, permission) {
        const action = this.createAction(contract, name, req, permission);
        await this.pushTransaction([action]);
    }

    async deploy(contractAccount, wasmPath, abiPath, permission) {
        const wasmHexString = fs.readFileSync(wasmPath).toString('hex');
        await this.pushAction('eosio', 'setcode', {
            account: contractAccount,
            code: wasmHexString,
            vmtype: 0,
            vmversion: 0
        }, permission);

        const abiText = fs.readFileSync(abiPath, 'utf8');
        const abiHexString = await this.utility.serializeAbi(abiText);
        await this.pushAction('eosio', 'setabi', {
            account: contractAccount,
            abi: abiHexString
        }, permission);
    }

    async newaccount(creator, name, owner, active, permission) {
        const nar = requests.newaccount(creator, name, owner, active);
        const act = this.createAction('eosio', 'newaccount', nar, permission);
        await this.pushTransaction([act]);
    }

    async newaccountram(creator, name, owner, active, net, cpu, transfer, bytes, permission) {
        const nar = requests.newaccount(creator, name, owner, active);
        const dbr = requests.delegatebw(creator, name, net, cpu, transfer);
        const brr = requests.buyrambytes(creator, name, bytes);

        const acts = [];
        acts.push(this.createAction('eosio', 'newaccount', nar, permission));
        acts.push(this.createAction('eosio', 'delegatebw', dbr, permission));
        acts.push(this.createAction('eosio', 'buyrambytes', brr, permission));
        await this.pushTransaction(acts);
    }
};

module.exports = AggregionBlockchain;
