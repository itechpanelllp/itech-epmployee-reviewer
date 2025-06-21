const industryTables = require('@config/table');
const db = require('@config/db');


module.exports = {
    // industry datatable
    industryDataTable: async (where, start, limit, sort, order) => {
        const query = `SELECT i.id, i.status, info.name, COUNT(i.id) OVER() AS total FROM ${industryTables.industry} AS i LEFT JOIN ${industryTables.industry_info} AS info ON info.industry_id = i.id WHERE ${where}  ORDER BY ${sort} ${order} LIMIT ${start}, ${limit} `
        const value = [];
        const result = await db.query(query, value);
        return result || '';
    },

    // update industry status
    updateIndustryStatus: async (id, status) => {
        const result = await db.query(`UPDATE ${industryTables.industry} set status = ? WHERE id = ?`, [status, id]);
        return result || '';
    },

    // check slug
    checkSlug: async (slug) => {
        const result = await db.query(`SELECT * FROM ${industryTables.industry} WHERE slug = '${slug}'`);
        return result[0] || '';
    },

    // check industry
    checkIndustry: async (name) => {
        const result = await db.query(`SELECT * FROM ${industryTables.industry_info} WHERE name = '${name}'`);
        return result[0] || '';
    },

    // add industry
    addIndustry: async (slug, status) => {
        const result = await db.query(`INSERT INTO ${industryTables.industry} (slug, status) VALUES(?, ?)`, [slug, status]);
        return Number(result.insertId) || '';
    },

    addIndustryInfo: async (data) => {
        const result = await db.query(`INSERT INTO ${industryTables.industry_info} (industry_id, name) VALUES(?, ?)`, [data.industry_id, data.name]);
        return result || '';
    },

    // get industry data
    getIndustryData: async (id) => {
        const result = await db.query(`SELECT i.id, i.status, info.name FROM ${industryTables.industry} AS i LEFT JOIN ${industryTables.industry_info} AS info ON info.industry_id = i.id WHERE i.id = '${id}'`);
        return result[0] || '';
    },
    // update industry data
    updateIndustry: async (name, status, id) => {
        const result = await db.query(`UPDATE ${industryTables.industry} SET status = ? WHERE id = ?`, [status, id]);
        if (result?.affectedRows > 0) {
            await db.query(`UPDATE ${industryTables.industry_info} SET name = ? WHERE industry_id = ?`, [name, id]);
        } return result || '';
    },

    // delete industry
    deleteIndustry: async (id) => {
        const result = await db.query(`DELETE FROM ${industryTables.industry} WHERE id = ?`, [id]);
        return result || '';

    }

}