const roleTables = require('@config/table');
const db = require('@config/db');


module.exports = {
   //role permissions
   getRolePermissionsMenus: async () => {
      const result = await db.query(`SELECT id, name, code, parent, url FROM ${roleTables.permission_menus} WHERE status = '1'`);
      return result || '';
   },

   // Check if the role name already exists
   getRoleByName: async (name) => {
      const result = await db.query(`SELECT * FROM ${roleTables.role} WHERE role_name = ?`, [name]);
      return result[0] || '';
   },
   // Add role
   addRole: async (data) => {
      const result = await db.query(`INSERT INTO ${roleTables.role} (role_name, status, permissions) VALUES (?, ?, ?)`, [data.role_name, data.status, data.permissions]);
      return result || '';
   }
}