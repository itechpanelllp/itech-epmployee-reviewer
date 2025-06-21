const roleTables = require('@config/table');
const db = require('@config/db');


module.exports = {
    //role permissions
    getRolePermissionsMenus: async () => {
        const result = await db.query(`SELECT id, name, code, parent, url FROM ${roleTables.sidebar_menus} WHERE status = '1'`);
        return result || '';
    },

    // get role data
    getRoleData: async (id) => {
        const result = await db.query(`SELECT * FROM ${roleTables.role} WHERE id = ?`, [id]);
        return result[0] || '';
    },

    // update role
    updateRole: async (data, id) => {
        const result = await db.query(`UPDATE ${roleTables.role} SET role_name = ?, permissions = ? WHERE id = ?`, [data.role_name, data.permissions, id]);
        return result || '';
    },


}