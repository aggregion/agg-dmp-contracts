
const AggregionBlockchain = require('../js/AggregionBlockchain.js');
const MessagesContract = require('../js/MessagesContract.js');
const MessagesUtility = require('../js/MessagesUtility.js');
const AggregionNode = require('../js/AggregionNode.js');
const TestConfig = require('./TestConfig.js');
const tools = require('./TestTools.js');

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var assert = chai.assert;
var should = chai.should();


describe('Messages', function () {

    const config = new TestConfig(__dirname + '/config.json')
    const contractConfig = config.contracts.dmpusers;

    let node = new AggregionNode(config.getSignatureProvider(), config.node.executable, config.node.endpoint, config.node.workdir);
    let bc = new AggregionBlockchain(config.getNodeUrl(), [config.blockchain.eosio_root_key.private], config.debug);
    let util = new MessagesUtility(contractConfig.account, bc);
    let contract = new MessagesContract(contractConfig.account, bc);

    this.timeout(0);

    beforeEach(async function () {
        await node.start();
        const dmpusers = await tools.makeAccount(bc, contractConfig.account);
        await bc.deploy(dmpusers.account, contractConfig.wasm, contractConfig.abi, dmpusers.permission);
    });

    afterEach(async function () {
        await node.stop();
    });

    describe('#messages', function () {
        it('should accept empty receiver', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.insertmsg(1234, 'alice', null, 'data', alice.permission);
            const m = await util.getMessageById(0);
            assert.ok(m);
            assert.equal(m.message.topic, 1234);
            assert.equal(m.message.sender, 'alice');
            assert.isEmpty(m.message.receiver);
            assert.equal(m.message.data, 'data');
        });
        it('should find messages within specified range', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.insertmsg(100, 'alice', 'laura', 'data1', alice.permission); // #0
            await contract.insertmsg(111, 'alice', 'laura', 'data2', alice.permission); // #1
            await contract.insertmsg(122, 'alice', 'laura', 'data3', alice.permission); // #2
            await contract.insertmsg(133, 'alice', 'laura', 'data4', alice.permission); // #3
            {
                const res = await util.getMessagesRange(1, 4);
                assert.ok(res);
                assert.lengthOf(res, 3);
                assert.equal(res[0].message.topic, 111);
                assert.equal(res[1].message.topic, 122);
                assert.equal(res[2].message.topic, 133);
            }
            {
                const res = await util.getMessagesAfter(1);
                assert.ok(res);
                assert.lengthOf(res, 2);
                assert.equal(res[0].message.topic, 122);
                assert.equal(res[1].message.topic, 133);
            }
            {
                const res = await util.getMessagesBefore(2);
                assert.ok(res);
                assert.lengthOf(res, 2);
                assert.equal(res[0].message.topic, 100);
                assert.equal(res[1].message.topic, 111);
            }
        });
        it('should send message', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.insertmsg(1234, 'alice', 'laura', 'data', alice.permission);
            await contract.insertmsg(1234, 'alice', 'laura', 'data', alice.permission);
            await contract.insertmsg(1234, 'alice', 'laura', 'data', alice.permission);
            const m = await util.getMessageById(0);
            assert.ok(m);
            assert.equal(m.message.topic, 1234);
            assert.equal(m.message.sender, 'alice');
            assert.equal(m.message.receiver, 'laura');
            assert.equal(m.message.data, 'data');
        });
        it('should dissalow impersonate sender', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.insertmsg(1234, 'laura', 'alice', 'data', alice.permission)
                .should.be.rejectedWith('missing authority of laura');
        });
        it('sender can erase message', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.insertmsg(1234, 'alice', 'laura', 'data', alice.permission);
            await contract.removemsg(0, alice.permission);
            const m = await util.getMessageById(0);
            assert.isUndefined(m);
        });
        it('receiver can erase message', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            const laura = await tools.makeAccount(bc, 'laura');
            await contract.insertmsg(1234, 'alice', 'laura', 'data', alice.permission);
            await contract.removemsg(0, laura.permission);
            const m = await util.getMessageById(0);
            assert.isUndefined(m);
        });
        it('should deny to erase message for random user', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            const laura = await tools.makeAccount(bc, 'laura');
            const david = await tools.makeAccount(bc, 'david');
            await contract.insertmsg(1234, 'alice', 'laura', 'data', alice.permission);
            await contract.removemsg(0, david.permission)
                .should.be.rejectedWith('401. Access denied');
            const m = await util.getMessageById(0);
            assert.ok(m);
        });
    });
});
