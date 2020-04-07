const fetch = require('node-fetch');
const { Api, JsonRpc } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');
const { TextEncoder, TextDecoder } = require('util');


class AggregionBlockchain {

    constructor(nodeUrl, privateKeys) {
        this.signatureProvider = new JsSignatureProvider(privateKeys);
        this.rpc = new JsonRpc(nodeUrl, { fetch });
        this.api = new Api({ rpc: this.rpc, signatureProvider: this.signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
    }

    async getScopes(contractAccount) {
        return await this.rpc.fetch('/v1/chain/get_table_by_scope', { code: contractAccount });
    }

    async getTableScope(contractAccount, tableName, scopeName) {
        return await this.rpc.get_table_rows({
            code: contractAccount,
            scope: scopeName,
            table: tableName,
            limit: '-1'
        });
    }

    async pushAction(contractAccount, actionName, requestObject, permission) {
        let [actorName, permissionLevel] = permission.split('@');
        requestObject.vmtype = 0;
        requestObject.vmversion = 0;
        return await this.api.transact({
            actions: [
                {
                    account: contractAccount,
                    name: actionName,
                    authorization: [
                        {
                            actor: actorName,
                            permission: permissionLevel,
                        },
                    ],
                    data: requestObject,
                }
            ],
        }, {
            blocksBehind: 3,
            expireSeconds: 30,
        });
    }

};

module.exports = AggregionBlockchain;
