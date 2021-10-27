const check = require('check-types');

const AggregionBlockchain = require('./AggregionBlockchain.js');

class GlossaryTermsContract {

    /**
     * @param {EosioName} contractName
     * @param {AggregionBlockchain} blockchain
    */
    constructor(contractName, blockchain) {
        this.contractName = contractName;
        this.bc = blockchain;
    }

    /**
     * Send/update glossary term
     * @param {permission} permission
     */
    async upsertGlossaryTerm(glossaryTermId, senderOrgId, receiverOrgId, updatedAt, bcVersion, data, permission) {
        check.assert.assigned(glossaryTermId, 'glossaryTermId is required');
        check.assert.assigned(senderOrgId, 'senderOrgId is required');
        check.assert.assigned(receiverOrgId, 'receiverOrgId is required');
        check.assert.assigned(updatedAt, 'updatedAt is required');
        check.assert.assigned(bcVersion, 'bcVersion is required');
        check.assert.assigned(data, 'data is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.glossary_term_id = glossaryTermId;
        request.info = {};
        request.info.sender_org_id = senderOrgId;
        request.info.receiver_org_id = receiverOrgId;
        request.info.updated_at = updatedAt;
        request.info.bc_version = bcVersion;
        request.info.data = data;
        return await this.bc.pushAction(this.contractName, "upsglterm", request, permission);
    }
    /**
     * Remove glossary term
     * @param {permission} permission
     */
    async removeGlossaryTerm(glossaryTermId, senderOrgId, permission) {
        check.assert.assigned(glossaryTermId, 'glossaryTermId is required');
        check.assert.assigned(senderOrgId, 'senderOrgId is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.glossary_term_id = glossaryTermId;
        request.sender_org_id = senderOrgId;
        return await this.bc.pushAction(this.contractName, "remglterm", request, permission);
    }

};

module.exports = GlossaryTermsContract;
