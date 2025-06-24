const companyTables = require('@config/table');
const db = require('@config/db');

module.exports = {
    // get company data
    companyData: async (id) => {
        const result = await db.query(`SELECT * FROM ${companyTables.companies} WHERE id = ?`, [id]);
        return result[0] || '';
    },
    
    // update password
    updatePassword : async (password, id) => {
        const result = await db.query(`UPDATE ${companyTables.companies} set password = ? WHERE id = ?`, [password, id]);
        return result || '';
    }


}