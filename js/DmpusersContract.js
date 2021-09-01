const check = require('check-types');

const AggregionBlockchain = require('./AggregionBlockchain.js');

class DmpusersContract {

    /**
     * @param {EosioName} contractName
     * @param {AggregionBlockchain} blockchain
    */
    constructor(contractName, blockchain) {
        this.contractName = contractName;
        this.bc = blockchain;
    }

    /**
     * Register new organization.
     * @param {EosioName} name
     * @param {string} email
     * @param {string} description
     * @param {permission} permission
     */
    async upsertorg(name, email, description, permission) {
        check.assert.assigned(name, 'name is required');
        check.assert.assigned(description, 'description is required');
        check.assert.assigned(permission, 'permission is required');
        if (!email) {
            email = '';
        }
        let request = {};
        request.name = name;
        request.email = email;
        request.description = description;
        return await this.bc.pushAction(this.contractName, "upsertorg", request, permission);
    }

    /**
     * Remove organization (without users).
     * @param {EosioName} name
     * @param {permission} permission
     */
    async removeorg(name, permission) {
        check.assert.assigned(name, 'name is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.name = name;
        return await this.bc.pushAction(this.contractName, "removeorg", request, permission);
    }

    /**
     * Register user.
     * @param {EosioName} name
     * @param {string} info
     * @param {permission} permission
     */
    async registeruser(user, info, permission) {
        check.assert.assigned(user, 'user is required');
        check.assert.assigned(info.email, 'email is required');
        check.assert.assigned(info.firstname, 'firstname is required');
        check.assert.assigned(info.lastname, 'lastname is required');
        check.assert.assigned(info.data, 'data is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.user = user;
        request.info = info;
        return await this.bc.pushAction(this.contractName, "registeruser", request, permission);
    }

    /**
     * Update user information.
     * @param {EosioName} name
     * @param {string} info
     * @param {permission} permission
     */
    async updateuser(user, info, permission) {
        check.assert.assigned(user, 'user is required');
        check.assert.assigned(info.email, 'email is required');
        check.assert.assigned(info.firstname, 'firstname is required');
        check.assert.assigned(info.lastname, 'lastname is required');
        check.assert.assigned(info.data, 'data is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.user = user;
        request.info = info;
        return await this.bc.pushAction(this.contractName, "updateuser", request, permission);
    }

    /**
     * Unregister user.
     * @param {EosioName} user
     * @param {permission} permission
     */
    async removeuser(user, permission) {
        check.assert.assigned(user, 'user is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.user = user;
        return await this.bc.pushAction(this.contractName, "removeuser", request, permission);
    }

    /**
     * Upsert provider public key.
     * @param {EosioName} owner
     * @param {string} key
     * @param {permission} permission
     */
    async upsertpkey(owner, key, permission) {
        check.assert.assigned(owner, 'owner is required');
        check.assert.assigned(key, 'key is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.owner = owner;
        request.key = key;
        return await this.bc.pushAction(this.contractName, "upsertpkey", request, permission);
    }

    /**
     * Remove provider public key.
     * @param {EosioName} user
     * @param {permission} permission
     */
    async removepkey(owner, permission) {
        check.assert.assigned(owner, 'owner is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.owner = owner;
        return await this.bc.pushAction(this.contractName, "removepkey", request, permission);
    }


    /**
     * Register/update new organization.
     * @param {permission} permission
     */
     async upsertorg2(orgId, data, publicKey, updatedAt, bcVersion, permission) {
        check.assert.assigned(orgId, 'orgId is required');
        check.assert.assigned(data, 'data is required');
        check.assert.assigned(publicKey, 'publicKey is required');
        check.assert.assigned(updatedAt, 'updatedAt is required');
        check.assert.assigned(bcVersion, 'bcVersion is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.org_id = orgId;
        request.data = data;
        request.public_key = publicKey;
        request.updated_at = updatedAt;
        request.bc_version = bcVersion;
        return await this.bc.pushAction(this.contractName, "upsertorgv2", request, permission);
    }

    /**
     * Send/update project
     * @param {permission} permission
     */
     async upsproject(projectId, receiverOrgId, senderOrgId, updatedAt, data, masterKey, permission) {
        check.assert.assigned(projectId, 'projectId is required');
        check.assert.assigned(receiverOrgId, 'receiverOrgId is required');
        check.assert.assigned(senderOrgId, 'senderOrgId is required');
        check.assert.assigned(updatedAt, 'updatedAt is required');
        check.assert.assigned(data, 'data is required');
        check.assert.assigned(masterKey, 'masterKey is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.project_id = projectId;
        request.receiver_org_id = receiverOrgId;
        request.updated_at = updatedAt;
        request.info = {};
        request.info.sender_org_id = senderOrgId;
        request.info.data = data;
        request.info.master_key = masterKey;
        return await this.bc.pushAction(this.contractName, "upsproject", request, permission);
    }

    /**
     * Send/update dataset
     * @param {permission} permission
     */
     async upsdataset(datasetId,  senderOrgId, receiverOrgId, updatedAt, bcVersion, data, permission) {
        check.assert.assigned(datasetId, 'datasetId is required');
        check.assert.assigned(senderOrgId, 'senderOrgId is required');
        check.assert.assigned(receiverOrgId, 'receiverOrgId is required');
        check.assert.assigned(updatedAt, 'updatedAt is required');
        check.assert.assigned(bcVersion, 'bcVersion is required');
        check.assert.assigned(data, 'data is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.dataset_id = datasetId;
        request.info = {};
        request.info.sender_org_id = senderOrgId;
        request.info.receiver_org_id = receiverOrgId;
        request.info.updated_at = updatedAt;
        request.info.bc_version = bcVersion;
        request.info.data = data;
        return await this.bc.pushAction(this.contractName, "upsdataset", request, permission);
    }

    /**
     * Send/update dataset request
     * @param {permission} permission
     */
     async upsdsreq(dsReqId, receiverOrgId, updatedAt, bcVersion, data, permission) {
        check.assert.assigned(dsReqId, 'dsReqId is required');
        check.assert.assigned(receiverOrgId, 'receiverOrgId is required');
        check.assert.assigned(updatedAt, 'updatedAt is required');
        check.assert.assigned(bcVersion, 'bcVersion is required');
        check.assert.assigned(data, 'data is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.dsreq_id = dsReqId;
        request.info = {};
        request.info.data = data;
        request.info.receiver_org_id = receiverOrgId;
        request.info.updated_at = updatedAt;
        request.info.bc_version = bcVersion;
        return await this.bc.pushAction(this.contractName, "upsdsreq", request, permission);
    }
};

module.exports = DmpusersContract;
