
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

describe('AggregionScripts', function () {

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

    const hashOne = 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad';
    const hashTwo = 'cb8379ac2098aa165029e3938a51da0bcecfc008fd6795f401178647f96c5b34';

    describe('#scripts', function () {
        it('should create several scripts for user', async () => {
            await contract.addscript('bob', 'script1', 'v1', 'Newton function', hashOne, 'http://example.com', aggregiondmp.permission);
            await contract.addscript('bob', 'script1', 'v2', 'Einstein function', hashTwo, 'http://eindef.com', aggregiondmp.permission);
            {
                let script = await util.getScript('bob', 'script1', 'v1');
                assert.equal('bob', script.owner);
                assert.equal('script1', script.script);
                assert.equal('v1', script.version);
                assert.equal('Newton function', script.description);
                assert.equal(hashOne, script.hash);
                assert.equal('http://example.com', script.url);
            }
            {
                let script = await util.getScript('bob', 'script1', 'v2');
                assert.equal('bob', script.owner);
                assert.equal('script1', script.script);
                assert.equal('v2', script.version);
                assert.equal('Einstein function', script.description);
                assert.equal(hashTwo, script.hash);
                assert.equal('http://eindef.com', script.url);
            }
        });

        it('should update script if it does not approved', async () => {
            await contract.addscript('bob', 'script1', 'v1', 'meaningless description', hashOne, 'url', aggregiondmp.permission);
            await contract.updscript('bob', 'script1', 'v1', 'Newton function', hashTwo, 'http://example.com', aggregiondmp.permission);
            {
                let script = await util.getScript('bob', 'script1', 'v1');
                assert.equal('bob', script.owner);
                assert.equal('script1', script.script);
                assert.equal('v1', script.version);
                assert.equal('Newton function', script.description);
                assert.equal(hashTwo, script.hash);
                assert.equal('http://example.com', script.url);
            }
        });

        it('should not update nor remove foreign script', async () => {
            await contract.addscript('john', 'script1', 'v1', 'meaningless description', hashOne, 'url', aggregiondmp.permission);
            await contract.updscript('kate', 'script1', 'v1', 'Newton function', hashOne, 'http://example.com', aggregiondmp.permission)
                .should.be.rejected;
            await contract.remscript('kate', 'script1', 'v1', 'Newton function', aggregiondmp.permission)
                .should.be.rejected;
        });

        it('should remove script if it does not approved', async () => {
            await contract.addscript('bob', 'script1', 'v1', 'Newton function', hashOne, 'http://example.com', aggregiondmp.permission);
            await contract.remscript('bob', 'script1', 'v1', aggregiondmp.permission);
            let script = await util.getScript('bob', 'script1', 'v1');
            assert.isUndefined(script);
        });

        it('should fail if script version already exists', async () => {
            await contract.addscript('bob', 'script1', 'v1', 'Newton function', hashOne, 'http://example.com', aggregiondmp.permission);
            await contract.addscript('bob', 'script1', 'v2', 'Einstein function', hashTwo, 'http://eindef.com', aggregiondmp.permission);
            await contract.addscript('bob', 'script1', 'v2', 'Einstein function', hashTwo, 'http://eindef.com', aggregiondmp.permission)
                .should.be.rejected;
        });

        it('should not fail if script version already exists for different provider', async () => {
            await contract.addscript('john', 'script1', 'v1', 'Newton function', hashOne, 'http://example.com', aggregiondmp.permission);
            await contract.addscript('kate', 'script1', 'v1', 'Newton function', hashTwo, 'http://example.com', aggregiondmp.permission);
        });

        it('should fail if script hash already exists', async () => {
            await contract.addscript('bob', 'script1', 'v1', 'Newton function', hashOne, 'http://example.com', aggregiondmp.permission);
            await contract.addscript('alice', 'script2', 'v2', 'Einstein function', hashOne, 'http://eindef.com', aggregiondmp.permission)
                .should.be.rejected;
        });
    });


    describe('#providers trust', function () {
        it('should not trust by default', async () => {
            await contract.regprov('john', 'John provider', aggregiondmp.permission);
            await contract.regprov('kate', 'Kate provider', aggregiondmp.permission);
            const trusted = await util.isTrusted('john', 'kate');
            assert.isFalse(trusted);
        });
        it('should add trusted provider', async () => {
            await contract.regprov('john', 'John provider', aggregiondmp.permission);
            await contract.regprov('kate', 'Kate provider', aggregiondmp.permission);
            await contract.trust('john', 'kate', aggregiondmp.permission);
            const trusted = await util.isTrusted('john', 'kate');
            assert.isTrue(trusted);
        });
        it('should remove trusted provider', async () => {
            await contract.regprov('john', 'John provider', aggregiondmp.permission);
            await contract.regprov('kate', 'Kate provider', aggregiondmp.permission);
            await contract.trust('john', 'kate', aggregiondmp.permission);
            assert.isTrue(await util.isTrusted('john', 'kate'));
            await contract.untrust('john', 'kate', aggregiondmp.permission);
            assert.isFalse(await util.isTrusted('john', 'kate'));
        });
    });


    describe('#approves', function () {
        it('should not be approved by default', async () => {
            await contract.regprov('alice', 'Alice provider', aggregiondmp.permission);
            await contract.addscript('bob', 'script1', 'v1', 'Newton function', hashOne, 'http://example.com', aggregiondmp.permission);
            const approved = await util.isScriptApprovedBy('alice', hashOne);
            assert.isFalse(approved);
        });
        it('should approve existing script', async () => {
            await contract.regprov('alice', 'Alice provider', aggregiondmp.permission);
            await contract.addscript('bob', 'script1', 'v1', 'Newton function', hashOne, 'http://example.com', aggregiondmp.permission);
            await contract.execapprove('alice', hashOne, aggregiondmp.permission);
            const approved = await util.isScriptApprovedBy('alice', hashOne);
            assert.isTrue(approved);
        });
        it('should deny approved script', async () => {
            await contract.regprov('alice', 'Alice provider', aggregiondmp.permission);
            await contract.addscript('bob', 'script1', 'v1', 'Newton function', hashOne, 'http://example.com', aggregiondmp.permission);
            await contract.execapprove('alice', hashOne, aggregiondmp.permission);
            await contract.execdeny('alice', hashOne, aggregiondmp.permission);
            const approved = await util.isScriptApprovedBy('alice', hashOne);
            assert.isFalse(approved);
        });
        it('should not update script if it is approved', async () => {
            await contract.regprov('alice', 'Alice provider', aggregiondmp.permission);
            await contract.addscript('bob', 'script1', 'v1', 'Description', hashOne, 'Url', aggregiondmp.permission);
            await contract.execapprove('alice', hashOne, aggregiondmp.permission);
            const scr = await util.getScriptByHash(hashOne);
            await contract.updscript('bob', 'script1', 'v1', 'Newton function', hashTwo, 'http://example.com', aggregiondmp.permission)
                .should.be.rejected;
            await contract.execdeny('alice', hashOne, aggregiondmp.permission);
            await contract.updscript('bob', 'script1', 'v1', 'Newton function', hashTwo, 'http://example.com', aggregiondmp.permission);
        });
        it('should not remove script if it is approved', async () => {
            await contract.regprov('alice', 'Alice provider', aggregiondmp.permission);
            await contract.addscript('bob', 'script1', 'v1', 'Description', hashOne, 'Url', aggregiondmp.permission);
            await contract.execapprove('alice', hashOne, aggregiondmp.permission);
            await contract.remscript('bob', 'script1', 'v1', aggregiondmp.permission)
                .should.be.rejected;
            await contract.execdeny('alice', hashOne, aggregiondmp.permission);
            await contract.remscript('bob', 'script1', 'v1', aggregiondmp.permission);
        });
    });

    describe('#script access', function () {
        it('should not deny access by default', async () => {
            await contract.regprov('john', 'John provider', aggregiondmp.permission);
            await contract.regprov('kate', 'Kate provider', aggregiondmp.permission);
            await contract.addscript('john', 'script1', 'v1', 'Newton function', hashOne, 'http://example.com', aggregiondmp.permission);
            assert.isTrue(await util.isScriptAccessGrantedTo('john', hashOne));
        });
        it('should deny access', async () => {
            await contract.regprov('john', 'John provider', aggregiondmp.permission);
            await contract.regprov('kate', 'Kate provider', aggregiondmp.permission);
            await contract.addscript('john', 'script1', 'v1', 'Newton function', hashOne, 'http://example.com', aggregiondmp.permission);
            await contract.denyaccess('john', hashOne, 'kate', aggregiondmp.permission);
            assert.isFalse(await util.isScriptAccessGrantedTo('kate', hashOne));
            await contract.grantaccess('john', hashOne, 'kate', aggregiondmp.permission);
            assert.isTrue(await util.isScriptAccessGrantedTo('kate', hashOne));
        });
        it('should not grant access to non-owned script', async () => {
            await contract.regprov('john', 'John provider', aggregiondmp.permission);
            await contract.regprov('kate', 'Kate provider', aggregiondmp.permission);
            await contract.addscript('john', 'script1', 'v1', 'Newton function', hashOne, 'http://example.com', aggregiondmp.permission);
            await contract.denyaccess('kate', hashOne, 'kate', aggregiondmp.permission)
                .should.be.rejected;
            await contract.grantaccess('kate', hashOne, 'kate', aggregiondmp.permission)
                .should.be.rejected;
        });
    });
});
