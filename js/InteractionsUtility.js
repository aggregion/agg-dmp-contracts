const crypto = require('crypto');
const AggregionBlockchain = require('./AggregionBlockchain.js');
const TablesUtility = require('./TablesUtility.js');


class InteractionsUtility {

    /**
     * @param {String} contractAccount
     * @param {AggregionBlockchain} blockchain
    */
    constructor(contractAccount, blockchain) {
        this.contractAccount = contractAccount;
        this.bc = blockchain;
        this.tables = new TablesUtility(contractAccount, blockchain);
    }

    async getInteractionById(id) {
        const res = await this.bc.getTableRowsByIndex(this.contractAccount, 'interactions', 'default', 'primary', 'i64', id, id);
        return res.rows[0];
    }

    async getInteraction(owner, partner, interactionType) {
        const hash = crypto.createHash('sha256').update(owner + '-' + partner + '-' + interactionType).digest('hex');
        const result = await this.bc.getTableRowsByIndex(this.contractAccount, 'interactions', 'default', 2, 'sha256', hash, hash);
        return result.rows[0];
    }

    async getInteractionsByOwner(owner) {
        const hash = crypto.createHash('sha256').update(owner).digest('hex');
        const res = await this.bc.getTableRowsByIndex(this.contractAccount, 'interactions', 'default', 3, 'sha256', hash, hash);
        return res.rows;
    }

    async isInteractionExists(owner, partner, interactionType) {
        return undefined != await this.getInteraction(owner, partner, interactionType);
    }
};

module.exports = InteractionsUtility;
