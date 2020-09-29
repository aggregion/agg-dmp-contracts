
const fs = require('fs');

class TestsConfig {
    constructor(path) {
        let rawdata = fs.readFileSync(path);
        let config = JSON.parse(rawdata);

        Object.assign(this, config);
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
