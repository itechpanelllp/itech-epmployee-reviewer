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

    getDocuments: async (id) => {
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

    // update document
    updateDocumentsStatus: async (id, docId, action) => {
        let query = '';
        switch (action) {
            case 'approved':
                query = `UPDATE ${companyTables.company_documents} SET status = 'approved' WHERE id = ? AND company_id = ?`;
                break;

            case 'rejected':
                query = `UPDATE ${companyTables.company_documents} SET status = 'rejected' WHERE id = ? AND company_id = ?`;
                break;

            default:
                throw new Error('Invalid action');
        }

        return await db.query(query, [docId, id]);
    },

    insertComment: async (data) => {
        const result = await db.query(`INSERT INTO ${companyTables.company_meta} (company_id, meta_key, meta_value) VALUES(?, ?, ?)`, [data.company_id, data.meta_key, data.meta_value]);
        return result || '';
    },


}