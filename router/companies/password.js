const express = require('express');
const app = express.Router();
const passwordController = require('@companyController/editCompany/password');
const path = require('./companiesPath');
const { checkSession } = require('@middleware/session');
const { checkPermission } = require('@middleware/checkPermission');
const { updatePassword } = require('@companyController/addCompany/companyValidation');


// password edit
app.get(`/${path.COMPANIES_PASSWORD_VIEW}:id`, checkSession,  checkPermission('companies', 'update'), passwordController.editPasswordView);

// password update
app.post(`/${path.COMPANIES_PASSWORD_UPDATE_ACTION}:id`, checkSession, updatePassword, checkPermission('companies', 'update'), passwordController.updatePasswordAction);


module.exports = app;