const settingTables = require('@config/table');
const db = require('@config/db');


module.exports = {
    // get country
    getCountry: async () => {
        const result = await db.query(`SELECT * FROM ${settingTables.country}`);
        return result || '';
    },
    // get state
    getSettingState: async (code) => {
        const result = await db.query(`SELECT * FROM ${settingTables.state} WHERE country_id = ? ORDER BY name ASC`, [code]);
        return result || '';
    },
    // get city
    getSettingCity: async (code) => {
        const result = await db.query(`SELECT * FROM ${settingTables.city} WHERE state_id = ?  ORDER BY name ASC`, [code]);
        return result || '';
    },
      // get site configuration data
    getSiteConfigData: async() => {
        const result = await db.query(`SELECT * FROM ${settingTables.configuration}`);
        return result || '';
    },

    // delete site data from configuration table
    deleteSiteData: async() => {
        const result = await db.query(`DELETE FROM ${settingTables.configuration}`);
        return result || '';
    },

    // insert setting data
    insertSettingData: async (data) => {
        const result = await db.query(`INSERT INTO ${settingTables.configuration} (meta_key, meta_value) VALUES (?, ?)`, [data.meta_key, data.meta_value]);
        return result || '';
    },
}