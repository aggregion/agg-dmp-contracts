const check = require('check-types');

const AggregionBlockchain = require('./AggregionBlockchain.js');

class GlossariesContract {

    /**
     * @param {EosioName} contractName
     * @param {AggregionBlockchain} blockchain
    */
    constructor(contractName, blockchain) {
        this.contractName = contractName;
        this.bc = blockchain;
    }

    /**
     * Send/update glossary
     * @param {permission} permission
     */
    async upsertGlossary(glossaryId, senderOrgId, receiverOrgId, updatedAt, bcVersion, data, permission) {
        check.assert.assigned(glossaryId, 'glossaryId is required');
        check.assert.assigned(senderOrgId, 'senderOrgId is required');
        check.assert.assigned(receiverOrgId, 'receiverOrgId is required');
        check.assert.assigned(updatedAt, 'updatedAt is required');
        check.assert.assigned(bcVersion, 'bcVersion is required');
        check.assert.assigned(data, 'data is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.glossary_id = glossaryId;
        request.info = {};
        request.info.sender_org_id = senderOrgId;
        request.info.receiver_org_id = receiverOrgId;
        request.info.updated_at = updatedAt;
        request.info.bc_version = bcVersion;
        request.info.data = data;
        return await this.bc.pushAction(this.contractName, "upsglossary", request, permission);
    }
    /**
     * Remove glossary
     * @param {permission} permission
     */
    async removeGlossary(glossaryId, senderOrgId, permission) {
        check.assert.assigned(glossaryId, 'glossaryId is required');
        check.assert.assigned(senderOrgId, 'senderOrgId is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.glossary_id = glossaryId;
        request.sender_org_id = senderOrgId;
        return await this.bc.pushAction(this.contractName, "remglossary", request, permission);
    }

};

module.exports = GlossariesContract;
