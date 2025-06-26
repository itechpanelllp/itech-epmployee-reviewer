const companyTables = require('@config/table');
const db = require('@config/db');

module.exports = {
    // get company type
    companyData: async (id) => {
        const result = await db.query(`SELECT * FROM ${companyTables.companies} WHERE id = ?`, [id]);
        return result[0] || '';
    },
    // get company type
    getCompanyType: async () => {
        const result = await db.query(`SELECT id, name FROM ${companyTables.company_types}`);
        return result || '';
    },

    getEmployeeStrength: async () => {
        const result = await db.query(`SELECT * FROM ${companyTables.employee_strength}`);
        return result || '';
    },

    // update company
    updateCompany: async (key, value) => {
        const result = await db.query(`UPDATE ${companyTables.companies} set ${key} WHERE id = ?`, value);
        return result || '';
    },

    setCompanyApprovalStatus: async (id, action) => {
        let query = '';
        switch (action) {
            case 'approved':
                query = `UPDATE ${companyTables.companies} SET approval_status = 'approved' WHERE id = ?`;
                break;

            case 'rejected':
                query = `UPDATE ${companyTables.companies} SET approval_status = 'rejected' WHERE id = ?`;
                break;

            default:
                throw new Error('Invalid action');
        }

        return await db.query(query, [id]);
    },

    /// insert comment
    insertComment: async (data) => {
        const result = await db.query(`INSERT INTO ${companyTables.company_meta} (company_id, meta_key, meta_value) VALUES(?, ?, ?)`, [data.company_id, data.meta_key, data.meta_value]);
        return result || '';
    },

    // get documents
    getDocuments: async (id) => {
        const result = await db.query(`SELECT * FROM ${companyTables.company_documents} WHERE company_id = ?`, [id]);
        return result || '';
    },
    getDocumentType: async () => {
        const result = await db.query(`SELECT id, name, side FROM ${companyTables.government_id_documents} WHERE status = 'active'`);
        return result || '';
    },
  
 

    // Delete multiple document keys
    deleteDocument: async (companyId, keys = []) => {
        if (!companyId || !Array.isArray(keys) || !keys.length) return;
        const placeholders = keys.map(() => '?').join(', ');
        const query = `DELETE FROM ${companyTables.company_documents} WHERE company_id = ? AND meta_key IN (${placeholders})`;
        return await db.query(query, [companyId, ...keys]);
    },

    // Update a single document key
    updateDocument: async (companyId, metaKey, metaValue) => {
        const query = `UPDATE ${companyTables.company_documents} SET meta_value = ? WHERE company_id = ? AND meta_key = ?`;
        return await db.query(query, [metaValue, companyId, metaKey]);
    },

    // Insert a new document key
    addDocument: async ({ company_id, meta_key, meta_value }) => {
        const query = `INSERT INTO ${companyTables.company_documents} (company_id, meta_key, meta_value) VALUES (?, ?, ?)`;
        return await db.query(query, [company_id, meta_key, meta_value]);
    },

    // Upsert logic (insert or update)
    updateOrInsertDocument: async (companyId, metaKey, metaValue) => {
    const query = `
        INSERT INTO ${companyTables.company_documents}
        (company_id, meta_key, meta_value)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE meta_value = VALUES(meta_value)
    `;
    return db.query(query, [companyId, metaKey, metaValue]);
}







}