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
     * Insert or update category
     * @param {Number} categoryId
     * @param {Number} parentId (may be null)
     * @param {String} name
     * @param {permission} permission
     */
    async catupsert(categoryId, parentId, lang, name, permission) {
        check.assert.assigned(categoryId, 'categoryId is required');
        check.assert.assigned(lang, 'lang is required');
        check.assert.assigned(name, 'name is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.id = categoryId;
        request.parent_id = parentId;
        request.lang = lang;
        request.name = name;
        return await this.bc.pushAction(this.contractName, "catupsert", request, permission);
    }

    /**
     * Insert or update category name translation.
     * @param {Number} categoryId
     * @param {String} lang
     * @param {String} name
     * @param {permission} permission
     */
    async catuptrans(categoryId, lang, name, permission) {
        check.assert.assigned(categoryId, 'categoryId is required');
        check.assert.assigned(lang, 'lang is required');
        check.assert.assigned(name, 'name is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.category_id = categoryId;
        request.lang = lang;
        request.name = name;
        return await this.bc.pushAction(this.contractName, "catuptrans", request, permission);
    }

    /**
     * Remove category and its name translations.
     * @param {Number} categoryId
     * @param {permission} permission
     */
    async catremove(categoryId, permission) {
        check.assert.assigned(categoryId, 'categoryId is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.category_id = categoryId;
        return await this.bc.pushAction(this.contractName, "catremove", request, permission);
    }

    /**
    * Insert new vendor.
    * @param {Number} vendorId (may be null)
    * @param {String} name
    * @param {permission} permission
    */
    async vendinsert(vendorId, name, permission) {
        check.assert.assigned(name, 'name is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.id = vendorId;
        request.name = name;
        return await this.bc.pushAction(this.contractName, "vendinsert", request, permission);
    }

    /**
     * Remove vendor.
     * @param {Number} vendorId
     * @param {permission} permission
     */
    async vendremove(vendorId, permission) {
        check.assert.assigned(vendorId, 'vendorId is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.vendor_id = vendorId;
        return await this.bc.pushAction(this.contractName, "vendremove", request, permission);
    }

    /**
    * Insert new brand.
    * @param {Number} brandId (may be null)
    * @param {String} name
    * @param {permission} permission
    */
    async brandinsert(brandId, name, permission) {
        check.assert.assigned(name, 'name is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.id = brandId;
        request.name = name;
        return await this.bc.pushAction(this.contractName, "brandinsert", request, permission);
    }

    /**
     * Remove brand.
     * @param {Number} brandId
     * @param {permission} permission
     */
    async brandremove(brandId, permission) {
        check.assert.assigned(brandId, 'brandId is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.brand_id = brandId;
        return await this.bc.pushAction(this.contractName, "brandremove", request, permission);
    }

    /**
    * Bind brand to vendor.
    * @param {Number} vendorId
    * @param {Number} brandId
    * @param {permission} permission
    */
    async bindBrandToVendor(vendorId, brandId, permission) {
        check.assert.assigned(vendorId, 'vendorId is required');
        check.assert.assigned(brandId, 'brandId is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.vendor_id = vendorId;
        request.brand_id = brandId;
        return await this.bc.pushAction(this.contractName, "venbrbind", request, permission);
    }

    /**
     * Unbind brand from vendor.
    * @param {Number} vendorId
    * @param {Number} brandId
     * @param {permission} permission
     */
    async unbindBrandFromVendor(vendorId, brandId, permission) {
        check.assert.assigned(vendorId, 'vendorId is required');
        check.assert.assigned(brandId, 'brandId is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.vendor_id = vendorId;
        request.brand_id = brandId;
        return await this.bc.pushAction(this.contractName, "venbrunbind", request, permission);
    }

    /**
    * Insert region.
    * @param {Number} regionId
    * @param {String} lang
    * @param {String} name
    * @param {permission} permission
    */
    async regioninsert(regionId, lang, name, permission) {
        check.assert.assigned(regionId, 'regionId is required');
        check.assert.assigned(lang, 'lang is required');
        check.assert.assigned(name, 'name is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.id = regionId;
        request.lang = lang;
        request.name = name;
        return await this.bc.pushAction(this.contractName, "regioninsert", request, permission);
    }

    /**
    * Update region translation.
    * @param {Number} regionId
    * @param {String} lang
    * @param {String} name
    * @param {permission} permission
    */
    async regionupdate(regionId, lang, name, permission) {
        check.assert.assigned(regionId, 'regionId is required');
        check.assert.assigned(lang, 'lang is required');
        check.assert.assigned(name, 'name is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.id = regionId;
        request.lang = lang;
        request.name = name;
        return await this.bc.pushAction(this.contractName, "regionupdate", request, permission);
    }

    /**
     * Remove region.
     * @param {Number} regionId
     * @param {permission} permission
     */
    async regionremove(regionId, permission) {
        check.assert.assigned(regionId, 'regionId is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.region_id = regionId;
        return await this.bc.pushAction(this.contractName, "regionremove", request, permission);
    }

    /**
    * Insert new city type.
    * @param {Number} citytypeId
    * @param {String} lang
    * @param {String} name
    * @param {permission} permission
    */
    async citytypeins(citytypeId, lang, name, permission) {
        check.assert.assigned(citytypeId, 'citytypeId is required');
        check.assert.assigned(lang, 'lang is required');
        check.assert.assigned(name, 'name is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.id = citytypeId;
        request.lang = lang;
        request.name = name;
        return await this.bc.pushAction(this.contractName, "citytypeins", request, permission);
    }

    /**
    * Update city type title translation.
    * @param {Number} citytypeId
    * @param {String} lang
    * @param {String} name
    * @param {permission} permission
    */
    async citytypetrn(citytypeId, lang, name, permission) {
        check.assert.assigned(citytypeId, 'citytypeId is required');
        check.assert.assigned(lang, 'lang is required');
        check.assert.assigned(name, 'name is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.id = citytypeId;
        request.lang = lang;
        request.name = name;
        return await this.bc.pushAction(this.contractName, "citytypetrn", request, permission);
    }

    /**
     * Remove city type.
     * @param {Number} citytypeId
     * @param {permission} permission
     */
    async citytyperem(citytypeId, permission) {
        check.assert.assigned(citytypeId, 'citytypeId is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.citytype_id = citytypeId;
        return await this.bc.pushAction(this.contractName, "citytyperem", request, permission);
    }

    /**
    * Insert new city.
    * @param {Number} cityId
    * @param {Number} regionId
    * @param {Number} citytypeId
    * @param {String} lang
    * @param {String} name
    * @param {Number} population
    * @param {permission} permission
    */
    async cityinsert(cityId, regionId, citytypeId, lang, name, population, permission) {
        check.assert.assigned(cityId, 'cityId is required');
        check.assert.assigned(regionId, 'regionId is required');
        check.assert.assigned(citytypeId, 'typeId is required');
        check.assert.assigned(lang, 'lang is required');
        check.assert.assigned(name, 'name is required');
        check.assert.assigned(population, 'population is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.id = cityId;
        request.region_id = regionId;
        request.type_id = citytypeId;
        request.lang = lang;
        request.name = name;
        request.population = population;
        return await this.bc.pushAction(this.contractName, "cityinsert", request, permission);
    }

    /**
    * Insert or update city name translation.
    * @param {Number} cityId
    * @param {String} lang
    * @param {String} name
    * @param {permission} permission
    */
    async citytrans(cityId, lang, name, permission) {
        check.assert.assigned(cityId, 'cityId is required');
        check.assert.assigned(lang, 'lang is required');
        check.assert.assigned(name, 'name is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.id = cityId;
        request.lang = lang;
        request.name = name;
        return await this.bc.pushAction(this.contractName, "citytrans", request, permission);
    }

    /**
    * Change city type.
    * @param {Number} cityId
    * @param {Number} cityTypeId
    */
    async citychtype(cityId, cityTypeId, permission) {
        check.assert.assigned(cityId, 'cityId is required');
        check.assert.assigned(cityTypeId, 'cityTypeId is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.id = cityId;
        request.type_id = cityTypeId;
        return await this.bc.pushAction(this.contractName, "citychtype", request, permission);
    }

    /**
     * Remove city.
     * @param {Number} cityId
     * @param {permission} permission
     */
    async cityremove(cityId, permission) {
        check.assert.assigned(cityId, 'cityId is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.city_id = cityId;
        return await this.bc.pushAction(this.contractName, "cityremove", request, permission);
    }


    /**
    * Insert place.
    * @param {Number} placeId
    * @param {String} lang
    * @param {String} name
    * @param {permission} permission
    */
    async placeinsert(placeId, lang, name, permission) {
        check.assert.assigned(placeId, 'placeId is required');
        check.assert.assigned(lang, 'lang is required');
        check.assert.assigned(name, 'name is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.id = placeId;
        request.lang = lang;
        request.name = name;
        return await this.bc.pushAction(this.contractName, "placeinsert", request, permission);
    }

    /**
    * Update place translation.
    * @param {Number} placeId
    * @param {String} lang
    * @param {String} name
    * @param {permission} permission
    */
    async placeupdate(placeId, lang, name, permission) {
        check.assert.assigned(placeId, 'placeId is required');
        check.assert.assigned(lang, 'lang is required');
        check.assert.assigned(name, 'name is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.id = placeId;
        request.lang = lang;
        request.name = name;
        return await this.bc.pushAction(this.contractName, "placeupdate", request, permission);
    }

    /**
     * Remove place.
     * @param {Number} placeId
     * @param {permission} permission
     */
    async placeremove(placeId, permission) {
        check.assert.assigned(placeId, 'placeId is required');
        check.assert.assigned(permission, 'permission is required');
        let request = {};
        request.place_id = placeId;
        return await this.bc.pushAction(this.contractName, "placeremove", request, permission);
    }

};

module.exports = CatalogsContract;
