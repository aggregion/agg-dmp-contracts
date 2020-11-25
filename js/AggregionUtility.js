const crypto = require('crypto');
const check = require('check-types');
const AggregionBlockchain = require('./AggregionBlockchain.js');
const TablesUtility = require('./TablesUtility.js');


class AggregionUtility {

    /**
     * @param {AggregionBlockchain} blockchain
    */
    constructor(contractAccount, blockchain) {
        this.contractAccount = contractAccount;
        this.bc = blockchain;
        this.tables = new TablesUtility(contractAccount, blockchain);
    }

    async getProviders() {
        return await this.tables.getTable('providers');
    }

    async getServices() {
        return await this.tables.getTable('services');
    }

    async getScripts() {
        return await this.tables.getTable('scripts');
    }

    async getApproves() {
        return await this.tables.getTable('scriptapprvs');
    }

    async getRequestsLog() {
        return await this.tables.getTable('reqslog');
    }

    async getProviderByName(name) {
        let data = await this.bc.getTableRows(this.contractAccount, 'providers', 'default', name);
        let scoped = data.rows.map(r => { r.scope = name; return r; });
        return scoped[0];
    }

    async isProviderExists(name) {
        let p = await this.getProviderByName(name);
        return typeof p != 'undefined';
    }

    async getService(provider, service) {
        let services = await this.getServices();
        return services.filter(s => s.scope === provider && s.service === service)[0];
    }

    async getScript(owner, script, version) {
        const hash = crypto.createHash('sha256').update(owner + script + version).digest('hex');
        const result = await this.bc.getTableRowsByIndex(this.contractAccount, 'scripts', 'default', 2, 'sha256', hash, hash);
        return result.rows[0];
    }

    async getScriptByHash(hash) {
        return await this.tables.getTableByIndex('scripts', 3, 'sha256', hash);
    }

    async isTrusted(truster, trustee) {
        const result = await this.bc.getTableRows(this.contractAccount, 'trustedprov', truster, trustee);
        const item = result.rows[0];
        return typeof item != 'undefined' && item.trust === 1;
    }

    async isScriptApprovedBy(provider, hash) {
        const script = await this.getScriptByHash(hash);
        const result = await this.bc.getTableRows(this.contractAccount, 'approves', provider, script.id);
        check.assert.lessOrEqual(result.rows.length, 1);
        const item = result.rows[0];
        return typeof item != 'undefined' && item.approved === 1;
    }

    async isScriptAccessGrantedTo(grantee, hash) {
        const script = await this.getScriptByHash(hash);
        const result = await this.bc.getTableRows(this.contractAccount, 'scriptaccess', grantee, script.id);
        check.assert.lessOrEqual(result.rows.length, 1);
        const item = result.rows[0];
        return typeof item == 'undefined' || item.granted === 1;
    }
};

module.exports = AggregionUtility;
