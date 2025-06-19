const userTables = require('@config/table');
const db = require('@config/db');

module.exports = {
    // user data
    getUserData: async (id) => {
        const result = await db.query(`SELECT * FROM ${userTables.user} WHERE id = '${id}'`);
        return result[0] || '';
    },
    // user meta
    getUserMetaData: async (id) => {
        const result = await db.query(`SELECT * FROM ${userTables.user_meta} WHERE user_id = ${id}`);
        return result || '';
    },

    // get role
    getRole: async () => {
        const result = await db.query(`SELECT * FROM ${userTables.role} WHERE status = '1'`);
        return result || '';
    },
    // get country
    getCountry: async () => {
        const result = await db.query(`SELECT * FROM ${userTables.country}`);
        return result || '';
    },
    // get state
    getState: async (code) => {
        const result = await db.query(`SELECT * FROM ${userTables.state} WHERE country_id = ? ORDER BY name ASC`, [code]);
        return result || '';
    },
    // get city
    getCity: async (code) => {
        const result = await db.query(`SELECT * FROM ${userTables.city} WHERE state_id = ? ORDER BY name ASC`, [code]);
        return result || '';
    },

    // update user profile
    updateProfile: async (key, value) => {
        const result = await db.query(`UPDATE ${userTables.user} set ${key} WHERE id = ?`, value);
        return result || '';
    },

    // delete user meta 
    deleteUserMeta: async (id) => {
        const result = await db.query(`DELETE FROM ${userTables.user_meta} WHERE user_id = ? `, [id]);
        return result || '';
    },

    // insert user meta 
    insertUserMeta: async (data) => {
        const result = await db.query(`INSERT INTO ${userTables.user_meta} (user_id, meta_key, meta_value ) VALUES(?, ?, ?)`, [data.user_id, data.meta_key, data.meta_value]);
        return result || '';
    },


}