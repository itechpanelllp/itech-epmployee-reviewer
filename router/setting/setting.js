const express = require('express');
const app = express.Router();
const siteController = require('@settingController/setting');
const { settingField } = require('@settingController/settingValidation');
const path = require('./settingPath');
const { checkSession } = require('@middleware/session');

// dashboard view page
app.get(`/${path.SETTING_ADDFORM_VIEW}`, checkSession, siteController.settingViewPage);

//state get
app.post(`/${path.SETTING_STATE_ACTION_URL}`, checkSession, siteController.getSettingState);

// get city
app.post(`/${path.SETTING_CITY_ACTION_URL}`, checkSession, siteController.getSettingCity);

// add setting
app.post(`/${path.SETTING_ADD_ACTION}`, checkSession, settingField, siteController.insertSetting);


module.exports = app;