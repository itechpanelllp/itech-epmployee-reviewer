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


}