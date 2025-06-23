const express = require('express');
const app = express.Router();
const contactController = require('@companyController/editCompany/contactDetails');
const path = require('./companiesPath');
const { checkSession } = require('@middleware/session');
const { checkPermission } = require('@middleware/checkPermission');
const { updateContact } = require('@companyController/addCompany/companyValidation');


// contact person edit
app.get(`/${path.COMPANIES_CONTACT_INFO_VIEW}:id`, checkSession,  checkPermission('companies', 'update'), contactController.editContactPersonView);

// contact person update
app.post(`/${path.COMPANIES_CONTACT_INFO_UPDATE_ACTION}:id`, checkSession, updateContact, checkPermission('companies', 'update'), contactController.updateContactPerson);


module.exports = app;