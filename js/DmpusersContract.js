const check = require('check-types');

const AggregionBlockchain = require('./AggregionBlockchain.js');

class UserInfo {
    constructor() {
        this.email = "";
        this.firstname = "";
        this.lastname = "";
        this.other = "";
    }
};
module.exports = UserInfo;

class EncryptedData {
    constructor() {
        this.encrypted_info = "";
        this.encrypted_master_key = "";
        this.hash_params = "";
        this.salt = "";
    }
};
module.exports = EncryptedData;

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
     * Create organization account.
     * @param {EosioName} creator
     * @param {EosioName} name
     * @param {string} ownerkey
     * @param {string} activekey
     * @param {permission} permission
     */
    async newacc(creator, name, ownerkey, activekey, permission) {
        check.assert.assigned(creator, 'creator is required');
        check.assert.assigned(name, 'name is required');
        check.assert.assigned(ownerkey, 'ownerkey is required');
        check.assert.assigned(activekey, 'activekey is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.creator = creator;
        request.name = name;
        request.ownerkey = ownerkey;
        request.activekey = activekey;
        return await this.bc.pushAction(this.contractName, "newacc", request, permission);
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
        check.assert.assigned(email, 'email is required');
        check.assert.assigned(description, 'description is required');
        check.assert.assigned(permission, 'permission is required');
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
     * Add user to organization.
     * @param {EosioName} orgname
     * @param {EosioName} name
     * @param {EncryptedData} data
     * @param {permission} permission
     */
    async registeruser(orgname, user, info, data, permission) {
        check.assert.assigned(orgname, 'orgname is required');
        check.assert.assigned(user, 'user is required');
        check.assert.assigned(info.email, 'email is required');
        check.assert.assigned(info.firstname, 'firstname is required');
        check.assert.assigned(info.lastname, 'lastname is required');
        check.assert.assigned(data.encrypted_info, 'data.encrypted_info is required');
        check.assert.assigned(data.encrypted_master_key, 'data.encrypted_master_key is required');
        check.assert.assigned(data.salt, 'data.salt is required');
        check.assert.assigned(data.hash_params, 'data.hash_params is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.orgname = orgname;
        request.user = user;
        request.info = info;
        request.data = data;
        return await this.bc.pushAction(this.contractName, "registeruser", request, permission);
    }

    /**
     * Update user in organization.
     * @param {EosioName} orgname
     * @param {EosioName} name
     * @param {EncryptedData} data
     * @param {permission} permission
     */
    async updateuser(orgname, user, info, data, permission) {
        check.assert.assigned(orgname, 'orgname is required');
        check.assert.assigned(user, 'user is required');
        check.assert.assigned(info.email, 'email is required');
        check.assert.assigned(info.firstname, 'firstname is required');
        check.assert.assigned(info.lastname, 'lastname is required');
        check.assert.assigned(data.encrypted_info, 'data.encrypted_info is required');
        check.assert.assigned(data.encrypted_master_key, 'data.encrypted_master_key is required');
        check.assert.assigned(data.salt, 'data.salt is required');
        check.assert.assigned(data.hash_params, 'data.hash_params is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.orgname = orgname;
        request.user = user;
        request.info = info;
        request.data = data;
        return await this.bc.pushAction(this.contractName, "updateuser", request, permission);
    }

    /**
     * Remove user from organization.
     * @param {EosioName} orgname
     * @param {EosioName} user
     * @param {permission} permission
     */
    async removeuser(orgname, user, permission) {
        check.assert.assigned(orgname, 'orgname is required');
        check.assert.assigned(user, 'user is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.orgname = orgname;
        request.user = user;
        return await this.bc.pushAction(this.contractName, "removeuser", request, permission);
    }

};

module.exports = DmpusersContract;
