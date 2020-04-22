const check = require('check-types');

const AggregionBlockchain = require('./AggregionBlockchain.js');


class AggregionContract {

    /**
     * @param {EosioName} contractName
     * @param {AggregionBlockchain} blockchain
    */
    constructor(contractName, blockchain) {
        this.contractName = contractName;
        this.bc = blockchain;
    }

    /**
     * Register new provider.
     * @param {EosioName} name
     * @param {string} description
     * @param {permission} permission  (Example: testaccount@active)
     */
    async regprov(name, description, permission) {
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.provider = name;
        request.description = description;
        return await this.bc.pushAction(this.contractName, "regprov", request, permission);
    }

    /**
     * Update provider description.
     * @param {EosioName} name
     * @param {string} description
     * @param {permission} permission
     */
    async updprov(name, description, permission) {
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.provider = name;
        request.description = description;
        return await this.bc.pushAction(this.contractName, "updprov", request, permission);
    }

    /**
     * Unregister existing provider.
     * @param {EosioName} name 
     * @param {permission} permission 
     */
    async unregprov(name, permission) {
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.provider = name;
        return await this.bc.pushAction(this.contractName, "unregprov", request, permission);
    }

    /**
     * Create new provider service.
     * @param {EosioName} provider
     * @param {EosioName} service 
     * @param {string} description 
     * @param {string} protocol 
     * @param {string} type 
     * @param {string} endpoint 
     * @param {permission} permission 
     */
    async addsvc(provider, service, description, protocol, type, endpoint, permission) {
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.provider = provider;
        request.service = service;
        request.description = description;
        request.protocol = protocol;
        request.type = type;
        request.endpoint = endpoint;
        return await this.bc.pushAction(this.contractName, "addsvc", request, permission);
    }

    /**
     * Update service info.
     * @param {EosioName} provider 
     * @param {EosioName} service 
     * @param {string} description 
     * @param {string} protocol 
     * @param {string} type 
     * @param {string} endpoint 
     * @param {permission} permission 
     */
    async updsvc(provider, service, description, protocol, type, endpoint, permission) {
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.provider = provider;
        request.service = service;
        request.description = description;
        request.protocol = protocol;
        request.type = type;
        request.endpoint = endpoint;
        return await this.bc.pushAction(this.contractName, "updsvc", request, permission);
    }

    /**
     * Remove provider service.
     * @param {EosioName} provider 
     * @param {EosioName} service 
     * @param {permission} permission 
     */
    async delsvc(provider, service, permission) {
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.provider = provider;
        request.service = service;
        return await this.bc.pushAction(this.contractName, "delsvc", request, permission);
    }


    /**
     * Create new user script.
     * @param {EosioName} user 
     * @param {EosioName} script 
     * @param {EosioName} version 
     * @param {string} description 
     * @param {string} hash 
     * @param {string} url 
     * @param {permission} permission 
     */
    async addscript(user, script, version, description, hash, url, permission) {
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.owner = user;
        request.script = script;
        request.version = version;
        request.description = description;
        request.hash = hash;
        request.url = url;
        return await this.bc.pushAction(this.contractName, "addscript", request, permission);
    }

    /**
     * Update script info.
     * @param {EosioName} user 
     * @param {EosioName} script 
     * @param {EosioName} version 
     * @param {string} description 
     * @param {string} hash 
     * @param {string} url 
     * @param {permission} permission 
     */
    async updscript(user, script, version, description, hash, url, permission) {
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.owner = user;
        request.script = script;
        request.version = version;
        request.description = description;
        request.hash = hash;
        request.url = url;
        return await this.bc.pushAction(this.contractName, "updscript", request, permission);
    }

    /**
     * Remove script.
     * @param {EosioName} user 
     * @param {EosioName} script 
     * @param {EosioName} version 
     * @param {permission} permission 
     */
    async delscript(user, script, version, permission) {
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.owner = user;
        request.script = script;
        request.version = version;
        return await this.bc.pushAction(this.contractName, "delscript", request, permission);
    }

    /**
     * Approve execution of user script.
     * @param {EosioName} provider 
     * @param {EosioName} script_owner 
     * @param {EosioName} script 
     * @param {EosioName} version 
     * @param {permission} permission 
     */
    async approve(provider, script_owner, script, version, permission) {
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.provider = provider;
        request.owner = script_owner;
        request.script = script;
        request.version = version;
        return await this.bc.pushAction(this.contractName, "approve", request, permission);
    }

    /**
     * Deny execution of user script.
     * @param {EosioName} provider 
     * @param {EosioName} script_owner 
     * @param {EosioName} script 
     * @param {EosioName} version 
     * @param {permission} permission 
     */
    async deny(provider, script_owner, script, version, permission) {
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.provider = provider;
        request.owner = script_owner;
        request.script = script;
        request.version = version;
        return await this.bc.pushAction(this.contractName, "deny", request, permission);
    }

    async requestlog(sender, receiver, date, requestBody, permission) {
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.sender = sender;
        request.receiver = receiver;
        request.date = date;
        request.request = requestBody;
        return await this.bc.pushAction(this.contractName, "requestlog", request, permission);
    }

    /**
     * Erase scope-binded data from all tables.
     * @param {permission} permission (must be contract account permission) 
     */
    async eraseAllData(permission) {
        const scopes = await this.bc.getScopes(this.contractName);
        for (const item of scopes.rows) {
            let request = {};
            request.scope = item.scope;
            await this.bc.pushAction(this.contractName, "erasescope", request, permission)
        }
    }
};

module.exports = AggregionContract;
