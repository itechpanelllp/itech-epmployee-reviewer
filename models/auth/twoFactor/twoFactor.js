
const twoFactorTables = require('@config/table');
const db = require('@config/db');

module.exports = {

    // get user data
    getUserData: async (userId) => {
        const result = await db.query(`SELECT * FROM ${twoFactorTables.user} WHERE id = ?`, [userId]);
        return result[0];
    }



}