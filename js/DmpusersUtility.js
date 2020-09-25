
const AggregionBlockchain = require('./AggregionBlockchain.js');
const TablesUtility = require('./TablesUtility.js');
const check = require('check-types');


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
        return await this.tables.getTableByPrimaryKey('org', name);
    }

    async isOrganizationExists(name) {
        let o = await this.getOrganization(name);
        return o.length == 1;
    };

    async getUser(name) {
        return await this.tables.getTableByPrimaryKey('users', name);
    }

    async isUserExists(name) {
        let o = await this.getUser(name);
        return o.length == 1;
    };
};

module.exports = AggregionUtility;
