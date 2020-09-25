
const AggregionBlockchain = require('../js/AggregionBlockchain.js');
const DmpusersContract = require('../js/DmpusersContract.js');
const DmpusersUtility = require('../js/DmpusersUtility.js');
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

    describe('#dmpusers', function () {
        it('should register new organization', async () => {
            const org = await makeAccount(bc, 'orgaccount');
            await contract.upsertorg(org.account, 'a@b.c', 'Abc', org.permission);
            const stored = await util.getOrganization(org.account);
            check.equal(stored.name, 'orgaccount');
            check.equal(stored.email, 'a@b.c');
            check.equal(stored.description, 'abc');
            check.equal(stored.users_count, 0);
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
            await contract.upsertuser(org.account, 'abc', '0xABC', org.permission);
            const user = await util.getUser('abc');
            check.equal(user.name, 'abc');
            check.equal(user.org, 'orgaccount');
            check.equal(user.encrypted_info, '0xABC');
            const stored = await util.getOrganization(org.account);
            check.equal(stored.users_count, 1);
        });
        it('should remove organization user', async () => {
            const org = await makeAccount(bc, 'orgaccount');
            await contract.upsertorg(org.account, 'a@b.c', 'Abc', org.permission);
            await contract.upsertuser(org.account, 'abc', '0xABC', org.permission);
            (await util.isUserExists('abc')).should.be.true;
            await contract.removeuser(org.account, 'abc', org.permission);
            (await util.isUserExists('abc')).should.be.false;
        });
        it('should not remove organization with users', async () => {
            const org = await makeAccount(bc, 'orgaccount');
            await contract.upsertorg(org.account, 'a@b.c', 'Abc', org.permission);
            await contract.upsertuser(org.account, 'abc', '0xABC', org.permission);
            await contract.removeorg(org.account, org.permission).should.be.rejected;
        });
    });
});
