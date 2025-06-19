
const forgotPassTables = require('@config/table');
const db = require('@config/db');

module.exports = {

    // user data
    userData: async (email) => {
        const result = await db.query(`SELECT * FROM ${forgotPassTables.user} WHERE email = ?`, [email]);
        return result[0] || '';
    },

    // update reset password token
    updateResetToken: async (id, token, expire) => {
        const result = await db.query(`UPDATE ${forgotPassTables.user} SET reset_token = ?, reset_token_expire = ? WHERE id = ?`, [token, expire, id]);
        return result[0] || '';
    },


}