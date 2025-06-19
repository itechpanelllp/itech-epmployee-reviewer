const permissionTables = require('@config/table');
const db = require('@config/db');

module.exports = {
    getPermission: async (id) => {
        const result = await db.query(`SELECT * FROM ${permissionTables.role} WHERE id = ?`, [id]);
        return result[0] || '';
    },                                                          
}