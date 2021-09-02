const check = require('check-types');

const AggregionBlockchain = require('./AggregionBlockchain.js');

class MessagesContract {
    
    /**
     * @param {EosioName} contractName
     * @param {AggregionBlockchain} blockchain
    */
    constructor(contractName, blockchain) {
        this.contractName = contractName;
        this.bc = blockchain;
        this.nonce = (n => () => n++)(0);
    }

    /**
     * Register new organization.
     * @param {permission} permission
     */
    async insertmsg(topic, sender, receiver, data, permission) {
        check.assert.assigned(topic, 'topic is required');
        check.assert.assigned(sender, 'sender is required');
        check.assert.assigned(data, 'data is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.message = {};
        request.message.topic = topic;
        request.message.sender = sender;
        request.message.receiver = receiver ?? '';
        request.message.data = data;
        request.nonce = this.nonce();
        return await this.bc.pushAction(this.contractName, "insertmsg", request, permission);
    }

    /**
     * Remove organization (without users).
     * @param {EosioName} name
     * @param {permission} permission
     */
    async removemsg(messageId, permission) {
        check.assert.assigned(messageId, 'messageId is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.message_id = messageId;
        return await this.bc.pushAction(this.contractName, "removemsg", request, permission);
    }

};

module.exports = MessagesContract;
