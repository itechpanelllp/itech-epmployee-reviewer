const express = require('express');
const app = express.Router();
const addEmployeeController = require('@companyController/editCompany/addEmployee');
const path = require('./companiesPath');
const { checkSession } = require('@middleware/session');
const { checkPermission } = require('@middleware/checkPermission');
const { employeeValidation } = require('@companyController/editCompany/employeeValidation');
const { upload } = require('@middleware/uploader');
const now = new Date();
const multerErrorHandler = require('@middleware/multerErrorHandler');
var uploadprofile = upload(`./public/uploads/employees/${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`).fields([
    { name: 'employeeImage', maxCount: 1 },
    { name: 'panFile', maxCount: 1 },
    { name: 'aadhaarFront', maxCount: 1 },
    { name: 'aadhaarBack', maxCount: 1 },
   
]);
const uploadWithErrorHandler = multerErrorHandler(uploadprofile);


// companies add employee
app.get(`/${path.COMPANIES_EMPLOYEES_ADD_VIEW}:id`, checkSession, checkPermission('companies', 'update'), addEmployeeController.addEmployeeView);

app.post(`/${path.COMPANIES_EMPLOYEES_ADD_ACTION}:id`, checkSession, uploadWithErrorHandler, checkPermission('companies', 'update'), employeeValidation, addEmployeeController.addEmployee);

module.exports = app;