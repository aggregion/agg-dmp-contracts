export declare class AggregionBlockchain {
    static createKeyPair(): Promise<{
        privateKey: any;
        publicKey: any;
    }>;
    constructor(nodeUrl: string, privateKeys: any, maxTransactionAttempt?: number);
    addPrivateKey(privateKey: any): Promise<void>;
    getAccount(name: any): Promise<void>;
    getScopes(contractAccount: any, tableName?: any): Promise<any>;
    getTableRows(contractAccount: any, tableName: any, scopeName: any, primaryKeyValue?: any): Promise<{
        rows: any[];
    }>;
    getTableRowsByIndex(contractAccount: any, tableName: any, scopeName: any, indexPosition: any, keyType: any, fromKey: any, toKey: any): Promise<{
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
     * Trust provider.
     * @param {EosioName} truster
     * @param {EosioName} trustee
     * @param {permission} permission
     */
    trust(truster: any, trustee: any, permission: any): Promise<void>;

    /**
     * Untrust provider.
     * @param {EosioName} truster
     * @param {EosioName} trustee
     * @param {permission} permission
     */
    untrust(truster: any, trustee: any, permission: any): Promise<void>;

    /**
     * Approve execution of user script.
     * @param {EosioName} provider
     * @param {string} script_hash
     * @param {permission} permission
     */
    execapprove(provider: any, script_hash: any, permission: any): Promise<void>;

    /**
     * Deny execution of user script.
     * @param {EosioName} provider
     * @param {string} script_hash
     * @param {permission} permission
     */
    execdeny(provider: any, script_hash: any, permission: any): Promise<void>;

    /**
     * Grant provider access to script.
     * @param {EosioName} owner
     * @param {string} script_hash
     * @param {EosioName} grantee
     * @param {permission} permission
     */
    grantaccess(owner: any, script_hash: any, grantee: any, permission: any): Promise<void>;

    /**
     * Deny provider access to script.
     * @param {EosioName} owner
     * @param {string} script_hash
     * @param {EosioName} grantee
     * @param {permission} permission
     */
    denyaccess(owner: any, script_hash: any, grantee: any, permission: any): Promise<void>;

    /**
     * Set provider access to script within enclave.
     * @param {EosioName} enclaveOwner
     * @param {string} script_hash
     * @param {EosioName} grantee
     * @param {Boolean} granted
     * @param {permission} permission
     */
    async enclaveScriptAccess(enclaveOwner: any, script_hash: any, grantee: any, granted: any, permission: any): Promise<void>;

    /**
     * Log request.
     * @param {String} sender
     * @param {String} receiver
     * @param {int} date
     * @param {string} body
     * @param {permission} permission
     */
    sendreq(sender: string, receiver: string, date: any, body: string, permission: any): Promise<void>;
}

export type UserInfo = {
    email: string;
    firstname: string;
    lastname: string;
    data: string;
};

export declare class DmpusersContract {
    /**
     * @param {EosioName} contractName
     * @param {AggregionBlockchain} blockchain
    */
    constructor(contractName: string, blockchain: AggregionBlockchain);

    upsertorg(name: any, email: string, description: string, permission: any): Promise<void>;
    removeorg(name: any, permission: any): Promise<void>;

    registeruser(name: any, info: UserInfo, permission: any): Promise<void>;
    updateuser(name: any, info: UserInfo, permission: any): Promise<void>;
    removeuser(name: any, permission: any): Promise<void>;

    upsertpkey(owner: any, key: any, permission: any): Promise<void>;
    removepkey(owner: any, permission: any): Promise<void>;

    upsertorg2(orgId: string, data: string, publicKey: string, updatedAt: string, bcVersion: string, permission: string): Promise<void>;
    upsproject(projectId: string, receiverOrgId: string, senderOrgId: string, updatedAt: string, data: string, masterKey: string, permission: string): Promise<void>;
    upsdataset(datasetId: string, senderOrgId: string, receiverOrgId: string, updatedAt: string, bcVersion: string, data: string, permission: string): Promise<void>;
    upsdsreq(dsReqId: string, receiverOrgId: string, updatedAt: string, bcVersion: string, data: string, permission: string): Promise<void>;


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
    getTableByIndex(tableName: any, indexPosition: any, keyType: any, keyValue: any): Promise<any[]>;
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
    getProviderByName(name: any): Promise<any>;
    isProviderExists(name: any): Promise<boolean>;
    getService(provider: any, service: any): Promise<any>;
    getScript(owner: any, script: any, version: any): Promise<any>;
    getScriptByHash(hash: any): Promise<boolean>;
    isTrusted(truster: any, trustee: any): Promise<boolean>;
    isScriptApprovedBy(provider: any, hash: any): Promise<boolean>;
    isScriptAccessGrantedTo(grantee: any, hash: any): Promise<boolean>;
    isScriptAllowedWithinEnclave(enclaveOwner: any, hash: any, grantee: any): Promise<boolean>;
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
    getPublicKey(owner: any): Promise<any>;
    isPublicKeyExists(owner: any): Promise<boolean>;

    getOrg2(orgId: string): Promise<any>;

    getProjectById(projectId: string): Promise<any>;
    getProjectsByReceiver(receiverOrgId: string): Promise<any[]>;
    getProjectsByReceiverAndUpdatedAt(receiverOrgId: string, updatedAt: string): Promise<any[]>;

    getDatasetById(datasetId: string): Promise<any>;
    getDatasetsByUpdateAt(lower: string, upper: string): Promise<any[]>;
    getDatasetsBySender(senderOrgId: string): Promise<any[]>;
    getDatasetsByReceiver(receiverOrgId: string): Promise<any[]>;

    getDatasetRequestById(dsReqId: string): Promise<any>;
    getDatasetRequestsByReceiverAndUpdatedAt(receiverOrgId: string, updatedAt: string): Promise<any[]>;
}


export declare class MessagesContract {
    /**
     * @param {EosioName} contractName
     * @param {AggregionBlockchain} blockchain
    */
    constructor(contractName: string, blockchain: AggregionBlockchain);

    insertmsg(topic: string, sender: string, receiver: string, data: string, permission: string): Promise<void>;
    removemsg(messageId: string, permission: string): Promise<void>;
}

export declare class MessagesUtility {
    /**
     * @param {AggregionBlockchain} blockchain
    */
    constructor(contractAccount: any, blockchain: AggregionBlockchain);

    getMessageById(id: number): Promise<any>;
    getMessagesAfter(id: number): Promise<any[]>;
    getMessagesBefore(id: number): Promise<any[]>;
    getMessagesRange(from: number, to: number): Promise<any[]>;
}


export declare class CatalogsContract {
    /**
     * @param {EosioName} contractName
     * @param {AggregionBlockchain} blockchain
    */
    constructor(contractName: string, blockchain: AggregionBlockchain);

    catupsert(categoryId: Number, parentId: Number, lang: string, name: string, permission: any): Promise<void>;
    catuptrans(categoryId: Number, lang: string, name: string, permission: string): Promise<void>;
    catremove(categoryId: Number, permission: any): Promise<void>;

    vendinsert(vendorId: Number, name: string, permission: any): Promise<void>;
    vendremove(vendorId: Number, permission: any): Promise<void>;

    brandinsert(brandId: Number, name: string, permission: any): Promise<void>;
    brandremove(brandId: Number, permission: any): Promise<void>;
    bindBrandToVendor(vendorId: Number, brandId: Number, permission: any): Promise<void>;
    unbindBrandFromVendor(vendorId: Number, brandId: Number, permission: any): Promise<void>;

    regioninsert(regionId: Number, lang: string, name: string, permission: any): Promise<void>;
    regionupdate(regionId: Number, lang: string, name: string, permission: any): Promise<void>;
    regionremove(regionId: Number, permission: any): Promise<void>;

    citytypeins(citytypeId: Number, lang: string, name: string, permission: any): Promise<void>;
    citytypetrn(citytypeId: Number, lang: string, name: string, permission: any): Promise<void>;
    citytyperem(citytypeId: Number, permission: any): Promise<void>;

    cityinsert(cityId: Number, regionId: Number, citytypeId: Number, lang: string, name: string, population: Number, permission: any): Promise<void>;
    citytrans(cityId: Number, lang: string, name: string, permission: string): Promise<void>;
    citychtype(cityId: Number, cityTypeId: Number, permission: string): Promise<void>;
    cityremove(cityId: Number, permission: any): Promise<void>;

    placeinsert(placeId: Number, lang: string, name: string, permission: any): Promise<void>;
    placeupdate(placeId: Number, lang: string, name: string, permission: any): Promise<void>;
    placeremove(placeId: Number, permission: any): Promise<void>;

    upsertCountry(countryId: Number, code: Number, lang: string, name: string, permission: any): Promise<void>;
    removeCountry(countryId: Number, permission: any): Promise<void>;

    setCityCountry(cityId: Number, countryId: Number, permission: any): Promise<void>;
    unsetCityCountry(cityId: Number, permission: any): Promise<void>;

    setRegionCountry(regionId: Number, countryId: Number, permission: any): Promise<void>;
    unsetRegionCountry(regionId: Number, permission: any): Promise<void>;
}


export declare class CatalogsUtility {
    /**
     * @param {AggregionBlockchain} blockchain
    */
    constructor(contractAccount: any, blockchain: AggregionBlockchain);
    getCategories(): Promise<any[]>;
    getCategoriesByLang(lang: any): Promise<any>;
    getCategoryName(lang: any, categoryId: any): Promise<String>;
    getCategoryById(id: any): Promise<any>;
    getSubcategories(parentId: any): Promise<any[]>;
    getCategoryPath(id: any): Promise<{
        a0: any;
        a1: any;
        a2: any;
        a3: any;
        a4: any;
    }>;

    getVendors(): Promise<any[]>;
    getBrands(): Promise<any[]>;

    getRegions(): Promise<any[]>;
    getRegionsByLang(lang: any): Promise<any[]>;
    getRegionName(lang: any, regionId: any): Promise<String>;

    getCityTypes(): Promise<any[]>;
    getCityTypesByLang(lang: any): Promise<any[]>;
    getCityTypeName(lang: any, citytypeId: any): Promise<any[]>;

    getCities(): Promise<any[]>;
    getCityById(id: any): Promise<any[]>;
    getCitiesByLang(lang: any): Promise<any[]>;
    getCityName(lang: any, cityId: any): Promise<String>;
    getCitiesByRegion(regionId: any): Promise<any[]>;

    getPlaces(): Promise<any[]>;
    getPlacesByLang(lang: any): Promise<any[]>;
    getPlaceName(lang: any, placeId: any): Promise<String>;

    getCountries(): Promise<any[]>;
    getCountriesByLang(lang: any): Promise<any[]>;
    getCountryCode(countryId: any): Promise<Number>;
    getCountryName(lang: any, countryId: any): Promise<String>;

    getCitiesCountries(): Promise<any[]>;
    getCityCountry(cityId: any): Promise<Number>;
    getCitiesByCountry(countryId: any): Promise<any[]>;

    getRegionsCountries(): Promise<any[]>;
    getRegionCountry(regionId: any): Promise<Number>;
    getRegionsByCountry(countryId: any): Promise<any[]>;
}



export { }
