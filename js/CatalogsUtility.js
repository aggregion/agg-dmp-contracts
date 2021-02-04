const check = require('check-types');

const AggregionBlockchain = require('./AggregionBlockchain.js');
const TablesUtility = require('./TablesUtility.js');


class CatalogsUtility {

    /**
     * @param {AggregionBlockchain} blockchain
    */
    constructor(contractAccount, blockchain) {
        this.contractAccount = contractAccount;
        this.bc = blockchain;
        this.tables = new TablesUtility(contractAccount, blockchain);
        this.langs = {};
    }

    async getCategories() {
        return await this.tables.getTable('categories');
    }

    async getCategoriesByLang(lang) {
        check.assert.assigned(lang, 'lang is required');
        return await this.tables.getTableScope('cattrans', lang);
    }

    async getCategoryName(lang, categoryId) {
        check.assert.assigned(lang, 'lang is required');
        check.assert.assigned(categoryId, 'categoryId is required');
        let data = await this.bc.getTableRows(this.contractAccount, 'cattrans', lang, categoryId);
        if (data && data.rows.length == 1 && data.rows[0].name)
            return data.rows[0].name;
        return undefined;
    }

    async getCategoryById(id) {
        check.assert.assigned(id, 'parentId is required');
        const rows = await this.tables.getTable('categories', id);
        return rows[0];
    }

    async getSubcategories(parentId) {
        check.assert.assigned(parentId, 'parentId is required');
        return await this.tables.getTableByIndex('categories', 2, 'i64', parentId);
    }

    async getCategoryPath(id, lang) {
        check.assert.assigned(id, 'id is required');
        check.assert.assigned(lang, 'lang is required');
        let path = [null, null, null, null, null];
        while (true) {
            const rows = await this.tables.getTable('categories', id);
            const category = rows[0];
            const name = await this.getCategoryName(lang, category.id);
            path.push(name);
            if (category.parent_id) {
                id = category.parent_id;
                continue;
            }
            break;
        }
        const base = path.length;
        return {
            a0: path[base - 1],
            a1: path[base - 2],
            a2: path[base - 3],
            a3: path[base - 4],
            a4: path[base - 5]
        };
    }

    async getVendors() {
        return await this.tables.getTable('vendors');
    }

    async getBrands() {
        return await this.tables.getTable('brands');
    }

    async getRegions() {
        return await this.tables.getTable('regions');
    }

    async getRegionsByLang(lang) {
        check.assert.assigned(lang, 'lang is required');
        return await this.tables.getTableScope('rtr', lang);
    }

    async getRegionName(lang, regionId) {
        check.assert.assigned(lang, 'lang is required');
        check.assert.assigned(regionId, 'regionId is required');
        let data = await this.bc.getTableRows(this.contractAccount, 'rtr', lang, regionId);
        if (data && data.rows.length == 1 && data.rows[0].name)
            return data.rows[0].name;
        return undefined;
    }

    async getCityTypes() {
        return await this.tables.getTable('citytypes');
    }

    async getCityTypesByLang(lang) {
        check.assert.assigned(lang, 'lang is required');
        return await this.tables.getTableScope('cttr', lang);
    }

    async getCityTypeName(lang, citytypeId) {
        check.assert.assigned(lang, 'lang is required');
        check.assert.assigned(citytypeId, 'citytypeId is required');
        let data = await this.bc.getTableRows(this.contractAccount, 'cttr', lang, citytypeId);
        if (data && data.rows.length == 1 && data.rows[0].name)
            return data.rows[0].name;
        return undefined;
    }

    async getCities() {
        return await this.tables.getTable('cities');
    }

    async getCitiesByLang(lang) {
        check.assert.assigned(lang, 'lang is required');
        return await this.tables.getTableScope('ctr', lang);
    }

    async getCityName(lang, cityId) {
        check.assert.assigned(lang, 'lang is required');
        check.assert.assigned(cityId, 'cityId is required');
        let data = await this.bc.getTableRows(this.contractAccount, 'ctr', lang, cityId);
        if (data && data.rows.length == 1 && data.rows[0].name)
            return data.rows[0].name;
        return undefined;
    }

    async getCitiesByRegion(regionId) {
        check.assert.assigned(regionId, 'regionId is required');
        return await this.tables.getTableByIndex('cities', 2, 'i64', regionId);
    }

    async getPlaces() {
        return await this.tables.getTable('places');
    }

    async getPlacesByLang(lang) {
        check.assert.assigned(lang, 'lang is required');
        return await this.tables.getTableScope('pltr', lang);
    }

    async getPlaceName(lang, placeId) {
        check.assert.assigned(lang, 'lang is required');
        check.assert.assigned(placeId, 'placeId is required');
        let data = await this.bc.getTableRows(this.contractAccount, 'pltr', lang, placeId);
        if (data && data.rows.length == 1 && data.rows[0].name)
            return data.rows[0].name;
        return undefined;
    }
};

module.exports = CatalogsUtility;
