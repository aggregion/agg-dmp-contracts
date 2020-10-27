
const AggregionBlockchain = require('./AggregionBlockchain.js');
const TablesUtility = require('./TablesUtility.js');


class AggregionUtility {

    /**
     * @param {String} contractAccount
     * @param {AggregionBlockchain} blockchain
    */
    constructor(contractAccount, blockchain) {
        this.contractAccount = contractAccount;
        this.bc = blockchain;
        this.tables = new TablesUtility(contractAccount, blockchain);
    }

    async getOrganization(name) {
        const rows = await this.tables.getTableByPrimaryKey('orgs', name);
        return rows[0];
    }

    async isOrganizationExists(name) {
        let o = await this.getOrganization(name);
        return typeof o != 'undefined';
    };

    async getUser(name) {
        const rows = await this.tables.getTableByPrimaryKey('users', name);
        return rows[0];
    }

    async isUserExists(name) {
        let u = await this.getUser(name);
        return typeof u != 'undefined';
    };
};

module.exports = AggregionUtility;
