const express = require('express');
const app = express.Router();
const employeeController = require('@companyController/editCompany/employeeList');
const path = require('./companiesPath');
const { checkSession } = require('@middleware/session');
const { checkPermission } = require('@middleware/checkPermission');


// employee list
app.get(`/${path.COMPANIES_EMPLOYEES_VIEW}:id`, checkSession,  checkPermission('companies', 'update'), employeeController.employeesListView);

// employee datatable
app.post(`/${path.COMPANIES_EMPLOYEES_DATA_TABLE_ACTION}:id`, checkSession,  checkPermission('companies', 'update'), employeeController.employeesDataTable);

// update status employee
app.post(`/${path.COMPANIES_EMPLOYEES_STATUS_UPDATE_ACTION}:id`, checkSession,  checkPermission('companies', 'update'), employeeController.updateEmployeeStatus);

//delete employee
app.post(`/${path.COMPANIES_EMPLOYEES_DELETE_ACTION}:id`, checkSession,  checkPermission('companies', 'delete'), employeeController.deleteEmployee);

module.exports = app;