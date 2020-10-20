export declare class AggregionBlockchain {
    static createKeyPair(): Promise<{
        privateKey: any;
        publicKey: any;
    }>;
    constructor(nodeUrl: string, privateKeys: any, maxTransactionAttempt?: number);
    addPrivateKey(privateKey: any): Promise<void>;
    getScopes(contractAccount: any, tableName?: any): Promise<any>;
    getTableRows(contractAccount: any, tableName: any, scopeName: any, primaryKeyValue?: any): Promise<{
        rows: any[];
    }>;
    getTableRowsBySecondaryKey(contractAccount: any, tableName: any, scopeName: any, fromKey: any, toKey: any): Promise<{
        rows: any[];
    }>;
    pushAction(contractAccount: any, actionName: any, requestObject: any, permission: any): Promise<void>;
    deploy(contractAccount: any, wasmPath: any, abiPath: any, permission: any): Promise<void>;
    newaccount(creatorName: any, accountName: any, ownerKey: any, activeKey: any, permission: any): Promise<void>;
    newaccountram(creator: any, name: any, owner: any, active: any, net: any, cpu: any, transfer: any, bytes: any, permission: any): Promise<void>;
}
export declare class AggregionBlockchainUtility {
    constructor(api: any);
    serializeAbi(text: any): Promise<string>;
}

export declare class AggregionContract {
    /**
     * @param {EosioName} contractName
     * @param {AggregionBlockchain} blockchain
    */
    constructor(contractName: string, blockchain: AggregionBlockchain);
    /**
     * Register new provider.
     * @param {EosioName} name
     * @param {string} description
     * @param {permission} permission  (Example: testaccount@active)
     */
    regprov(name: any, description: string, permission: any): Promise<void>;
    /**
     * Update provider description.
     * @param {EosioName} name
     * @param {string} description
     * @param {permission} permission
     */
    updprov(name: any, description: string, permission: any): Promise<void>;
    /**
     * Unregister existing provider.
     * @param {EosioName} name
     * @param {permission} permission
     */
    unregprov(name: any, permission: any): Promise<void>;
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
    addsvc(provider: any, service: any, description: string, protocol: string, type: string, endpoint: string, permission: any): Promise<void>;
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
    updsvc(provider: any, service: any, description: string, protocol: string, type: string, endpoint: string, permission: any): Promise<void>;
    /**
     * Remove provider service.
     * @param {EosioName} provider
     * @param {EosioName} service
     * @param {permission} permission
     */
    remsvc(provider: any, service: any, permission: any): Promise<void>;
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
    addscript(user: any, script: any, version: any, description: string, hash: string, url: string, permission: any): Promise<void>;
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
    updscript(user: any, script: any, version: any, description: string, hash: string, url: string, permission: any): Promise<void>;
    /**
     * Remove script.
     * @param {EosioName} user
     * @param {EosioName} script
     * @param {EosioName} version
     * @param {permission} permission
     */
    remscript(user: any, script: any, version: any, permission: any): Promise<void>;
    /**
     * Approve execution of user script.
     * @param {EosioName} provider
     * @param {EosioName} script_owner
     * @param {EosioName} script
     * @param {EosioName} version
     * @param {permission} permission
     */
    approve(provider: any, script_owner: any, script: any, version: any, permission: any): Promise<void>;
    /**
     * Deny execution of user script.
     * @param {EosioName} provider
     * @param {EosioName} script_owner
     * @param {EosioName} script
     * @param {EosioName} version
     * @param {permission} permission
     */
    deny(provider: any, script_owner: any, script: any, version: any, permission: any): Promise<void>;
    /**
     * Log request.
     * @param {String} sender
     * @param {String} receiver
     * @param {int} date
     * @param {string} body
     * @param {permission} permission
     */
    sendreq(sender: string, receiver: string, date: any, body: string, permission: any): Promise<void>;
    /**
     * Insert new entry to categories catalog.
     * @param {String} id Entry ID may be null (auto assigned), must be unique
     * @param {String} parent_id Parent Entry ID (may be null)
     * @param {String} name
     * @param {permission} permission
     */
    catinsert(id: string, parent_id: string, name: string, permission: any): Promise<void>;
    /**
     * Remove entry from categories catalog.
     * @param {String} id
     * @param {permission} permission
     */
    catremove(id: string, permission: any): Promise<void>;
}

export type UserInfo = {
    email: string;
    firstname: string;
    lastname: string;
};

export type EncryptedData = {
    encrypted_info: string;
    encrypted_master_key: string;
    salt: string;
    has_params: string;
};

export declare class DmpusersContract {
    /**
     * @param {EosioName} contractName
     * @param {AggregionBlockchain} blockchain
    */
    constructor(contractName: string, blockchain: AggregionBlockchain);

    newacc(name: any, owner: any, active: any, permission: any): Promise<void>;

    upsertorg(name: any, email: string, description: string, permission: any): Promise<void>;
    removeorg(name: any, permission: any): Promise<void>;

    registeruser(orgname: any, name: any, info: UserInfo, data: EncryptedData, permission: any): Promise<void>;
    updateuser(orgname: any, name: any, info: UserInfo, data: EncryptedData, permission: any): Promise<void>;
    removeuser(orgname: any, name: any, permission: any): Promise<void>;
}

/// <reference types="node" />
export declare class AggregionNode {
    constructor(signatureProvider: any, endpoint: any, workdir: any);
    start(): Promise<void>;
    stop(): Promise<void>;
}

export declare class TablesUtility {
    /**
     * @param {AggregionBlockchain} blockchain
    */
    constructor(contractAccount: any, blockchain: AggregionBlockchain);
    getTable(tableName: any, id?: any): Promise<any[]>;
    getTableBySecondaryKey(tableName: any, keyValue: any): Promise<any[]>;
}

export declare class AggregionUtility {
    /**
     * @param {AggregionBlockchain} blockchain
    */
    constructor(contractAccount: any, blockchain: AggregionBlockchain);
    getProviders(): Promise<any[]>;
    getServices(): Promise<any[]>;
    getScripts(): Promise<any[]>;
    getApproves(): Promise<any[]>;
    getRequestsLog(): Promise<any[]>;
    getCategories(): Promise<any[]>;
    getCategoryById(id: any): Promise<any>;
    getSubcategories(parentId: any): Promise<any[]>;
    getCategoryPath(id: any): Promise<{
        a0: any;
        a1: any;
        a2: any;
        a3: any;
        a4: any;
    }>;
    getProviderByName(name: any): Promise<any>;
    isProviderExists(name: any): Promise<boolean>;
    getService(provider: any, service: any): Promise<any>;
    getScript(owner: any, script: any, version: any): Promise<any>;
    isScriptApproved(provider: any, owner: any, script: any, version: any): Promise<boolean>;
}

export declare class DmpusersUtility {
    /**
     * @param {AggregionBlockchain} blockchain
    */
    constructor(contractAccount: any, blockchain: AggregionBlockchain);
    getOrganization(name: any): Promise<any>;
    isOrganizationExists(name: any): Promise<boolean>;
    getUser(name: any): Promise<any>;
    isUserExists(name: any): Promise<boolean>;
}

export { }
