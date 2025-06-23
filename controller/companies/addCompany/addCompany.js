const companyPath = require('@companyRouter/companiesPath')
const companyModel = require('@companyModel/addCompany/addCompany')
const base_url = process.env.BASE_URL;
const { userActivityLog, formatted_date } = require('@middleware/commonMiddleware');
const { checkPermissionEJS } = require('@middleware/checkPermission');
const now = new Date();
let uploadprofile = `companies/${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;
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



        const { businessType, businessName, businessEmail, businessPhone, employeeStrength, businessWebsite, contactPersonName, contactPersonEmail, contactPersonPhone, country, state, city, address, postalCode, operationalCountry, operationalState, operationalCity, operationalAddress, operationalPostalCode, companyStatus, sameAddress, company: { tanNumberCheck, tanNumber, gstNumber, panNumber } = {} } = req.body;
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
        let isCompanyExists = await companyModel.checkCompanyName(businessName);
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
            { key: 'gstNumber', value: gstNumber, file: gstFile },
            { key: 'panNumber', value: panNumber, file: panFile },
            { key: 'aadhaarFront', value: '', file: aadhaarFront },
            { key: 'aadhaarBack', value: '', file: aadhaarBack },
        ];
        if (tanNumberCheck == 'on') {
            docs.push(
                { key: 'tanNumberCheck', value: 'on', file: '' },
                { key: 'tanNumber', value: tanNumber, file: '' }
            );
        }

        for (const doc of docs) {
            if (doc.value || doc.file) {
                await companyModel.addDocument({
                    company_id: companyId,
                    meta_key: doc.key,
                    meta_value: doc.file ? `${uploadprofile}/${doc.file}` : doc.value
                });
            }
        }

        // Log user activity
        await userActivityLog(req, req.session.userId, companyPath.COMPANIES_ADD_ACTION, "Company added successfully", "Add");

        return res.status(200).json({ success: req.__('Company added successfully') });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

module.exports = { addCompanyView, addCompanyAction }
