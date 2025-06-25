const companyTables = require('@config/table');
const db = require('@config/db');

module.exports = {
    emailVerification: async(id, token) => {
        const result = await db.query(`SELECT * FROM ${companyTables.companies} WHERE id = ? AND email_verification_token = ?`, [id, token]);
        return result[0] || '';
    },
    updateEmailVerification: async(id, token) => {
        const result= await db.query(`UPDATE ${companyTables.companies} SET email_verification = ?, email_verification_token = '' WHERE id = ? AND email_verification_token = ?`, ['approved', id, token]);
        return result || '';
    },
}