
const AggregionBlockchain = require('../js/AggregionBlockchain.js');
const GlossaryTermsContract = require('../js/GlossaryTermsContract.js');
const GlossaryTermsUtility = require('../js/GlossaryTermsUtility.js');
const AggregionNode = require('../js/AggregionNode.js');
const TestConfig = require('./TestConfig.js');
const tools = require('./TestTools.js');

const chai = require('chai')
const { expect } = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var assert = chai.assert;
var should = chai.should();


describe('GlossaryTerms', function () {

    const config = new TestConfig(__dirname + '/config.json')
    const contractConfig = config.contracts.dmpusers;

    let node = new AggregionNode(config.getSignatureProvider(), config.node.executable, config.node.endpoint, config.node.workdir);
    let bc = new AggregionBlockchain(config.getNodeUrl(), [config.blockchain.eosio_root_key.private], config.debug);
    let util = new GlossaryTermsUtility(contractConfig.account, bc);
    let contract = new GlossaryTermsContract(contractConfig.account, bc);
    let dmpusers = null;

    this.timeout(0);

    beforeEach(async function () {
        await node.start();
        dmpusers = await tools.makeAccount(bc, contractConfig.account);
        await bc.deploy(dmpusers.account, contractConfig.wasm, contractConfig.abi, dmpusers.permission);
    });

    afterEach(async function () {
        // const timer = ms => new Promise( res => setTimeout(res, ms));
        // await timer(300000);
        await node.stop();
    });

    describe('#Version', function () {
        it('glossary terms', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.upsertGlossaryTerm('d1', 'alice', 'laura', 222, 3, 'data1', alice.permission);
            await contract.upsertGlossaryTerm('d1', 'alice', 'laura', 222, 3, 'data3', alice.permission)
                .should.be.rejectedWith('403. Version too old');
            await contract.upsertGlossaryTerm('d1', 'alice', 'laura', 222, 2, 'data3', alice.permission)
                .should.be.rejectedWith('403. Version too old');
            await contract.upsertGlossaryTerm('d1', 'alice', 'laura', 222, 4, 'data3', alice.permission)
                .should.not.be.rejectedWith('403. Version too old');
        });
    });

    describe('#GlossaryTerms', function () {
        it('should find glossary by sender or receiver', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            const laura = await tools.makeAccount(bc, 'laura');
            await contract.upsertGlossaryTerm('d1', 'alice', 'laura', 111, 1, 'data1', alice.permission);
            await contract.upsertGlossaryTerm('d2', 'laura', 'david', 222, 2, 'data2', laura.permission);
            await contract.upsertGlossaryTerm('d3', 'alice', 'laura', 333, 3, 'data3', alice.permission);
            await contract.upsertGlossaryTerm('d4', 'laura', 'david', 444, 4, 'data4', laura.permission);

            const checkResult = res => {
                assert.lengthOf(res, 2);
                {
                    const d = res[0];
                    assert.ok(d);
                    assert.equal(d.id, 'd2');
                    assert.equal(d.info.sender_org_id, 'laura');
                    assert.equal(d.info.receiver_org_id, 'david');
                    assert.equal(d.info.updated_at, 222);
                    assert.equal(d.info.bc_version, 2);
                    assert.equal(d.info.data, 'data2');
                }
                {
                    const d = res[1];
                    assert.ok(d);
                    assert.equal(d.id, 'd4');
                    assert.equal(d.info.sender_org_id, 'laura');
                    assert.equal(d.info.receiver_org_id, 'david');
                    assert.equal(d.info.updated_at, 444);
                    assert.equal(d.info.bc_version, 4);
                    assert.equal(d.info.data, 'data4');
                }
            };
            checkResult(await util.getGlossaryTermsBySender('laura'));
            checkResult(await util.getGlossaryTermsByReceiver('david'));
        });

        it('should find glossary by update_at', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.upsertGlossaryTerm('d1', 'alice', 'r1', 111, 1, 'data1', alice.permission);
            await contract.upsertGlossaryTerm('d2', 'alice', 'r2', 222, 2, 'data2', alice.permission);
            await contract.upsertGlossaryTerm('d3', 'alice', 'r3', 333, 3, 'data3', alice.permission);
            await contract.upsertGlossaryTerm('d4', 'alice', 'r4', 444, 4, 'data4', alice.permission);
            const res = await util.getGlossaryTermsByUpdateAt(222, 333 /* + 1*/);
            assert.lengthOf(res, 2);
            {
                const d = res[0];
                assert.ok(d);
                assert.equal(d.id, 'd2');
                assert.equal(d.info.sender_org_id, 'alice');
                assert.equal(d.info.receiver_org_id, 'r2');
                assert.equal(d.info.updated_at, 222);
                assert.equal(d.info.bc_version, 2);
                assert.equal(d.info.data, 'data2');
            }
            {
                const d = res[1];
                assert.ok(d);
                assert.equal(d.id, 'd3');
                assert.equal(d.info.sender_org_id, 'alice');
                assert.equal(d.info.receiver_org_id, 'r3');
                assert.equal(d.info.updated_at, 333);
                assert.equal(d.info.bc_version, 3);
                assert.equal(d.info.data, 'data3');
            }
        });

        it('should modify glossary by owner (sender)', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.upsertGlossaryTerm('d1', 'alice', 'laura', 111, 222, 'data', alice.permission);
            await contract.upsertGlossaryTerm('d1', 'alice', 'john', 333, 444, 'data5', alice.permission);
            const d = await util.getGlossaryTermById('d1')
            {
                assert.ok(d);
                assert.equal(d.id, 'd1');
                assert.equal(d.info.sender_org_id, 'alice');
                assert.equal(d.info.receiver_org_id, 'john');
                assert.equal(d.info.updated_at, 333);
                assert.equal(d.info.bc_version, 444);
                assert.equal(d.info.data, 'data5');
            }
            await contract.upsertGlossaryTerm('d1', 'laura', 'alice', 555, 666, 'data', alice.permission)
                .should.be.rejectedWith("missing authority of laura");

            const laura = await tools.makeAccount(bc, 'laura');
            await contract.upsertGlossaryTerm('d1', 'laura', 'alice', 111, 222, 'data', laura.permission)
                .should.be.rejectedWith("401. Access denied");
        });

        it('should store glossary', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.upsertGlossaryTerm('d1', 'alice', 'laura', 111, 222, 'data', alice.permission);
            const d = await util.getGlossaryTermById('d1')
            {
                assert.ok(d);
                assert.equal(d.id, 'd1');
                assert.equal(d.info.sender_org_id, 'alice');
                assert.equal(d.info.receiver_org_id, 'laura');
                assert.equal(d.info.updated_at, 111);
                assert.equal(d.info.bc_version, 222);
                assert.equal(d.info.data, 'data');
            }
        });

        it('should not remove unknown glossary', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await expect(contract.removeGlossaryTerm('d1', 'alice', alice.permission))
                .be.rejectedWith("404. Glossary term not found");
        });

        it('should not remove foreign glossary', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            const laura = await tools.makeAccount(bc, 'laura');
            await contract.upsertGlossaryTerm('d1', 'alice', 'laura', 111, 222, 'data', alice.permission);
            await expect(contract.removeGlossaryTerm('d1', 'alice', laura.permission))
                .be.rejectedWith("missing authority of alice");
            await expect(contract.removeGlossaryTerm('d1', 'laura', laura.permission))
                .be.rejectedWith("401. Access denied");
        });

        it('should remove glossary', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.upsertGlossaryTerm('d1', 'alice', 'laura', 111, 222, 'data', alice.permission);
            expect(await util.isGlossaryTermExists('d1')).be.true;
            await contract.removeGlossaryTerm('d1', 'alice', alice.permission);
            expect(await util.isGlossaryTermExists('d1')).be.false;
        });
    });

});
