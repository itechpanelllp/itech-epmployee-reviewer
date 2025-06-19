
const userTables = require('@config/table');
const db = require('@config/db');
module.exports = {
    // user activity log
    insertActivity: async (data) => {
        const result = await db.query(`INSERT INTO ${userTables.user_activity} (user_id, type, activity, action, browser) VALUES(?, ?, ?, ?, ?)`, [data.user_id, data.type, data.activity, data.action, data.browser]);
        return result || '';
    },
}