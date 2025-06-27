const companyTables = require('@config/table');
const db = require('@config/db');


module.exports = {
    
    // company datatable
    companiesDataTable: async (where, start, limit, sort, order) => {
        const query = `SELECT c.*,  ct.name AS company_type_name, es.range_label, cb.name AS Regcountry, st.name AS Regstate, ci.name AS Regcity, COUNT(c.id) OVER() AS total FROM ${companyTables.companies} AS c LEFT JOIN ${companyTables.company_types} AS ct ON ct.id = c.company_type_id LEFT JOIN ${companyTables.employee_strength} AS es ON es.id = c.employee_strength LEFT JOIN ${companyTables.company_address} AS ca ON ca.company_id = c.id  AND ca.type = 'registered' AND ca.status = '1' LEFT JOIN ${companyTables.country} AS cb ON cb.id = ca.country LEFT JOIN ${companyTables.state} AS st ON st.id = ca.state AND ca.country = st.country_id  LEFT JOIN ${companyTables.city} AS ci ON ci.id = ca.city AND ca.country = ci.country_id WHERE ${where}  ORDER BY ${sort} ${order} LIMIT ${start}, ${limit} `
        const value = [];
        const result = await db.query(query, value);
        return result || '';
    },

    // update status
    updateCompanyStatus: async (id, status) => {
        const result = await db.query(`UPDATE ${companyTables.companies} SET status = ? WHERE id = ?`, [status, id]);
        return result || '';
    },


    // delete company
    deleteCompany: async (id) => {
        const result = await db.query(`DELETE FROM ${companyTables.companies} WHERE id = ?`, [id]);
        return result || '';
    },

}