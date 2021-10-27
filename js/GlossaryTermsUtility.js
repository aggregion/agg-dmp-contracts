const crypto = require('crypto');
const AggregionBlockchain = require('./AggregionBlockchain.js');
const TablesUtility = require('./TablesUtility.js');


class GlossaryTermsUtility {

    /**
     * @param {String} contractAccount
     * @param {AggregionBlockchain} blockchain
    */
    constructor(contractAccount, blockchain) {
        this.contractAccount = contractAccount;
        this.bc = blockchain;
        this.tables = new TablesUtility(contractAccount, blockchain);
    }

    async getGlossaryTermById(glossaryId) {
        const rows = await this.tables.getTableByPrimaryKey('glterms', glossaryId);
        return rows[0];
    }

    async isGlossaryTermExists(glossaryId) {
        const p = await this.getGlossaryTermById(glossaryId);
        return typeof p != 'undefined';
    }

    async getGlossaryTermsByUpdateAt(lower, upper) {
        const result = await this.bc.getTableRowsByIndex(this.contractAccount, 'glterms', 'default', 2, 'i64', lower, upper);
        return result.rows;
    }

    async getGlossaryTermsBySender(senderOrgId) {
        const result = await this.bc.getTableRowsByIndex(this.contractAccount, 'glterms', 'default', 3, 'i64', senderOrgId, senderOrgId);
        return result.rows;
    }

    async getGlossaryTermsByReceiver(receiverOrgId) {
        const result = await this.bc.getTableRowsByIndex(this.contractAccount, 'glterms', 'default', 4, 'i64', receiverOrgId, receiverOrgId);
        return result.rows;
    }
};

module.exports = GlossaryTermsUtility;
