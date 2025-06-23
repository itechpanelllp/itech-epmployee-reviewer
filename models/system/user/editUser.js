const userTables = require('@config/table');
const db = require('@config/db');


module.exports = {

    getUserData: async (id) => {
        const result = await db.query(`SELECT * FROM ${userTables.user} WHERE id = '${id}'`);
        return result[0] || '';
    },
    // user meta
    userMeta: async (id) => {
        const result = await db.query(`SELECT * FROM ${userTables.user_meta} WHERE user_id = ${id}`);
        return result || '';
    },

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
    getCity: async ({ country, state }) => {
        const where = [];
        const values = [];
        if (state) { where.push('state_id = ?'); values.push(state); }
        if (country) { where.push('country_id = ?'); values.push(country); }
        const query = ` SELECT * FROM ${userTables.city} ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY name ASC `; const result = await db.query(query, values);
        return result || '';
    },
    // update user
    updateUser: async (key, value) => {
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