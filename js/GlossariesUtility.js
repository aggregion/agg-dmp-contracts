const crypto = require('crypto');
const AggregionBlockchain = require('./AggregionBlockchain.js');
const TablesUtility = require('./TablesUtility.js');


class GlossariesUtility {

    /**
     * @param {String} contractAccount
     * @param {AggregionBlockchain} blockchain
    */
    constructor(contractAccount, blockchain) {
        this.contractAccount = contractAccount;
        this.bc = blockchain;
        this.tables = new TablesUtility(contractAccount, blockchain);
    }

    async getGlossaryById(glossaryId) {
        const rows = await this.tables.getTableByPrimaryKey('glossaries', glossaryId);
        return rows[0];
    }

    async isGlossaryExists(glossaryId) {
        const p = await this.getGlossaryById(glossaryId);
        return typeof p != 'undefined';
    }

    async getGlossariesByUpdateAt(lower, upper) {
        const result = await this.bc.getTableRowsByIndex(this.contractAccount, 'glossaries', 'default', 2, 'i64', lower, upper);
        return result.rows;
    }

    async getGlossariesBySender(senderOrgId) {
        const result = await this.bc.getTableRowsByIndex(this.contractAccount, 'glossaries', 'default', 3, 'i64', senderOrgId, senderOrgId);
        return result.rows;
    }

    async getGlossariesByReceiver(receiverOrgId) {
        const result = await this.bc.getTableRowsByIndex(this.contractAccount, 'glossaries', 'default', 4, 'i64', receiverOrgId, receiverOrgId);
        return result.rows;
    }
};

module.exports = GlossariesUtility;
