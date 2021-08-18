
const AggregionBlockchain = require('../js/AggregionBlockchain.js');
const AggregionNode = require('../js/AggregionNode.js');
const CatalogsContract = require('../js/CatalogsContract.js');
const CatalogsUtility = require('../js/CatalogsUtility.js');
const TestConfig = require('./TestConfig.js');
const tools = require('./TestTools.js');

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const check = require('check-types');
const { utils } = require('mocha');
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

    describe('#region countries', function () {
        it('should not assign country to unknown region', async () => {
            await contract.setRegionCountry(1, 2, catalogs.permission)
                .should.be.rejectedWith('404. Region not found');
        });
        it('should fail if try to unset country for unknown region', async () => {
            await contract.unsetRegionCountry(999, catalogs.permission)
                .should.be.rejectedWith('404. Region not found');
        });
        it('should assign and update region country', async () => {
            await contract.regioninsert(111, 'en', 'Tatarstan', catalogs.permission);
            await contract.regioninsert(222, 'en', 'Tatarstan', catalogs.permission);
            await contract.setRegionCountry(111, 333, catalogs.permission).should.not.be.rejectedWith('404. Region not found');
            await contract.setRegionCountry(111, 555, catalogs.permission).should.not.be.rejectedWith('404. Region not found');
            await contract.setRegionCountry(222, 777, catalogs.permission).should.not.be.rejectedWith('404. Region not found');
            const countries = await util.getRegionsCountries();
            assert.equal(2, countries.length);
            assert.equal(555, await util.getRegionCountry(111));
            assert.equal(777, await util.getRegionCountry(222));
            await contract.setRegionCountry(222, 888, catalogs.permission).should.not.be.rejectedWith('404. Region not found');
            assert.equal(888, await util.getRegionCountry(222));
        });
        it('should remove region country', async () => {
            await contract.regioninsert(111, 'en', 'Tatarstan', catalogs.permission);
            await contract.setRegionCountry(111, 555, catalogs.permission).should.not.be.rejectedWith('404. Region not found');
            assert.equal(555, await util.getRegionCountry(111));
            await contract.unsetRegionCountry(111, catalogs.permission).should.not.be.rejectedWith('404. Region not found');
            assert.isEmpty(await util.getRegionsCountries());
        });
    });

    describe('#countries', function () {
        it('should insert countries', async () => {
            await contract.upsertCountry(1, 11111, 'en', 'aaa', catalogs.permission);
            await contract.upsertCountry(1, 22222, 'fr', 'bbb', catalogs.permission);
            await contract.upsertCountry(2, 33333, 'en', 'ccc', catalogs.permission);
            await contract.upsertCountry(3, 44444, 'en', 'ddd', catalogs.permission);

            assert.equal(22222, await util.getCountryCode(1));
            assert.equal(33333, await util.getCountryCode(2));
            assert.equal(44444, await util.getCountryCode(3));

            assert.equal('aaa', await util.getCountryName('en', 1));
            assert.equal('bbb', await util.getCountryName('fr', 1));
            assert.equal('ccc', await util.getCountryName('en', 2));
            assert.equal('ddd', await util.getCountryName('en', 3));

            assert.equal(3, (await util.getCountries()).length);
            assert.equal(3, (await util.getCountriesByLang('en')).length);
            assert.equal(1, (await util.getCountriesByLang('fr')).length);
        });
        it('should update country if it already exists', async () => {
            await contract.upsertCountry(1, 111, 'en', 'abc', catalogs.permission);
            assert.equal('abc', await util.getCountryName('en', 1));
            await contract.upsertCountry(1, 222, 'en', 'ABC', catalogs.permission)
                .should.not.be.rejected;
            assert.equal('ABC', await util.getCountryName('en', 1));
        });
        it('should not accept zero id value', async () => {
            await contract.upsertCountry(0, 111, 'en', 'abc', catalogs.permission)
                .should.be.rejected;
        });
        it('should remove country', async () => {
            await contract.upsertCountry(224, 111, 'en', 'abc', catalogs.permission);
            await contract.removeCountry(224, catalogs.permission);
            let rows = await util.getCountries();
            assert.equal(0, rows.length);
        });
        it('should deny insert country for non-root accounts', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.upsertCountry(1, 111, 'en', 'abc', alice.permission)
                .should.be.rejectedWith('missing authority of catalogs');
        });
        it('should deny remove for non-root accounts', async () => {
            await contract.upsertCountry(125, 111, 'en', 'abc', catalogs.permission);
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.removeCountry(125, alice.permission)
                .should.be.rejectedWith('missing authority of catalogs');
        });
    });

    describe('#cities countries', function () {
        it('should not assign country to unknown city', async () => {
            await contract.setCityCountry(1, 2, catalogs.permission)
                .should.be.rejectedWith('404. City not found');
        });
        it('should fail if try to unset country for unknown region', async () => {
            await contract.unsetCityCountry(999, catalogs.permission)
                .should.be.rejectedWith('404. City not found');
        });
        it('should assign and update city country', async () => {
            await contract.regioninsert(111, 'en', 'Europa', catalogs.permission);
            await contract.citytypeins(222, 'en', 'City', catalogs.permission);
            await contract.cityinsert(888, 111, 222, 'en', 'London', 125553, catalogs.permission);
            await contract.cityinsert(999, 111, 222, 'en', 'London', 125553, catalogs.permission);
            await contract.setCityCountry(888, 444, catalogs.permission).should.not.be.rejectedWith('404. City not found');
            await contract.setCityCountry(999, 555, catalogs.permission).should.not.be.rejectedWith('404. City not found');
            const countries = await util.getCitiesCountries();
            assert.equal(2, countries.length);
            assert.equal(555, await util.getCityCountry(999));
            await contract.setCityCountry(999, 777, catalogs.permission).should.not.be.rejectedWith('404. City not found');
            assert.equal(777, await util.getCityCountry(999));
        });
        it('should remove city country', async () => {
            await contract.regioninsert(111, 'en', 'Europa', catalogs.permission);
            await contract.citytypeins(222, 'en', 'City', catalogs.permission);
            await contract.cityinsert(999, 111, 222, 'en', 'London', 125553, catalogs.permission);
            await contract.setCityCountry(999, 555, catalogs.permission).should.not.be.rejectedWith('404. City not found');
            assert.equal(555, await util.getCityCountry(999));
            await contract.unsetCityCountry(999, catalogs.permission).should.not.be.rejectedWith('404. City not found');
            assert.isEmpty(await util.getCitiesCountries());
        });
    });

    describe('#cities type', function () {
        it('should not return unknown city', async () => {
            const city = await util.getCityById(1);
            assert.isUndefined(city);
        });
        it('should change city type', async () => {
            await contract.regioninsert(16, 'en', 'region', catalogs.permission);
            await contract.citytypeins(111, 'en', 'aaa', catalogs.permission);
            await contract.citytypeins(222, 'en', 'bbb', catalogs.permission);
            await contract.citytypeins(333, 'en', 'bbb', catalogs.permission);
            await contract.cityinsert(1, 16, 111, 'en', 'AAA', 1000, catalogs.permission);
            const before = await util.getCityById(1);
            assert.equal(111, before.type_id);
            await contract.citychtype(1, 222, catalogs.permission);
            const after = await util.getCityById(1);
            assert.equal(222, after.type_id);
        });
        it('should fail if city is unknown when change city type ', async () => {
            await contract.regioninsert(16, 'en', 'region', catalogs.permission);
            await contract.citytypeins(111, 'en', 'aaa', catalogs.permission);
            await contract.citytypeins(222, 'en', 'bbb', catalogs.permission);
            await contract.cityinsert(1, 16, 111, 'en', 'AAA', 1000, catalogs.permission);
            await contract.citychtype(999, 222, catalogs.permission)
                .should.be.rejectedWith('404. City not found');
        });
        it('should not change to unknown city type', async () => {
            await contract.regioninsert(16, 'en', 'region', catalogs.permission);
            await contract.citytypeins(111, 'en', 'aaa', catalogs.permission);
            await contract.cityinsert(1, 16, 111, 'en', 'AAA', 1000, catalogs.permission);
            const city = await util.getCityById(1);
            assert.equal(111, city.type_id);
            await contract.citychtype(1, 222, catalogs.permission)
                .should.be.rejectedWith('403. Unknown city type');
        });
    });

    describe('#cities translations', function () {
        it('should insert city with translations', async () => {
            await contract.citytypeins(999, 'en', 'citytype', catalogs.permission);
            await contract.regioninsert(16, 'en', 'region', catalogs.permission);
            await contract.cityinsert(111, 16, 999, 'en', 'AAA', 1000, catalogs.permission);
            assert.lengthOf(await util.getCitiesByLang('en'), 1);
            assert.equal('AAA', await util.getCityName('en', 111));
        });
        it('should update city translations', async () => {
            await contract.citytypeins(999, 'en', 'citytype', catalogs.permission);
            await contract.regioninsert(16, 'en', 'region', catalogs.permission);
            await contract.cityinsert(111, 16, 999, 'en', 'AAA', 1000, catalogs.permission);
            await contract.citytrans(111, 'en', 'BBB', catalogs.permission);
            const name = await util.getCityName('en', 111);
            assert.equal('BBB', name);
        });
        it('should remove city and its translations', async () => {
            await contract.citytypeins(999, 'en', 'citytype', catalogs.permission);
            await contract.regioninsert(16, 'en', 'region', catalogs.permission);
            await contract.cityinsert(111, 16, 999, 'en', 'AAA', 1000, catalogs.permission);
            await contract.citytrans(111, 'fr', 'AAA', catalogs.permission);
            await contract.cityremove(111, catalogs.permission);
            assert.lengthOf(await util.getCitiesByLang('en'), 0);
            assert.lengthOf(await util.getCitiesByLang('fr'), 0);
            assert.isUndefined(await util.getCityName('en', 111));
            assert.isUndefined(await util.getCityName('fr', 111));
        });
    });

    describe('#regions translations', function () {
        it('should insert region with translations', async () => {
            await contract.regioninsert(111, 'ru', 'AAA', catalogs.permission);
            await contract.regioninsert(222, 'ru', 'BBB', catalogs.permission);
            await contract.regioninsert(333, 'ru', 'CCC', catalogs.permission);
            await contract.regionupdate(111, 'en', 'DDD', catalogs.permission);
            await contract.regionupdate(222, 'en', 'EEE', catalogs.permission);
            await contract.regionupdate(111, 'fr', 'FFF', catalogs.permission);
            assert.lengthOf(await util.getRegionsByLang('ru'), 3);
            assert.equal('AAA', await util.getRegionName('ru', 111));
            assert.equal('BBB', await util.getRegionName('ru', 222));
            assert.equal('CCC', await util.getRegionName('ru', 333));
            assert.lengthOf(await util.getRegionsByLang('en'), 2);
            assert.equal('DDD', await util.getRegionName('en', 111));
            assert.equal('EEE', await util.getRegionName('en', 222));
            assert.lengthOf(await util.getRegionsByLang('fr'), 1);
            assert.equal('FFF', await util.getRegionName('fr', 111));
        });
        it('should update region translations', async () => {
            await contract.regioninsert(111, 'ru', 'AAA', catalogs.permission);
            await contract.regionupdate(111, 'ru', 'BBB', catalogs.permission);
            const name = await util.getRegionName('ru', 111);
            assert.equal('BBB', name);
        });
        it('should remove region and its translations', async () => {
            await contract.regioninsert(111, 'ru', 'город', catalogs.permission);
            await contract.regionupdate(111, 'fr', 'cité', catalogs.permission);
            await contract.regionremove(111, catalogs.permission);
            assert.lengthOf(await util.getRegionsByLang('ru'), 0);
            assert.lengthOf(await util.getRegionsByLang('fr'), 0);
            assert.isUndefined(await util.getRegionName('ru', 111));
            assert.isUndefined(await util.getRegionName('fr', 111));
        });
    });

    describe('#citytypes translations', function () {
        it('should not insert citytype if already exist', async () => {
            await contract.citytypeins(111, 'ru', 'AAA', catalogs.permission);
            await contract.citytypeins(111, 'ru', 'AAA', catalogs.permission)
                .should.be.rejectedWith("403. City type with specified ID already exists");
        });
        it('should not allow update non-existing citytype', async () => {
            await contract.citytypetrn(111, 'ru', 'AAA', catalogs.permission)
                .should.be.rejectedWith("404. City type not found");
        });
        it('should allow update existing citytype', async () => {
            await contract.citytypeins(111, 'ru', 'AAA', catalogs.permission);
            await contract.citytypetrn(111, 'ru', 'BBB', catalogs.permission)
                .should.not.be.rejectedWith("404. City type not found");
            assert.equal('BBB', await util.getCityTypeName('ru', 111));
        });
        it('should insert citytype with translations', async () => {
            await contract.citytypeins(111, 'ru', 'AAA', catalogs.permission);
            await contract.citytypeins(222, 'ru', 'BBB', catalogs.permission);
            await contract.citytypeins(333, 'ru', 'CCC', catalogs.permission);
            await contract.citytypetrn(111, 'en', 'DDD', catalogs.permission);
            await contract.citytypetrn(222, 'en', 'EEE', catalogs.permission);
            await contract.citytypetrn(111, 'fr', 'FFF', catalogs.permission);
            assert.lengthOf(await util.getCityTypesByLang('ru'), 3);
            assert.equal('AAA', await util.getCityTypeName('ru', 111));
            assert.equal('BBB', await util.getCityTypeName('ru', 222));
            assert.equal('CCC', await util.getCityTypeName('ru', 333));
            assert.lengthOf(await util.getCityTypesByLang('en'), 2);
            assert.equal('DDD', await util.getCityTypeName('en', 111));
            assert.equal('EEE', await util.getCityTypeName('en', 222));
            assert.lengthOf(await util.getCityTypesByLang('fr'), 1);
            assert.equal('FFF', await util.getCityTypeName('fr', 111));
        });
        it('should update citytype translations', async () => {
            await contract.citytypeins(111, 'ru', 'AAA', catalogs.permission);
            await contract.citytypetrn(111, 'ru', 'BBB', catalogs.permission);
            const name = await util.getCityTypeName('ru', 111);
            assert.equal('BBB', name);
        });
        it('should remove citytype and its translations', async () => {
            await contract.citytypeins(111, 'ru', 'город', catalogs.permission);
            await contract.citytypetrn(111, 'fr', 'cité', catalogs.permission);
            await contract.citytyperem(111, catalogs.permission);
            assert.lengthOf(await util.getCityTypesByLang('ru'), 0);
            assert.lengthOf(await util.getCityTypesByLang('fr'), 0);
            assert.isUndefined(await util.getCityTypeName('ru', 111));
            assert.isUndefined(await util.getCityTypeName('fr', 111));
        });
    });

    describe('#categories', function () {
        it('should not change parent after insert', async () => {
            await contract.catupsert(1111, null, 'ru', 'AAA', catalogs.permission);
            await contract.catupsert(2222, 1111, 'ru', 'BBB', catalogs.permission);
            await contract.catupsert(3333, null, 'ru', 'CCC', catalogs.permission);
            const check = async (id, parent, childs_count) => {
                const item = await util.getCategoryById(id);
                assert.equal(id, item.id);
                assert.equal(parent, item.parent_id, " invalid parent_id of " + id);
                assert.equal(childs_count, item.childs_count, " invalid childs_count of " + id);
            };
            await check(1111, 0, 1);
            await check(2222, 1111, 0);
            await check(3333, 0, 0);
            await contract.catupsert(2222, 3333, 'ru', 'bbb', catalogs.permission)
                .should.be.rejectedWith("403. Cant change parent with catupsert");
        });
        it('should not update parent child counter when new translation was added', async () => {
            await contract.catupsert(1111, null, 'ru', 'AAA', catalogs.permission);
            await contract.catupsert(2222, 1111, 'ru', 'BBB', catalogs.permission);
            const check = async (id, parent, childs_count) => {
                const item = await util.getCategoryById(id);
                assert.equal(id, item.id);
                assert.equal(parent, item.parent_id, " invalid parent_id of " + id);
                assert.equal(childs_count, item.childs_count, " invalid childs_count of " + id);
            };
            await check(1111, 0, 1);
            await check(2222, 1111, 0);
            await contract.catupsert(2222, 1111, 'en', 'BBB', catalogs.permission);
            await contract.catupsert(2222, 1111, 'fr', 'CCC', catalogs.permission);
            await check(1111, 0, 1);
            await check(2222, 1111, 0);
        });
        it('should remove category translations', async () => {
            await contract.catupsert(111, null, 'ru', 'Rus', catalogs.permission);
            await contract.catupsert(111, null, 'en', 'Eng', catalogs.permission);
            await contract.catupsert(222, null, 'en', 'En2', catalogs.permission);
            assert.equal('Rus', await util.getCategoryName('ru', 111));
            assert.equal('Eng', await util.getCategoryName('en', 111));
            assert.equal('En2', await util.getCategoryName('en', 222));
            await contract.catremove(111, catalogs.permission);
            assert.isUndefined(await util.getCategoryName('ru', 111));
            assert.isUndefined(await util.getCategoryName('en', 111));
            assert.equal('En2', await util.getCategoryName('en', 222));
        });
        it('should add category with translations', async () => {
            await contract.catupsert(111, null, 'ru', 'Rus', catalogs.permission);
            await contract.catupsert(111, null, 'en', 'Eng', catalogs.permission);
            await contract.catupsert(111, null, 'fr', 'Fra', catalogs.permission);
            assert.equal('Rus', await util.getCategoryName('ru', 111));
            assert.equal('Eng', await util.getCategoryName('en', 111));
            assert.equal('Fra', await util.getCategoryName('fr', 111));
        });
        it('should add category with translations. another method', async () => {
            await contract.catupsert(111, null, 'ru', 'Rus', catalogs.permission);
            await contract.catuptrans(111, 'en', 'Eng', catalogs.permission);
            await contract.catuptrans(111, 'fr', 'Fra', catalogs.permission);
            assert.equal('Rus', await util.getCategoryName('ru', 111));
            assert.equal('Eng', await util.getCategoryName('en', 111));
            assert.equal('Fra', await util.getCategoryName('fr', 111));
        });
        it('should not add translation for unknown category', async () => {
            await contract.catuptrans(111, 'en', 'Eng', catalogs.permission)
                .should.be.rejectedWith("404. Category not found");
        });
        it('should fetch categories translations by lang', async () => {
            await contract.catupsert(1111, null, 'ru', 'Rus', catalogs.permission);
            await contract.catupsert(2222, null, 'ru', 'Rus', catalogs.permission);
            await contract.catupsert(3333, null, 'ru', 'Rus', catalogs.permission);
            await contract.catupsert(4444, null, 'zz', 'Eng', catalogs.permission);
            await contract.catupsert(5555, null, 'zz', 'En2', catalogs.permission);
            const ru = await util.getCategoriesByLang('ru');
            assert.lengthOf(ru, 3);
            const zz = await util.getCategoriesByLang('zz');
            assert.lengthOf(zz, 2);
        });
        it('should update category translations', async () => {
            await contract.catupsert(111, null, 'ru', 'Rus', catalogs.permission);
            await contract.catupsert(111, null, 'en', 'Eng', catalogs.permission);
            assert.equal('Rus', await util.getCategoryName('ru', 111));
            assert.equal('Eng', await util.getCategoryName('en', 111));
            await contract.catupsert(111, null, 'en', 'ENG', catalogs.permission);
            assert.equal('ENG', await util.getCategoryName('en', 111));
        });
        it('should add root category', async () => {
            await contract.catupsert(1111, null, 'ru', 'abc', catalogs.permission);
            let rows = await util.getCategories();
            assert.lengthOf(rows, 1);
            let item = rows.pop();
            assert.equal(1111, item.id);
            assert.equal(0, item.parent_id);
            assert.equal(0, item.childs_count);
            assert.equal('', item.name);
        });
        it('should not accept zero id value', async () => {
            await contract.catupsert(0, null, 'ru', 'abc', catalogs.permission)
                .should.be.rejected;
        });
        it('should add subcategory', async () => {
            await contract.catupsert(1250, null, 'ru', 'abc', catalogs.permission);
            await contract.catupsert(1260, 1250, 'ru', 'def', catalogs.permission);
            let first = await util.getCategoryById(1250);
            assert.equal(0, first.parent_id);
            let second = await util.getCategoryById(1260);
            assert.equal(1250, second.parent_id);
        });
        it('should remove category', async () => {
            await contract.catupsert(224, null, 'ru', 'abc', catalogs.permission);
            await contract.catremove(224, catalogs.permission);
            let rows = await util.getCategories();
            assert.isEmpty(rows);
        });
        it('should not remove category if it has subcategories', async () => {
            await contract.catupsert(1250, null, 'ru', 'abc', catalogs.permission);
            await contract.catupsert(1260, 1250, 'ru', 'def', catalogs.permission);
            await contract.catremove(1250, catalogs.permission)
                .should.be.rejected;
        });
        it('should remove category after its subcategories was removed', async () => {
            await contract.catupsert(1250, null, 'ru', 'abc', catalogs.permission);
            await contract.catupsert(1260, 1250, 'ru', 'def', catalogs.permission);
            await contract.catremove(1260, catalogs.permission);
            await contract.catremove(1250, catalogs.permission);
            let rows = await util.getCategories();
            assert.isEmpty(rows);
        });
        it('should deny insert for non-root accounts', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.catupsert(1111, null, 'ru', 'abc', alice.permission)
                .should.be.rejectedWith('missing authority of catalogs');
        });
        it('should deny remove for non-root accounts', async () => {
            await contract.catupsert(125, null, 'ru', 'abc', catalogs.permission);
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.catremove(125, alice.permission)
                .should.be.rejected;
        });
        it('should find subcategories', async () => {
            await contract.catupsert(1250, null, 'ru', '111', catalogs.permission);
            await contract.catupsert(1260, 1250, 'ru', '222', catalogs.permission);
            await contract.catupsert(1261, 1250, 'ru', '333', catalogs.permission);
            await contract.catupsert(1262, 1250, 'ru', '444', catalogs.permission);
            await contract.catupsert(1270, null, 'ru', '555', catalogs.permission);
            let rows = await util.getSubcategories(1250);
            assert.equal(3, rows.length);
        });
        it('should build path for category at full depth', async () => {
            await contract.catupsert(1111, null, 'ru', '111', catalogs.permission);
            await contract.catupsert(2222, 1111, 'ru', '222', catalogs.permission);
            await contract.catupsert(3333, 2222, 'ru', '333', catalogs.permission);
            await contract.catupsert(4444, 3333, 'ru', '444', catalogs.permission);
            await contract.catupsert(5555, 4444, 'ru', '555', catalogs.permission);
            {
                let path = await util.getCategoryPath(5555, 'ru');
                assert.equal("111", path.a0);
                assert.equal("222", path.a1);
                assert.equal("333", path.a2);
                assert.equal("444", path.a3);
                assert.equal("555", path.a4);
            }
            {
                let path = await util.getCategoryPath(3333, 'ru');
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
                .should.be.rejectedWith('403. Vendor ID can\'t be zero');
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
                .should.be.rejectedWith('missing authority of catalogs');
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
                .should.be.rejectedWith('missing authority of catalogs');
        });
        it('should deny remove for non-root accounts', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.brandinsert(224, 'abc', catalogs.permission)
            await contract.brandremove(224, alice.permission)
                .should.be.rejectedWith('missing authority of catalogs');
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
        it('should ignore insert if region already exists', async () => {
            await contract.regioninsert(1, 'en', 'abc', catalogs.permission);
            await contract.regioninsert(1, 'en', 'abc', catalogs.permission)
                .should.be.rejectedWith('403. Region with specified ID already exists');
        });
        it('should not allow update non existing region', async () => {
            await contract.regionupdate(1, 'en', 'ABC', catalogs.permission)
                .should.be.rejectedWith('404. Region not found');
        });
        it('should allow update existing region', async () => {
            await contract.regioninsert(1, 'en', 'abc', catalogs.permission);
            await contract.regionupdate(1, 'en', 'ABC', catalogs.permission)
                .should.not.be.rejectedWith('403. Region already exists');
            assert.equal('ABC', await util.getRegionName('en', 1));
        });
        it('should add region', async () => {
            await contract.regioninsert(1, 'en', 'abc', catalogs.permission);
            let rows = await util.getRegions();
            let item = rows.pop();
            assert.equal(1, item.id);
            assert.equal(0, item.cities_count);
            assert.equal('abc', item.name);
        });
        it('should not accept zero id value', async () => {
            await contract.regioninsert(0, 'en', 'abc', catalogs.permission)
                .should.be.rejected;
        });
        it('should add region with specified id', async () => {
            await contract.regioninsert(126, 'en', 'abc', catalogs.permission);
            let rows = await util.getRegions();
            let item = rows.pop();
            assert.equal(126, item.id);
            assert.equal(0, item.cities_count);
            assert.equal('abc', item.name);
        });
        it('should remove region', async () => {
            await contract.regioninsert(224, 'en', 'abc', catalogs.permission);
            await contract.regionremove(224, catalogs.permission);
            let rows = await util.getRegions();
            assert.equal(0, rows.length);
        });
        it('should not remove region if city has references to it', async () => {
            await contract.regioninsert(111, 'en', 'Russia', catalogs.permission);
            await contract.citytypeins(222, 'en', 'Village', catalogs.permission);
            await contract.cityinsert(333, 111, 222, 'en', 'Moscow', 100000, catalogs.permission);
            await contract.regionremove(111, catalogs.permission)
                .should.be.rejected;
        });
        it('should remove region after city reference was removed', async () => {
            await contract.regioninsert(111, 'en', 'Russia', catalogs.permission);
            await contract.citytypeins(222, 'en', 'Village', catalogs.permission);
            await contract.cityinsert(333, 111, 222, 'en', 'Moscow', 100000, catalogs.permission);
            await contract.cityremove(333, catalogs.permission);
            await contract.regionremove(111, catalogs.permission);
        });
        it('should deny insert region for non-root accounts', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.regioninsert(1, 'en', 'abc', alice.permission)
                .should.be.rejectedWith('missing authority of catalogs');
        });
        it('should deny remove for non-root accounts', async () => {
            await contract.regioninsert(125, 'en', 'abc', catalogs.permission);
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.regionremove(125, alice.permission)
                .should.be.rejectedWith('missing authority of catalogs');
        });
        it('should find region cities', async () => {
            await contract.regioninsert(125, 'en', 'Russia', catalogs.permission);
            await contract.citytypeins(222, 'en', 'Village', catalogs.permission);
            await contract.cityinsert(33, 125, 222, 'en', 'Moscow', 100000, catalogs.permission);
            await contract.cityinsert(44, 125, 222, 'en', 'St.Peterburg', 100000, catalogs.permission);
            await contract.cityinsert(55, 125, 222, 'en', 'Kazan', 100000, catalogs.permission);
            const rows = await util.getCitiesByRegion(125);
            assert.equal(3, rows.length);
        });
    });


    describe('#citytypes', function () {
        it('should add city type', async () => {
            await contract.citytypeins(4, 'en', 'abc', catalogs.permission);
            let rows = await util.getCityTypes();
            let item = rows.pop();
            assert.equal(4, item.id);
            assert.equal(0, item.cities_count);
            assert.equal('', item.name);
        });
        it('should not accept zero id value', async () => {
            await contract.citytypeins(0, 'en', 'abc', catalogs.permission)
                .should.be.rejected;
        });
        it('should add city type with specified id', async () => {
            await contract.citytypeins(126, 'en', 'abc', catalogs.permission);
            let rows = await util.getCityTypes();
            let item = rows.pop();
            assert.equal(126, item.id);
            assert.equal(0, item.cities_count);
            assert.equal('', item.name);
        });
        it('should remove city type', async () => {
            await contract.citytypeins(224, 'en', 'abc', catalogs.permission);
            await contract.citytyperem(224, catalogs.permission);
            let rows = await util.getCityTypes();
            assert.equal(0, rows.length);
        });
        it('should not remove city type if city has references to it', async () => {
            await contract.regioninsert(125, 'en', 'Russia', catalogs.permission);
            await contract.citytypeins(2222, 'en', 'Village', catalogs.permission);
            await contract.cityinsert(33, 125, 2222, 'en', 'Moscow', 20000, catalogs.permission);
            await contract.citytyperem(2222, catalogs.permission)
                .should.be.rejectedWith('403. Region has cities');
        });
        it('should remove city type after city reference was removed', async () => {
            await contract.regioninsert(125, 'en', 'Russia', catalogs.permission);
            await contract.citytypeins(2222, 'en', 'Village', catalogs.permission);
            await contract.cityinsert(33, 125, 2222, 'en', 'Moscow', 20000, catalogs.permission);
            await contract.cityremove(33, catalogs.permission);
            await contract.citytyperem(2222, catalogs.permission);
        });
        it('should deny insert for non-root accounts', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.regioninsert(1, 'en', 'abc', alice.permission)
                .should.be.rejectedWith('missing authority of catalogs');
        });
        it('should deny remove for non-root accounts', async () => {
            await contract.regioninsert(125, 'en', 'abc', catalogs.permission);
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.regionremove(125, alice.permission)
                .should.be.rejectedWith('missing authority of catalogs');
        });
    });

    describe('#cities', function () {
        it('should ignore insert if city already exist', async () => {
            await contract.regioninsert(111, 'en', 'Europa', catalogs.permission);
            await contract.citytypeins(222, 'en', 'City', catalogs.permission);
            await contract.cityinsert(999, 111, 222, 'ru', 'London', 125553, catalogs.permission);
            await contract.cityinsert(999, 111, 222, 'ru', 'London', 125553, catalogs.permission)
                .should.be.rejectedWith("403. City with specified ID already exists");
        });
        it('should not allow update non-existing city', async () => {
            await contract.regioninsert(111, 'en', 'Europa', catalogs.permission);
            await contract.citytypeins(222, 'en', 'City', catalogs.permission);
            await contract.citytrans(999, 'ru', 'London', catalogs.permission)
                .should.be.rejectedWith("404. City not found");
        });
        it('should allow update existing city', async () => {
            await contract.regioninsert(111, 'en', 'Europa', catalogs.permission);
            await contract.citytypeins(222, 'en', 'City', catalogs.permission);
            await contract.cityinsert(999, 111, 222, 'ru', 'AAA', 125553, catalogs.permission);
            await contract.citytrans(999, 'ru', 'BBB', catalogs.permission)
                .should.not.be.rejectedWith("404. City not found");
            assert.equal('BBB', await util.getCityName('ru', 999));
        });
        it('should add city', async () => {
            await contract.regioninsert(111, 'en', 'Europa', catalogs.permission);
            await contract.citytypeins(222, 'en', 'City', catalogs.permission);
            await contract.cityinsert(999, 111, 222, 'ru', 'London', 125553, catalogs.permission);
            let rows = await util.getCities();
            let item = rows.pop();
            assert.equal(999, item.id);
            assert.equal(111, item.region_id);
            assert.equal(222, item.type_id);
            assert.equal('London', item.name);
            assert.equal(125553, item.population);
        });
        it('should not accept zero id value', async () => {
            await contract.regioninsert(111, 'en', 'Europa', catalogs.permission);
            await contract.citytypeins(222, 'en', 'City', catalogs.permission);
            await contract.cityinsert(0, 111, 222, 'en', 'London', 125553, catalogs.permission)
                .should.be.rejectedWith('403. City ID can\'t be zero');
        });
        it('should decline city if region is unknown', async () => {
            await contract.citytypeins(222, 'en', 'citytype', catalogs.permission);
            await contract.cityinsert(999, 0, 222, 'en', 'city', 125553, catalogs.permission)
                .should.be.rejectedWith('404. Region not found');
        });
        it('should decline city if city type is unknown', async () => {
            await contract.regioninsert(111, 'en', 'Europa', catalogs.permission);
            await contract.cityinsert(999, 111, 0, 'en', 'city', 125553, catalogs.permission)
                .should.be.rejectedWith('404. Citytype not found');
        });
        it('should remove city', async () => {
            await contract.regioninsert(111, 'en', 'Europa', catalogs.permission);
            await contract.citytypeins(222, 'en', 'City', catalogs.permission);
            await contract.cityinsert(999, 111, 222, 'en', 'London', 125553, catalogs.permission);
            await contract.cityremove(999, catalogs.permission);
            let rows = await util.getCities();
            assert.equal(0, rows.length);
        });
        it('should deny insert for non-root accounts', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.regioninsert(111, 'en', 'Europa', catalogs.permission);
            await contract.citytypeins(222, 'en', 'City', catalogs.permission);
            await contract.cityinsert(999, 111, 222, 'en', 'London', 125553, alice.permission)
                .should.be.rejectedWith('missing authority of catalogs');
        });
        it('should deny remove for non-root accounts', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.regioninsert(111, 'en', 'Europa', catalogs.permission);
            await contract.citytypeins(222, 'en', 'City', catalogs.permission);
            await contract.cityinsert(999, 111, 222, 'en', 'London', 125553, catalogs.permission);
            await contract.cityremove(999, alice.permission)
                .should.be.rejectedWith('missing authority of catalogs');
        });
    });

    describe('#places', function () {
        it('should ignore insert if place already exists', async () => {
            await contract.placeinsert(1, 'en', 'abc', catalogs.permission);
            await contract.placeinsert(1, 'en', 'abc', catalogs.permission)
                .should.be.rejectedWith('403. Place with specified ID already exists');
        });
        it('should not allow update non existing place', async () => {
            await contract.placeupdate(1, 'en', 'ABC', catalogs.permission)
                .should.be.rejectedWith('404. Place not found');
        });
        it('should allow update existing place', async () => {
            await contract.placeinsert(1, 'en', 'abc', catalogs.permission);
            await contract.placeupdate(1, 'en', 'ABC', catalogs.permission)
                .should.not.be.rejectedWith('403. Place already exists');
            assert.equal('ABC', await util.getPlaceName('en', 1));
        });
        it('should add place', async () => {
            await contract.placeinsert(1, 'en', 'abc', catalogs.permission);
            let rows = await util.getPlaces();
            let item = rows.pop();
            assert.equal(1, item.id);
            assert.equal('abc', item.name);
        });
        it('should not accept zero id value', async () => {
            await contract.placeinsert(0, 'en', 'abc', catalogs.permission)
                .should.be.rejected;
        });
        it('should add place with specified id', async () => {
            await contract.placeinsert(126, 'en', 'abc', catalogs.permission);
            let rows = await util.getPlaces();
            let item = rows.pop();
            assert.equal(126, item.id);
            assert.equal('', item.name);
        });
        it('should remove place', async () => {
            await contract.placeinsert(224, 'en', 'abc', catalogs.permission);
            await contract.placeremove(224, catalogs.permission);
            let rows = await util.getPlaces();
            assert.equal(0, rows.length);
        });
        it('should deny insert place for non-root accounts', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.placeinsert(1, 'en', 'abc', alice.permission)
                .should.be.rejectedWith('missing authority of catalogs');
        });
        it('should deny remove for non-root accounts', async () => {
            await contract.placeinsert(125, 'en', 'abc', catalogs.permission);
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.placeremove(125, alice.permission)
                .should.be.rejectedWith('missing authority of catalogs');
        });
    });
});
