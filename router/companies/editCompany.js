const express = require('express');
const app = express.Router();
const editCompanyController = require('@companyController/editCompany/editCompany');
const path = require('./companiesPath');
const { checkSession } = require('@middleware/session');
const { checkPermission } = require('@middleware/checkPermission');
const { updateCompany } = require('@companyController/addCompany/companyValidation');


// companies edit
app.get(`/${path.COMPANIES_EDIT_VIEW}:id`, checkSession,  checkPermission('companies', 'update'), editCompanyController.editCompanyView);

// companies update
app.post(`/${path.COMPANIES_UPDATE_ACTION}:id`, checkSession, updateCompany, checkPermission('companies', 'update'), editCompanyController.updateCompanyAction);

// update company approval status
app.post(`/${path.COMPANIES_APPROVAL_STATUS_UPDATE_ACTION}:id`, checkSession, checkPermission('companies', 'update'), editCompanyController.updateCompanyApprovalStatus);




module.exports = app;