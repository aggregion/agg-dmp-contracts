
const AggregionBlockchain = require('../js/AggregionBlockchain.js');
const AggregionContract = require('../js/AggregionContract.js');
const AggregionUtility = require('../js/AggregionUtility.js');
const TestsConfig = require('../js/TestsConfig.js');

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var assert = chai.assert;
var should = chai.should()


describe('Aggregion', () => {

    const config = new TestsConfig(__dirname + '/config.json')
    const cred = config.credentials;
    const keys = [
        cred.contract.private_key,
        cred.alice.private_key,
        cred.bob.private_key,
    ];

    let bc = new AggregionBlockchain(config.testnet.nodeUrl, cred.contract.account, keys);
    let util = new AggregionUtility(bc);
    let contract = new AggregionContract(cred.contract.account, bc);
    let alice = cred.alice;
    let bob = cred.bob;

    beforeEach(async function () {
        this.timeout(0);
        await contract.eraseAllData(cred.contract.permission);
    });

    describe('#providers', function () {
        it('should register new unique provider', async () => {
            await contract.regprov(alice.account, 'Alice provider', alice.permission);
            (await util.isProviderExist(alice.account))
                .should.be.true;
        });

        it('should not register provider if it already registered', async () => {
            await contract.regprov(alice.account, 'Alice provider', alice.permission);
            await contract.regprov(alice.account, 'Alice provider', alice.permission)
                .should.be.rejected;
        });

        it('should update description of provider', async () => {
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
            {
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
            }
        });

        it('should update service for provider', async () => {
            {
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
            }
        });

        it('should remove service for provider', async () => {
            {
                await contract.regprov(alice.account, 'Alice provider', alice.permission);
                await contract.addsvc(alice.account, 'svc1', 'Alice provider Service One', 'http', 'local', 'http://alicesvcone.ru/', alice.permission);
                await contract.delsvc(alice.account, 'svc1', alice.permission);
                let svc = await util.getService(alice.account, 'svc1');
                assert.isUndefined(svc);
            }
        });

    });

    describe('#scripts', function () {
        it('should create several scripts for user', async () => {
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


        it('should fail if script version already exists', async () => {
            await contract.addscript(bob.account, 'script1', 'v1', 'Newton function', 'abc', 'http://example.com', bob.permission);
            await contract.addscript(bob.account, 'script1', 'v2', 'Einstein function', 'def', 'http://eindef.com', bob.permission);
            await contract.addscript(bob.account, 'script1', 'v2', 'Einstein function', 'def', 'http://eindef.com', bob.permission)
                .should.be.rejected;
        });
    });

    describe('#approves', function () {
        it('should not be approved by default', async () => {
            await contract.regprov(alice.account, 'Alice provider', alice.permission);
            await contract.addscript(bob.account, 'script1', 'v1', 'Newton function', 'abc', 'http://example.com', bob.permission);
            let approved = await util.isScriptApproved(alice.account, bob.account, 'script1', 'v1');
            assert.isFalse(approved);

        });
        it('should approve existing script', async () => {
            await contract.regprov(alice.account, 'Alice provider', alice.permission);
            await contract.addscript(bob.account, 'script1', 'v1', 'Newton function', 'abc', 'http://example.com', bob.permission);
            await contract.approve(alice.account, bob.account, 'script1', 'v1', alice.permission);
            let approved = await util.isScriptApproved(alice.account, bob.account, 'script1', 'v1');
            assert.isTrue(approved);

        });
        it('should deny approved script', async () => {
            await contract.regprov(alice.account, 'Alice provider', alice.permission);
            await contract.addscript(bob.account, 'script1', 'v1', 'Newton function', 'abc', 'http://example.com', bob.permission);
            await contract.approve(alice.account, bob.account, 'script1', 'v1', alice.permission);
            await contract.deny(alice.account, bob.account, 'script1', 'v1', alice.permission);
            let approved = await util.isScriptApproved(alice.account, bob.account, 'script1', 'v1');
            assert.isFalse(approved);
        });
        it('should not update script if it approved', async () => {
            await contract.regprov(alice.account, 'Alice provider', alice.permission);
            await contract.addscript(bob.account, 'script1', 'v1', 'Description', 'Hash', 'Url', bob.permission);
            await contract.approve(alice.account, bob.account, 'script1', 'v1', alice.permission);
            await contract.updscript(bob.account, 'script1', 'v1', 'Newton function', 'abc', 'http://example.com', bob.permission)
                .should.be.rejected;
            await contract.deny(alice.account, bob.account, 'script1', 'v1', alice.permission);
            await contract.updscript(bob.account, 'script1', 'v1', 'Newton function', 'abc', 'http://example.com', bob.permission);
        });
    });
});