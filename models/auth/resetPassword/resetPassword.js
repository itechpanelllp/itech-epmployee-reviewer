
const resetPassTables = require('@config/table');
const db = require('@config/db');

module.exports = {

    // user data
    userData: async (token) => {
        const result = await db.query(`SELECT * FROM ${resetPassTables.user} WHERE reset_token = ?`, [token]);
        return result[0] || '';
    },

   // update password
   updatePassword: async (token, password) => {
        const result = await db.query(`UPDATE ${resetPassTables.user} SET password = ?, reset_token = NULL, reset_token_expire = NULL WHERE reset_token = ?`, [password, token]);
        return result[0] || '';
    }


}