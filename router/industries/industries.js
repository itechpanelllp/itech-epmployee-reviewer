const express = require('express');
const app = express.Router();
const industryController = require('@industryController/industry');
const path = require('./industryPath');
const industryField = require('@industryController/industryValidation');
const { checkSession } = require('@middleware/session');
const { checkPermission } = require('@middleware/checkPermission');

// show industries list view page
app.get(`/${path.INDUSTRY_LIST_VIEW_PAGE}`, checkSession, checkPermission('industry','view'), industryController.industryList),

// get industry data table
app.post(`/${path.INDUSTRY_DATATABLE_ACTION_URL}`, checkSession, checkPermission('industry','view'), industryController.industryDataTable);

// udate industry status
app.post(`/${path.INDUSTRY_STATUS_UPDATE_URL}`, checkSession, checkPermission('industry','update'), industryController.updateIndustryStatus);

// add industry 
app.post(`/${path.INDUSTRY_ADD_ACTION_URL}`, checkSession, industryField, checkPermission('industry','add'), industryController.addIndustry);

// edit industry
app.post(`/${path.INDUSTRY_EDIT_ACTION_URL}`, checkSession, checkPermission('industry','view'), industryController.editIndustry);

// update industry
app.post(`/${path.INDUSTRY_UPDATE_ACTION_URL}:id`, checkSession, industryField, checkPermission('industry','update'), industryController.updateIndustry);

// // delete industry
app.post(`/${path.INDUSTRY_DELETE_ACTION_URL}:id`, checkSession, checkPermission('industry','delete'), industryController.deleteIndustry);



module.exports = app;