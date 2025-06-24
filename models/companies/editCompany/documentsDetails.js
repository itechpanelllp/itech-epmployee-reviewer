const companyTables = require('@config/table');
const db = require('@config/db');

module.exports = {
    // get company data
    companyData: async (id) => {
        const result = await db.query(`SELECT * FROM ${companyTables.companies} WHERE id = ?`, [id]);
        return result[0] || '';
    },
    // add document
    addDocument: async (data) => {
        const result = await db.query(`INSERT INTO ${companyTables.company_documents} (company_id, meta_key, meta_value) VALUES(?, ?, ?)`, [data.company_id, data.meta_key, data.meta_value]);
        return result || '';
    },

    getDocuments : async (id) => {
        const result = await db.query(`SELECT * FROM ${companyTables.company_documents} WHERE company_id = ?`, [id]);
        return result || '';
    },

    // update logo
    updateCompanyLogo: async (id, logo) => {
        const result = await db.query(`UPDATE ${companyTables.companies} SET logo = ? WHERE id = ?`, [logo, id]);
        return result || '';
    },

    // delete document
    deleteDocument: async (id) => {
        const result = await db.query(`DELETE FROM ${companyTables.company_documents} WHERE company_id = ?`, [id]);
        return result || '';
    },

}