
const AggregionBlockchain = require('./AggregionBlockchain.js');


class AggregionUtility {

    /**
     * @param {AggregionBlockchain} blockchain
    */
    constructor(contractAccount, blockchain) {
        this.contractAccount = contractAccount;
        this.bc = blockchain;
    }

    async getTable(tableName, id = null) {
        let scopes = await this.bc.getScopes(this.contractAccount, tableName);
        let rows = [];
        for (const item of scopes.rows) {
            let data = await this.bc.getTableRows(this.contractAccount, tableName, item.scope, id);
            let scoped = data.rows.map(r => { r.scope = item.scope; return r; });
            rows.push(...scoped);
        };
        return rows;
    }

    async getTableBySecondaryKey(tableName, keyValue) {
        let scopes = await this.bc.getScopes(this.contractAccount, tableName);
        let rows = [];
        for (const item of scopes.rows) {
            let data = await this.bc.getTableRowsBySecondaryKey(this.contractAccount, tableName, item.scope, keyValue, keyValue);
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

    async getCategories() {
        return await this.getTable('categories');
    }

    async getCategoryById(id) {
        const rows = await this.getTable('categories', id);
        return rows[0];
    }

    async getSubcategories(parentId) {
        return await this.getTableBySecondaryKey('categories', parentId);
    }

    async getCategoryPath(id) {
        let path = [null, null, null, null, null];
        while (true) {
            const rows = await this.getTable('categories', id);
            const category = rows[0];
            path.push(category.name);
            if (category.parent_id) {
                id = category.parent_id;
                continue;
            }
            break;
        }
        const base = path.length;
        return {
            a0: path[base - 1],
            a1: path[base - 2],
            a2: path[base - 3],
            a3: path[base - 4],
            a4: path[base - 5]
        };
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

    async getVendors() {
        return await this.getTable('vendors');
    }

    async getBrands() {
        return await this.getTable('brands');
    }

    async getRegions() {
        return await this.getTable('regions');
    }

    async getCityTypes() {
        return await this.getTable('citytypes');
    }

    async getCities() {
        return await this.getTable('cities');
    }

    async getRegionCities(region_id) {
        return await this.getTableBySecondaryKey('cities', region_id);
    }
};

module.exports = AggregionUtility;
