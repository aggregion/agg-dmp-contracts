
const fs = require('fs');

class TestsConfig {
    constructor(path) {
        let rawdata = fs.readFileSync(path);
        let config = JSON.parse(rawdata);

        this.credentials = config.credentials;
        this.testnet = config.testnet;
    }
};

module.exports = TestsConfig;
