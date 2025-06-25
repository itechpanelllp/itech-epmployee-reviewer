const companyPath = require('@companyRouter/companiesPath')
const companyModel = require('@companyModel/editCompany/conatctDetails')
const { userActivityLog } = require('@middleware/commonMiddleware');
const { checkPermissionEJS } = require('@middleware/checkPermission');


// edit contact person details view
const editContactPersonView = async (req, res) => {
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

        res.render('companies/editCompany/contactDetails', {
            title: res.__("Edit contact person details"),
            session: req.session,
            updatePer,
            urls,
            data,
            update_company: companyPath.COMPANIES_CONTACT_INFO_UPDATE_ACTION + id,
            currentPage: 'contact_info',

        })
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}


// update company
const updateContactPerson = async (req, res) => {
    try {
        let id = req.params.id;
        const { contactPersonName, contactPersonEmail, contactPersonPhone, } = req.body;
        const companyData = {
            name: contactPersonName,
            email: contactPersonEmail,
            phone: contactPersonPhone,
        }
        const setKeys = Object.keys(companyData).map(key => `${key} = ?`).join(", ");
        const setValues = [...Object.values(companyData), id];
        const updateResult = await companyModel.updateContactPerson(setKeys, setValues);
        if (!updateResult) return res.status(200).json({ error: res.__("Something went wrong, please try again") });
        // user activity 
        await userActivityLog(req, req.session.userId, companyPath.COMPANIES_CONTACT_INFO_VIEW + id, "Conatct person updated successfully", "UPDATE");
        return res.status(200).json({ success: res.__("Conatct person updated successfully") });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}


module.exports = {
    editContactPersonView,
    updateContactPerson
}
