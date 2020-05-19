
const AggregionBlockchain = require('./AggregionBlockchain.js');


class AggregionUtility {

    /**
     * @param {AggregionBlockchain} blockchain
    */
    constructor(contractAccount, blockchain) {
        this.contractAccount = contractAccount;
        this.bc = blockchain;
    }

    async getTable(tableName) {
        // 1. Find all scopes of table
        let scopes = await this.bc.getScopes(this.contractAccount);
        let filtered = scopes.rows.filter(s => s.table == tableName);

        // 2. Fetch rows for each scope
        let rows = [];
        for (const item of filtered) {
            let data = await this.bc.getTableScope(this.contractAccount, tableName, item.scope);
            let scoped = data.rows.map(r => { r.scope = item.scope; return r; });
            rows.push(...scoped);
        };
        return rows;
    }

    async getProviders() {
        return await this.getTable('providers');
    }

    async getServices() {
        return await this.getTable('services');
    }

    async getScripts() {
        return await this.getTable('scripts');
    }

    async getApproves() {
        return await this.getTable('approves');
    }

    async getRequestsLog() {
        return await this.getTable('reqslog');
    }

    async getMarketCatalog() {
        return await this.getTable('mcat');
    }

    async getMarketCatalogItemById(id) {
        let items = await this.getMarketCatalog();
        return items.filter(s => s.id == id)[0];
    }

    async getProviderByName(name) {
        let providers = await this.getTable('providers');
        let theone = providers.filter(p => p.provider == name);
        return theone[0];
    }

    async isProviderExist(name) {
        let p = await this.getProviderByName(name);
        return typeof p != 'undefined';
    }

    async getService(provider, service) {
        let services = await this.getServices();
        return services.filter(s => s.scope == provider && s.service == service)[0];
    }

    async getScript(owner, script, version) {
        let scripts = await this.getScripts();
        return scripts.filter(s => s.scope == owner && s.script == script && s.version == version)[0];
    }

    async isScriptApproved(provider, owner, script, version) {
        let scriptObject = await this.getScript(owner, script, version);
        let approves = await this.getApproves();
        let approvalState = approves.filter(s => s.scope == provider && s.script_id == scriptObject.id)[0];
        return typeof approvalState != 'undefined' && approvalState.approved == 1;
    }
};

module.exports = AggregionUtility;
