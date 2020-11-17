
const AggregionBlockchain = require('../js/AggregionBlockchain.js');
const AggregionNode = require('../js/AggregionNode.js');
const CatalogsContract = require('../js/CatalogsContract.js');
const CatalogsUtility = require('../js/CatalogsUtility.js');
const TestConfig = require('./TestConfig.js');
const tools = require('./TestTools.js');

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const check = require('check-types');
chai.use(chaiAsPromised);
var assert = chai.assert;
var should = chai.should();

describe('Catalogs', function () {

    const config = new TestConfig(__dirname + '/config.json')
    const contractConfig = config.contracts.catalogs;

    let node = new AggregionNode(config.getSignatureProvider(), config.node.executable, config.node.endpoint, config.node.workdir);
    let bc = new AggregionBlockchain(config.getNodeUrl(), [config.blockchain.eosio_root_key.private], config.debug);
    let contract = new CatalogsContract(contractConfig.account, bc);
    let util = new CatalogsUtility(contractConfig.account, bc);
    let catalogs = null;

    this.timeout(0);

    beforeEach(async function () {
        await node.start();
        catalogs = await tools.makeAccount(bc, contractConfig.account);
        await bc.deploy(catalogs.account, contractConfig.wasm, contractConfig.abi, catalogs.permission);
    });

    afterEach(async function () {
        await node.stop();
    });

    describe('#categories', function () {
        it('should add root category and assign auto generated id', async () => {
            await contract.catinsert(null, null, 'abc', catalogs.permission);
            let rows = await util.getCategories();
            let item = rows.pop();
            assert.equal(1, item.id);
            assert.equal(0, item.parent_id);
            assert.equal(0, item.childs_count);
            assert.equal('abc', item.name);
        });
        it('should not accept zero id value', async () => {
            await contract.catinsert(0, null, 'abc', catalogs.permission)
                .should.be.rejected;
        });
        it('should add root category with specified id', async () => {
            await contract.catinsert(126, null, 'abc', catalogs.permission);
            let rows = await util.getCategories();
            let item = rows.pop();
            assert.equal(126, item.id);
            assert.equal(0, item.parent_id);
            assert.equal(0, item.childs_count);
            assert.equal('abc', item.name);
        });
        it('should add subcategory', async () => {
            await contract.catinsert(1250, null, 'abc', catalogs.permission);
            await contract.catinsert(1260, 1250, 'def', catalogs.permission);
            let first = await util.getCategoryById(1250);
            assert.equal(0, first.parent_id);
            let second = await util.getCategoryById(1260);
            assert.equal(1250, second.parent_id);
        });
        it('should remove category', async () => {
            await contract.catinsert(224, null, 'abc', catalogs.permission);
            await contract.catremove(224, catalogs.permission);
            let rows = await util.getCategories();
            assert.equal(0, rows.length);
        });
        it('should not remove category if it has subcategories', async () => {
            await contract.catinsert(1250, null, 'abc', catalogs.permission);
            await contract.catinsert(1260, 1250, 'def', catalogs.permission);
            await contract.catremove(1250, catalogs.permission)
                .should.be.rejected;
        });
        it('should remove category after its subcategories was removed', async () => {
            await contract.catinsert(1250, null, 'abc', catalogs.permission);
            await contract.catinsert(1260, 1250, 'def', catalogs.permission);
            await contract.catremove(1260, catalogs.permission);
            await contract.catremove(1250, catalogs.permission);
            let rows = await util.getCategories();
            assert.equal(0, rows.length);
        });
        it('should deny insert for non-root accounts', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.catinsert(null, 'abc', alice.permission)
                .should.be.rejected;
        });
        it('should deny remove for non-root accounts', async () => {
            await contract.catinsert(125, null, 'abc', catalogs.permission);
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.catremove(125, alice.permission)
                .should.be.rejected;
        });
        it('should find subcategories', async () => {
            await contract.catinsert(1250, null, '111', catalogs.permission);
            await contract.catinsert(1260, 1250, '222', catalogs.permission);
            await contract.catinsert(1261, 1250, '333', catalogs.permission);
            await contract.catinsert(1262, 1250, '444', catalogs.permission);
            await contract.catinsert(1270, null, '555', catalogs.permission);
            let rows = await util.getSubcategories(1250);
            assert.equal(3, rows.length);
        });

        it('should build path for category at full depth', async () => {
            await contract.catinsert(1111, null, '111', catalogs.permission);
            await contract.catinsert(2222, 1111, '222', catalogs.permission);
            await contract.catinsert(3333, 2222, '333', catalogs.permission);
            await contract.catinsert(4444, 3333, '444', catalogs.permission);
            await contract.catinsert(5555, 4444, '555', catalogs.permission);
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
            await contract.vendinsert(null, 'abc', catalogs.permission);
            let rows = await util.getVendors();
            let item = rows.pop();
            assert.equal(1, item.id);
            assert.equal(0, item.brands_count);
            assert.equal('abc', item.name);
        });
        it('should not accept zero id value', async () => {
            await contract.vendinsert(0, 'abc', catalogs.permission)
                .should.be.rejected;
        });
        it('should add vendor with specified id', async () => {
            await contract.vendinsert(126, 'abc', catalogs.permission);
            let rows = await util.getVendors();
            let item = rows.pop();
            assert.equal(126, item.id);
            assert.equal(0, item.brands_count);
            assert.equal('abc', item.name);
        });
        it('should remove vendor', async () => {
            await contract.vendinsert(224, 'abc', catalogs.permission);
            await contract.vendremove(224, catalogs.permission);
            let rows = await util.getVendors();
            assert.equal(0, rows.length);
        });
        it('should deny insert vendor for non-root accounts', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.vendinsert(null, 'abc', alice.permission)
                .should.be.rejected;
        });
        it('should deny remove for non-root accounts', async () => {
            await contract.vendinsert(125, 'abc', catalogs.permission);
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.vendremove(125, alice.permission)
                .should.be.rejected;
        });
    });

    describe('#brands', function () {
        it('should add brand and assign auto generated id', async () => {
            await contract.brandinsert(null, 'abc', catalogs.permission);
            let rows = await util.getBrands();
            let item = rows.pop();
            assert.equal(1, item.id);
            assert.equal('abc', item.name);
        });
        it('should not accept zero id value', async () => {
            await contract.brandinsert(0, 'abc', catalogs.permission)
                .should.be.rejected;
        });
        it('should add brand with specified id', async () => {
            await contract.brandinsert(222, 'abc', catalogs.permission);
            let rows = await util.getBrands();
            let item = rows.pop();
            assert.equal(222, item.id);
            assert.equal('abc', item.name);
        });
        it('should remove brand', async () => {
            await contract.brandinsert(224, 'abc', catalogs.permission);
            await contract.brandremove(224, catalogs.permission);
            let rows = await util.getBrands();
            assert.equal(0, rows.length);
        });
        it('should deny insert brand for non-root accounts', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.brandinsert(224, 'abc', alice.permission)
                .should.be.rejected;
        });
        it('should deny remove for non-root accounts', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.brandinsert(224, 'abc', catalogs.permission)
            await contract.brandremove(224, alice.permission)
                .should.be.rejected;
        });
    });

    describe('#vendor/brands', function () {
        it('should not bind duplicate brand to vendor', async () => {
            await contract.vendinsert(125, 'Vendor', catalogs.permission);
            await contract.brandinsert(33, 'Brand', catalogs.permission);
            await contract.bindBrandToVendor(125, 33, catalogs.permission);
            await contract.bindBrandToVendor(125, 33, catalogs.permission)
                .should.be.rejected;
        });
        it('should bind brand to many vendors', async () => {
            await contract.brandinsert(99, 'Brand', catalogs.permission);
            await contract.vendinsert(111, 'Vendor One', catalogs.permission);
            await contract.vendinsert(222, 'Vendor Two', catalogs.permission);
            await contract.bindBrandToVendor(111, 99, catalogs.permission);
            await contract.bindBrandToVendor(222, 99, catalogs.permission)
                .should.not.be.rejected;
        });
        it('should not remove vendor if it has brands', async () => {
            await contract.vendinsert(125, 'Vendor', catalogs.permission);
            await contract.brandinsert(33, 'Brand', catalogs.permission);
            await contract.bindBrandToVendor(125, 33, catalogs.permission);
            await contract.vendremove(125, catalogs.permission)
                .should.be.rejected;
        });
        it('should remove vendor after its brands was removed', async () => {
            await contract.vendinsert(125, 'Vendor', catalogs.permission);
            await contract.brandinsert(33, 'Brand', catalogs.permission);
            await contract.bindBrandToVendor(125, 33, catalogs.permission);
            await contract.unbindBrandFromVendor(125, 33, catalogs.permission);
            await contract.vendremove(125, catalogs.permission);
        });
        it('should not remove brand if it binded to vendor', async () => {
            await contract.vendinsert(125, 'Vendor', catalogs.permission);
            await contract.brandinsert(33, 'Brand', catalogs.permission);
            await contract.bindBrandToVendor(125, 33, catalogs.permission);
            await contract.brandremove(33, catalogs.permission)
                .should.be.rejected;
        });
        it('should remove brand after it unbinded from vendor', async () => {
            await contract.vendinsert(125, 'Vendor', catalogs.permission);
            await contract.brandinsert(33, 'Brand', catalogs.permission);
            await contract.bindBrandToVendor(125, 33, catalogs.permission);
            await contract.unbindBrandFromVendor(125, 33, catalogs.permission);
            await contract.brandremove(33, catalogs.permission);
        });
    });

    describe('#regions', function () {
        it('should add region and assign auto generated id', async () => {
            await contract.regioninsert(null, 'abc', catalogs.permission);
            let rows = await util.getRegions();
            let item = rows.pop();
            assert.equal(1, item.id);
            assert.equal(0, item.cities_count);
            assert.equal('abc', item.name);
        });
        it('should not accept zero id value', async () => {
            await contract.regioninsert(0, 'abc', catalogs.permission)
                .should.be.rejected;
        });
        it('should add region with specified id', async () => {
            await contract.regioninsert(126, 'abc', catalogs.permission);
            let rows = await util.getRegions();
            let item = rows.pop();
            assert.equal(126, item.id);
            assert.equal(0, item.cities_count);
            assert.equal('abc', item.name);
        });
        it('should remove region', async () => {
            await contract.regioninsert(224, 'abc', catalogs.permission);
            await contract.regionremove(224, catalogs.permission);
            let rows = await util.getRegions();
            assert.equal(0, rows.length);
        });
        it('should not remove region if city has references to it', async () => {
            await contract.regioninsert(111, 'Russia', catalogs.permission);
            await contract.citytypeins(222, 'Village', catalogs.permission);
            await contract.cityinsert(333, 111, 222, 'Moscow', 100000, catalogs.permission);
            await contract.regionremove(111, catalogs.permission)
                .should.be.rejected;
        });
        it('should remove region after city reference was removed', async () => {
            await contract.regioninsert(111, 'Russia', catalogs.permission);
            await contract.citytypeins(222, 'Village', catalogs.permission);
            await contract.cityinsert(333, 111, 222, 'Moscow', 100000, catalogs.permission);
            await contract.cityremove(333, catalogs.permission);
            await contract.regionremove(111, catalogs.permission);
        });
        it('should deny insert region for non-root accounts', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.regioninsert(null, 'abc', alice.permission)
                .should.be.rejected;
        });
        it('should deny remove for non-root accounts', async () => {
            await contract.regioninsert(125, 'abc', catalogs.permission);
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.regionremove(125, alice.permission)
                .should.be.rejected;
        });
        it('should find region cities', async () => {
            await contract.regioninsert(125, 'Russia', catalogs.permission);
            await contract.citytypeins(222, 'Village', catalogs.permission);
            await contract.cityinsert(33, 125, 222, 'Moscow', 100000, catalogs.permission);
            await contract.cityinsert(44, 125, 222, 'St.Peterburg', 100000, catalogs.permission);
            await contract.cityinsert(55, 125, 222, 'Kazan', 100000, catalogs.permission);
            const rows = await util.getRegionCities(125);
            assert.equal(3, rows.length);
        });
    });


    describe('#citytypes', function () {
        it('should add city type and assign auto generated id', async () => {
            await contract.citytypeins(null, 'abc', catalogs.permission);
            let rows = await util.getCityTypes();
            let item = rows.pop();
            assert.equal(1, item.id);
            assert.equal(0, item.cities_count);
            assert.equal('abc', item.name);
        });
        it('should not accept zero id value', async () => {
            await contract.citytypeins(0, 'abc', catalogs.permission)
                .should.be.rejected;
        });
        it('should add city type with specified id', async () => {
            await contract.citytypeins(126, 'abc', catalogs.permission);
            let rows = await util.getCityTypes();
            let item = rows.pop();
            assert.equal(126, item.id);
            assert.equal(0, item.cities_count);
            assert.equal('abc', item.name);
        });
        it('should remove city type', async () => {
            await contract.citytypeins(224, 'abc', catalogs.permission);
            await contract.citytyperem(224, catalogs.permission);
            let rows = await util.getCityTypes();
            assert.equal(0, rows.length);
        });
        it('should not remove city type if city has references to it', async () => {
            await contract.regioninsert(125, 'Russia', catalogs.permission);
            await contract.citytypeins(2222, 'Village', catalogs.permission);
            await contract.cityinsert(33, 125, 2222, 'Moscow', 20000, catalogs.permission);
            await contract.citytyperem(2222, catalogs.permission)
                .should.be.rejected;
        });
        it('should remove city type after city reference was removed', async () => {
            await contract.regioninsert(125, 'Russia', catalogs.permission);
            await contract.citytypeins(2222, 'Village', catalogs.permission);
            await contract.cityinsert(33, 125, 2222, 'Moscow', 20000, catalogs.permission);
            await contract.cityremove(33, catalogs.permission);
            await contract.citytyperem(2222, catalogs.permission);
        });
        it('should deny insert for non-root accounts', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.regioninsert(null, 'abc', alice.permission)
                .should.be.rejected;
        });
        it('should deny remove for non-root accounts', async () => {
            await contract.regioninsert(125, 'abc', catalogs.permission);
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.regionremove(125, alice.permission)
                .should.be.rejected;
        });
    });

    describe('#cities', function () {
        it('should add city and assign auto generated id', async () => {
            await contract.regioninsert(111, 'Europa', catalogs.permission);
            await contract.citytypeins(222, 'City', catalogs.permission);
            await contract.cityinsert(null, 111, 222, 'London', 125553, catalogs.permission);
            let rows = await util.getCities();
            let item = rows.pop();
            assert.equal(1, item.id);
            assert.equal(111, item.region_id);
            assert.equal(222, item.type_id);
            assert.equal('London', item.name);
            assert.equal(125553, item.population);
        });
        it('should add city with specified id', async () => {
            await contract.regioninsert(111, 'Europa', catalogs.permission);
            await contract.citytypeins(222, 'City', catalogs.permission);
            await contract.cityinsert(999, 111, 222, 'London', 125553, catalogs.permission);
            let rows = await util.getCities();
            let item = rows.pop();
            assert.equal(999, item.id);
        });
        it('should not accept zero id value', async () => {
            await contract.regioninsert(111, 'Europa', catalogs.permission);
            await contract.citytypeins(222, 'City', catalogs.permission);
            await contract.cityinsert(0, 111, 222, 'London', 125553, catalogs.permission)
                .should.be.rejected;
        });
        it('should decline city if region is unknown', async () => {
            await contract.citytypeins(222, 'citytype', catalogs.permission);
            await contract.cityinsert(999, 0, 222, 'city', 125553, catalogs.permission)
                .should.be.rejected;
        });
        it('should decline city if city type is unknown', async () => {
            await contract.regioninsert(111, 'Europa', catalogs.permission);
            await contract.cityinsert(999, 111, 0, 'city', 125553, catalogs.permission)
                .should.be.rejected;
        });
        it('should remove city', async () => {
            await contract.regioninsert(111, 'Europa', catalogs.permission);
            await contract.citytypeins(222, 'City', catalogs.permission);
            await contract.cityinsert(999, 111, 222, 'London', 125553, catalogs.permission);
            await contract.cityremove(999, catalogs.permission);
            let rows = await util.getCities();
            assert.equal(0, rows.length);
        });
        it('should deny insert for non-root accounts', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.regioninsert(111, 'Europa', catalogs.permission);
            await contract.citytypeins(222, 'City', catalogs.permission);
            await contract.cityinsert(999, 111, 222, 'London', 125553, alice.permission)
                .should.be.rejected;
        });
        it('should deny remove for non-root accounts', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.regioninsert(111, 'Europa', catalogs.permission);
            await contract.citytypeins(222, 'City', catalogs.permission);
            await contract.cityinsert(999, 111, 222, 'London', 125553, catalogs.permission);
            await contract.cityremove(999, alice.permission)
                .should.be.rejected;
        });
    });
});
