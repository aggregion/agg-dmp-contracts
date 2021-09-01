
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


describe('DmpusersV2', function () {

    const config = new TestConfig(__dirname + '/config.json')
    const contractConfig = config.contracts.dmpusers;

    let node = new AggregionNode(config.getSignatureProvider(), config.node.executable, config.node.endpoint, config.node.workdir);
    let bc = new AggregionBlockchain(config.getNodeUrl(), [config.blockchain.eosio_root_key.private], config.debug);
    let util = new DmpusersUtility(contractConfig.account, bc);
    let contract = new DmpusersContract(contractConfig.account, bc);
    let dmpusers = null;

    this.timeout(0);

    beforeEach(async function () {
        await node.start();
        dmpusers = await tools.makeAccount(bc, contractConfig.account);
        await bc.deploy(dmpusers.account, contractConfig.wasm, contractConfig.abi, dmpusers.permission);
    });

    afterEach(async function () {
        await node.stop();
    });

    describe('#updateAt', function () {
        it('dsreqs', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.upsdsreq('dr1', 'alice', 22, 1, 'data1', alice.permission);
            await contract.upsdsreq('dr1', 'alice', 11, 2, 'data2', alice.permission)
                .should.be.rejectedWith('403. Version too old');
        });
        it('orgv2', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.upsertorg2('alice', 'aaaa', 'bbbb', 333, 222, alice.permission);
            await contract.upsertorg2('alice', 'cccc', 'dddd', 222, 444, alice.permission)
                .should.be.rejectedWith('403. Version too old');
        });
        it('project', async () => {
            const john = await tools.makeAccount(bc, 'john');
            await contract.upsproject('p1', 'alice', 'john', 222, 'data1', 'mk1', john.permission);
            await contract.upsproject('p1', 'laura', 'john', 111, 'data2', 'mk2', john.permission)
                .should.be.rejectedWith('403. Version too old');
        });
        it('dataset', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.upsdataset('d1', 'alice', 'laura', 333, 1, 'data1', alice.permission);
            await contract.upsdataset('d1', 'alice', 'laura', 222, 3, 'data3', alice.permission)
                .should.be.rejectedWith('403. Version too old');
        });
    });


    describe('#dataset requests', function () {
        it('should not modify foreign requests', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.upsdsreq('dr1', 'alice', 11, 1, 'data1', alice.permission);
            const laura = await tools.makeAccount(bc, 'laura');
            await contract.upsdsreq('dr1', 'laura', 22, 2, 'data2', laura.permission)
                .should.be.rejectedWith('401. Access denied');
        });
        it('should find dataset requests by receiver and update at', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            const laura = await tools.makeAccount(bc, 'laura');
            await contract.upsdsreq('dr1', 'alice', 11, 1, 'data1', alice.permission);
            await contract.upsdsreq('dr1', 'alice', 22, 2, 'data2', alice.permission);
            await contract.upsdsreq('dr2', 'alice', 22, 3, 'data3', alice.permission);
            await contract.upsdsreq('dr3', 'laura', 33, 1, 'data4', laura.permission);
            const res = await util.getDatasetRequestsByReceiverAndUpdatedAt('alice', 22);
            assert.lengthOf(res, 2)
            {
                const r = res[0];
                assert.ok(r);
                assert.equal(r.id, 'dr1');
                assert.equal(r.info.receiver_org_id, 'alice');
                assert.equal(r.info.updated_at, 22);
                assert.equal(r.info.bc_version, 2);
                assert.equal(r.info.data, 'data2');
            }
            {
                const r = res[1];
                assert.ok(r);
                assert.equal(r.id, 'dr2');
                assert.equal(r.info.receiver_org_id, 'alice');
                assert.equal(r.info.updated_at, 22);
                assert.equal(r.info.bc_version, 3);
                assert.equal(r.info.data, 'data3');
            }
        });
        it('should not allow impersonate receiver', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.upsdsreq('dr1', 'laura', 111, 222, 'data', alice.permission)
                .should.be.rejectedWith('missing authority of laura');
        });
        it('should store dataset requests', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.upsdsreq('dr1', 'alice', 111, 222, 'data', alice.permission);
            const r = await util.getDatasetRequestById('dr1')
            {
                assert.ok(r);
                assert.equal(r.id, 'dr1');
                assert.equal(r.info.receiver_org_id, 'alice');
                assert.equal(r.info.updated_at, 111);
                assert.equal(r.info.bc_version, 222);
                assert.equal(r.info.data, 'data');
            }
        });
    });

    describe('#datasets', function () {
        it('should find dataset by sender or receiver', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            const laura = await tools.makeAccount(bc, 'laura');
            await contract.upsdataset('d1', 'alice', 'laura', 111, 1, 'data1', alice.permission);
            await contract.upsdataset('d2', 'laura', 'david', 222, 2, 'data2', laura.permission);
            await contract.upsdataset('d3', 'alice', 'laura', 333, 3, 'data3', alice.permission);
            await contract.upsdataset('d4', 'laura', 'david', 444, 4, 'data4', laura.permission);
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
            checkResult(await util.getDatasetsBySender('laura'));
            checkResult(await util.getDatasetsByReceiver('david'));
        });

        it('should find dataset by update_at', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.upsdataset('d1', 'alice', 'r1', 111, 1, 'data1', alice.permission);
            await contract.upsdataset('d2', 'alice', 'r2', 222, 2, 'data2', alice.permission);
            await contract.upsdataset('d3', 'alice', 'r3', 333, 3, 'data3', alice.permission);
            await contract.upsdataset('d4', 'alice', 'r4', 444, 4, 'data4', alice.permission);
            const res = await util.getDatasetsByUpdateAt(222, 333 /* + 1*/);
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

        it('should modify dataset by owner (sender)', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.upsdataset('d1', 'alice', 'laura', 111, 222, 'data', alice.permission);
            await contract.upsdataset('d1', 'alice', 'john', 333, 444, 'data5', alice.permission);
            const d = await util.getDatasetById('d1')
            {
                assert.ok(d);
                assert.equal(d.id, 'd1');
                assert.equal(d.info.sender_org_id, 'alice');
                assert.equal(d.info.receiver_org_id, 'john');
                assert.equal(d.info.updated_at, 333);
                assert.equal(d.info.bc_version, 444);
                assert.equal(d.info.data, 'data5');
            }
            await contract.upsdataset('d1', 'laura', 'alice', 555, 666, 'data', alice.permission)
                .should.be.rejectedWith("missing authority of laura");

            const laura = await tools.makeAccount(bc, 'laura');
            await contract.upsdataset('d1', 'laura', 'alice', 111, 222, 'data', laura.permission)
                .should.be.rejectedWith("401. Access denied");
        });

        it('should store dataset', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.upsdataset('d1', 'alice', 'laura', 111, 222, 'data', alice.permission);
            const d = await util.getDatasetById('d1')
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
    });

    describe('#projects', function () {
        it('should not modify foreign projects', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            const laura = await tools.makeAccount(bc, 'laura');
            await contract.upsproject('p1', 'r1', 'alice', 111, 'data1', 'mk1', alice.permission);
            await contract.upsproject('p1', 'r2', 'laura', 222, 'data2', 'mk2', laura.permission)
                .should.be.rejectedWith("401. Access denied");
        });

        it('should find projects by receiver and updated at', async () => {
            const john = await tools.makeAccount(bc, 'john');
            await contract.upsproject('p1', 'alice', 'john', 111, 'data1', 'mk1', john.permission);
            await contract.upsproject('p2', 'laura', 'john', 222, 'data2', 'mk2', john.permission);
            await contract.upsproject('p3', 'laura', 'john', 333, 'data3', 'mk3', john.permission);

            const projects = await util.getProjectsByReceiverAndUpdatedAt('laura', 222);
            assert.lengthOf(projects, 1);
            {
                const p = projects[0];
                assert.equal(p.id, 'p2');
                assert.equal(p.receiver_org_id, 'laura');
                assert.equal(p.updated_at, 222);
                assert.equal(p.info.sender_org_id, 'john');
                assert.equal(p.info.data, 'data2');
                assert.equal(p.info.master_key, 'mk2');
            }
        });

        it('should find projects by receiver org id', async () => {
            const john = await tools.makeAccount(bc, 'john');
            await contract.upsproject('p1', 'alice', 'john', 111, 'data1', 'mk1', john.permission);
            await contract.upsproject('p2', 'laura', 'john', 222, 'data2', 'mk2', john.permission);
            await contract.upsproject('p3', 'laura', 'john', 333, 'data3', 'mk3', john.permission);

            const projects = await util.getProjectsByReceiver('laura');
            assert.lengthOf(projects, 2);
            {
                const p = projects[0];
                assert.equal(p.id, 'p2');
                assert.equal(p.receiver_org_id, 'laura');
                assert.equal(p.updated_at, 222);
                assert.equal(p.info.sender_org_id, 'john');
                assert.equal(p.info.data, 'data2');
                assert.equal(p.info.master_key, 'mk2');
            }
            {
                const p = projects[1];
                assert.equal(p.id, 'p3');
                assert.equal(p.receiver_org_id, 'laura');
                assert.equal(p.updated_at, 333);
                assert.equal(p.info.sender_org_id, 'john');
                assert.equal(p.info.data, 'data3');
                assert.equal(p.info.master_key, 'mk3');
            }
        });

        it('should modify project', async () => {
            const john = await tools.makeAccount(bc, 'john');
            await contract.upsproject('p1', 'alice', 'john', 111, 'data1', 'mk1', john.permission);
            await contract.upsproject('p1', 'laura', 'john', 222, 'data2', 'mk2', john.permission);

            const p = await util.getProjectById('p1');
            assert.equal(p.id, 'p1');
            assert.equal(p.receiver_org_id, 'laura');
            assert.equal(p.info.sender_org_id, 'john');
            assert.equal(p.updated_at, 222);
            assert.equal(p.info.data, 'data2');
            assert.equal(p.info.master_key, 'mk2');
        });

        it('should store project', async () => {
            const laura = await tools.makeAccount(bc, 'laura');
            await contract.upsproject('p1', 'alice', 'laura', 111, 'data', 'mk', laura.permission);

            const checkProject = p => {
                assert.ok(p);
                assert.equal(p.id, 'p1');
                assert.equal(p.receiver_org_id, 'alice');
                assert.equal(p.updated_at, 111);
                assert.equal(p.info.sender_org_id, 'laura');
                assert.equal(p.info.data, 'data');
                assert.equal(p.info.master_key, 'mk');
            };

            checkProject(await util.getProjectById('p1'));
            checkProject((await util.getProjectsByReceiver('alice'))[0]);
            checkProject((await util.getProjectsByReceiverAndUpdatedAt('alice', 111))[0]);
        });
    });

    describe('#orgsv2', function () {
        it('should not update foreign organization', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            const laura = await tools.makeAccount(bc, 'laura');
            await contract.upsertorg2('alice', 'aaaa', 'bbbb', 111, 222, alice.permission);
            await contract.upsertorg2('alice', 'cccc', 'dddd', 333, 444, laura.permission)
                .should.be.rejectedWith("missing authority of alice");
        });

        it('should register organization', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.upsertorg2('alice', 'data', 'key', 111, 222, alice.permission);
            const o = await util.getOrg2('alice');
            assert.ok(o);
            assert.equal(o.id, 'alice');
            assert.equal(o.data, 'data');
            assert.equal(o.public_key, 'key');
            assert.equal(o.updated_at, 111);
            assert.equal(o.bc_version, 222);
        });

        it('should update organization', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.upsertorg2('alice', 'aaaa', 'bbbb', 111, 222, alice.permission);
            await contract.upsertorg2('alice', 'cccc', 'dddd', 333, 444, alice.permission);
            const o = await util.getOrg2('alice');
            assert.ok(o);
            assert.equal(o.id, 'alice');
            assert.equal(o.data, 'cccc');
            assert.equal(o.public_key, 'dddd');
            assert.equal(o.updated_at, 333);
            assert.equal(o.bc_version, 444);
        });
    });

});
