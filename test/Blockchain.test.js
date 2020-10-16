
const AggregionBlockchain = require('../js/AggregionBlockchain.js');
const AggregionNode = require('../js/AggregionNode.js');

const TestConfig = require('./TestConfig.js');

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const check = require('check-types');
chai.use(chaiAsPromised);
var assert = chai.assert;
var should = chai.should();


describe('AggregionBlockchain', function () {

    const config = new TestConfig(__dirname + '/config.json')

    let node = new AggregionNode(config.getSignatureProvider(), config.node.endpoint, config.node.workdir);
    let bc = new AggregionBlockchain(config.getNodeUrl(), [config.blockchain.eosio_root_key.private], config.debug);

    this.timeout(0);

    beforeEach(async function () {
        await node.start();
    });

    afterEach(async function () {
        await node.stop();
    });

    describe('#newaccount', function () {
        it('account can create another account ', async () => {
            const ak = await AggregionBlockchain.createKeyPair();
            await bc.newaccount('eosio', 'alice', ak.publicKey, ak.publicKey, 'eosio@active');
            bc.addPrivateKey(ak.privateKey);

            const bk = await AggregionBlockchain.createKeyPair();
            await bc.newaccount('alice', 'bob', bk.publicKey, bk.publicKey, 'alice@active');

            const bob = await bc.getAccount('bob');
            assert.equal(bob.account_name, 'bob');
        });
    });
});
