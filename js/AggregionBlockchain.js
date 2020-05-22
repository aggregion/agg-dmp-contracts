const fs = require('fs');
const fetch = require('node-fetch');
const { Api, JsonRpc, Numeric } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');
const { TextEncoder, TextDecoder } = require('util');
const Serialize = require('eosjs/dist/eosjs-serialize');
const ecc = require('eosjs-ecc')

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


class AggregionBlockchain {


    constructor(nodeUrl, privateKeys, maxTransactionAttempt = 4) {
        this.maxTransactionAttempt = maxTransactionAttempt;
        this.signatureProvider = new JsSignatureProvider(privateKeys);
        this.rpc = new JsonRpc(nodeUrl, { fetch });
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

    async addPrivateKey(privateKey) {
        const legacyPublicKey = ecc.PrivateKey.fromString(privateKey).toPublic();
        const publicKey = Numeric.convertLegacyPublicKey(legacyPublicKey.toString());
        this.signatureProvider.keys.set(publicKey, privateKey);
        this.signatureProvider.availableKeys.push(publicKey);
    }


    async getScopes(contractAccount) {
        return await this.rpc.fetch('/v1/chain/get_table_by_scope', { code: contractAccount });
    }

    async getTableScope(contractAccount, tableName, scopeName, id = null) {
        let result = {
            rows: []
        };
        let lowerBound = id;
        let upperBound = id;
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

    async pushAction(contractAccount, actionName, requestObject, permission) {
        let [actorName, permissionLevel] = permission.split('@');
        let attempt = 0;
        while (true) {
            try {
                await this.api.transact({
                    actions: [{
                        account: contractAccount,
                        name: actionName,
                        authorization: [{ actor: actorName, permission: permissionLevel }],
                        data: requestObject,
                    }]
                }, { blocksBehind: 1, expireSeconds: 30 });
                break;
            }
            catch (exc) {
                const deadline = exc.message.match("deadline.*exceeded");
                if (attempt < this.maxTransactionAttempt && deadline) {
                    attempt++;
                    continue;
                }
                throw exc;
            }
        }
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

    async newaccount(creatorName, accountName, ownerKey, activeKey, permission) {
        await this.pushAction(creatorName, 'newaccount', {
            creator: creatorName,
            name: accountName,
            owner: {
                threshold: 1,
                keys: [{
                    key: ownerKey,
                    weight: 1
                }],
                accounts: [],
                waits: []
            },
            active: {
                threshold: 1,
                keys: [{
                    key: activeKey,
                    weight: 1
                }],
                accounts: [],
                waits: []
            },
        }, permission);
    }

};

module.exports = AggregionBlockchain;
