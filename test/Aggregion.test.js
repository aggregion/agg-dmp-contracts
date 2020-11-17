
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

    describe('#scripts', function () {
        it('should create several scripts for user', async () => {
            await contract.addscript('bob', 'script1', 'v1', 'Newton function', 'abc', 'http://example.com', aggregiondmp.permission);
            await contract.addscript('bob', 'script1', 'v2', 'Einstein function', 'def', 'http://eindef.com', aggregiondmp.permission);
            {
                let script = await util.getScript('bob', 'script1', 'v1');
                assert.equal('bob', script.scope);
                assert.equal('script1', script.script);
                assert.equal('v1', script.version);
                assert.equal('Newton function', script.description);
                assert.equal('abc', script.hash);
                assert.equal('http://example.com', script.url);
            }
            {
                let script = await util.getScript('bob', 'script1', 'v2');
                assert.equal('bob', script.scope);
                assert.equal('script1', script.script);
                assert.equal('v2', script.version);
                assert.equal('Einstein function', script.description);
                assert.equal('def', script.hash);
                assert.equal('http://eindef.com', script.url);
            }
        });

        it('should update script if it does not approved', async () => {
            await contract.addscript('bob', 'script1', 'v1', 'meaningless description', 'hash', 'url', aggregiondmp.permission);
            await contract.updscript('bob', 'script1', 'v1', 'Newton function', 'abc', 'http://example.com', aggregiondmp.permission);
            {
                let script = await util.getScript('bob', 'script1', 'v1');
                assert.equal('bob', script.scope);
                assert.equal('script1', script.script);
                assert.equal('v1', script.version);
                assert.equal('Newton function', script.description);
                assert.equal('abc', script.hash);
                assert.equal('http://example.com', script.url);
            }
        });

        it('should remove script if it does not approved', async () => {
            await contract.addscript('bob', 'script1', 'v1', 'Newton function', 'abc', 'http://example.com', aggregiondmp.permission);
            await contract.remscript('bob', 'script1', 'v1', aggregiondmp.permission);
            let script = await util.getScript('bob', 'script1', 'v1');
            assert.isUndefined(script);
        });

        it('should fail if script version already exists', async () => {
            await contract.addscript('bob', 'script1', 'v1', 'Newton function', 'abc', 'http://example.com', aggregiondmp.permission);
            await contract.addscript('bob', 'script1', 'v2', 'Einstein function', 'def', 'http://eindef.com', aggregiondmp.permission);
            await contract.addscript('bob', 'script1', 'v2', 'Einstein function', 'def', 'http://eindef.com', aggregiondmp.permission)
                .should.be.rejected;
        });
    });

    describe('#approves', function () {
        it('should not be approved by default', async () => {
            await contract.regprov('alice', 'Alice provider', aggregiondmp.permission);
            await contract.addscript('bob', 'script1', 'v1', 'Newton function', 'abc', 'http://example.com', aggregiondmp.permission);
            let approved = await util.isScriptApproved('alice', 'bob', 'script1', 'v1');
            assert.isFalse(approved);

        });
        it('should approve existing script', async () => {
            await contract.regprov('alice', 'Alice provider', aggregiondmp.permission);
            await contract.addscript('bob', 'script1', 'v1', 'Newton function', 'abc', 'http://example.com', aggregiondmp.permission);
            await contract.approve('alice', 'bob', 'script1', 'v1', aggregiondmp.permission);
            let approved = await util.isScriptApproved('alice', 'bob', 'script1', 'v1');
            assert.isTrue(approved);
        });
        it('should deny approved script', async () => {
            await contract.regprov('alice', 'Alice provider', aggregiondmp.permission);
            await contract.addscript('bob', 'script1', 'v1', 'Newton function', 'abc', 'http://example.com', aggregiondmp.permission);
            await contract.approve('alice', 'bob', 'script1', 'v1', aggregiondmp.permission);
            await contract.deny('alice', 'bob', 'script1', 'v1', aggregiondmp.permission);
            let approved = await util.isScriptApproved('alice', 'bob', 'script1', 'v1');
            assert.isFalse(approved);
        });
        it('should not update script if it is approved', async () => {
            await contract.regprov('alice', 'Alice provider', aggregiondmp.permission);
            await contract.addscript('bob', 'script1', 'v1', 'Description', 'Hash', 'Url', aggregiondmp.permission);
            await contract.approve('alice', 'bob', 'script1', 'v1', aggregiondmp.permission);
            await contract.updscript('bob', 'script1', 'v1', 'Newton function', 'abc', 'http://example.com', aggregiondmp.permission)
                .should.be.rejected;
            await contract.deny('alice', 'bob', 'script1', 'v1', aggregiondmp.permission);
            await contract.updscript('bob', 'script1', 'v1', 'Newton function', 'abc', 'http://example.com', aggregiondmp.permission);
        });

        it('should not remove script if it is approved', async () => {
            await contract.regprov('alice', 'Alice provider', aggregiondmp.permission);
            await contract.addscript('bob', 'script1', 'v1', 'Description', 'Hash', 'Url', aggregiondmp.permission);
            await contract.approve('alice', 'bob', 'script1', 'v1', aggregiondmp.permission);
            await contract.remscript('bob', 'script1', 'v1', aggregiondmp.permission)
                .should.be.rejected;
            await contract.deny('alice', 'bob', 'script1', 'v1', aggregiondmp.permission);
            await contract.remscript('bob', 'script1', 'v1', aggregiondmp.permission);
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
