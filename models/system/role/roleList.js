const roleTables = require('@config/table');
const db = require('@config/db');

module.exports = {
    // role data table
    roleDataTable: async (where, start, limit, sort, order) => {
        const query = `SELECT *, COUNT(id) OVER() AS total FROM ${roleTables.role} WHERE ${where}  ORDER BY ${sort} ${order} LIMIT ${start}, ${limit} `;
        const value = [];
        const result = await db.query(query, value);
        return result || "";
    },

    // check role if it is global
    checkRoleIsGloble: async (id) => {
        const result = await db.query(`SELECT * FROM ${roleTables.role} WHERE isglobal = 1 AND id = ?`, [id]);
        return result[0] || "";
    },
    // check role assign user
    checkRoleAssign: async (id) => {
        const result = await db.query(`SELECT * FROM ${roleTables.user} WHERE role = ?`, [id]);
        return result[0] || "";
    },
    // update status
    updateRoleStatus: async (id, status) => {
        const result = await db.query(`UPDATE ${roleTables.role} SET status = ? WHERE id = ?`, [status, id]);
        return result || '';

    },

    // delete role
    deleteRole: async (id) => {
        const result = await db.query(`DELETE FROM ${roleTables.role} WHERE id = ?`, [id]);
        return result || '';
    },

}