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

    // get employee data
    getEmployeeData: async (id) => {
        const result = await db.query(` SELECT e.*, ea.country, ea.state, ea.city, ea.address, ea.postal_code, efd.bank_name, efd.account_number, efd.account_holder_name, efd.account_type, efd.ifsc_code, efd.branch_name, ( SELECT CONCAT( '[', GROUP_CONCAT(DISTINCT JSON_OBJECT('id', id,'meta_key', meta_key, 'meta_value', meta_value, 'status', status) SEPARATOR ','), ']' ) FROM ${companyTables.employee_documents} WHERE employee_id = e.id ) AS employee_documents, ( SELECT CONCAT( '[', GROUP_CONCAT(DISTINCT JSON_OBJECT('meta_key', meta_key, 'meta_value', meta_value) SEPARATOR ','), ']' ) FROM ${companyTables.employee_meta} WHERE employee_id = e.id ) AS employee_meta FROM ${companyTables.employees} AS e LEFT JOIN ${companyTables.employee_address} AS ea ON ea.employee_id = e.id LEFT JOIN ${companyTables.employee_financial_details} AS efd ON efd.employee_id = e.id WHERE e.id = ?`, [id]);
        return result[0] || '';
    },

    // update employee
    updateEmployee: async (key, value) => {
        const result = await db.query(`UPDATE ${companyTables.employees} set ${key} WHERE id = ?`, value);
        return result || '';
    },

    // update address
    updateAddress: async (key, value) => {
        const result = await db.query(`UPDATE ${companyTables.employee_address} set ${key} WHERE employee_id = ?`, value);
        return result || '';
    },

    // update financial details
    updateFinancial: async (key, value) => {
        const result = await db.query(`UPDATE ${companyTables.employee_financial_details} set ${key} WHERE employee_id = ?`, value);
        return result || '';
    },

    // get documents
    getDocuments: async (id) => {
        const result = await db.query(`SELECT * FROM ${companyTables.employee_documents} WHERE employee_id = ?`, [id]);
        return result || '';
    },
    updateOrInsertDocument: async (employeeId, metaKey, metaValue, status) => {
        const finalStatus = status && status.trim() !== '' ? status : 'pending';
        const query = `INSERT INTO ${companyTables.employee_documents} (employee_id, meta_key, meta_value, status) VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE meta_value = VALUES(meta_value), status = CASE WHEN employee_documents.status IS NULL OR employee_documents.status = 'pending' THEN VALUES(status) ELSE employee_documents.status END`;
        return await db.query(query, [employeeId, metaKey, metaValue, finalStatus]);
    },

    //
    deleteWorkingDays: async (id) => {
        const result = await db.query(`DELETE FROM ${companyTables.employee_meta} WHERE employee_id = ?`, [id]);
        return result || '';
    },

    // meta data
    addEmployeeMetaData: async (data) => {
        const result = await db.query(`INSERT INTO ${companyTables.employee_meta} (employee_id, meta_key, meta_value) VALUES(?, ?, ?)`, [data.employee_id, data.meta_key, data.meta_value]);
        return result || '';
    },










}