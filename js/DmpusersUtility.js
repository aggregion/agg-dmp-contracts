const crypto = require('crypto');
const AggregionBlockchain = require('./AggregionBlockchain.js');
const TablesUtility = require('./TablesUtility.js');


class DmpusersUtility {

    /**
     * @param {String} contractAccount
     * @param {AggregionBlockchain} blockchain
    */
    constructor(contractAccount, blockchain) {
        this.contractAccount = contractAccount;
        this.bc = blockchain;
        this.tables = new TablesUtility(contractAccount, blockchain);
    }

    async getOrganization(name) {
        const rows = await this.tables.getTableByPrimaryKey('orgs', name);
        return rows[0];
    }

    async isOrganizationExists(name) {
        let o = await this.getOrganization(name);
        return typeof o != 'undefined';
    };

    async getUser(name) {
        const rows = await this.tables.getTableByPrimaryKey('users', name);
        return rows[0];
    }

    async isUserExists(name) {
        let u = await this.getUser(name);
        return typeof u != 'undefined';
    };

    async getPublicKey(owner) {
        const rows = await this.tables.getTableByPrimaryKey('pkeys', owner);
        return rows[0];
    }

    async isPublicKeyExists(owner) {
        let u = await this.getPublicKey(owner);
        return typeof u != 'undefined';
    };


    async getOrg2(orgId) {
        const rows = await this.tables.getTableByPrimaryKey('orgsv2', orgId);
        return rows[0];
    }

    async getProjectById(projectId) {
        const rows = await this.tables.getTableByPrimaryKey('projects', projectId);
        return rows[0];
    }

    async getProjectsByReceiver(receiverOrgId) {
        const result = await this.bc.getTableRowsByIndex(this.contractAccount, 'projects', 'default', 2, 'i64', receiverOrgId, receiverOrgId);
        return result.rows;

    }

    async getProjectsByReceiverAndUpdatedAt(receiverOrgId, updatedAt) {
        const hash = crypto.createHash('sha256').update(receiverOrgId + '-' + updatedAt).digest('hex');
        const result = await this.bc.getTableRowsByIndex(this.contractAccount, 'projects', 'default', 3, 'sha256', hash, hash);
        return result.rows;
    }


    async getDatasetById(datasetId) {
        const rows = await this.tables.getTableByPrimaryKey('datasets', datasetId);
        return rows[0];
    }

    async getDatasetsByUpdateAt(lower, upper) {
        const result = await this.bc.getTableRowsByIndex(this.contractAccount, 'datasets', 'default', 2, 'i64', lower, upper);
        return result.rows;
    }

    async getDatasetsBySender(senderOrgId) {
        const result = await this.bc.getTableRowsByIndex(this.contractAccount, 'datasets', 'default', 3, 'i64', senderOrgId, senderOrgId);
        return result.rows;
    }

    async getDatasetsByReceiver(receiverOrgId) {
        const result = await this.bc.getTableRowsByIndex(this.contractAccount, 'datasets', 'default', 4, 'i64', receiverOrgId, receiverOrgId);
        return result.rows;
    }


    async getDatasetRequestById(dsReqId) {
        const rows = await this.tables.getTableByPrimaryKey('dsreqs', dsReqId);
        return rows[0];
    }

    async getDatasetRequestsByReceiverAndUpdatedAt(receiverOrgId, updatedAt) {
        const hash = crypto.createHash('sha256').update(receiverOrgId + '-' + updatedAt).digest('hex');
        const result = await this.bc.getTableRowsByIndex(this.contractAccount, 'dsreqs', 'default', 2, 'sha256', hash, hash);
        return result.rows;
    }

};

module.exports = DmpusersUtility;
