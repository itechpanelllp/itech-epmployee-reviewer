const companyPath = require('@companyRouter/companiesPath')
const companyModel = require('@companyModel/editCompany/addressDetails')
const { userActivityLog } = require('@middleware/commonMiddleware');
const { checkPermissionEJS } = require('@middleware/checkPermission');


// edit address view
const editBusinessAddressView = async (req, res) => {
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
        const addressData = await companyModel.getCompanyAddress(id);
        const country = await companyModel.getCountry();

        res.render('companies/editCompany/addressDetails', {
            title: res.__("Edit business address"),
            session: req.session,
            updatePer,
            urls,
            data,
            regAddress: addressData.registration || {},
            operAddress: addressData.operational || {},
            country,
            get_state: companyPath.COMPANIES_STATE_ACTION,
            get_city: companyPath.COMPANIES_CITY_ACTION,
            update_address: companyPath.COMPANIES_ADDRESS_UPDATE_ACTION + id,
            currentPage: 'address',

        })
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}


// update address
const updateAddressAction = async (req, res) => {
    try {
        let id = req.params.id;
        const { country, state, city, address, postalCode, operationalCountry, operationalState, operationalCity, operationalAddress, operationalPostalCode, sameAddress, } = req.body;

        // delete old address
        await companyModel.deleteAddress(id);

        const companyAddress = {
            company_id: id,
            is_same_address: sameAddress ? sameAddress == 'on' ? 1 : 0 : '',
            type: 'registered',
            country: country,
            state: state,
            city: city,
            address: address,
            postal_code: postalCode
        }


        const companyAddressResult = await companyModel.addAddress(companyAddress);
        const companyOperationalAddress = {
            company_id: id,
            is_same_address: sameAddress ? sameAddress == 'on' ? 1 : 0 : '',
            type: 'operational',
            country: operationalCountry,
            state: operationalState,
            city: operationalCity,
            address: operationalAddress,
            postal_code: operationalPostalCode
        }
        const companyOpAddressResult = await companyModel.addAddress(companyOperationalAddress);

        // user activity 
        await userActivityLog(req, req.session.userId, companyPath.COMPANIES_ADDRESS_UPDATE_ACTION + id, "Business address updated successfully", "UPDATE");
        return res.status(200).json({ success: res.__("Business address updated successfully") });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}


module.exports = {
    editBusinessAddressView,
    updateAddressAction
}
