
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
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.addscript(alice.account, 'script1', 'v1', 'Newton function', hashOne, 'http://example.com', alice.permission);
            await contract.addscript(alice.account, 'script1', 'v2', 'Einstein function', hashTwo, 'http://eindef.com', alice.permission);
            {
                let script = await util.getScript(alice.account, 'script1', 'v1');
                assert.equal(alice.account, script.owner);
                assert.equal('script1', script.script);
                assert.equal('v1', script.version);
                assert.equal('Newton function', script.description);
                assert.equal(hashOne, script.hash);
                assert.equal('http://example.com', script.url);
            }
            {
                let script = await util.getScript(alice.account, 'script1', 'v2');
                assert.equal(alice.account, script.owner);
                assert.equal('script1', script.script);
                assert.equal('v2', script.version);
                assert.equal('Einstein function', script.description);
                assert.equal(hashTwo, script.hash);
                assert.equal('http://eindef.com', script.url);
            }
        });

        it('should update script if it does not approved', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.addscript(alice.account, 'script1', 'v1', 'meaningless description', hashOne, 'url', alice.permission);
            await contract.updscript(alice.account, 'script1', 'v1', 'Newton function', hashTwo, 'http://example.com', alice.permission);
            {
                let script = await util.getScript(alice.account, 'script1', 'v1');
                assert.equal(alice.account, script.owner);
                assert.equal('script1', script.script);
                assert.equal('v1', script.version);
                assert.equal('Newton function', script.description);
                assert.equal(hashTwo, script.hash);
                assert.equal('http://example.com', script.url);
            }
        });

        it('should not update nor remove foreign script', async () => {
            const john = await tools.makeAccount(bc, 'john');
            const kate = await tools.makeAccount(bc, 'kate');
            await contract.addscript(john.account, 'script1', 'v1', 'meaningless description', hashOne, 'url', john.permission);
            await contract.updscript(kate.account, 'script1', 'v1', 'Newton function', hashOne, 'http://example.com', kate.permission)
                .should.be.rejected;
            await contract.remscript(kate.account, 'script1', 'v1', 'Newton function', kate.permission)
                .should.be.rejected;
        });

        it('should remove script if it does not approved', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.addscript(alice.account, 'script1', 'v1', 'Newton function', hashOne, 'http://example.com', alice.permission);
            await contract.remscript(alice.account, 'script1', 'v1', alice.permission);
            let script = await util.getScript(alice.account, 'script1', 'v1');
            assert.isUndefined(script);
        });

        it('should fail if script version already exists', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.addscript(alice.account, 'script1', 'v1', 'Newton function', hashOne, 'http://example.com', alice.permission);
            await contract.addscript(alice.account, 'script1', 'v2', 'Einstein function', hashTwo, 'http://eindef.com', alice.permission);
            await contract.addscript(alice.account, 'script1', 'v2', 'Einstein function', hashTwo, 'http://eindef.com', alice.permission)
                .should.be.rejected;
        });

        it('should not fail if script version already exists for different provider', async () => {
            const john = await tools.makeAccount(bc, 'john');
            const kate = await tools.makeAccount(bc, 'kate');
            await contract.addscript(john.account, 'script1', 'v1', 'Newton function', hashOne, 'http://example.com', john.permission);
            await contract.addscript(kate.account, 'script1', 'v1', 'Newton function', hashTwo, 'http://example.com', kate.permission);
        });

        it('should fail if script hash already exists', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.addscript(alice.account, 'script1', 'v1', 'Newton function', hashOne, 'http://example.com', alice.permission);
            await contract.addscript('alice', 'script2', 'v2', 'Einstein function', hashOne, 'http://eindef.com', alice.permission)
                .should.be.rejected;
        });
    });


    describe('#providers trust', function () {
        it('should not trust by default', async () => {
            const john = await tools.makeAccount(bc, 'john');
            const kate = await tools.makeAccount(bc, 'kate');
            await contract.regprov(john.account, 'John provider', john.permission);
            await contract.regprov(kate.account, 'Kate provider', kate.permission);
            const trusted = await util.isTrusted(john.account, kate.account);
            assert.isFalse(trusted);
        });
        it('should add trusted provider', async () => {
            const john = await tools.makeAccount(bc, 'john');
            const kate = await tools.makeAccount(bc, 'kate');
            await contract.regprov(john.account, 'John provider', john.permission);
            await contract.regprov(kate.account, 'Kate provider', kate.permission);
            await contract.trust(john.account, kate.account, john.permission);
            const trusted = await util.isTrusted(john.account, kate.account);
            assert.isTrue(trusted);
        });
        it('should remove trusted provider', async () => {
            const john = await tools.makeAccount(bc, 'john');
            const kate = await tools.makeAccount(bc, 'kate');
            await contract.regprov(john.account, 'John provider', john.permission);
            await contract.regprov(kate.account, 'Kate provider', kate.permission);
            await contract.trust(john.account, kate.account, john.permission);
            assert.isTrue(await util.isTrusted(john.account, kate.account));
            await contract.untrust(john.account, kate.account, john.permission);
            assert.isFalse(await util.isTrusted(john.account, kate.account));
        });
    });


    describe('#approves', function () {
        it('should not be approved by default', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.regprov('alice', 'Alice provider', alice.permission);
            await contract.addscript(alice.account, 'script1', 'v1', 'Newton function', hashOne, 'http://example.com', alice.permission);
            const approved = await util.isScriptApprovedBy('alice', hashOne);
            assert.isFalse(approved);
        });
        it('should approve existing script', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.regprov('alice', 'Alice provider', alice.permission);
            await contract.addscript(alice.account, 'script1', 'v1', 'Newton function', hashOne, 'http://example.com', alice.permission);
            await contract.execapprove('alice', hashOne, alice.permission);
            const approved = await util.isScriptApprovedBy('alice', hashOne);
            assert.isTrue(approved);
        });
        it('should deny approved script', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.regprov('alice', 'Alice provider', alice.permission);
            await contract.addscript(alice.account, 'script1', 'v1', 'Newton function', hashOne, 'http://example.com', alice.permission);
            await contract.execapprove('alice', hashOne, alice.permission);
            await contract.execdeny('alice', hashOne, alice.permission);
            const approved = await util.isScriptApprovedBy('alice', hashOne);
            assert.isFalse(approved);
        });
        it('should not update script if it is approved', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.regprov('alice', 'Alice provider', alice.permission);
            await contract.addscript(alice.account, 'script1', 'v1', 'Description', hashOne, 'Url', alice.permission);
            await contract.execapprove('alice', hashOne, alice.permission);
            const scr = await util.getScriptByHash(hashOne);
            await contract.updscript(alice.account, 'script1', 'v1', 'Newton function', hashTwo, 'http://example.com', alice.permission)
                .should.be.rejected;
            await contract.execdeny('alice', hashOne, alice.permission);
            await contract.updscript(alice.account, 'script1', 'v1', 'Newton function', hashTwo, 'http://example.com', alice.permission);
        });
        it('should not remove script if it is approved', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.regprov('alice', 'Alice provider', alice.permission);
            await contract.addscript(alice.account, 'script1', 'v1', 'Description', hashOne, 'Url', alice.permission);
            await contract.execapprove('alice', hashOne, alice.permission);
            await contract.remscript(alice.account, 'script1', 'v1', alice.permission)
                .should.be.rejected;
            await contract.execdeny('alice', hashOne, alice.permission);
            await contract.remscript(alice.account, 'script1', 'v1', alice.permission);
        });
    });

    describe('#script access', function () {
        it('should be undefined if unknown script', async () => {
            const john = await tools.makeAccount(bc, 'john');
            const kate = await tools.makeAccount(bc, 'kate');
            await contract.regprov(john.account, 'John provider', john.permission);
            await contract.regprov(kate.account, 'Kate provider', kate.permission);
            assert.isUndefined(await util.isScriptAccessGrantedTo(john.account, hashOne));
        });
        it('should be undefined if no rule', async () => {
            const john = await tools.makeAccount(bc, 'john');
            const kate = await tools.makeAccount(bc, 'kate');
            await contract.regprov(john.account, 'John provider', john.permission);
            await contract.regprov(kate.account, 'Kate provider', kate.permission);
            await contract.addscript(john.account, 'script1', 'v1', 'Newton function', hashOne, 'http://example.com', john.permission);
            assert.isUndefined(await util.isScriptAccessGrantedTo(john.account, hashOne));
        });
        it('should deny and grant access', async () => {
            const john = await tools.makeAccount(bc, 'john');
            const kate = await tools.makeAccount(bc, 'kate');
            await contract.regprov(john.account, 'John provider', john.permission);
            await contract.regprov(kate.account, 'Kate provider', kate.permission);
            await contract.addscript(john.account, 'script1', 'v1', 'Newton function', hashOne, 'http://example.com', john.permission);
            await contract.denyaccess(john.account, hashOne, kate.account, john.permission);
            assert.isFalse(await util.isScriptAccessGrantedTo(kate.account, hashOne));
            await contract.grantaccess(john.account, hashOne, kate.account, john.permission);
            assert.isTrue(await util.isScriptAccessGrantedTo(kate.account, hashOne));
        });
        it('should not grant access to non-owned script', async () => {
            const john = await tools.makeAccount(bc, 'john');
            const kate = await tools.makeAccount(bc, 'kate');
            await contract.regprov(john.account, 'John provider', john.permission);
            await contract.regprov(kate.account, 'Kate provider', kate.permission);
            await contract.addscript(john.account, 'script1', 'v1', 'Newton function', hashOne, 'http://example.com', john.permission);
            await contract.denyaccess(kate.account, hashOne, kate.account, kate.permission)
                .should.be.rejected;
            await contract.grantaccess(kate.account, hashOne, kate.account, kate.permission)
                .should.be.rejected;
        });
    });

    describe('#enclave script access', function () {
        it('should be undefined if unknown script', async () => {
            const eown = await tools.makeAccount(bc, 'eown');
            const sown = await tools.makeAccount(bc, 'sown');
            const prov = await tools.makeAccount(bc, 'prov');
            await contract.regprov(eown.account, 'Enclave Owner', eown.permission);
            await contract.regprov(prov.account, 'Some Provider', prov.permission);
            assert.isUndefined(await util.isScriptAllowedWithinEnclave(eown.account, hashOne, prov.account));
        });
        it('should be undefined if no rule', async () => {
            const eown = await tools.makeAccount(bc, 'eown');
            const sown = await tools.makeAccount(bc, 'sown');
            const prov = await tools.makeAccount(bc, 'prov');
            await contract.regprov(eown.account, 'Enclave Owner', eown.permission);
            await contract.regprov(prov.account, 'Some Provider', prov.permission);
            await contract.addscript(sown.account, 's1', 'v1', 'ABC', hashOne, 'http://example.com', sown.permission);
            assert.isUndefined(await util.isScriptAllowedWithinEnclave(eown.account, hashOne, prov.account));
        });
        it('should be undefined if has rule but unknown provider', async () => {
            const eown = await tools.makeAccount(bc, 'eown');
            const sown = await tools.makeAccount(bc, 'sown');
            const prv1 = await tools.makeAccount(bc, 'prv1');
            const prv2 = await tools.makeAccount(bc, 'prv2');
            await contract.regprov(eown.account, 'Enclave Owner', eown.permission);
            await contract.regprov(prv1.account, 'Some Provider', prv1.permission);
            await contract.addscript(sown.account, 's1', 'v1', 'ABC', hashOne, 'http://example.com', sown.permission);
            await contract.enclaveScriptAccess(eown.account, hashOne, prv1.account, true, eown.permission);
            assert.isUndefined(await util.isScriptAllowedWithinEnclave(eown.account, hashOne, prv2.account));
        });
        it('should deny access', async () => {
            const eown = await tools.makeAccount(bc, 'eown');
            const sown = await tools.makeAccount(bc, 'sown');
            const prov = await tools.makeAccount(bc, 'prov');
            await contract.regprov(eown.account, 'Enclave Owner', eown.permission);
            await contract.regprov(prov.account, 'Some Provider', prov.permission);
            await contract.addscript(sown.account, 's1', 'v1', 'ABC', hashOne, 'http://example.com', sown.permission);
            await contract.enclaveScriptAccess(eown.account, hashOne, prov.account, false, eown.permission);
            assert.isFalse(await util.isScriptAllowedWithinEnclave(eown.account, hashOne, prov.account));
        });
        it('should grant access', async () => {
            const eown = await tools.makeAccount(bc, 'eown');
            const sown = await tools.makeAccount(bc, 'sown');
            const prov = await tools.makeAccount(bc, 'prov');
            await contract.regprov(eown.account, 'Enclave Owner', eown.permission);
            await contract.regprov(prov.account, 'Some Provider', prov.permission);
            await contract.addscript(sown.account, 's1', 'v1', 'ABC', hashOne, 'http://example.com', sown.permission);
            await contract.enclaveScriptAccess(eown.account, hashOne, prov.account, true, eown.permission);
            assert.isTrue(await util.isScriptAllowedWithinEnclave(eown.account, hashOne, prov.account));
        });
        it('should not grant access to foreign enclave', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            const bob = await tools.makeAccount(bc, 'bob');
            const sown = await tools.makeAccount(bc, 'sown');
            const prov = await tools.makeAccount(bc, 'prov');
            await contract.regprov(alice.account, 'Enclave Owner', alice.permission);
            await contract.regprov(bob.account, 'Evil provider', bob.permission);
            await contract.regprov(prov.account, 'Some Provider', prov.permission);
            await contract.addscript(sown.account, 's1', 'v1', 'ABC', hashOne, 'http://example.com', sown.permission);
            await contract.enclaveScriptAccess(alice.account, hashOne, prov.account, false, bob.permission)
                .should.be.rejected;
            assert.isUndefined(await util.isScriptAllowedWithinEnclave(alice.account, hashOne, prov.account));
        });
    });
});
