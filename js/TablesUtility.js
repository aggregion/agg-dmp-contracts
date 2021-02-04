
const check = require('check-types');
const AggregionBlockchain = require('./AggregionBlockchain.js');


class TablesUtility {

    /**
     * @param {AggregionBlockchain} blockchain
    */
    constructor(contractAccount, blockchain) {
        this.contractAccount = contractAccount;
        this.bc = blockchain;
    }

    async getTable(tableName, id = null) {
        check.assert.assigned(tableName, 'table name is required');
        let scopes = await this.bc.getScopes(this.contractAccount, tableName);
        let rows = [];
        for (const item of scopes.rows) {
            let data = await this.bc.getTableRows(this.contractAccount, tableName, item.scope, id);
            let scoped = data.rows.map(r => { r.scope = item.scope; return r; });
            rows.push(...scoped);
        };
        return rows;
    }

    async getTableScope(tableName, scope) {
        check.assert.assigned(tableName, 'table name is required');
        let rows = [];
        let data = await this.bc.getTableRows(this.contractAccount, tableName, scope);
        let scoped = data.rows.map(r => { r.scope = scope; return r; });
        rows.push(...scoped);
        return rows;
    }

    async getTableByPrimaryKey(tableName, id) {
        check.assert.assigned(tableName, 'tableName value is required');
        check.assert.assigned(id, 'id is required');
        return await this.getTable(tableName, id);
    }

    async getTableByIndex(tableName, indexPosition, keyType, keyValue) {
        check.assert.assigned(tableName, 'tableName value is required');
        check.assert.assigned(indexPosition, 'indexPosition value is required');
        check.assert.assigned(keyType, 'keyType is required');
        check.assert.assigned(keyValue, 'keyValue is required');
        let scopes = await this.bc.getScopes(this.contractAccount, tableName);
        let rows = [];
        for (const item of scopes.rows) {
            let data = await this.bc.getTableRowsByIndex(this.contractAccount, tableName, item.scope, indexPosition, keyType, keyValue, keyValue);
            let scoped = data.rows.map(r => { r.scope = item.scope; return r; });
            rows.push(...scoped);
        };
        return rows;
    }
};

module.exports = TablesUtility;
