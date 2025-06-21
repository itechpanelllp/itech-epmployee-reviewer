const companyTables = require('@config/table');
const db = require('@config/db');


module.exports = {
    
    // company datatable
    companiesDataTable: async (where, start, limit, sort, order) => {
        const query = `SELECT i.id, i.status, info.name, COUNT(i.id) OVER() AS total FROM ${companyTables.industry} AS i LEFT JOIN ${companyTables.industry_info} AS info ON info.industry_id = i.id WHERE ${where}  ORDER BY ${sort} ${order} LIMIT ${start}, ${limit} `
        const value = [];
        const result = await db.query(query, value);
        return result || '';
    },

}