const companyPath = require('@companyRouter/companiesPath')
const companyModel = require('@companyModel/editCompany/editCompany')
const base_url = process.env.BASE_URL;
const img_url = process.env.IMG_BASE_URL;
const { userActivityLog, deleteImage } = require('@middleware/commonMiddleware');
const { checkPermissionEJS } = require('@middleware/checkPermission');
const now = new Date();
let uploadprofile = `companies/${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;

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
        const documents = await companyModel.getDocuments(id);
        const documentType = await companyModel.getDocumentType();

        res.render('companies/editCompany/editCompany', {
            title: res.__("Edit Company"),
            session: req.session,
            updatePer,
            companyType,
            employeeStrength,
            urls,
            data,
            documents,
            img_url,
            documentType,
            update_company: companyPath.COMPANIES_UPDATE_ACTION + id,
            update_documents_status: companyPath.COMPANIES_DOCUMENTS_STATUS_UPDATE_ACTION + id,
            currentPage: 'business_info',

        })
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}


// update company
const updateCompanyAction = async (req, res) => {
    try {
        const id = req.params.id;

        const {
            businessType, businessName, businessPhone, employeeStrength, businessWebsite, companyStatus,
            companyLogoOld, removeCompanyLogoImg, removePanImg, panFileOld,
            removeGSTImg, gstFileOld, oldGovermentDoc, company = {}
        } = req.body;

        const documents = await companyModel.getDocuments(id);
        const existingDocMap = {};

        for (const doc of documents) {
            if (doc.meta_key) {
                existingDocMap[doc.meta_key.toLowerCase()] = (doc.meta_value || '').trim();
            }
        }

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

        const companyLogo = getImagePath('companyLogo', companyLogoOld, removeCompanyLogoImg);
        const gstPath = getImagePath('gstFile', gstFileOld, removeGSTImg);
        const panPath = getImagePath('panFile', panFileOld, removePanImg);

        const companyData = {
            company_type_id: businessType,
            business_name: businessName,
            business_phone: businessPhone,
            employee_strength: employeeStrength,
            website: businessWebsite,
            status: companyStatus,
            logo: companyLogo,
        };

        const setKeys = Object.keys(companyData).map(key => `${key} = ?`).join(", ");
        const setValues = [...Object.values(companyData), id];
        const updateResult = await companyModel.updateCompany(setKeys, setValues);

        if (!updateResult) {
            return res.status(200).json({ error: res.__("Something went wrong, please try again") });
        }

        const insertedKeys = new Set();

        if ((company.gstCheck || '').trim().toLowerCase() !== 'on') {
            await companyModel.deleteDocument(id, ['gstCheck', 'gstNumber', 'gstFile']);
            insertedKeys.add('gstcheck');
            insertedKeys.add('gstnumber');
            insertedKeys.add('gstfile');
        }

        if ((company.tanNumberCheck || '').trim().toLowerCase() !== 'on') {
            await companyModel.deleteDocument(id, ['tanNumberCheck', 'tanNumber']);
            insertedKeys.add('tannumbercheck');
            insertedKeys.add('tannumber');
        }

        if (oldGovermentDoc && oldGovermentDoc !== company.govermentDoc) {
            const lowerOld = oldGovermentDoc.toLowerCase();
            await companyModel.deleteDocumentByKeys(id, [
                `${oldGovermentDoc}FrontFile`,
                `${oldGovermentDoc}BackFile`,
                `${oldGovermentDoc}_number`
            ]);
            insertedKeys.add(`${lowerOld}frontfile`);
            insertedKeys.add(`${lowerOld}backfile`);
            insertedKeys.add(`${lowerOld}_number`);
        }

        const docs = [];

        // TAN Handling
        if ((company.tanNumberCheck || '').trim().toLowerCase() === 'on') {
            if (existingDocMap['tannumbercheck'] !== 'on') {
                docs.push({ key: 'tanNumberCheck', value: 'on' });
            }

            const tanNumber = (company.tanNumber || '').trim();
            if (tanNumber && tanNumber !== existingDocMap['tannumber']) {
                docs.push({ key: 'tanNumber', value: tanNumber });
            }
        }

        // GST Handling
        if ((company.gstCheck || '').trim().toLowerCase() === 'on') {
            if (existingDocMap['gstcheck'] !== 'on') {
                docs.push({ key: 'gstCheck', value: 'on' });
            }

            const gstNumber = (company.gstNumber || '').trim();
            if (gstNumber && gstNumber !== existingDocMap['gstnumber']) {
                docs.push({ key: 'gstNumber', value: gstNumber });
            }

            if (gstPath && gstPath !== existingDocMap['gstfile']) {
                docs.push({ key: 'gstFile', value: gstPath });
            }
        }

        // PAN Handling
        const panNumber = (company.panNumber || '').trim();
        if (panNumber && panNumber !== existingDocMap['pannumber']) {
            docs.push({ key: 'panNumber', value: panNumber });
        }

        if (panPath && panPath !== existingDocMap['panfile']) {
            docs.push({ key: 'panFile', value: panPath });
        }

        // Goverment Doc Type
        if ((company.govermentDoc || '').trim() && company.govermentDoc !== existingDocMap['govermentdoc']) {
            docs.push({ key: 'govermentDoc', value: company.govermentDoc });
        }

        // Insert or update meta docs
        for (const doc of docs) {
            await companyModel.updateOrInsertDocument(id, doc.key, doc.value);
            insertedKeys.add(doc.key.toLowerCase());
        }

        // Upload files like aadhaarCard_front / back etc.
        for (const fileKey in req.files || {}) {
            const lowerKey = fileKey.toLowerCase();
            if (/_(front|back)$/i.test(fileKey) && !insertedKeys.has(lowerKey)) {
                const file = req.files[fileKey][0].filename;
                await companyModel.updateOrInsertDocument(id, fileKey, `${uploadprofile}/${file}`);
                insertedKeys.add(lowerKey);
            }
        }

        // Upload *_number values like aadhaarCard_number
        for (const [key, value] of Object.entries(company)) {
            const lowerKey = key.toLowerCase();
            const trimmedValue = (value || '').trim();
            if (
                /_number$/i.test(key) &&
                trimmedValue &&
                trimmedValue !== existingDocMap[lowerKey] &&
                !insertedKeys.has(lowerKey)
            ) {
                await companyModel.updateOrInsertDocument(id, key, trimmedValue);
                insertedKeys.add(lowerKey);
            }
        }

        await userActivityLog(req, req.session.userId, companyPath.COMPANIES_EDIT_VIEW + id, "Company updated successfully", "UPDATE");

        return res.status(200).json({ success: res.__("Company updated successfully") });

    } catch (error) {
        console.error("Update Error:", error);
        return res.status(500).json({ error: error.message });
    }
};





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
