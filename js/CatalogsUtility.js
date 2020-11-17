
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
    }

    async getCategories() {
        return await this.tables.getTable('categories');
    }

    async getCategoryById(id) {
        const rows = await this.tables.getTable('categories', id);
        return rows[0];
    }

    async getSubcategories(parentId) {
        return await this.tables.getTableBySecondaryKey('categories', parentId);
    }

    async getCategoryPath(id) {
        let path = [null, null, null, null, null];
        while (true) {
            const rows = await this.tables.getTable('categories', id);
            const category = rows[0];
            path.push(category.name);
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

    async getCityTypes() {
        return await this.tables.getTable('citytypes');
    }

    async getCities() {
        return await this.tables.getTable('cities');
    }

    async getRegionCities(region_id) {
        return await this.tables.getTableBySecondaryKey('cities', region_id);
    }
};

module.exports = CatalogsUtility;
