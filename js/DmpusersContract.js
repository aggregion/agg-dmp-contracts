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
     * @param {String} encrypted_info
     * @param {permission} permission
     */
    async upsertuser(orgname, name, encrypted_info, permission) {
        check.assert.assigned(orgname, 'orgname is required');
        check.assert.assigned(name, 'name is required');
        check.assert.assigned(encrypted_info, 'encrypted_info is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.orgname = orgname;
        request.name = name;
        request.encrypted_info = encrypted_info;
        return await this.bc.pushAction(this.contractName, "upsertuser", request, permission);
    }

    /**
     * Remove user from organization.
     * @param {EosioName} orgname
     * @param {EosioName} user
     * @param {String} encrypted_info
     * @param {permission} permission
     */
    async removeuser(orgname, name, permission) {
        check.assert.assigned(orgname, 'orgname is required');
        check.assert.assigned(name, 'name is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.orgname = orgname;
        request.name = name;
        return await this.bc.pushAction(this.contractName, "removeuser", request, permission);
    }

};

module.exports = DmpusersContract;
