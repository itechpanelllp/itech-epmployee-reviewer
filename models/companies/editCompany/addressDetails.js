const companyTables = require('@config/table');
const db = require('@config/db');

module.exports = {
    // get company data
    companyData: async (id) => {
        const result = await db.query(`SELECT * FROM ${companyTables.companies} WHERE id = ?`, [id]);
        return result[0] || '';
    },
    getCountry: async () => {
        const result = await db.query(`SELECT * FROM ${companyTables.country}`);
        return result || '';
    },
    // get company address
    getCompanyAddress: async (id) => {
        const [registration] = await db.query(`SELECT * FROM ${companyTables.company_address} WHERE company_id = ? AND type = 'registered'  LIMIT 1`, [id]);
        const [operational] = await db.query(`SELECT * FROM ${companyTables.company_address} WHERE company_id = ? AND type = "operational" LIMIT 1`, [id]);
        return { registration: registration || {}, operational: operational || {} };
    },

    //delete address
    deleteAddress: async (id) => {
        const result = await db.query(`DELETE FROM ${companyTables.company_address} WHERE company_id = ?`, [id]);
        return result || '';
    },

    // insert address
    addAddress: async (data) => {
        const result = await db.query(`INSERT INTO ${companyTables.company_address} (company_id, is_same_address, type, country, state, city, address, postal_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [data.company_id, data.is_same_address, data.type, data.country, data.state, data.city, data.address, data.postal_code]);
        return Number(result.insertId) || '';
    },


}