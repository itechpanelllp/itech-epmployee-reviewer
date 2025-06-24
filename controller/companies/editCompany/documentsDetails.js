const companyPath = require('@companyRouter/companiesPath')
const companyModel = require('@companyModel/editCompany/documentsDetails')
const base_url = process.env.BASE_URL;
const img_url = process.env.IMG_BASE_URL;
const { userActivityLog, deleteImage } = require('@middleware/commonMiddleware');
const { checkPermissionEJS } = require('@middleware/checkPermission');
const now = new Date();
let uploadprofile = `companies/${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;


// document view page
const editDocumentsView = async (req, res) => {
    try {
        let id = req.params.id;
        const result = await companyModel.companyData(id);
        if (!result) {
            return res.redirect(`/${companyPath.COMPANIES_LIST_VIEW}`);
        }
        const urls = {
            business_info: companyPath.COMPANIES_EDIT_VIEW + id,
            contact_info: companyPath.COMPANIES_CONTACT_INFO_VIEW + id,
            address: companyPath.COMPANIES_ADDRESS_VIEW + id,
            documents: companyPath.COMPANIES_DOCUMENTS_VIEW + id,
            password: companyPath.COMPANIES_PASSWORD_VIEW + id,
        };
        const updatePer = await checkPermissionEJS('companies', 'update', req);

        const documents = await companyModel.getDocuments(id);

        res.render('companies/editCompany/documentsDetails', {
            title: res.__("Edit contact person details"),
            session: req.session,
            updatePer,
            urls,
            data: result,
            documents,
            img_url,
            update_documents: companyPath.COMPANIES_DOCUMENTS_UPDATE_ACTION + id,
            currentPage: 'documents',

        })
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// update documents
const updateDocumentsAction = async (req, res) => {
    try {
        const id = req.params.id;
        const {
            company: { tanNumberCheck, tanNumber, gstNumber, panNumber } = {},
            gstFileOld, panFileOld, aadhaarFrontOld, aadhaarBackOld, websiteLogoOld,
            removeGSTImg, removePanImg, removeAdhaarFrontImg, removeAdhaarBackImg, removeWebsiteLogoImg
        } = req.body;

        // Utility to handle image logic (keep, replace or remove)
        const getImagePath = (fileKey, oldPath, shouldRemove) => {
            const fileObj = req.files?.[fileKey]?.[0];
            if (fileObj) {
                if (oldPath) deleteImage(oldPath);
                return `${uploadprofile}/${fileObj.filename}`;
            }
            if (shouldRemove === '1') {
                if (oldPath) deleteImage(oldPath);
                return '';
            }
            return oldPath;
        };

        // Collecting new or old paths
        const websiteLogo = getImagePath('websiteLogo', websiteLogoOld, removeWebsiteLogoImg);
        const gstPath = getImagePath('gstFile', gstFileOld, removeGSTImg);
        const panPath = getImagePath('panFile', panFileOld, removePanImg);
        const aadhaarFrontPath = getImagePath('aadhaarFront', aadhaarFrontOld, removeAdhaarFrontImg);
        const aadhaarBackPath = getImagePath('aadhaarBack', aadhaarBackOld, removeAdhaarBackImg);

        // Validation: if image is removed and no file is uploaded, throw error
        const errors = {};
        if (!gstPath) errors.gstFile = 'GST file is required';
        if (!panPath) errors.panFile = 'PAN file is required';
        if (!aadhaarFrontPath) errors.aadhaarFront = 'Aadhaar front image is required';
        if (!aadhaarBackPath) errors.aadhaarBack = 'Aadhaar back image is required';

        if (Object.keys(errors).length > 0) {
            return res.status(200).json({ errors });
        }

        // Update website logo
        await companyModel.updateCompanyLogo(id, websiteLogo);

        // Delete old documents before re-inserting
        await companyModel.deleteDocument(id);

        // Prepare document entries
        const docs = [
            { key: 'gstNumber', value: gstNumber },
            { key: 'gstFile', value: gstPath },
            { key: 'panNumber', value: panNumber },
            { key: 'panFile', value: panPath },
            { key: 'aadhaarFrontFile', value: aadhaarFrontPath },
            { key: 'aadhaarBackFile', value: aadhaarBackPath },
        ];

        if (tanNumberCheck === 'on') {
            docs.push(
                { key: 'tanNumberCheck', value: 'on' },
                { key: 'tanNumber', value: tanNumber }
            );
        }

        for (const doc of docs) {
            if (doc.value) {
                await companyModel.addDocument({
                    company_id: id,
                    meta_key: doc.key,
                    meta_value: doc.value
                });
            }
        }

        await userActivityLog(req, req.session.userId, companyPath.COMPANIES_CONTACT_INFO_VIEW + id, "Business documents updated successfully", "UPDATE");

        return res.status(200).json({ success: res.__("Business documents updated successfully") });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};



module.exports = {
    editDocumentsView,
    updateDocumentsAction
}
