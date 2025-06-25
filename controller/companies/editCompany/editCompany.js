const companyPath = require('@companyRouter/companiesPath')
const companyModel = require('@companyModel/editCompany/editCompany')
const base_url = process.env.BASE_URL;
const { userActivityLog, formatted_date } = require('@middleware/commonMiddleware');
const { checkPermissionEJS } = require('@middleware/checkPermission');


// edit company view
const editCompanyView = async (req, res) => {
    try {
        let id = req.params.id;
        const data = await companyModel.companyData(id);
        if (!data) {
            return res.redirect(`/${companyPath.COMPANIES_LIST_VIEW}`);
        }
        const urls = {
            business_info: companyPath.COMPANIES_EDIT_VIEW + id,
            contact_info: companyPath.COMPANIES_CONTACT_INFO_VIEW + id,
            address: companyPath.COMPANIES_ADDRESS_VIEW + id,
            documents: companyPath.COMPANIES_DOCUMENTS_VIEW + id,
            password: companyPath.COMPANIES_PASSWORD_VIEW + id,
        };
        data.update_action = companyPath.COMPANIES_APPROVAL_STATUS_UPDATE_ACTION;
        const updatePer = await checkPermissionEJS('companies', 'update', req);
        const companyType = await companyModel.getCompanyType();
        const employeeStrength = await companyModel.getEmployeeStrength();
        res.render('companies/editCompany/editCompany', {
            title: res.__("Edit Company"),
            session: req.session,
            updatePer,
            companyType,
            employeeStrength,
            urls,
            data,
            update_company: companyPath.COMPANIES_UPDATE_ACTION + id,
            currentPage: 'business_info',

        })
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}


// update company
const updateCompanyAction = async (req, res) => {
    try {
        let id = req.params.id;
        const result = await companyModel.companyData(id);
        if (!result) {
            return res.redirect(`/${companyPath.COMPANIES_LIST_VIEW}`);
        }

        const { businessType, businessName, businessPhone, employeeStrength, businessWebsite, companyStatus } = req.body;
        const companyData = {
            company_type_id: businessType,
            business_name: businessName,
            business_phone: businessPhone,
            employee_strength: employeeStrength,
            website: businessWebsite,
            status: companyStatus
        }
        const setKeys = Object.keys(companyData).map(key => `${key} = ?`).join(", ");
        const setValues = [...Object.values(companyData), id];
        const updateResult = await companyModel.updateCompany(setKeys, setValues);
        if (!updateResult) return res.status(200).json({ error: res.__("Something went wrong, please try again") });
        // user activity 
        await userActivityLog(req, req.session.userId, companyPath.COMPANIES_EDIT_VIEW + id, "Company updated successfully", "UPDATE");
        return res.status(200).json({ success: res.__("Company updated successfully") });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// update company approval status
const updateCompanyApprovalStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const { action, comment } = req.body;
        const result = await companyModel.setCompanyApprovalStatus(id, action);
        if (!result) return res.status(200).json({ error: res.__("Something went wrong, please try again") });
        // Save comment if provided
        if (comment && comment.trim() !== '') {
            const data = {
                company_id: id,
                meta_key: `${action}_comment`,
                meta_value: comment.trim(),
            }
            await companyModel.insertComment(data);
        }
        // user activity 
        await userActivityLog(req, req.session.userId, companyPath.COMPANIES_APPROVAL_STATUS_UPDATE_ACTION + id, "Company approval status updated successfully", "UPDATE");
        return res.status(200).json({ success: res.__("Company approval status updated successfully") });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}


module.exports = {
    editCompanyView,
    updateCompanyAction,
    updateCompanyApprovalStatus
}
