const companyPath = require('@companyRouter/companiesPath')
const companyModel = require('@companyModel/editCompany/editCompany')
const base_url = process.env.BASE_URL;
const img_url = process.env.IMG_BASE_URL;
const { userActivityLog, deleteImage, validateGovtIdProof } = require('@middleware/commonMiddleware');
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
            employees: companyPath.COMPANIES_EMPLOYEES_VIEW + id,
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

const checkAndUpdateCompanyApprovalStatus = async (id, reqBody = {}, reqFiles = {}) => {
    const { businessType, businessName, businessPhone, employeeStrength, businessWebsite, companyStatus, companyLogoOld, company = {} } = reqBody;
    const trim = val => (val || '').toString().trim();
    // Get company data and documents
    const data = await companyModel.companyData(id);
    const documents = await companyModel.getDocuments(id);

    // Check if any basic company data changed
    const companyChanged = (
        trim(data.company_type_id) !== trim(businessType) ||
        trim(data.business_name) !== trim(businessName) ||
        trim(data.business_phone) !== trim(businessPhone) ||
        trim(data.employee_strength) !== trim(employeeStrength) ||
        trim(data.website) !== trim(businessWebsite) ||
        trim(data.status) !== trim(companyStatus) ||
        trim(data.logo) !== trim(companyLogoOld)
    );

    // Check if any document changed
    const documentChanged = documents.some(doc => {
        const key = doc.meta_key;
        const oldVal = trim(doc.meta_value);
        const status = trim(doc.status);
        const file = reqFiles?.[key]?.[0];
        const newVal = file ? `${uploadprofile}/${file.filename}` : trim(company[key] || reqBody[key] || oldVal || status);
        return oldVal !== newVal;
    });

    // Update approval status if necessary
    if (companyChanged || documentChanged) {
        await companyModel.updateCompanyApprovalStatus(id);
        return true;
    }

    return false;
};
// update company
const updateCompanyAction = async (req, res) => {
    try {
        const id = req.params.id;
        const { businessType, businessName, businessPhone, employeeStrength, businessWebsite, companyStatus, companyLogoOld, removeCompanyLogoImg, removePanImg, panFileOld, removeGSTImg, gstFileOld, oldGovermentDoc, company = {} } = req.body;
        const idProofMap = {
            panNumber: "pan",
            gstNumber: "gstin",
            aadhaarNumber: "aadhaar",
            voterIdNumber: "voter",
            drivingLicence_number: "driving_license",
            passportNumber: "passport",
            rationNumber: "ration",
            uanNumber: "uan",
            tanNumber: "tan"
        };
        const validationErrors = {};
        Object.entries(company).forEach(([key, value]) => {
            const type = idProofMap[key];
            if (type && value) {
                const result = validateGovtIdProof(type, value);
                if (!result.valid) {
                    validationErrors[key] = result.message;
                }
            }
        });

        if (Object.keys(validationErrors).length > 0) {
            return res.status(200).json({ errors: validationErrors });
        }
        // all documents type
        const documentType = await companyModel.getDocumentType();
        // this is for get all documents
        const documents = await companyModel.getDocuments(id);
        const existingDocMap = Object.fromEntries(
            documents.map(doc => [doc.meta_key, (doc.meta_value || '').trim()])
        );
        // Check if any document changed
        await checkAndUpdateCompanyApprovalStatus(id, req.body, req.files);

        const getImagePath = (key, oldPath, removeFlag) => {
            const file = req.files?.[key]?.[0];
            if (file) {
                if (oldPath) deleteImage(oldPath);
                return `${uploadprofile}/${file.filename}`;
            }
            if (removeFlag === '1' && oldPath) {
                deleteImage(oldPath);
                return '';
            }
            return oldPath;
        };

        // Prepare company data
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

        // Update company master data
        const setKeys = Object.keys(companyData).map(key => `${key} = ?`).join(", ");
        const setValues = [...Object.values(companyData), id];
        const updateResult = await companyModel.updateCompany(setKeys, setValues);
        if (!updateResult) return res.status(200).json({ error: res.__("Something went wrong, please try again") });

        const insertedKeys = new Set();
        const docs = [];

        // Document deletion if TAN or GST is unchecked
        const deleteKeys = [];
        if ((company.tanNumberCheck || '') !== 'on') {
            deleteKeys.push('tanNumberCheck', 'tanNumber');
        }
        if ((company.gstCheck || '') !== 'on') {
            deleteKeys.push('gstCheck', 'gstNumber', 'gstFile');
            const gstDoc = documents.find(doc => doc.meta_key === 'gstFile');
            if (gstDoc?.meta_value) {
                deleteImage(gstDoc.meta_value);
            }
        }
        if (deleteKeys.length) {
            await companyModel.deleteDocument(id, deleteKeys);
            deleteKeys.forEach(k => insertedKeys.add(k.toLowerCase()));
        }

        // Delete old government doc data if changed
        if (oldGovermentDoc && oldGovermentDoc !== company.govermentDoc) {
            const govType = documentType.find(dt => dt.id == oldGovermentDoc);
            if (govType) {
                const toCamelCase = str => str.replace(/\s+(.)/g, (_, ch) => ch.toUpperCase()).replace(/^./, ch => ch.toLowerCase());

                const typeKey = toCamelCase(govType.name);
                const govKeys = [`${typeKey}_number`];

                if (govType.side === 'front' || govType.side === 'both') govKeys.push(`${typeKey}_front`);
                if (govType.side === 'back' || govType.side === 'both') govKeys.push(`${typeKey}_back`);

                for (const key of govKeys) {
                    const match = documents.find(d => d.meta_key === key);
                    if (match?.meta_value) deleteImage(match.meta_value);
                }

                await companyModel.deleteDocument(id, [...govKeys, 'govermentDoc']);
                [...govKeys, 'govermentDoc'].forEach(k => insertedKeys.add(k.toLowerCase()));
            }
        }

        // TAN Docs
        if ((company.tanNumberCheck || '') === 'on') {
            if (existingDocMap['tanNumberCheck'] !== 'on') docs.push({ key: 'tanNumberCheck', value: 'on' });

            const tan = (company.tanNumber || '').trim();
            if (tan && tan !== existingDocMap['tanNumber']) docs.push({ key: 'tanNumber', value: tan, status: 'pending' });
        }

        // GST Docs
        if ((company.gstCheck || '') === 'on') {
            if (existingDocMap['gstCheck'] !== 'on') docs.push({ key: 'gstCheck', value: 'on' });

            const gst = (company.gstNumber || '').trim();
            if (gst && gst !== existingDocMap['gstNumber']) docs.push({ key: 'gstNumber', value: gst });

            if (gstPath && gstPath !== existingDocMap['gstFile']) docs.push({ key: 'gstFile', value: gstPath, status: 'pending' });
        }

        // PAN Docs
        const panNumber = (company.panNumber || '').trim();
        if (panNumber && panNumber !== existingDocMap['panNumber']) docs.push({ key: 'panNumber', value: panNumber });

        if (panPath && panPath !== existingDocMap['panFile']) docs.push({ key: 'panFile', value: panPath, status: 'pending' });

        // Government doc type change
        if ((company.govermentDoc || '') && company.govermentDoc !== existingDocMap['govermentDoc']) {
            docs.push({ key: 'govermentDoc', value: company.govermentDoc });
        }

        // Upsert changed docs
        for (const doc of docs) {
            await companyModel.updateOrInsertDocument(id, doc.key, doc.value, doc.status);
            insertedKeys.add(doc.key);
        }

        // Handle *_front / *_back file uploads
        for (const fileKey in req.files || {}) {
            if (/_(front|back)$/i.test(fileKey)) {
                const filePath = `${uploadprofile}/${req.files[fileKey][0].filename}`;
                if (filePath !== existingDocMap[fileKey]) {
                    if (existingDocMap[fileKey]) deleteImage(existingDocMap[fileKey]);
                    await companyModel.updateOrInsertDocument(id, fileKey, filePath, 'pending');
                    insertedKeys.add(fileKey);
                }
            }
        }

        // Handle *_number fields
        for (const [key, value] of Object.entries(company)) {
            if (/_number$/i.test(key)) {
                const v = (value || '').trim();
                if (v && v !== existingDocMap[key] && !insertedKeys.has(key)) {
                    await companyModel.updateOrInsertDocument(id, key, v, 'pending');
                    insertedKeys.add(key);
                }
            }
        }
        // user activity
        await userActivityLog(req, req.session.userId, companyPath.COMPANIES_EDIT_VIEW + id, "Company updated successfully", "UPDATE");
        return res.status(200).json({ success: res.__("Company updated successfully") });

    } catch (error) {
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

// documents status update action
const updateDocumentsStatusAction = async (req, res) => {
    try {
        const id = req.params.id;
        const docId = req.params.docId;
        const { action, comment } = req.body;
        const result = await companyModel.updateDocumentsStatus(id, docId, action, comment);
        if (result) {
            await checkAndUpdateCompanyApprovalStatus(id);
            await userActivityLog(req, req.session.userId, companyPath.COMPANIES_DOCUMENTS_STATUS_UPDATE_ACTION + id, "Documents status updated successfully", "UPDATE");
            return res.status(200).json({ success: res.__("Documents status updated successfully") });
        }
        return res.status(200).json({ error: res.__("Something went wrong, please try again") });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

module.exports = {
    editCompanyView,
    updateCompanyAction,
    updateCompanyApprovalStatus,
    updateDocumentsStatusAction
}
