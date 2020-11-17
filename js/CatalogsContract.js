const check = require('check-types');

const AggregionBlockchain = require('./AggregionBlockchain.js');


class CatalogsContract {

    /**
     * @param {EosioName} contractName
     * @param {AggregionBlockchain} blockchain
    */
    constructor(contractName, blockchain) {
        this.contractName = contractName;
        this.bc = blockchain;
    }

    /**
     * Insert new entry to categories catalog.
     * @param {String} id Category ID, may be null (auto assigned), must be unique
     * @param {String} parent_id Parent category ID (may be null)
     * @param {String} name
     * @param {permission} permission
     */
    async catinsert(id, parent_id, name, permission) {
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.id = id;
        request.parent_id = parent_id;
        request.name = name;
        return await this.bc.pushAction(this.contractName, "catinsert", request, permission);
    }

    /**
     * Remove entry from categories catalog.
     * @param {String} id
     * @param {permission} permission
     */
    async catremove(id, permission) {
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.category_id = id;
        return await this.bc.pushAction(this.contractName, "catremove", request, permission);
    }


    /**
    * Insert new vendor.
    * @param {String} id Vendor ID, may be null (auto assigned), must be unique
    * @param {String} name
    * @param {permission} permission
    */
    async vendinsert(id, name, permission) {
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.id = id;
        request.name = name;
        return await this.bc.pushAction(this.contractName, "vendinsert", request, permission);
    }

    /**
     * Remove vendor.
     * @param {String} id
     * @param {permission} permission
     */
    async vendremove(id, permission) {
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.vendor_id = id;
        return await this.bc.pushAction(this.contractName, "vendremove", request, permission);
    }

    /**
    * Insert new brand.
    * @param {String} id Brand ID, may be null (auto assigned), must be unique
    * @param {String} name
    * @param {permission} permission
    */
    async brandinsert(id, name, permission) {
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.id = id;
        request.name = name;
        return await this.bc.pushAction(this.contractName, "brandinsert", request, permission);
    }

    /**
     * Remove brand.
     * @param {String} id
     * @param {permission} permission
     */
    async brandremove(id, permission) {
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.brand_id = id;
        return await this.bc.pushAction(this.contractName, "brandremove", request, permission);
    }

    /**
    * Bind brand to vendor.
    * @param {String} vendor_id
    * @param {String} brand_id
    * @param {permission} permission
    */
    async bindBrandToVendor(vendor_id, brand_id, permission) {
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.vendor_id = vendor_id;
        request.brand_id = brand_id;
        return await this.bc.pushAction(this.contractName, "venbrbind", request, permission);
    }

    /**
     * Unbind brand from vendor.
     * @param {String} id
     * @param {permission} permission
     */
    async unbindBrandFromVendor(vendor_id, brand_id, permission) {
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.vendor_id = vendor_id;
        request.brand_id = brand_id;
        return await this.bc.pushAction(this.contractName, "venbrunbind", request, permission);
    }

    /**
    * Insert new region.
    * @param {String} id Region ID, may be null (auto assigned), must be unique
    * @param {String} name
    * @param {permission} permission
    */
    async regioninsert(id, name, permission) {
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.id = id;
        request.name = name;
        return await this.bc.pushAction(this.contractName, "regioninsert", request, permission);
    }

    /**
     * Remove region.
     * @param {String} id
     * @param {permission} permission
     */
    async regionremove(id, permission) {
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.region_id = id;
        return await this.bc.pushAction(this.contractName, "regionremove", request, permission);
    }

    /**
    * Insert new city type.
    * @param {String} id City type ID, may be null (auto assigned), must be unique
    * @param {String} name
    * @param {permission} permission
    */
    async citytypeins(id, name, permission) {
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.id = id;
        request.name = name;
        return await this.bc.pushAction(this.contractName, "citytypeins", request, permission);
    }

    /**
     * Remove city type.
     * @param {String} id
     * @param {permission} permission
     */
    async citytyperem(id, permission) {
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.citytype_id = id;
        return await this.bc.pushAction(this.contractName, "citytyperem", request, permission);
    }

    /**
    * Insert new city.
    * @param {String} id City ID, may be null (auto assigned), must be unique
    * @param {String} name
    * @param {permission} permission
    */
    async cityinsert(id, region_id, type_id, name, population, permission) {
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.id = id;
        request.region_id = region_id;
        request.type_id = type_id;
        request.population = population;
        request.name = name;
        return await this.bc.pushAction(this.contractName, "cityinsert", request, permission);
    }

    /**
     * Remove city.
     * @param {String} id
     * @param {permission} permission
     */
    async cityremove(id, permission) {
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.city_id = id;
        return await this.bc.pushAction(this.contractName, "cityremove", request, permission);
    }
};

module.exports = CatalogsContract;
