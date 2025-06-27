const express = require('express');
const app = express.Router();
const companyListController = require('@companyController/companiesList/companiesList');
const addCompanyController = require('@companyController/addCompany/addCompany');
const path = require('./companiesPath');
const { checkSession } = require('@middleware/session');
const { checkPermission } = require('@middleware/checkPermission');
const { companiesValidation } = require('@companyController/addCompany/companyValidation');
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

// companies list
app.get(`/${path.COMPANIES_LIST_VIEW}`, checkSession, checkPermission('companies', 'view'), companyListController.companiesList);

// companies datatable
app.post(`/${path.COMPANIES_DATATABLE_ACTION}`, checkSession, checkPermission('companies', 'view'), companyListController.companiesDataTable);

// companies status update
app.post(`/${path.COMPANIES_STATUS_UPDATE_ACTION}`, checkSession, checkPermission('companies', 'view'), companyListController.updateCompanyStatus);

// companies add
app.get(`/${path.COMPANIES_ADD_VIEW}`, checkSession, checkPermission('companies', 'add'), addCompanyController.addCompanyView);

app.post(`/${path.COMPANIES_ADD_ACTION}`, checkSession, uploadWithErrorHandler, checkPermission('companies', 'add'), companiesValidation, addCompanyController.addCompanyAction);


// companies delete
app.post(`/${path.COMPANIES_DELETE_ACTION}:id`, checkSession, checkPermission('companies','delete'), companyListController.deleteCompany);


module.exports = app;