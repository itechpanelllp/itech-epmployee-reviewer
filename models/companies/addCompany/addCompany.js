const companyTables = require('@config/table');
const db = require('@config/db');

module.exports = {
    // get company type
    getCompanyType: async () => {
        const result = await db.query(`SELECT id, name FROM ${companyTables.company_types}`);
        return result || '';
    },
    getCountry: async () => {
        const result = await db.query(`SELECT * FROM ${companyTables.country}`);
        return result || '';
    },
    getEmployeeStrength: async () => {
        const result = await db.query(`SELECT * FROM ${companyTables.employee_strength}`);
        return result || '';
    },
}