const check = require('check-types');

const AggregionBlockchain = require('./AggregionBlockchain.js');

class InteractionsContract {

    /**
     * @param {EosioName} contractName
     * @param {AggregionBlockchain} blockchain
    */
    constructor(contractName, blockchain) {
        this.contractName = contractName;
        this.bc = blockchain;
        this.nonce = (n => () => n++)(0);
    }

    /**
     * Create new interaction
     * @param {permission} permission
     */
    async createInteraction(owner, partner, interactionType, params, permission) {
        check.assert.assigned(owner, 'owner is required');
        check.assert.assigned(partner, 'partner is required');
        check.assert.assigned(interactionType, 'interactionType is required');
        check.assert.assigned(params, 'params is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.info = {};
        request.owner = owner;
        request.info.partner = partner;
        request.info.interaction_type = interactionType;
        request.info.params = params;
        request.nonce = this.nonce();
        return await this.bc.pushAction(this.contractName, "insinteract", request, permission);
    }

    /**
     * Update interaction
     * @param {permission} permission
     */
    async updateInteractionById(owner, interactionId, partner, interactionType, params, permission) {
        check.assert.assigned(owner, 'owner is required');
        check.assert.assigned(interactionId, 'interactionId is required');
        check.assert.assigned(partner, 'partner is required');
        check.assert.assigned(interactionType, 'interactionType is required');
        check.assert.assigned(params, 'params is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.owner = owner;
        request.interaction_id = interactionId;
        request.info = {};
        request.info.partner = partner;
        request.info.interaction_type = interactionType;
        request.info.params = params;
        request.nonce = this.nonce();
        return await this.bc.pushAction(this.contractName, "updinteract", request, permission);
    }

    /**
     * Remove interaction.
     * @param {permission} permission
     */
    async removeInteraction(owner, partner, interactionType, permission) {
        check.assert.assigned(owner, 'owner is required');
        check.assert.assigned(partner, 'partner is required');
        check.assert.assigned(interactionType, 'interactionType is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.owner = owner;
        request.partner = partner;
        request.interaction_type = interactionType;
        request.nonce = this.nonce();
        return await this.bc.pushAction(this.contractName, "reminteract", request, permission);
    }

    /**
     * Remove interaction by id.
     * @param {permission} permission
     */
    async removeInteractionById(owner, interactionId, permission) {
        check.assert.assigned(owner, 'owner is required');
        check.assert.assigned(interactionId, 'interactionId is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.owner = owner;
        request.interaction_id = interactionId;
        request.nonce = this.nonce();
        return await this.bc.pushAction(this.contractName, "remintrbyid", request, permission);
    }

    /**
     * Enabled/disable interaction.
     * @param {permission} permission
     */
    async enableInteractionById(owner, interactionId, enabled, permission) {
        check.assert.assigned(owner, 'owner is required');
        check.assert.assigned(interactionId, 'interactionId is required');
        check.assert.assigned(enabled, 'enabled is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.owner = owner;
        request.interaction_id = interactionId;
        request.enable = enabled;
        request.nonce = this.nonce();
        return await this.bc.pushAction(this.contractName, "intrctenble", request, permission);
    }

};

module.exports = InteractionsContract;


