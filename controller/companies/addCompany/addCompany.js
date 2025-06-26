const companyPath = require('@companyRouter/companiesPath')
const companyModel = require('@companyModel/addCompany/addCompany')
const { userActivityLog } = require('@middleware/commonMiddleware');
const { emailVerificationMail } = require('@middleware/mailer');
const { checkPermissionEJS } = require('@middleware/checkPermission');
const now = new Date();
let uploadprofile = `companies/${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { base_url, JWT_SECRET } = process.env;
// add company view
const addCompanyView = async (req, res) => {
    try {
        const addPermission = await checkPermissionEJS('companies', 'add', req);
        const companyType = await companyModel.getCompanyType();
        const country = await companyModel.getCountry();
        const employeeStrength = await companyModel.getEmployeeStrength();
        const documentType = await companyModel.getDocumentType();

        res.render('companies/addCompany/addCompany', {
            title: res.__("Add Company"),
            session: req.session,
            addPermission,
            companyType,
            country,
            employeeStrength,
            documentType,
            add_company: companyPath.COMPANIES_ADD_ACTION,
            get_state: companyPath.COMPANIES_STATE_ACTION,
            get_city: companyPath.COMPANIES_CITY_ACTION,
            company_list: companyPath.COMPANIES_LIST_VIEW,
        })
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// add company action
const addCompanyAction = async (req, res) => {
    try {
        const { businessType, businessName, businessEmail, businessPhone, employeeStrength, businessWebsite, password, contactPersonName,
            contactPersonEmail, contactPersonPhone, country, state, city, address, postalCode, operationalCountry, operationalState,
            operationalCity, operationalAddress, operationalPostalCode, companyStatus, sameAddress, company = {}
        } = req.body;


        const getFile = key => req.files?.[key]?.[0]?.filename || '';
        const logo = getFile('companyLogo');
        
        if (await companyModel.checkCompanyName(businessEmail)) {
            return res.status(200).json({ error: 'Company name already exists' });
        }

        const companyId = await companyModel.addCompany({
            company_type_id: businessType,
            business_name: businessName,
            business_email: businessEmail,
            business_phone: businessPhone,
            employee_strength: employeeStrength,
            website: businessWebsite,
            name: contactPersonName,
            email: contactPersonEmail,
            phone: contactPersonPhone,
            status: companyStatus,
            logo: logo ? `${uploadprofile}/${logo}`: '',
            password: await bcrypt.hash(password, 10),
        });

        const addressData = (type, c, s, ct, a, p) => ({
            company_id: companyId,
            type, country: c, state: s, city: ct, address: a,
            postal_code: p,
            is_same_address: sameAddress === 'on' ? 1 : ''
        });

        await companyModel.addAddress(addressData('registered', country, state, city, address, postalCode));
        await companyModel.addAddress(addressData('operational', operationalCountry, operationalState, operationalCity, operationalAddress, operationalPostalCode));

        const docs = [
            { key: 'panNumber', value: company.panNumber, file: getFile('panFile'), fileKey: 'panFile' },
            { key: 'govermentDoc', value: company.govermentDoc, file: '', fileKey: '' },
            ...(company.tanNumberCheck === 'on' ? [{ key: 'tanNumber', value: company.tanNumber }, { key: 'tanNumberCheck', value: 'on' }] : []),
            ...(company.gstCheck === 'on' ? [
                { key: 'gstCheck', value: 'on' },
                { key: 'gstNumber', value: company.gstNumber },
                { key: 'gstFile', file: getFile('gstFile'), fileKey: 'gstFile' }
            ] : [])
        ];

        const insertedKeys = new Set();

        // Insert static documents and their files
        for (const doc of docs) {
            if (doc.value && !insertedKeys.has(doc.key)) {
                await companyModel.addDocument({
                    company_id: companyId,
                    meta_key: doc.key,
                    meta_value: doc.value
                });
                insertedKeys.add(doc.key);
            }

            if (doc.file && !insertedKeys.has(doc.fileKey || `${doc.key}File`)) {
                await companyModel.addDocument({
                    company_id: companyId,
                    meta_key: doc.fileKey || `${doc.key}File`,
                    meta_value: `${uploadprofile}/${doc.file}`
                });
                insertedKeys.add(doc.fileKey || `${doc.key}File`);
            }
        }

        // Insert Aadhaar/Voter files (dynamic doc files)
        for (const fileKey in req.files || {}) {
            if (/_(front|back)$/.test(fileKey) && !insertedKeys.has(fileKey)) {
                const file = req.files[fileKey][0].filename;
                await companyModel.addDocument({
                    company_id: companyId,
                    meta_key: fileKey,
                    meta_value: `${uploadprofile}/${file}`
                });
                insertedKeys.add(fileKey);
            }
        }

        // Insert dynamic document numbers (e.g., AadhaarCard_number, VoterID_number)
        for (const [key, value] of Object.entries(company)) {
            if (/_number$/i.test(key) && !insertedKeys.has(key)) {
                await companyModel.addDocument({
                    company_id: companyId,
                    meta_key: key,
                    meta_value: value
                });
                insertedKeys.add(key);
            }
        }


        const token = jwt.sign({ id: companyId }, JWT_SECRET);
        await companyModel.addEmailVerificationToken(companyId, token);

        await emailVerificationMail({
            name: businessName,
            message: res.__("Please confirm your email address to complete your registration. Simply click the button below. If you did not initiate this request, you may safely disregard this email."),
            link: `${base_url}${companyPath.COMPANY_EMAIL_VERIFICATION}${token}`,
            button_text: res.__("Verify email"),
            footer: res.__("Thanks"),
            support_team: res.__("The Support Teams"),
            email: businessEmail,
            subject: res.__("Verify your email address")
        });

        await userActivityLog(req, req.session.userId, companyPath.COMPANIES_ADD_ACTION, "Company added successfully", "Add");

       return res.status(200).json({ success: req.__('Company added successfully') });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


module.exports = { addCompanyView, addCompanyAction }
