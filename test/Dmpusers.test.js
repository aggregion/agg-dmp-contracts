
const AggregionBlockchain = require('../js/AggregionBlockchain.js');
const DmpusersContract = require('../js/DmpusersContract.js');
const DmpusersUtility = require('../js/DmpusersUtility.js');
const AggregionNode = require('../js/AggregionNode.js');
const TestConfig = require('./TestConfig.js');
const UserInfo = require('../js/DmpusersContract.js');
const tools = require('./TestTools.js');

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var assert = chai.assert;
var should = chai.should();


describe('Dmpusers', function () {

    const config = new TestConfig(__dirname + '/config.json')
    const contractConfig = config.contracts.dmpusers;

    let node = new AggregionNode(config.getSignatureProvider(), config.node.executable, config.node.endpoint, config.node.workdir);
    let bc = new AggregionBlockchain(config.getNodeUrl(), [config.blockchain.eosio_root_key.private], config.debug);
    let util = new DmpusersUtility(contractConfig.account, bc);
    let contract = new DmpusersContract(contractConfig.account, bc);
    let dmpusers = null;
    let aggregiondmp = null;

    this.timeout(0);

    beforeEach(async function () {
        await node.start();
        aggregiondmp = await tools.makeAccount(bc, 'aggregiondmp');
        dmpusers = await tools.makeAccount(bc, contractConfig.account);
        await bc.deploy(dmpusers.account, contractConfig.wasm, contractConfig.abi, dmpusers.permission);
    });

    afterEach(async function () {
        await node.stop();
    });

    function anyUserInfo() {
        const info = new UserInfo;
        info.email = 'a@b.c';
        info.firstname = 'firstname';
        info.lastname = 'lastname';
        info.data = 'data';
        return info;
    }

    describe('#dmpusers', function () {
        it('should register new organization', async () => {
            await contract.upsertorg('myorg', 'a@b.c', 'Abc', aggregiondmp.permission);
            const stored = await util.getOrganization('myorg');
            assert.equal(stored.name, 'myorg');
            assert.equal(stored.email, 'a@b.c');
            assert.equal(stored.description, 'Abc');
        });


        it('should update organization', async () => {
            {
                await contract.upsertorg('myorg', 'a@b.c', 'Abc', aggregiondmp.permission);
                const stored = await util.getOrganization('myorg');
                assert.equal(stored.name, 'myorg');
                assert.equal(stored.email, 'a@b.c');
                assert.equal(stored.description, 'Abc');
            }
            {
                await contract.upsertorg('myorg', '1', '2', aggregiondmp.permission);
                const stored = await util.getOrganization('myorg');
                assert.equal(stored.name, 'myorg');
                assert.equal(stored.email, '1');
                assert.equal(stored.description, '2');
            }
        });


        it('should remove organization', async () => {
            await contract.upsertorg('myorg', 'a@b.c', 'Abc', aggregiondmp.permission);
            (await util.isOrganizationExists('myorg')).should.be.true;
            await contract.removeorg('myorg', aggregiondmp.permission);
            (await util.isOrganizationExists('myorg')).should.be.false;
        });


        it('should register new user', async () => {
            const info = new UserInfo;
            info.email = 'user@b.c';
            info.firstname = 'firstname';
            info.lastname = 'lastname';
            info.data = '{"some":"other info"}';
            await contract.registeruser('myuser', info, aggregiondmp.permission);

            const user = await util.getUser('myuser');
            assert.equal(user.id, 'myuser');
            assert.equal(user.info.email, 'user@b.c');
            assert.equal(user.info.firstname, 'firstname');
            assert.equal(user.info.lastname, 'lastname');
            assert.equal(user.info.data, '{"some":"other info"}');
        });

        it('should keep users uniqueness', async () => {
            await contract.registeruser('myuser', anyUserInfo(), aggregiondmp.permission);
            await contract.registeruser('myuser', anyUserInfo(), aggregiondmp.permission).should.be.rejected;
        });


        it('should update user info', async () => {
            {
                const info = new UserInfo;
                info.email = 'user@b.c';
                info.firstname = 'firstname';
                info.lastname = 'lastname';
                info.data = 'data';
                await contract.registeruser('myuser', info, aggregiondmp.permission);

                const user = await util.getUser('myuser');
                assert.equal(user.id, 'myuser');
                assert.equal(user.info.email, 'user@b.c');
                assert.equal(user.info.firstname, 'firstname');
                assert.equal(user.info.lastname, 'lastname');
                assert.equal(user.info.data, 'data');
            }
            {
                const info = new UserInfo;
                info.email = '1';
                info.firstname = '2';
                info.lastname = '3';
                info.data = '4';
                await contract.updateuser('myuser', info, aggregiondmp.permission);

                const user = await util.getUser('myuser');
                assert.equal(user.id, 'myuser');
                assert.equal(user.info.email, '1');
                assert.equal(user.info.firstname, '2');
                assert.equal(user.info.lastname, '3');
                assert.equal(user.info.data, '4');
            }
        });


        it('should not update unknown user', async () => {
            await contract.updateuser('myuser', anyUserInfo(), aggregiondmp.permission).should.be.rejected;
        });


        it('should remove organization user', async () => {
            await contract.registeruser('myuser', anyUserInfo(), aggregiondmp.permission);
            (await util.isUserExists('myuser')).should.be.true;

            await contract.removeuser('myuser', aggregiondmp.permission);
            (await util.isUserExists('myuser')).should.be.false;
        });


        it('should keep provider public key', async () => {
            await contract.upsertpkey('myprovider', 'MYPUBLICKEY', aggregiondmp.permission);

            const pkey = await util.getPublicKey('myprovider');
            assert.equal(pkey.owner, 'myprovider');
            assert.equal(pkey.key, 'MYPUBLICKEY');
        });

        it('should remove provider public key', async () => {
            await contract.upsertpkey('myprovider', 'MYPUBLICKEY', aggregiondmp.permission);
            await contract.removepkey('myprovider', aggregiondmp.permission);

            (await util.isPublicKeyExists('myprovider')).should.be.false;
        });
    });
});
