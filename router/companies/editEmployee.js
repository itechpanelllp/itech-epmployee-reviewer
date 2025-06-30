const express = require('express');
const app = express.Router();
const editEmployeeController = require('@companyController/editCompany/editEmployee');
const path = require('./companiesPath');
const { checkSession } = require('@middleware/session');
const { checkPermission } = require('@middleware/checkPermission');
const { employeeValidation, employeeUpdateValidation } = require('@companyController/editCompany/employeeValidation');
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
app.get(`/${path.COMPANIES_EMPLOYEES_EDIT_VIEW}:id/:empId`, checkSession, checkPermission('companies', 'update'), editEmployeeController.editEmployeeView);

app.post(`/${path.COMPANIES_EMPLOYEES_UPDATE_ACTION}:id/:empId`, checkSession, uploadWithErrorHandler, checkPermission('companies', 'update'), employeeUpdateValidation, editEmployeeController.updateEmployee);

module.exports = app;