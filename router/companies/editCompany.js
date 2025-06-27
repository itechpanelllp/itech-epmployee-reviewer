const express = require('express');
const app = express.Router();
const editCompanyController = require('@companyController/editCompany/editCompany');
const path = require('./companiesPath');
const { checkSession } = require('@middleware/session');
const { checkPermission } = require('@middleware/checkPermission');
const { updateCompany } = require('@companyController/addCompany/companyValidation');
const { upload } = require('@middleware/uploader');
const now = new Date();
const multerErrorHandler = require('@middleware/multerErrorHandler');
var uploadprofile = upload(`./public/uploads/companies/${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`).fields([
    { name: 'gstFile', maxCount: 1 },
    { name: 'panFile', maxCount: 1 },
    { name: 'companyLogo', maxCount: 1 },
    { name: 'aadhaarCard_front', maxCount: 1 },
    { name: 'aadhaarCard_back', maxCount: 1 },
    { name: 'voterID_front', maxCount: 1 },
    { name: 'voterID_back', maxCount: 1 },
    { name: 'passport_front', maxCount: 1 },
    { name: 'passport_back', maxCount: 1 },
    { name: 'drivingLicence_front', maxCount: 1 },
    { name: 'drivingLicence_back', maxCount: 1 },
]);

const uploadWithErrorHandler = multerErrorHandler(uploadprofile);

// companies edit
app.get(`/${path.COMPANIES_EDIT_VIEW}:id`, checkSession,  checkPermission('companies', 'update'), editCompanyController.editCompanyView);

// companies update
app.post(`/${path.COMPANIES_UPDATE_ACTION}:id`, checkSession,  uploadWithErrorHandler, updateCompany, checkPermission('companies', 'update'), editCompanyController.updateCompanyAction);

// update company approval status
app.post(`/${path.COMPANIES_APPROVAL_STATUS_UPDATE_ACTION}/:id`, checkSession, checkPermission('companies', 'update'), editCompanyController.updateCompanyApprovalStatus);

// update company documents status
app.post(`/${path.COMPANIES_DOCUMENTS_STATUS_UPDATE_ACTION}:id/:docId`, checkSession, checkPermission('companies', 'update'), editCompanyController.updateDocumentsStatusAction);




module.exports = app;