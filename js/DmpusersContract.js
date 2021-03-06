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

};

module.exports = DmpusersContract;
