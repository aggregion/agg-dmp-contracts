
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
        aggregiondmp = await tools.makeAccount(bc, 'aggregiondmp');
        aggregion = await tools.makeAccount(bc, contractConfig.account);
        await bc.deploy(aggregion.account, contractConfig.wasm, contractConfig.abi, aggregion.permission);
    });

    afterEach(async function () {
        await node.stop();
    });

    describe('#providers', function () {
        it('should register new unique provider', async () => {
            await contract.regprov('alice', 'Alice provider', aggregiondmp.permission);
            (await util.isProviderExists('alice'))
                .should.be.true;
        });

        it('should not register provider if it already registered', async () => {
            await contract.regprov('alice', 'Alice provider', aggregiondmp.permission);
            await contract.regprov('alice', 'Alice provider', aggregiondmp.permission)
                .should.be.rejected;
        });

        it('should update description of provider', async () => {
            {
                await contract.regprov('alice', 'Description One', aggregiondmp.permission);
                let prov = await util.getProviderByName('alice');
                prov.description.should.be.eq('Description One');
            }
            {
                await contract.updprov('alice', 'Description Two', aggregiondmp.permission);
                let prov = await util.getProviderByName('alice');
                prov.description.should.be.eq('Description Two');
            }
        });

        it('should remove existing provider', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            {
                await contract.regprov('alice', 'Alice provider', aggregiondmp.permission);
                await contract.unregprov('alice', aggregiondmp.permission);
                (await util.isProviderExists('alice'))
                    .should.be.false;
            }
        });
    });

    describe('#services', function () {
        it('should create several services for provider', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.regprov('alice', 'Alice provider', aggregiondmp.permission);
            await contract.addsvc('alice', 'svc1', 'Alice provider Service One', 'http', 'local', 'http://alicesvcone.ru/', aggregiondmp.permission);
            await contract.addsvc('alice', 'svc2', 'Alice provider Service Two', 'ftp', 'distributed', 'http://alicesvctwo.ru', aggregiondmp.permission);
            {
                let svc = await util.getService('alice', 'svc1');
                assert.equal('alice', svc.scope);
                assert.equal('svc1', svc.service);
                assert.equal('Alice provider Service One', svc.description);
                assert.equal('http', svc.protocol);
                assert.equal('local', svc.type);
                assert.equal('http://alicesvcone.ru/', svc.endpoint);
            }
            {
                let svc = await util.getService('alice', 'svc2');
                assert.equal('alice', svc.scope);
                assert.equal('svc2', svc.service);
                assert.equal('Alice provider Service Two', svc.description);
                assert.equal('ftp', svc.protocol);
                assert.equal('distributed', svc.type);
                assert.equal('http://alicesvctwo.ru', svc.endpoint);
            }
        });

        it('should update service for provider', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.regprov('alice', 'Alice provider', aggregiondmp.permission);
            await contract.addsvc('alice', 'svc1', 'Alice provider Service One', 'http', 'local', 'http://alicesvcone.ru/', aggregiondmp.permission);
            await contract.updsvc('alice', 'svc1', 'MST', 'ftp', 'distributed', 'http://alicesvctwo.ru', aggregiondmp.permission);
            {
                let svc = await util.getService('alice', 'svc1');
                assert.equal('alice', svc.scope);
                assert.equal('svc1', svc.service);
                assert.equal('MST', svc.description);
                assert.equal('ftp', svc.protocol);
                assert.equal('distributed', svc.type);
                assert.equal('http://alicesvctwo.ru', svc.endpoint);
            }
        });

        it('should remove service for provider', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.regprov('alice', 'Alice provider', aggregiondmp.permission);
            await contract.addsvc('alice', 'svc1', 'Alice provider Service One', 'http', 'local', 'http://alicesvcone.ru/', aggregiondmp.permission);
            await contract.remsvc('alice', 'svc1', aggregiondmp.permission);
            let svc = await util.getService('alice', 'svc1');
            assert.isUndefined(svc);
        });

    });

    describe('#requestslog', function () {
        it('should write one item to requests log table', async () => {
            await contract.sendreq('alice', 'bob', 82034, "my request", aggregiondmp.permission);
            let rows = await util.getRequestsLog();
            let item = rows.pop();
            assert.equal('alice', item.sender);
            assert.equal('bob', item.receiver);
            assert.equal('82034', item.date);
            assert.equal('my request', item.request);
        });
        it('should write several items to requests log table', async () => {
            await contract.sendreq('alice', 'bob', 82034, "my request 1", aggregiondmp.permission);
            await contract.sendreq('alice', 'bob', 82035, "my request 2", aggregiondmp.permission);
            await contract.sendreq('bob', 'alice', 82035, "my request 2", aggregiondmp.permission);
            let rows = await util.getRequestsLog();
            assert.equal(3, rows.length);
        });
        it('should not write duplicates to requests log table', async () => {
            await contract.sendreq('alice', 'bob', 82034, "my request 1", aggregiondmp.permission);
            await contract.sendreq('alice', 'bob', 82034, "my request 1", aggregiondmp.permission)
                .should.be.rejected;
        });
    });
});
