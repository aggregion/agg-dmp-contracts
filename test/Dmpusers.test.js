
const AggregionBlockchain = require('../js/AggregionBlockchain.js');
const DmpusersContract = require('../js/DmpusersContract.js');
const DmpusersUtility = require('../js/DmpusersUtility.js');
const AggregionNode = require('../js/AggregionNode.js');
const TestsConfig = require('../js/TestsConfig.js');
const EncryptedData = require('../js/DmpusersContract.js');

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


describe('Dmpusers', function () {

    const config = new TestsConfig(__dirname + '/config.json')
    const contractConfig = config.contracts.dmpusers;

    let node = new AggregionNode(config.getSignatureProvider(), config.node.endpoint, config.node.workdir);
    let bc = new AggregionBlockchain(config.getNodeUrl(), [config.blockchain.eosio_root_key.private], config.debug);
    let util = new DmpusersUtility(contractConfig.account, bc);
    let contract = new DmpusersContract(contractConfig.account, bc);
    let dmpusers = null;

    this.timeout(0);

    beforeEach(async function () {
        await node.start();
        dmpusers = await makeAccount(bc, contractConfig.account);
        await bc.deploy(dmpusers.account, contractConfig.wasm, contractConfig.abi, dmpusers.permission);
    });

    afterEach(async function () {
        await node.stop();
    });

    function anyEncryptedData() {
        const data = new EncryptedData;
        data.encrypted_info = "user private data";
        data.encrypted_master_key = "master key";
        data.salt = "salt";
        data.hash_params = "{n=10}";
        return data;
    }

    describe('#dmpusers', function () {
        it('should register new organization', async () => {
            const org = await makeAccount(bc, 'orgaccount');
            await contract.upsertorg(org.account, 'a@b.c', 'Abc', org.permission);
            const stored = await util.getOrganization(org.account);
            assert.equal(stored.name, 'orgaccount');
            assert.equal(stored.email, 'a@b.c');
            assert.equal(stored.description, 'Abc');
            assert.equal(stored.users_count, 0);
        });


        it('should remove organization without users', async () => {
            const org = await makeAccount(bc, 'orgaccount');
            await contract.upsertorg(org.account, 'a@b.c', 'Abc', org.permission);
            (await util.isOrganizationExists(org.account)).should.be.true;
            await contract.removeorg(org.account, org.permission);
            (await util.isOrganizationExists(org.account)).should.be.false;
        });


        it('should add user to organization', async () => {
            const org = await makeAccount(bc, 'orgaccount');
            await contract.upsertorg(org.account, 'a@b.c', 'Abc', org.permission);

            const data = new EncryptedData;
            data.encrypted_info = "user private data";
            data.encrypted_master_key = "master key";
            data.salt = "salt";
            data.hash_params = "{n=10}";
            await contract.registeruser(org.account, 'myuser', data, org.permission);

            const user = await util.getUser('myuser');
            assert.equal(user.id, 'myuser');
            assert.equal(user.orgname, 'orgaccount');
            assert.equal(user.data.encrypted_info, 'user private data');
            assert.equal(user.data.encrypted_master_key, 'master key');
            assert.equal(user.data.salt, 'salt');
            assert.equal(user.data.hash_params, '{n=10}');
        });


        it('should keep in sync organization users counter', async () => {
            const org = await makeAccount(bc, 'orgaccount');
            await contract.upsertorg(org.account, 'a@b.c', 'Abc', org.permission);

            let getCount = async function () {
                return (await util.getOrganization(org.account)).users_count;
            };

            await contract.registeruser(org.account, 'a', anyEncryptedData(), org.permission);
            assert.equal(await getCount(), 1);

            await contract.registeruser(org.account, 'b', anyEncryptedData(), org.permission);
            assert.equal(await getCount(), 2);

            await contract.registeruser(org.account, 'c', anyEncryptedData(), org.permission);
            assert.equal(await getCount(), 3);

            await contract.removeuser(org.account, 'a', org.permission);
            assert.equal(await getCount(), 2);
        });


        it('should keep users uniqueness', async () => {
            const orgA = await makeAccount(bc, 'orga');
            await contract.upsertorg(orgA.account, 'a@a.a', 'AAA', orgA.permission);

            const orgB = await makeAccount(bc, 'orgb');
            await contract.upsertorg(orgB.account, 'b@b.b', 'BBB', orgB.permission);

            await contract.registeruser(orgA.account, 'myuser', anyEncryptedData(), orgA.permission);
            await contract.registeruser(orgA.account, 'myuser', anyEncryptedData(), orgA.permission).should.be.rejected;
            await contract.registeruser(orgB.account, 'myuser', anyEncryptedData(), orgB.permission).should.be.rejected;
        });


        it('should update organization user', async () => {
            const org = await makeAccount(bc, 'orgaccount');
            await contract.upsertorg(org.account, 'a@b.c', 'Abc', org.permission);
            {
                const data = new EncryptedData;
                data.encrypted_info = "111";
                data.encrypted_master_key = "222";
                data.salt = "333";
                data.hash_params = "444";
                await contract.registeruser(org.account, 'myuser', data, org.permission);
                const user = await util.getUser('myuser');
                assert.equal(user.id, 'myuser');
                assert.equal(user.orgname, 'orgaccount');
                assert.equal(user.data.encrypted_info, '111');
                assert.equal(user.data.encrypted_master_key, '222');
                assert.equal(user.data.salt, '333');
                assert.equal(user.data.hash_params, '444');
            }
            {
                const data = new EncryptedData;
                data.encrypted_info = "AAA";
                data.encrypted_master_key = "BBB";
                data.salt = "CCC";
                data.hash_params = "DDD";
                await contract.updateuser(org.account, 'myuser', data, org.permission);
                const user = await util.getUser('myuser');
                assert.equal(user.id, 'myuser');
                assert.equal(user.orgname, 'orgaccount');
                assert.equal(user.data.encrypted_info, 'AAA');
                assert.equal(user.data.encrypted_master_key, 'BBB');
                assert.equal(user.data.salt, 'CCC');
                assert.equal(user.data.hash_params, 'DDD');
            }
            const stored = await util.getOrganization(org.account);
            assert.equal(stored.users_count, 1);
        });


        it('should not update unknown user', async () => {
            const org = await makeAccount(bc, 'orgaccount');
            await contract.upsertorg(org.account, 'a@b.c', 'Abc', org.permission);
            await contract.updateuser(org.account, 'myuser', anyEncryptedData(), org.permission).should.be.rejected;
        });


        it('should not update foreign user', async () => {
            const orgA = await makeAccount(bc, 'orga');
            await contract.upsertorg(orgA.account, 'a@a.a', 'AAA', orgA.permission);
            await contract.registeruser(orgA.account, 'myuser', anyEncryptedData(), orgA.permission);

            const orgB = await makeAccount(bc, 'orgb');
            await contract.upsertorg(orgB.account, 'b@b.b', 'BBB', orgB.permission);
            await contract.updateuser(orgB.account, 'myuser', anyEncryptedData(), orgB.permission).should.be.rejected;
        });


        it('should remove organization user', async () => {
            const org = await makeAccount(bc, 'orgaccount');
            await contract.upsertorg(org.account, 'a@b.c', 'Abc', org.permission);

            await contract.registeruser(org.account, 'myuser', anyEncryptedData(), org.permission);
            (await util.isUserExists('myuser')).should.be.true;

            await contract.removeuser(org.account, 'myuser', org.permission);
            (await util.isUserExists('myuser')).should.be.false;
        });


        it('should not remove organization with users', async () => {
            const org = await makeAccount(bc, 'orgaccount');
            await contract.upsertorg(org.account, 'a@b.c', 'Abc', org.permission);
            await contract.registeruser(org.account, 'myuser', anyEncryptedData(), org.permission);

            await contract.removeorg(org.account, org.permission).should.be.rejected;
        });
    });
});
