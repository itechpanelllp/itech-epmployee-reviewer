const companyPath = require('@companyRouter/companiesPath')
const companyModel = require('@companyModel/editCompany/password')
const { userActivityLog } = require('@middleware/commonMiddleware');
const { checkPermissionEJS } = require('@middleware/checkPermission');
const bcrypt = require('bcrypt');

// edit password view
const editPasswordView = async (req, res) => {
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

        res.render('companies/editCompany/password', {
            title: res.__("Edit password"),
            session: req.session,
            updatePer,
            urls,
            data,
            update_password: companyPath.COMPANIES_PASSWORD_UPDATE_ACTION + id,
            currentPage: 'password',

        })
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}


// update password
const updatePasswordAction = async (req, res) => {
    try {
        let id = req.params.id;
        const { password, confirmPassword } = req.body;
       
        if (password !== confirmPassword) {
            return res.status(200).json({ errors: {confirmPassword: res.__("Password and confirm password does not match")}
            });
        }

        // update password
        let data = password ? await bcrypt.hash(password, 10) : '';
        const updateResult = await companyModel.updatePassword(data, id);

        if (!updateResult) return res.status(200).json({ error: res.__("Something went wrong, please try again") });
        // user activity 
        await userActivityLog(req, req.session.userId, companyPath.COMPANIES_PASSWORD_UPDATE_ACTION + id, "Password updated successfully", "UPDATE");
        return res.status(200).json({ success: res.__("Password updated successfully") });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}


module.exports = {
    editPasswordView,
    updatePasswordAction
}
