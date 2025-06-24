const express = require('express');
const app = express.Router();
const documentController = require('@companyController/editCompany/documentsDetails');
const path = require('./companiesPath');
const { checkSession } = require('@middleware/session');
const { checkPermission } = require('@middleware/checkPermission');
const { updateDocuments } = require('@companyController/addCompany/companyValidation');
const { upload } = require('@middleware/uploader');
const now = new Date();
const multerErrorHandler = require('@middleware/multerErrorHandler');
var uploadprofile = upload(`./public/uploads/companies/${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`).fields([
    { name: 'gstFile', maxCount: 1 },
    { name: 'panFile', maxCount: 1 },
    { name: 'aadhaarFront', maxCount: 1 },
    { name: 'aadhaarBack', maxCount: 1 },
    { name: 'websiteLogo', maxCount: 1 },
]);

const uploadWithErrorHandler = multerErrorHandler(uploadprofile);

// contact person edit
app.get(`/${path.COMPANIES_DOCUMENTS_VIEW}:id`, checkSession,  checkPermission('companies', 'update'), documentController.editDocumentsView);

// contact person update
app.post(`/${path.COMPANIES_DOCUMENTS_UPDATE_ACTION}:id`, checkSession, uploadWithErrorHandler, updateDocuments, checkPermission('companies', 'update'), documentController.updateDocumentsAction);


module.exports = app;