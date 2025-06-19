const userTables = require('@config/table');
const db = require('@config/db');


module.exports = {
    // get role
    getRole: async () => {
        const result = await db.query(`SELECT * FROM ${userTables.role} WHERE status = '1'`);
        return result || '';
    },

    // user data table
    userDataTable: async (where, start, limit, sort, order) => {
        const query = `SELECT u.*, r.role_name, COUNT(u.id) OVER() AS total FROM ${userTables.user} AS u LEFT JOIN ${userTables.role} AS r ON r.id = u.role WHERE ${where} ORDER BY ${sort} ${order} LIMIT ${start}, ${limit} `
        const value = [];
        const result = await db.query(query, value);
        return result || '';
    },

    // update user status
    updateUserStatus: async (id, status) => {
        const result = await db.query(`UPDATE ${userTables.user} SET status = ? WHERE id = ?`, [status, id]);
        return result || '';
    },

    // check user exits
    checkUserExist: async (email) => {
        const result = await db.query(`SELECT * FROM ${userTables.user} WHERE email = ? AND status = '1'`, [email]);
        return result[0] || '';

    },

    //delete user
    deleteUser: async (id) => {
        const result = await db.query(`UPDATE ${userTables.user} set status = '3' WHERE id = ? `, [id]);
        return result || '';
    },

    // get trash user
    getTrashUsers: async () => {
        const result = await db.query(`SELECT u.*, r.role_name, COUNT(u.id) OVER() AS total FROM ${userTables.user} AS u LEFT JOIN ${userTables.role} AS r ON r.id = u.role WHERE u.status = '3' ORDER BY id DESC`);
        return result || '';
    },

    // restore user
    restoreUserAction: async (id) => {
        const result = await db.query(`UPDATE ${userTables.user} SET status = '1' WHERE id = ?`, id);
        return result || '';
    },

    // permanent  user delete
    permanentUserDelete: async (id) => {
        const result = await db.query(`DELETE FROM ${userTables.user} WHERE id = ?`, [id]);
        return result || '';
    },

}