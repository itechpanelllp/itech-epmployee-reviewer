const loginTable = require('@config/table');
const db = require('@config/db');

module.exports = {

    // user data
    userData: async (email) => {
        const result = await db.query(`SELECT * FROM ${loginTable.user} WHERE email = ?`, [email]);
        return result[0] || '';
    },

    // user status update
    userStatusUpdate: async (id) => {
        const result = await db.query(`UPDATE ${loginTable.user} SET status = 2 WHERE id = ?`, [id]);
        return result[0] || '';
    },

    // user status update when incorrect password and email
    userFailAttempUpdate: async (id, attempts) => {
        const result = await db.query(`UPDATE ${loginTable.user} SET login_attempts = ? WHERE id = ?`, [attempts, id]);
        return result[0] || '';
    },
    // user status update when correct password and email
    updateLoginAttemp: async (id) => {
        const result = await db.query(`UPDATE ${loginTable.user} SET login_attempts = 0 WHERE id = ?`, [id]);
        return result[0] || '';
    },
}