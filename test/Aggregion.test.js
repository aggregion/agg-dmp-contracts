
const AggregionBlockchain = require('../js/AggregionBlockchain.js');
const AggregionContract = require('../js/AggregionContract.js');
const AggregionUtility = require('../js/AggregionUtility.js');
const AggregionNode = require('../js/AggregionNode.js');
const TestsConfig = require('../js/TestsConfig.js');

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var assert = chai.assert;
var should = chai.should();

class TestAccount {
    constructor(name, publicKey, privateKey) {
        this.account = name;
        this.publicKey = publicKey;
        this.privateKey = privateKey;
        this.permission = name + '@active';
    }
};

/**
 *
 * @param {AggregionBlockchain} blockchain
 * @param {String} name
 * @returns {TestAccount}
 */
async function makeAccount(blockchain, name) {
    const pair = await AggregionBlockchain.createKeyPair();
    const ownerKey = pair.publicKey;
    const activeKey = ownerKey;
    await blockchain.newaccount('eosio', name, ownerKey, activeKey, 'eosio@active');
    await blockchain.addPrivateKey(pair.privateKey);
    return new TestAccount(name, ownerKey, pair.privateKey);
}


describe('Aggregion', function () {

    const config = new TestsConfig(__dirname + '/config.json')

    let node = new AggregionNode(config.getSignatureProvider(), config.node.endpoint, config.node.workdir);
    let bc = new AggregionBlockchain(config.getNodeUrl(), [config.blockchain.eosio_root_key.private]);
    let util = new AggregionUtility(config.contract.account, bc);
    let contract = new AggregionContract(config.contract.account, bc);

    this.timeout(0);

    beforeEach(async function () {
        await node.start();
        const aggregion = await makeAccount(bc, config.contract.account);
        await bc.deploy(aggregion.account, config.contract.wasm, config.contract.abi, aggregion.permission);
    });

    afterEach(async function () {
        await node.stop();
    });

    describe('#providers', function () {
        it('should register new unique provider', async () => {
            const alice = await makeAccount(bc, 'alice');
            await contract.regprov(alice.account, 'Alice provider', alice.permission);
            (await util.isProviderExist(alice.account))
                .should.be.true;
        });

        it('should not register provider if it already registered', async () => {
            const alice = await makeAccount(bc, 'alice');
            await contract.regprov(alice.account, 'Alice provider', alice.permission);
            await contract.regprov(alice.account, 'Alice provider', alice.permission)
                .should.be.rejected;
        });

        it('should update description of provider', async () => {
            const alice = await makeAccount(bc, 'alice');
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
            const alice = await makeAccount(bc, 'alice');
            {
                await contract.regprov(alice.account, 'Alice provider', alice.permission);
                await contract.unregprov(alice.account, alice.permission);
                (await util.isProviderExist(alice.account))
                    .should.be.false;
            }
        });
    });

    describe('#services', function () {
        it('should create several services for provider', async () => {
            const alice = await makeAccount(bc, 'alice');
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
            const alice = await makeAccount(bc, 'alice');
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
            const alice = await makeAccount(bc, 'alice');
            await contract.regprov(alice.account, 'Alice provider', alice.permission);
            await contract.addsvc(alice.account, 'svc1', 'Alice provider Service One', 'http', 'local', 'http://alicesvcone.ru/', alice.permission);
            await contract.delsvc(alice.account, 'svc1', alice.permission);
            let svc = await util.getService(alice.account, 'svc1');
            assert.isUndefined(svc);
        });

    });

    describe('#scripts', function () {
        it('should create several scripts for user', async () => {
            const bob = await makeAccount(bc, 'bob');
            await contract.addscript(bob.account, 'script1', 'v1', 'Newton function', 'abc', 'http://example.com', bob.permission);
            await contract.addscript(bob.account, 'script1', 'v2', 'Einstein function', 'def', 'http://eindef.com', bob.permission);
            {
                let script = await util.getScript(bob.account, 'script1', 'v1');
                assert.equal(bob.account, script.scope);
                assert.equal('script1', script.script);
                assert.equal('v1', script.version);
                assert.equal('Newton function', script.description);
                assert.equal('abc', script.hash);
                assert.equal('http://example.com', script.url);
            }
            {
                let script = await util.getScript(bob.account, 'script1', 'v2');
                assert.equal(bob.account, script.scope);
                assert.equal('script1', script.script);
                assert.equal('v2', script.version);
                assert.equal('Einstein function', script.description);
                assert.equal('def', script.hash);
                assert.equal('http://eindef.com', script.url);
            }
        });

        it('should update script if it does not approved', async () => {
            const bob = await makeAccount(bc, 'bob');
            await contract.addscript(bob.account, 'script1', 'v1', 'meaningless description', 'hash', 'url', bob.permission);
            await contract.updscript(bob.account, 'script1', 'v1', 'Newton function', 'abc', 'http://example.com', bob.permission);
            {
                let script = await util.getScript(bob.account, 'script1', 'v1');
                assert.equal(bob.account, script.scope);
                assert.equal('script1', script.script);
                assert.equal('v1', script.version);
                assert.equal('Newton function', script.description);
                assert.equal('abc', script.hash);
                assert.equal('http://example.com', script.url);
            }
        });

        it('should remove script if it does not approved', async () => {
            const bob = await makeAccount(bc, 'bob');
            await contract.addscript(bob.account, 'script1', 'v1', 'Newton function', 'abc', 'http://example.com', bob.permission);
            await contract.delscript(bob.account, 'script1', 'v1', bob.permission);
            let script = await util.getScript(bob.account, 'script1', 'v1');
            assert.isUndefined(script);
        });

        it('should fail if script version already exists', async () => {
            const bob = await makeAccount(bc, 'bob');
            await contract.addscript(bob.account, 'script1', 'v1', 'Newton function', 'abc', 'http://example.com', bob.permission);
            await contract.addscript(bob.account, 'script1', 'v2', 'Einstein function', 'def', 'http://eindef.com', bob.permission);
            await contract.addscript(bob.account, 'script1', 'v2', 'Einstein function', 'def', 'http://eindef.com', bob.permission)
                .should.be.rejected;
        });
    });

    describe('#approves', function () {
        it('should not be approved by default', async () => {
            const alice = await makeAccount(bc, 'alice');
            const bob = await makeAccount(bc, 'bob');
            await contract.regprov(alice.account, 'Alice provider', alice.permission);
            await contract.addscript(bob.account, 'script1', 'v1', 'Newton function', 'abc', 'http://example.com', bob.permission);
            let approved = await util.isScriptApproved(alice.account, bob.account, 'script1', 'v1');
            assert.isFalse(approved);

        });
        it('should approve existing script', async () => {
            const alice = await makeAccount(bc, 'alice');
            const bob = await makeAccount(bc, 'bob');
            await contract.regprov(alice.account, 'Alice provider', alice.permission);
            await contract.addscript(bob.account, 'script1', 'v1', 'Newton function', 'abc', 'http://example.com', bob.permission);
            await contract.approve(alice.account, bob.account, 'script1', 'v1', alice.permission);
            let approved = await util.isScriptApproved(alice.account, bob.account, 'script1', 'v1');
            assert.isTrue(approved);
        });
        it('should deny approved script', async () => {
            const alice = await makeAccount(bc, 'alice');
            const bob = await makeAccount(bc, 'bob');
            await contract.regprov(alice.account, 'Alice provider', alice.permission);
            await contract.addscript(bob.account, 'script1', 'v1', 'Newton function', 'abc', 'http://example.com', bob.permission);
            await contract.approve(alice.account, bob.account, 'script1', 'v1', alice.permission);
            await contract.deny(alice.account, bob.account, 'script1', 'v1', alice.permission);
            let approved = await util.isScriptApproved(alice.account, bob.account, 'script1', 'v1');
            assert.isFalse(approved);
        });
        it('should not update script if it approved', async () => {
            const alice = await makeAccount(bc, 'alice');
            const bob = await makeAccount(bc, 'bob');
            await contract.regprov(alice.account, 'Alice provider', alice.permission);
            await contract.addscript(bob.account, 'script1', 'v1', 'Description', 'Hash', 'Url', bob.permission);
            await contract.approve(alice.account, bob.account, 'script1', 'v1', alice.permission);
            await contract.updscript(bob.account, 'script1', 'v1', 'Newton function', 'abc', 'http://example.com', bob.permission)
                .should.be.rejected;
            await contract.deny(alice.account, bob.account, 'script1', 'v1', alice.permission);
            await contract.updscript(bob.account, 'script1', 'v1', 'Newton function', 'abc', 'http://example.com', bob.permission);
        });

        it('should not remove script if it is approved', async () => {
            const alice = await makeAccount(bc, 'alice');
            const bob = await makeAccount(bc, 'bob');
            await contract.regprov(alice.account, 'Alice provider', alice.permission);
            await contract.addscript(bob.account, 'script1', 'v1', 'Description', 'Hash', 'Url', bob.permission);
            await contract.approve(alice.account, bob.account, 'script1', 'v1', alice.permission);
            await contract.delscript(bob.account, 'script1', 'v1', bob.permission)
                .should.be.rejected;
            await contract.deny(alice.account, bob.account, 'script1', 'v1', alice.permission);
            await contract.delscript(bob.account, 'script1', 'v1', bob.permission);
        });
    });

    describe('#requestslog', function () {
        it('should write one item to requests log table', async () => {
            const alice = await makeAccount(bc, 'alice');
            const bob = await makeAccount(bc, 'bob');
            await contract.sendreq(alice.account, bob.account, 82034, "my request", alice.permission);
            let rows = await util.getRequestsLog();
            let item = rows.pop();
            assert.equal('alice', item.sender);
            assert.equal('bob', item.receiver);
            assert.equal('82034', item.date);
            assert.equal('my request', item.request);
        });
        it('should write several items to requests log table', async () => {
            const alice = await makeAccount(bc, 'alice');
            const bob = await makeAccount(bc, 'bob');
            await contract.sendreq(alice.account, bob.account, 82034, "my request 1", alice.permission);
            await contract.sendreq(alice.account, bob.account, 82035, "my request 2", alice.permission);
            await contract.sendreq(bob.account, alice.account, 82035, "my request 2", bob.permission);
            let rows = await util.getRequestsLog();
            assert.equal(3, rows.length);
        });
        it('should not write duplicates to requests log table', async () => {
            const alice = await makeAccount(bc, 'alice');
            const bob = await makeAccount(bc, 'bob');
            await contract.sendreq(alice.account, bob.account, 82034, "my request 1", alice.permission);
            await contract.sendreq(alice.account, bob.account, 82034, "my request 1", alice.permission)
                .should.be.rejected;
        });
    });

});
