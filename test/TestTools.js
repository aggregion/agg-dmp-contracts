const AggregionBlockchain = require('../js/AggregionBlockchain.js');


class TestAccount {
    constructor(name, publicKey, privateKey) {
        this.account = name;
        this.publicKey = publicKey;
        this.privateKey = privateKey;
        this.permission = name + '@active';
    }
};

module.exports = {
    /**
     *
     * @param {AggregionBlockchain} blockchain
     * @param {String} name
     * @returns {TestAccount}
     */
    makeAccount: async function (blockchain, name) {
        const pair = await AggregionBlockchain.createKeyPair();
        const ownerKey = pair.publicKey;
        const activeKey = ownerKey;
        await blockchain.newaccount('eosio', name, ownerKey, activeKey, 'eosio@active');
        await blockchain.addPrivateKey(pair.privateKey);
        return new TestAccount(name, ownerKey, pair.privateKey);
    }
};
