const companyTables = require('@config/table');
const db = require('@config/db');

module.exports = {
    // get company type
    companyData: async (id) => {
        const result = await db.query(`SELECT * FROM ${companyTables.companies} WHERE id = ?`, [id]);
        return result[0] || '';
    },
    getCountry: async () => {
        const result = await db.query(`SELECT * FROM ${companyTables.country}`);
        return result || '';
    },
    // get designation
    getDesignation: async () => {
        const result = await db.query(`SELECT * FROM ${companyTables.designation_master} WHERE status = 'active'`);
        return result || '';
    },
    getWorkingDays: async () => {
        const result = await db.query(`SELECT * FROM ${companyTables.working_days}`);
        return result || '';
    },

    // check employee
    checkEmployee: async (email) => {
        const result = await db.query(`SELECT * FROM ${companyTables.employees} WHERE email = ?`, [email]);
        return result[0] || '';
    },

    // add employee
    addEmployee: async (data) => {
        const result = await db.query(`INSERT INTO ${companyTables.employees} (emp_id, first_name, last_name, email, phone_number, dob, gender, status, salary, hours_rate, designation_id, password, other_details, employee_image) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [data.emp_id, data.first_name, data.last_name, data.email, data.phone_number, data.dob, data.gender, data.status, data.salary, data.hours_rate, data.designation_id, data.password, data.other_details, data.employee_image]);
        return Number(result.insertId) || '';
    },

    // addEmployeeAddress
    addEmployeeAddress: async (data) => {
        const result = await db.query(`INSERT INTO ${companyTables.employee_address} (employee_id, country, state, city, address, postal_code) VALUES(?, ?, ?, ?, ?, ?)`, [data.employee_id, data.country, data.state, data.city, data.address, data.postal_code]);
        return result || '';
    },

    // add Financial details
    addEmployeeFinancial: async (data) => {
        const result = await db.query(`INSERT INTO ${companyTables.employee_financial_details} (employee_id, bank_name, account_number, account_holder_name, account_type, ifsc_code, branch_name) VALUES(?, ?, ?, ?, ?, ?, ?)`, [data.employee_id, data.bank_name, data.account_number, data.account_holder_name, data.account_type, data.ifsc_code, data.branch_name]);
        return result || '';
    },

    // add documets
    addDocument: async (data) => {
        const result = await db.query(`INSERT INTO ${companyTables.employee_documents} (employee_id, meta_key, meta_value) VALUES(?, ?, ?)`, [data.employee_id, data.meta_key, data.meta_value]);
        return result || '';
    },

    // meta data
    addEmployeeMetaData: async (data) => {
        const result = await db.query(`INSERT INTO ${companyTables.employee_meta} (employee_id, meta_key, meta_value) VALUES(?, ?, ?)`, [data.employee_id, data.meta_key, data.meta_value]);
        return result || '';
    },

}