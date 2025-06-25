const companyTables = require('@config/table');
const db = require('@config/db');

module.exports = {
    // get company type
    getCompanyType: async () => {
        const result = await db.query(`SELECT id, name FROM ${companyTables.company_types} WHERE status = 'active'`);
        return result || '';
    },
    getDocumentType: async () => {
        const result = await db.query(`SELECT id, name, side FROM ${companyTables.government_id_documents} WHERE status = 'active'`);
        return result || '';
    },
    getCountry: async () => {
        const result = await db.query(`SELECT * FROM ${companyTables.country}`);
        return result || '';
    },
    getEmployeeStrength: async () => {
        const result = await db.query(`SELECT * FROM ${companyTables.employee_strength}`);
        return result || '';
    },

    // check company name
    checkCompanyName: async (email) => {
        const result = await db.query(`SELECT * FROM ${companyTables.companies} WHERE business_email = ?`, [email]);
        return result[0] || '';
    },
    // add company
    addCompany: async (data) => {
        const result = await db.query(`INSERT INTO ${companyTables.companies} (company_type_id , business_name, business_email, business_phone, name,  email, phone, employee_strength, website, logo, status, password) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [data.company_type_id, data.business_name, data.business_email, data.business_phone, data.name, data.email, data.phone, data.employee_strength, data.website, data.logo, data.status, data.password]);
        return Number(result.insertId) || '';
    },

    // compamy address
    addAddress: async (data) => {
        const result = await db.query(`INSERT INTO ${companyTables.company_address} (company_id, is_same_address, type, country, state, city, address, postal_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [data.company_id, data.is_same_address, data.type, data.country, data.state, data.city, data.address, data.postal_code]);
        return Number(result.insertId) || '';
    },

    // add document
    addDocument: async (data) => {
        const result = await db.query(`INSERT INTO ${companyTables.company_documents} (company_id, meta_key, meta_value) VALUES(?, ?, ?)`, [data.company_id, data.meta_key, data.meta_value]);
        return result || '';
    },

    // email verification token
    addEmailVerificationToken: async (id, token) => {
        const result = await db.query(`UPDATE ${companyTables.companies} set email_verification_token = ? WHERE id = ?`, [token, id]); 
        return result[0] || '';
    }
}