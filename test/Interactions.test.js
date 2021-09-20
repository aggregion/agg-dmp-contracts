
const AggregionBlockchain = require('../js/AggregionBlockchain.js');
const InteractionsContract = require('../js/InteractionsContract.js');
const InteractionsUtility = require('../js/InteractionsUtility.js');
const AggregionNode = require('../js/AggregionNode.js');
const TestConfig = require('./TestConfig.js');
const tools = require('./TestTools.js');

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const { expect } = require('chai');
chai.use(chaiAsPromised);
var assert = chai.assert;
var should = chai.should();

const InteractionTypeCommunication = 0;
const InteractionTypeMarketplace = 1;

describe('Interactions', function () {

    const config = new TestConfig(__dirname + '/config.json')
    const contractConfig = config.contracts.dmpusers;

    let node = new AggregionNode(config.getSignatureProvider(), config.node.executable, config.node.endpoint, config.node.workdir);
    let bc = new AggregionBlockchain(config.getNodeUrl(), [config.blockchain.eosio_root_key.private], config.debug);
    let util = new InteractionsUtility(contractConfig.account, bc);
    let contract = new InteractionsContract(contractConfig.account, bc);
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

    describe('#Crud', function () {
        it('should create interaction', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.createInteraction('alice', 'laura', InteractionTypeCommunication, 'params', alice.permission);
            expect(await util.isInteractionExists('alice', 'laura', InteractionTypeCommunication)).is.true;
            const c = await util.getInteraction('alice', 'laura', InteractionTypeCommunication);
            expect(c.owner).eq('alice');
            expect(c.info.partner).eq('laura');
            expect(c.info.interaction_type).eq(InteractionTypeCommunication);
            expect(c.enabled).eq(1);
            expect(c.info.params).eq('params');
        });
        it('should remove interaction', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.createInteraction('alice', 'laura', InteractionTypeCommunication, 'params', alice.permission);
            await contract.removeInteraction('alice', 'laura', InteractionTypeCommunication, alice.permission);
            expect(await util.isInteractionExists('alice', 'laura', InteractionTypeCommunication)).is.false;
            const c = await util.getInteraction('alice', 'laura', InteractionTypeCommunication);
            expect(c).is.undefined;
        });
        it('should remove interaction by id', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.createInteraction('alice', 'laura', InteractionTypeCommunication, 'params', alice.permission);
            const c1 = await util.getInteraction('alice', 'laura', InteractionTypeCommunication);
            await contract.removeInteractionById('alice', c1.id, alice.permission);
            expect(await util.isInteractionExists('alice', 'laura', InteractionTypeCommunication)).is.false;
            const c2 = await util.getInteraction('alice', 'laura', InteractionTypeCommunication);
            expect(c2).is.undefined;
        });
        it('should not create duplicate interaction', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.createInteraction('alice', 'laura', InteractionTypeCommunication, 'params1', alice.permission);
            await contract.createInteraction('alice', 'laura', InteractionTypeCommunication, 'params2', alice.permission)
                .should.be.rejectedWith('403. Interaction already exists');
        });
        it('should update interaction', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.createInteraction('alice', 'laura', InteractionTypeCommunication, 'params1', alice.permission);
            const c1 = await util.getInteraction('alice', 'laura', InteractionTypeCommunication);
            expect(c1).is.not.undefined;

            await contract.updateInteractionById('alice', c1.id, 'jamie', InteractionTypeMarketplace, 'params2', alice.permission);
            const c2 = await util.getInteractionById(c1.id);
            expect(c2.owner).eq('alice');
            expect(c2.info.partner).eq('jamie');
            expect(c2.info.interaction_type).eq(InteractionTypeMarketplace);
            expect(c2.enabled).eq(1);
            expect(c2.info.params).eq('params2');
        });
        it('should not update if key exists', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.createInteraction('alice', 'laura', InteractionTypeCommunication, 'params1', alice.permission);
            await contract.createInteraction('alice', 'jamie', InteractionTypeMarketplace, 'params2', alice.permission);
            const c1 = await util.getInteraction('alice', 'laura', InteractionTypeCommunication);
            await contract.updateInteractionById('alice', c1.id, 'jamie', InteractionTypeMarketplace, 'params3', alice.permission)
                .should.be.rejectedWith('403. Duplicate interaction');
        });
        it('should enable/disable interaction', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            await contract.createInteraction('alice', 'laura', InteractionTypeCommunication, 'params1', alice.permission);
            const c = await util.getInteraction('alice', 'laura', InteractionTypeCommunication);
            expect(c).is.not.undefined;
            {
                await contract.enableInteractionById('alice', c.id, false, alice.permission);
                const c1 = await util.getInteraction('alice', 'laura', InteractionTypeCommunication);
                expect(c1.enabled).eq(0);
            }
            {
                await contract.enableInteractionById('alice', c.id, true, alice.permission);
                const c2 = await util.getInteraction('alice', 'laura', InteractionTypeCommunication);
                expect(c2.enabled).eq(1);
            }
        });
    });

    describe('#Auth', function () {
        it('should not create foreign interaction', async () => {
            const laura = await tools.makeAccount(bc, 'laura');
            await contract.createInteraction('alice', 'laura', InteractionTypeCommunication, 'params1', laura.permission)
                .should.be.rejectedWith('missing authority of alice');
        });
        it('should not update foreign interaction info', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            const laura = await tools.makeAccount(bc, 'laura');
            await contract.createInteraction('alice', 'laura', InteractionTypeCommunication, 'params1', alice.permission);
            const c = await util.getInteraction('alice', 'laura', InteractionTypeCommunication);
            expect(c).is.not.undefined;
            await contract.updateInteractionById('alice', c.id, 'laura', InteractionTypeMarketplace, 'params1', laura.permission)
                .should.be.rejectedWith('missing authority of alice');
        });
        it('should not enable/disable foreign interaction', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            const laura = await tools.makeAccount(bc, 'laura');
            await contract.createInteraction('alice', 'laura', InteractionTypeCommunication, 'params1', alice.permission);
            const c = await util.getInteraction('alice', 'laura', InteractionTypeCommunication);
            expect(c).is.not.undefined;
            await contract.enableInteractionById('alice', c.id, false, laura.permission)
                .should.be.rejectedWith('missing authority of alice');
        });
        it('should not remove foreign interaction', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            const laura = await tools.makeAccount(bc, 'laura');
            await contract.createInteraction('alice', 'laura', InteractionTypeCommunication, 'params', alice.permission);
            await contract.removeInteraction('alice', 'laura', InteractionTypeCommunication, laura.permission)
                .should.be.rejectedWith('missing authority of alice');
        });
        it('should not remove foreign interaction by id', async () => {
            const alice = await tools.makeAccount(bc, 'alice');
            const laura = await tools.makeAccount(bc, 'laura');
            await contract.createInteraction('alice', 'laura', InteractionTypeCommunication, 'params', alice.permission);
            const c = await util.getInteraction('alice', 'laura', InteractionTypeCommunication);
            await contract.removeInteractionById('alice', c.id, laura.permission)
                .should.be.rejectedWith('missing authority of alice');
        });
    });



});
