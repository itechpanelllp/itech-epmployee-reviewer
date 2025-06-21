const companyPath = require('@companyRouter/companiesPath')
const companyModel = require('@companyModel/addCompany/addCompany')
const base_url = process.env.BASE_URL;
const { userActivityLog, formatted_date } = require('@middleware/commonMiddleware');
const { checkPermissionEJS } = require('@middleware/checkPermission');

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
   
  

        const { businessType, businessName, businessEmail, businessPhone, employeeStrength, businessWebsite, contactPersonName,contactPersonEmail, contactPersonPhone, country, state, city, addresspostalCode, operationalCountry, operationalState,operationalCity, operationalAddress, operationalPostalCode, tanNumberCheck, tanNumber, gstNumber, panNumber  } = req.body;

        const companyData = {
            businessType,
            businessName,
            businessEmail,
            businessPhone,
            employeeStrength,
            businessWebsite,
            contactPersonName,
            contactPersonEmail,
            contactPersonPhone,
            country,
            state,
            city,
            addresspostalCode,
            operationalCountry,
            operationalState,
            operationalCity,
            operationalAddress,
            operationalPostalCode,
            tanNumberCheck,
            tanNumber,
            gstNumber,
            panNumber
        }
        
        // gstFile panFile aadhaarFront aadhaarBack websiteLogo

        // const result = await companyModel.addCompany(companyData);
        // // Log user activity
        // if (result) {
        //     await userActivityLog(req, req.session.userId, companyPath.COMPANIES_ADD_ACTION, "Company added successfully", "Add");
        // }
        // return res.status(200).json({
        //     [result ? 'success' : 'error']: res.__(result ? 'Company added successfully' : 'Failed to add company, please try again')
        // });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

module.exports = { addCompanyView, addCompanyAction }
