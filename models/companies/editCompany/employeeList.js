const companyTables = require('@config/table');
const db = require('@config/db');

module.exports = {
    // get company data
    companyData: async (id) => {
        const result = await db.query(`SELECT * FROM ${companyTables.companies} WHERE id = ?`, [id]);
        return result[0] || '';
    },
    companiesDataTable: async (where, start, limit, sort, order) => {
        const query = `SELECT e.*,  d.title AS designation, c.name AS countryName, st.name AS stateName, ci.name AS cityName, COUNT(c.id) OVER() AS total FROM ${companyTables.employees} AS e LEFT JOIN ${companyTables.employee_address} AS ea ON ea.employee_id = e.id  LEFT JOIN ${companyTables.country} AS c ON c.id = ea.country LEFT JOIN ${companyTables.state} AS st ON st.id = ea.state AND ea.country = st.country_id  LEFT JOIN ${companyTables.city} AS ci ON ci.id = ea.city AND ea.country = ci.country_id LEFT JOIN ${companyTables.designation_master} AS d ON e.designation_id = d.id WHERE ${where}  ORDER BY ${sort} ${order} LIMIT ${start}, ${limit} `
        const value = [];
        const result = await db.query(query, value);
        return result || '';
    },

    // update employee status
    updateEmployeeStatus: async (id, status) => {
        const result = await db.query(`UPDATE ${companyTables.employees} SET status = ? WHERE id = ?`, [status, id]);
        return result[0] || '';
    },

    // delete employee
    deleteEmployee: async (id) => {
        const result = await db.query(`DELETE FROM ${companyTables.employees} WHERE id = ?`, [id]);
        return result[0] || '';
    },
}