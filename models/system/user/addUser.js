const userTables = require('@config/table');
const db = require('@config/db');


module.exports = {

    // user details
    userDetails: async (id) => {
        const result = await db.query(`SELECT * FROM ${userTables.user} WHERE id = '${id}'`);
        return result[0] || '';
    },
    // check user exits
    checkUserExist: async (email) => {
        const result = await db.query(`SELECT * FROM ${userTables.user} WHERE email = ? AND status = '1'`, [email]);
        return result[0] || '';

    },

    // add user
    addUser: async (data) => {
        const result = await db.query(`INSERT INTO ${userTables.user} (firstname, lastname, email, phoneNumber, password,  status, role) VALUES(?, ?, ?, ?, ?, ?, ?)`, [data.firstname, data.lastname, data.email, data.phoneNumber, data.password, data.status, data.role]);
        return Number(result.insertId) || '';
    },
}