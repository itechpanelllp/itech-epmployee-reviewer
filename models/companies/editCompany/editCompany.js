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
    updateCompany: async(key, value) => {
        const result = await db.query(`UPDATE ${companyTables.companies} set ${key} WHERE id = ?`, value);
        return result || '';
    }

    
}