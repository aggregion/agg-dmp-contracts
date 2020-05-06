
const fs = require('fs');

class TestsConfig {
    constructor(path) {
        let rawdata = fs.readFileSync(path);
        let config = JSON.parse(rawdata);

        this.node = config.node;
        this.blockchain = config.blockchain;
        this.contract = config.contract;
    }

    getNodeUrl() {
        return "http://" + this.node.endpoint;
    }

    getSignatureProvider() {
        const pub = this.blockchain.eosio_root_key.public;
        const prv = this.blockchain.eosio_root_key.private;
        return pub + '=KEY:' + prv;
    }
};

module.exports = TestsConfig;
