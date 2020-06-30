
const AggregionBlockchain = require('../js/AggregionBlockchain.js');
const AggregionContract = require('../js/AggregionContract.js');
const AggregionUtility = require('../js/AggregionUtility.js');
const AggregionNode = require('../js/AggregionNode.js');
const TestsConfig = require('../js/TestsConfig.js');

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const check = require('check-types');
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
    let aggregion = null;

    this.timeout(0);

    beforeEach(async function () {
        await node.start();
        aggregion = await makeAccount(bc, config.contract.account);
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
            await contract.remsvc(alice.account, 'svc1', alice.permission);
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
            await contract.remscript(bob.account, 'script1', 'v1', bob.permission);
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
        it('should not update script if it is approved', async () => {
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
            await contract.remscript(bob.account, 'script1', 'v1', bob.permission)
                .should.be.rejected;
            await contract.deny(alice.account, bob.account, 'script1', 'v1', alice.permission);
            await contract.remscript(bob.account, 'script1', 'v1', bob.permission);
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

    describe('#categories', function () {
        it('should add root category and assign auto generated id', async () => {
            await contract.catinsert(null, null, 'abc', aggregion.permission);
            let rows = await util.getCategories();
            let item = rows.pop();
            assert.equal(1, item.id);
            assert.equal(0, item.parent_id);
            assert.equal(0, item.childs_count);
            assert.equal('abc', item.name);
        });
        it('should not accept zero id value', async () => {
            await contract.catinsert(0, null, 'abc', aggregion.permission)
                .should.be.rejected;
        });
        it('should add root category with specified id', async () => {
            await contract.catinsert(126, null, 'abc', aggregion.permission);
            let rows = await util.getCategories();
            let item = rows.pop();
            assert.equal(126, item.id);
            assert.equal(0, item.parent_id);
            assert.equal(0, item.childs_count);
            assert.equal('abc', item.name);
        });
        it('should add subcategory', async () => {
            await contract.catinsert(1250, null, 'abc', aggregion.permission);
            await contract.catinsert(1260, 1250, 'def', aggregion.permission);
            let first = await util.getCategoryById(1250);
            assert.equal(0, first.parent_id);
            let second = await util.getCategoryById(1260);
            assert.equal(1250, second.parent_id);
        });
        it('should remove category', async () => {
            await contract.catinsert(224, null, 'abc', aggregion.permission);
            await contract.catremove(224, aggregion.permission);
            let rows = await util.getCategories();
            assert.equal(0, rows.length);
        });
        it('should not remove category if it has subcategories', async () => {
            await contract.catinsert(1250, null, 'abc', aggregion.permission);
            await contract.catinsert(1260, 1250, 'def', aggregion.permission);
            await contract.catremove(1250, aggregion.permission)
                .should.be.rejected;
        });
        it('should remove category after its subcategories was removed', async () => {
            await contract.catinsert(1250, null, 'abc', aggregion.permission);
            await contract.catinsert(1260, 1250, 'def', aggregion.permission);
            await contract.catremove(1260, aggregion.permission);
            await contract.catremove(1250, aggregion.permission);
            let rows = await util.getCategories();
            assert.equal(0, rows.length);
        });
        it('should deny insert for non-root accounts', async () => {
            const alice = await makeAccount(bc, 'alice');
            await contract.catinsert(null, 'abc', alice.permission)
                .should.be.rejected;
        });
        it('should deny remove for non-root accounts', async () => {
            await contract.catinsert(125, null, 'abc', aggregion.permission);
            const alice = await makeAccount(bc, 'alice');
            await contract.catremove(125, alice.permission)
                .should.be.rejected;
        });
        it('should find subcategories', async () => {
            await contract.catinsert(1250, null, '111', aggregion.permission);
            await contract.catinsert(1260, 1250, '222', aggregion.permission);
            await contract.catinsert(1261, 1250, '333', aggregion.permission);
            await contract.catinsert(1262, 1250, '444', aggregion.permission);
            await contract.catinsert(1270, null, '555', aggregion.permission);
            let rows = await util.getSubcategories(1250);
            assert.equal(3, rows.length);
        });

        it('should build path for category at full depth', async () => {
            await contract.catinsert(1111, null, '111', aggregion.permission);
            await contract.catinsert(2222, 1111, '222', aggregion.permission);
            await contract.catinsert(3333, 2222, '333', aggregion.permission);
            await contract.catinsert(4444, 3333, '444', aggregion.permission);
            await contract.catinsert(5555, 4444, '555', aggregion.permission);
            {
                let path = await util.getCategoryPath(5555);
                assert.equal("111", path.a0);
                assert.equal("222", path.a1);
                assert.equal("333", path.a2);
                assert.equal("444", path.a3);
                assert.equal("555", path.a4);
            }
            {
                let path = await util.getCategoryPath(3333);
                assert.equal("111", path.a0);
                assert.equal("222", path.a1);
                assert.equal("333", path.a2);
                assert.equal(null, path.a3);
                assert.equal(null, path.a4);
            }
        });
    });

    describe('#vendors', function () {
        it('should add vendor and assign auto generated id', async () => {
            await contract.vendinsert(null, 'abc', aggregion.permission);
            let rows = await util.getVendors();
            let item = rows.pop();
            assert.equal(1, item.id);
            assert.equal(0, item.brands_count);
            assert.equal('abc', item.name);
        });
        it('should not accept zero id value', async () => {
            await contract.vendinsert(0, 'abc', aggregion.permission)
                .should.be.rejected;
        });
        it('should add vendor with specified id', async () => {
            await contract.vendinsert(126, 'abc', aggregion.permission);
            let rows = await util.getVendors();
            let item = rows.pop();
            assert.equal(126, item.id);
            assert.equal(0, item.brands_count);
            assert.equal('abc', item.name);
        });
        it('should remove vendor', async () => {
            await contract.vendinsert(224, 'abc', aggregion.permission);
            await contract.vendremove(224, aggregion.permission);
            let rows = await util.getVendors();
            assert.equal(0, rows.length);
        });
        it('should deny insert vendor for non-root accounts', async () => {
            const alice = await makeAccount(bc, 'alice');
            await contract.vendinsert(null, 'abc', alice.permission)
                .should.be.rejected;
        });
        it('should deny remove for non-root accounts', async () => {
            await contract.vendinsert(125, 'abc', aggregion.permission);
            const alice = await makeAccount(bc, 'alice');
            await contract.vendremove(125, alice.permission)
                .should.be.rejected;
        });
    });

    describe('#brands', function () {
        it('should add brand and assign auto generated id', async () => {
            await contract.brandinsert(null, 'abc', aggregion.permission);
            let rows = await util.getBrands();
            let item = rows.pop();
            assert.equal(1, item.id);
            assert.equal('abc', item.name);
        });
        it('should not accept zero id value', async () => {
            await contract.brandinsert(0, 'abc', aggregion.permission)
                .should.be.rejected;
        });
        it('should add brand with specified id', async () => {
            await contract.brandinsert(222, 'abc', aggregion.permission);
            let rows = await util.getBrands();
            let item = rows.pop();
            assert.equal(222, item.id);
            assert.equal('abc', item.name);
        });
        it('should remove brand', async () => {
            await contract.brandinsert(224, 'abc', aggregion.permission);
            await contract.brandremove(224, aggregion.permission);
            let rows = await util.getBrands();
            assert.equal(0, rows.length);
        });
        it('should deny insert brand for non-root accounts', async () => {
            const alice = await makeAccount(bc, 'alice');
            await contract.brandinsert(224, 'abc', alice.permission)
                .should.be.rejected;
        });
        it('should deny remove for non-root accounts', async () => {
            const alice = await makeAccount(bc, 'alice');
            await contract.brandinsert(224, 'abc', aggregion.permission)
            await contract.brandremove(224, alice.permission)
                .should.be.rejected;
        });
    });

    describe('#vendor/brands', function () {
        it('should not bind duplicate brand to vendor', async () => {
            await contract.vendinsert(125, 'Vendor', aggregion.permission);
            await contract.brandinsert(33, 'Brand', aggregion.permission);
            await contract.bindBrandToVendor(125, 33, aggregion.permission);
            await contract.bindBrandToVendor(125, 33, aggregion.permission)
                .should.be.rejected;
        });
        it('should bind brand to many vendors', async () => {
            await contract.brandinsert(99, 'Brand', aggregion.permission);
            await contract.vendinsert(111, 'Vendor One', aggregion.permission);
            await contract.vendinsert(222, 'Vendor Two', aggregion.permission);
            await contract.bindBrandToVendor(111, 99, aggregion.permission);
            await contract.bindBrandToVendor(222, 99, aggregion.permission)
                .should.not.be.rejected;
        });
        it('should not remove vendor if it has brands', async () => {
            await contract.vendinsert(125, 'Vendor', aggregion.permission);
            await contract.brandinsert(33, 'Brand', aggregion.permission);
            await contract.bindBrandToVendor(125, 33, aggregion.permission);
            await contract.vendremove(125, aggregion.permission)
                .should.be.rejected;
        });
        it('should remove vendor after its brands was removed', async () => {
            await contract.vendinsert(125, 'Vendor', aggregion.permission);
            await contract.brandinsert(33, 'Brand', aggregion.permission);
            await contract.bindBrandToVendor(125, 33, aggregion.permission);
            await contract.unbindBrandFromVendor(125, 33, aggregion.permission);
            await contract.vendremove(125, aggregion.permission);
        });
        it('should not remove brand if it binded to vendor', async () => {
            await contract.vendinsert(125, 'Vendor', aggregion.permission);
            await contract.brandinsert(33, 'Brand', aggregion.permission);
            await contract.bindBrandToVendor(125, 33, aggregion.permission);
            await contract.brandremove(33, aggregion.permission)
                .should.be.rejected;
        });
        it('should remove brand after it unbinded from vendor', async () => {
            await contract.vendinsert(125, 'Vendor', aggregion.permission);
            await contract.brandinsert(33, 'Brand', aggregion.permission);
            await contract.bindBrandToVendor(125, 33, aggregion.permission);
            await contract.unbindBrandFromVendor(125, 33, aggregion.permission);
            await contract.brandremove(33, aggregion.permission);
        });
    });

    describe('#regions', function () {
        it('should add region and assign auto generated id', async () => {
            await contract.regioninsert(null, 'abc', aggregion.permission);
            let rows = await util.getRegions();
            let item = rows.pop();
            assert.equal(1, item.id);
            assert.equal(0, item.cities_count);
            assert.equal('abc', item.name);
        });
        it('should not accept zero id value', async () => {
            await contract.regioninsert(0, 'abc', aggregion.permission)
                .should.be.rejected;
        });
        it('should add region with specified id', async () => {
            await contract.regioninsert(126, 'abc', aggregion.permission);
            let rows = await util.getRegions();
            let item = rows.pop();
            assert.equal(126, item.id);
            assert.equal(0, item.cities_count);
            assert.equal('abc', item.name);
        });
        it('should remove region', async () => {
            await contract.regioninsert(224, 'abc', aggregion.permission);
            await contract.regionremove(224, aggregion.permission);
            let rows = await util.getRegions();
            assert.equal(0, rows.length);
        });
        it('should not remove region if city has references to it', async () => {
            await contract.regioninsert(111, 'Russia', aggregion.permission);
            await contract.citytypeins(222, 'Village', aggregion.permission);
            await contract.cityinsert(333, 111, 222, 'Moscow', 100000, aggregion.permission);
            await contract.regionremove(111, aggregion.permission)
                .should.be.rejected;
        });
        it('should remove region after city reference was removed', async () => {
            await contract.regioninsert(111, 'Russia', aggregion.permission);
            await contract.citytypeins(222, 'Village', aggregion.permission);
            await contract.cityinsert(333, 111, 222, 'Moscow', 100000, aggregion.permission);
            await contract.cityremove(333, aggregion.permission);
            await contract.regionremove(111, aggregion.permission);
        });
        it('should deny insert region for non-root accounts', async () => {
            const alice = await makeAccount(bc, 'alice');
            await contract.regioninsert(null, 'abc', alice.permission)
                .should.be.rejected;
        });
        it('should deny remove for non-root accounts', async () => {
            await contract.regioninsert(125, 'abc', aggregion.permission);
            const alice = await makeAccount(bc, 'alice');
            await contract.regionremove(125, alice.permission)
                .should.be.rejected;
        });
        it('should find region cities', async () => {
            await contract.regioninsert(125, 'Russia', aggregion.permission);
            await contract.citytypeins(222, 'Village', aggregion.permission);
            await contract.cityinsert(33, 125, 222, 'Moscow', 100000, aggregion.permission);
            await contract.cityinsert(44, 125, 222, 'St.Peterburg', 100000, aggregion.permission);
            await contract.cityinsert(55, 125, 222, 'Kazan', 100000, aggregion.permission);
            const rows = await util.getRegionCities(125);
            assert.equal(3, rows.length);
        });
    });


    describe('#citytypes', function () {
        it('should add city type and assign auto generated id', async () => {
            await contract.citytypeins(null, 'abc', aggregion.permission);
            let rows = await util.getCityTypes();
            let item = rows.pop();
            assert.equal(1, item.id);
            assert.equal(0, item.cities_count);
            assert.equal('abc', item.name);
        });
        it('should not accept zero id value', async () => {
            await contract.citytypeins(0, 'abc', aggregion.permission)
                .should.be.rejected;
        });
        it('should add city type with specified id', async () => {
            await contract.citytypeins(126, 'abc', aggregion.permission);
            let rows = await util.getCityTypes();
            let item = rows.pop();
            assert.equal(126, item.id);
            assert.equal(0, item.cities_count);
            assert.equal('abc', item.name);
        });
        it('should remove city type', async () => {
            await contract.citytypeins(224, 'abc', aggregion.permission);
            await contract.citytyperem(224, aggregion.permission);
            let rows = await util.getCityTypes();
            assert.equal(0, rows.length);
        });
        it('should not remove city type if city has references to it', async () => {
            await contract.regioninsert(125, 'Russia', aggregion.permission);
            await contract.citytypeins(2222, 'Village', aggregion.permission);
            await contract.cityinsert(33, 125, 2222, 'Moscow', 20000, aggregion.permission);
            await contract.citytyperem(2222, aggregion.permission)
                .should.be.rejected;
        });
        it('should remove city type after city reference was removed', async () => {
            await contract.regioninsert(125, 'Russia', aggregion.permission);
            await contract.citytypeins(2222, 'Village', aggregion.permission);
            await contract.cityinsert(33, 125, 2222, 'Moscow', 20000, aggregion.permission);
            await contract.cityremove(33, aggregion.permission);
            await contract.citytyperem(2222, aggregion.permission);
        });
        it('should deny insert for non-root accounts', async () => {
            const alice = await makeAccount(bc, 'alice');
            await contract.regioninsert(null, 'abc', alice.permission)
                .should.be.rejected;
        });
        it('should deny remove for non-root accounts', async () => {
            await contract.regioninsert(125, 'abc', aggregion.permission);
            const alice = await makeAccount(bc, 'alice');
            await contract.regionremove(125, alice.permission)
                .should.be.rejected;
        });
    });

    describe('#cities', function () {
        it('should add city and assign auto generated id', async () => {
            await contract.regioninsert(111, 'Europa', aggregion.permission);
            await contract.citytypeins(222, 'City', aggregion.permission);
            await contract.cityinsert(null, 111, 222, 'London', 125553, aggregion.permission);
            let rows = await util.getCities();
            let item = rows.pop();
            assert.equal(1, item.id);
            assert.equal(111, item.region_id);
            assert.equal(222, item.type_id);
            assert.equal('London', item.name);
            assert.equal(125553, item.population);
        });
        it('should add city with specified id', async () => {
            await contract.regioninsert(111, 'Europa', aggregion.permission);
            await contract.citytypeins(222, 'City', aggregion.permission);
            await contract.cityinsert(999, 111, 222, 'London', 125553, aggregion.permission);
            let rows = await util.getCities();
            let item = rows.pop();
            assert.equal(999, item.id);
        });
        it('should not accept zero id value', async () => {
            await contract.regioninsert(111, 'Europa', aggregion.permission);
            await contract.citytypeins(222, 'City', aggregion.permission);
            await contract.cityinsert(0, 111, 222, 'London', 125553, aggregion.permission)
                .should.be.rejected;
        });
        it('should decline city if region is unknown', async () => {
            await contract.citytypeins(222, 'citytype', aggregion.permission);
            await contract.cityinsert(999, 0, 222, 'city', 125553, aggregion.permission)
                .should.be.rejected;
        });
        it('should decline city if city type is unknown', async () => {
            await contract.regioninsert(111, 'Europa', aggregion.permission);
            await contract.cityinsert(999, 111, 0, 'city', 125553, aggregion.permission)
                .should.be.rejected;
        });
        it('should remove city', async () => {
            await contract.regioninsert(111, 'Europa', aggregion.permission);
            await contract.citytypeins(222, 'City', aggregion.permission);
            await contract.cityinsert(999, 111, 222, 'London', 125553, aggregion.permission);
            await contract.cityremove(999, aggregion.permission);
            let rows = await util.getCities();
            assert.equal(0, rows.length);
        });
        it('should deny insert for non-root accounts', async () => {
            const alice = await makeAccount(bc, 'alice');
            await contract.regioninsert(111, 'Europa', aggregion.permission);
            await contract.citytypeins(222, 'City', aggregion.permission);
            await contract.cityinsert(999, 111, 222, 'London', 125553, alice.permission)
                .should.be.rejected;
        });
        it('should deny remove for non-root accounts', async () => {
            const alice = await makeAccount(bc, 'alice');
            await contract.regioninsert(111, 'Europa', aggregion.permission);
            await contract.citytypeins(222, 'City', aggregion.permission);
            await contract.cityinsert(999, 111, 222, 'London', 125553, aggregion.permission);
            await contract.cityremove(999, alice.permission)
                .should.be.rejected;
        });
    });
});
