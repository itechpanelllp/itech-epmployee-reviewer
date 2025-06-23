const companyTables = require('@config/table');
const db = require('@config/db');

module.exports = {
    // get company data
    companyData: async (id) => {
        const result = await db.query(`SELECT * FROM ${companyTables.companies} WHERE id = ?`, [id]);
        return result[0] || '';
    },
    
    // update company
    updateContactPerson : async (key, value) => {
        const result = await db.query(`UPDATE ${companyTables.companies} set ${key} WHERE id = ?`, value);
        return result || '';
    }


}