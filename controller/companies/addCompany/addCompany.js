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
        res.render('companies/addCompany/addCompany', {
            title: res.__("Add Company"),
            session: req.session,
            addPermission,
            companyType,
            country,
            employeeStrength,
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

        const { businessType, businessName, businessEmail, businessPhone, employeeStrength, businessWebsite, password, contactPersonName, contactPersonEmail, contactPersonPhone, country, state, city, address, postalCode, operationalCountry, operationalState, operationalCity, operationalAddress, operationalPostalCode, companyStatus, sameAddress, company: { tanNumberCheck, tanNumber, gstNumber, panNumber } = {} } = req.body;
        const getFile = (key) => req.files?.[key]?.[0]?.filename || '';

        const logo = getFile('websiteLogo');
        const gstFile = getFile('gstFile');
        const panFile = getFile('panFile');
        const aadhaarFront = getFile('aadhaarFront');
        const aadhaarBack = getFile('aadhaarBack');
        // Check required files
        const missingFiles = [];
        if (!gstFile) missingFiles.push('GST file');
        if (!panFile) missingFiles.push('PAN file');
        if (!aadhaarFront) missingFiles.push('Aadhaar front image');
        if (!aadhaarBack) missingFiles.push('Aadhaar back image');

        if (missingFiles.length > 0) {
            return res.status(200).json({
                error: `Missing required document(s): ${missingFiles.join(', ')}`
            });
        }
        let isCompanyExists = await companyModel.checkCompanyName(businessEmail);
        if (isCompanyExists) {
            return res.status(200).json({ error: 'Company name already exists' });
        }

        const companyData = {
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
            logo: `${uploadprofile}/${logo}`,
            password: await bcrypt.hash(password, 10),
        }

        const companyId = await companyModel.addCompany(companyData);
        if (!companyId) {
            return res.status(500).json({ error: 'Failed to add company, please try again' });
        }

        const companyAddress = {
            company_id: companyId,
            is_same_address: sameAddress ? sameAddress == 'on' ? 1 : '' : '',
            type: 'registered',
            country: country,
            state: state,
            city: city,
            address: address,
            postal_code: postalCode
        }


        const companyAddressResult = await companyModel.addAddress(companyAddress);
        const companyOperationalAddress = {
            company_id: companyId,
            is_same_address: sameAddress ? sameAddress == 'on' ? 1 : '' : '',
            type: 'operational',
            country: operationalCountry,
            state: operationalState,
            city: operationalCity,
            address: operationalAddress,
            postal_code: operationalPostalCode
        }
        const companyOpAddressResult = await companyModel.addAddress(companyOperationalAddress);
        // Save documents
        const docs = [
            { key: 'gstNumber', value: gstNumber, fileKey: 'gstFile', file: gstFile },
            { key: 'panNumber', value: panNumber, fileKey: 'panFile', file: panFile },
            { key: 'aadhaarFront', value: '', fileKey: 'aadhaarFrontFile', file: aadhaarFront },
            { key: 'aadhaarBack', value: '', fileKey: 'aadhaarBackFile', file: aadhaarBack },
        ];
        if (tanNumberCheck == 'on') {
            docs.push(
                { key: 'tanNumberCheck', value: 'on', file: '' },
                { key: 'tanNumber', value: tanNumber, file: '' }
            );
        }

        for (const doc of docs) {
            if (doc.value) {
                await companyModel.addDocument({
                    company_id: companyId,
                    meta_key: doc.key,
                    meta_value: doc.value
                });
            }
            if (doc.file) {
                await companyModel.addDocument({
                    company_id: companyId,
                    meta_key: doc.fileKey || `${doc.key}File`,
                    meta_value: `${uploadprofile}/${doc.file}`
                });
            }

        }
        // send email
        const token = jwt.sign({ id: companyId }, JWT_SECRET);
        await companyModel.addEmailVerificationToken(companyId, token);

        const emailVerifylink = `${base_url}${companyPath.COMPANY_EMAIL_VERIFICATION}/${token}`;
console.log(emailVerifylink);

        const emailVerification = {
            name: businessName,
            message: res.__("Please confirm your email address to complete your registration. Simply click the button below. If you did not initiate this request, you may safely disregard this email."),
            link: emailVerifylink,
            button_text: res.__("Verify email"),
            footer: res.__("Thanks"),
            support_team: res.__("The Support Teams"),
            email: businessEmail,
            subject: res.__("Verify your email address")
        };
        console.log(emailVerification);
        
        emailVerificationMail(emailVerification);

        // Log user activity
        await userActivityLog(req, req.session.userId, companyPath.COMPANIES_ADD_ACTION, "Company added successfully", "Add");

        return res.status(200).json({ success: req.__('Company added successfully') });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

module.exports = { addCompanyView, addCompanyAction }
