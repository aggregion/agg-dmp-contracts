
const AggregionBlockchain = require('../js/AggregionBlockchain.js');
const AggregionNode = require('../js/AggregionNode.js');
const AggregionContract = require('../js/AggregionContract.js');
const AggregionUtility = require('../js/AggregionUtility.js');
const TestConfig = require('./TestConfig.js');
const tools = require('./TestTools.js');

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const check = require('check-types');
chai.use(chaiAsPromised);
var assert = chai.assert;
var should = chai.should();

describe('Aggregion', function () {

    const config = new TestConfig(__dirname + '/config.json')
    const contractConfig = config.contracts.aggregion;

    let node = new AggregionNode(config.getSignatureProvider(), config.node.executable, config.node.endpoint, config.node.workdir);
    let bc = new AggregionBlockchain(config.getNodeUrl(), [config.blockchain.eosio_root_key.private], config.debug);
    let contract = new AggregionContract(contractConfig.account, bc);
    let util = new AggregionUtility(contractConfig.account, bc);
    let aggregion = null;

    this.timeout(0);

    beforeEach(async function () {
        await node.start();
        aggregion = await tools.makeAccount(bc, contractConfig.account);
        await bc.deploy(aggregion.account, contractConfig.wasm, contractConfig.abi, aggregion.permission);
    });

    afterEach(async function () {
        await node.stop();
    });

    describe('#providers', function () {
        it('should register new unique provider', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.regprov(alice.account, 'Alice provider', alice.permission);
            (await util.isProviderExists(alice.account))
                .should.be.true;
        });

        it('should not register provider if it already registered', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.regprov(alice.account, 'Alice provider', alice.permission);
            await contract.regprov(alice.account, 'Alice provider', alice.permission)
                .should.be.rejected;
        });

        it('should update description of provider', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            {
                await contract.regprov(alice.account, 'Description One', alice.permission);
                let prov = await util.getProviderByName(alice.account);
                prov.description.should.be.eq('Description One');
            }
            {
                await contract.updprov(alice.account, 'Description Two', alice.permission);
                let prov = await util.getProviderByName(alice.account);
                prov.description.should.be.eq('Description Two');
            }
        });

        it('should remove existing provider', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            {
                await contract.regprov(alice.account, 'Alice provider', alice.permission);
                await contract.unregprov(alice.account, alice.permission);
                (await util.isProviderExists(alice.account))
                    .should.be.false;
            }
        });
    });

    describe('#services', function () {
        it('should create several services for provider', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.regprov(alice.account, 'Alice provider', alice.permission);
            await contract.addsvc(alice.account, 'svc1', 'Alice provider Service One', 'http', 'local', 'http://alicesvcone.ru/', alice.permission);
            await contract.addsvc(alice.account, 'svc2', 'Alice provider Service Two', 'ftp', 'distributed', 'http://alicesvctwo.ru', alice.permission);
            {
                let svc = await util.getService(alice.account, 'svc1');
                assert.equal(alice.account, svc.scope);
                assert.equal('svc1', svc.service);
                assert.equal('Alice provider Service One', svc.description);
                assert.equal('http', svc.protocol);
                assert.equal('local', svc.type);
                assert.equal('http://alicesvcone.ru/', svc.endpoint);
            }
            {
                let svc = await util.getService(alice.account, 'svc2');
                assert.equal(alice.account, svc.scope);
                assert.equal('svc2', svc.service);
                assert.equal('Alice provider Service Two', svc.description);
                assert.equal('ftp', svc.protocol);
                assert.equal('distributed', svc.type);
                assert.equal('http://alicesvctwo.ru', svc.endpoint);
            }
        });

        it('should update service for provider', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.regprov(alice.account, 'Alice provider', alice.permission);
            await contract.addsvc(alice.account, 'svc1', 'Alice provider Service One', 'http', 'local', 'http://alicesvcone.ru/', alice.permission);
            await contract.updsvc(alice.account, 'svc1', 'MST', 'ftp', 'distributed', 'http://alicesvctwo.ru', alice.permission);
            {
                let svc = await util.getService(alice.account, 'svc1');
                assert.equal(alice.account, svc.scope);
                assert.equal('svc1', svc.service);
                assert.equal('MST', svc.description);
                assert.equal('ftp', svc.protocol);
                assert.equal('distributed', svc.type);
                assert.equal('http://alicesvctwo.ru', svc.endpoint);
            }
        });

        it('should remove service for provider', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.regprov(alice.account, 'Alice provider', alice.permission);
            await contract.addsvc(alice.account, 'svc1', 'Alice provider Service One', 'http', 'local', 'http://alicesvcone.ru/', alice.permission);
            await contract.remsvc(alice.account, 'svc1', alice.permission);
            let svc = await util.getService(alice.account, 'svc1');
            assert.isUndefined(svc);
        });

    });

    describe('#requestslog', function () {
        it('should write one item to requests log table', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            const jimbo = await tools.makeAccount(bc, 'jimbo');
            await contract.sendreq(alice.account, jimbo.account, 82034, "my request", alice.permission);
            let rows = await util.getRequestsLog();
            let item = rows.pop();
            assert.equal(alice.account, item.sender);
            assert.equal(jimbo.account, item.receiver);
            assert.equal('82034', item.date);
            assert.equal('my request', item.request);
        });
        it('should write several items to requests log table', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            const jimbo = await tools.makeAccount(bc, 'jimbo');
            await contract.sendreq(alice.account, jimbo.account, 82034, "my request 1", alice.permission);
            await contract.sendreq(alice.account, jimbo.account, 82035, "my request 2", alice.permission);
            await contract.sendreq(jimbo.account, alice.account, 82035, "my request 2", jimbo.permission);
            let rows = await util.getRequestsLog();
            assert.equal(3, rows.length);
        });
        it('should not write duplicates to requests log table', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            const jimbo = await tools.makeAccount(bc, 'jimbo');
            await contract.sendreq(alice.account, jimbo.account, 82034, "my request 1", alice.permission);
            await contract.sendreq(alice.account, jimbo.account, 82034, "my request 1", alice.permission)
                .should.be.rejected;
        });
    });
});
