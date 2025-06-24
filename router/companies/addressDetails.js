const express = require('express');
const app = express.Router();
const addressController = require('@companyController/editCompany/addressDetails');
const path = require('./companiesPath');
const { checkSession } = require('@middleware/session');
const { checkPermission } = require('@middleware/checkPermission');
const { updateAddress } = require('@companyController/addCompany/companyValidation');


// address edit view
app.get(`/${path.COMPANIES_ADDRESS_VIEW}:id`, checkSession,  checkPermission('companies', 'update'), addressController.editBusinessAddressView);

// contact person update
app.post(`/${path.COMPANIES_ADDRESS_UPDATE_ACTION}:id`, checkSession, updateAddress, checkPermission('companies', 'update'), addressController.updateAddressAction);


module.exports = app;