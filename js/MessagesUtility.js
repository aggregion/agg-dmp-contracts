
const AggregionBlockchain = require('./AggregionBlockchain.js');
const TablesUtility = require('./TablesUtility.js');


class MessagesUtility {

    /**
     * @param {String} contractAccount
     * @param {AggregionBlockchain} blockchain
    */
    constructor(contractAccount, blockchain) {
        this.contractAccount = contractAccount;
        this.bc = blockchain;
        this.tables = new TablesUtility(contractAccount, blockchain);
    }

    async getMessageById(id) {
        const res = await this.getMessagesRange(id, id);
        return res[0];
    }

    async getMessagesAfter(id) {
        return await this.getMessagesRange(id + 1, 99_999_999_999);
    }

    async getMessagesBefore(id) {
        return await this.getMessagesRange(0, id - 1);
    }

    async getMessagesRange(from, to) {
        const res = await this.bc.getTableRowsByIndex(this.contractAccount, 'msgs', 'default', 'primary', 'i64', from, to);
        return res.rows;
    }
};

module.exports = MessagesUtility;
