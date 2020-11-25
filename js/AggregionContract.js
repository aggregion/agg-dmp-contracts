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
    async remsvc(provider, service, permission) {
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.provider = provider;
        request.service = service;
        return await this.bc.pushAction(this.contractName, "remsvc", request, permission);
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
    async remscript(user, script, version, permission) {
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.owner = user;
        request.script = script;
        request.version = version;
        return await this.bc.pushAction(this.contractName, "remscript", request, permission);
    }

    /**
     * Trust provider.
     * @param {EosioName} truster
     * @param {EosioName} trustee
     * @param {permission} permission
     */
    async trust(truster, trustee, permission) {
        check.assert.assigned(truster, 'truster is required');
        check.assert.assigned(trustee, 'trustee is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.truster = truster;
        request.trustee = trustee;
        return await this.bc.pushAction(this.contractName, "trust", request, permission);
    }

    /**
     * Untrust provider.
     * @param {EosioName} truster
     * @param {EosioName} trustee
     * @param {permission} permission
     */
    async untrust(truster, trustee, permission) {
        check.assert.assigned(truster, 'truster is required');
        check.assert.assigned(trustee, 'trustee is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.truster = truster;
        request.trustee = trustee;
        return await this.bc.pushAction(this.contractName, "untrust", request, permission);
    }

    /**
     * Approve execution of user script.
     * @param {EosioName} provider
     * @param {string} script_hash
     * @param {permission} permission
     */
    async execapprove(provider, script_hash, permission) {
        check.assert.assigned(provider, 'provider is required');
        check.assert.assigned(script_hash, 'script_hash is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.provider = provider;
        request.hash = script_hash;
        return await this.bc.pushAction(this.contractName, "execapprove", request, permission);
    }

    /**
     * Deny execution of user script.
     * @param {EosioName} provider
     * @param {string} script_hash
     * @param {permission} permission
     */
    async execdeny(provider, script_hash, permission) {
        check.assert.assigned(provider, 'provider is required');
        check.assert.assigned(script_hash, 'script_hash is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.provider = provider;
        request.hash = script_hash;
        return await this.bc.pushAction(this.contractName, "execdeny", request, permission);
    }

    /**
     * Grant provider access to script.
     * @param {EosioName} owner
     * @param {string} script_hash
     * @param {EosioName} grantee
     * @param {permission} permission
     */
    async grantaccess(owner, script_hash, grantee, permission) {
        check.assert.assigned(owner, 'owner is required');
        check.assert.assigned(script_hash, 'script_hash is required');
        check.assert.assigned(grantee, 'grantee is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.owner = owner;
        request.hash = script_hash;
        request.grantee = grantee;
        return await this.bc.pushAction(this.contractName, "grantaccess", request, permission);
    }

    /**
     * Deny provider access to script.
     * @param {EosioName} owner
     * @param {string} script_hash
     * @param {EosioName} grantee
     * @param {permission} permission
     */
    async denyaccess(owner, script_hash, grantee, permission) {
        check.assert.assigned(owner, 'owner is required');
        check.assert.assigned(script_hash, 'script_hash is required');
        check.assert.assigned(grantee, 'grantee is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.owner = owner;
        request.hash = script_hash;
        request.grantee = grantee;
        return await this.bc.pushAction(this.contractName, "denyaccess", request, permission);
    }

    /**
     * Set provider access to script within enclave.
     * @param {EosioName} enclaveOwner
     * @param {string} script_hash
     * @param {EosioName} grantee
     * @param {Boolean} granted
     * @param {permission} permission
     */
    async enclaveScriptAccess(enclaveOwner, script_hash, grantee, granted, permission) {
        check.assert.assigned(enclaveOwner, 'enclaveOwner is required');
        check.assert.assigned(script_hash, 'script_hash is required');
        check.assert.assigned(grantee, 'grantee is required');
        check.assert.assigned(granted, 'granted is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.enclave_owner = enclaveOwner;
        request.script_hash = script_hash;
        request.grantee = grantee;
        request.granted = granted;
        return await this.bc.pushAction(this.contractName, "encscraccess", request, permission);
    }

    /**
     * Log request.
     * @param {String} sender
     * @param {String} receiver
     * @param {int} date
     * @param {string} body
     * @param {permission} permission
     */
    async sendreq(sender, receiver, date, body, permission) {
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.sender = sender;
        request.receiver = receiver;
        request.date = date;
        request.request = body;
        return await this.bc.pushAction(this.contractName, "sendreq", request, permission);
    }


};

module.exports = AggregionContract;
