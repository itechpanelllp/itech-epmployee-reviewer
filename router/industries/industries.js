const express = require('express');
const app = express.Router();
const industryController = require('@industryController/industries');
const path = require('./industriesPath');
const{ checkSession }=  require('@middleware/session');
const industryField = require('@industryController/industryValidation');
const { checkPermission } = require('@middleware/permissionCheck');

// show industries list view page
app.get(`/${path.INDUSTRY_LIST_VIEW_PAGE}`, checkSession, checkPermission('industries','view'), industryController.industryList),

// get industries data table
app.post(`/${path.INDUSTRY_DATATABLE_ACTION_URL}`, checkSession, checkPermission('industries','view'), industryController.industryDataTable);

// // udate industries status
// app.post(`/${path.INDUSTRY_STATUS_UPDATE_URL}`, checkSession, checkPermission('industries','update'), industryController.updateIndustryStatus);

// add industries 
app.post(`/${path.INDUSTRY_ADD_ACTION_URL}`, checkSession, industryField, checkPermission('industries','add'), industryController.addIndustry);

// edit industry
app.post(`/${path.INDUSTRY_EDIT_ACTION_URL}`, checkSession, checkPermission('industries','view'), industryController.editIndustry);

// update industry
app.post(`/${path.INDUSTRY_UPDATE_ACTION_URL}:id`, checkSession, industryField, checkPermission('industries','update'), industryController.updateIndustry);

// delete industry
app.post(`/${path.INDUSTRY_BULK_ACTION_URL}`, checkSession, checkPermission('industries','update'), industryController.bulkAction);



module.exports = app;