const express = require('express');
const app = express.Router();
const dashboardController = require('@dashboardController/dashboard');
const path = require('./dashboardPath');
const { checkSession } = require('@middleware/session');

// dashboard view page
app.get(`/${path.DASHBOARD_VIEW}`, checkSession, dashboardController.dashboardView);


module.exports = app;