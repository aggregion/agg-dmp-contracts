
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
        return await this.tables.getTable('approves');
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
        return await this.tables.getTable('vendors');
    }

    async getBrands() {
        return await this.tables.getTable('brands');
    }

    async getRegions() {
        return await this.tables.getTable('regions');
    }

    async getCityTypes() {
        return await this.tables.getTable('citytypes');
    }

    async getCities() {
        return await this.tables.getTable('cities');
    }

    async getRegionCities(region_id) {
        return await this.tables.getTableBySecondaryKey('cities', region_id);
    }
};

module.exports = AggregionUtility;
