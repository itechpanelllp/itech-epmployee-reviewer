const express = require('express');
const app = express.Router();
const forgotPassController = require('@authController/forgotPassword/forgotPassword');
const path = require('./forgotPassPath');

// forgot password view
app.get(`/${path.FORGOT_PASSWORD_VIEW_PAGE}`, forgotPassController.forgotPassView);

// forgot password action
app.post(`/${path.FORGOT_PASSWORD_ACTION}`, forgotPassController.forgotPassAction);

module.exports = app;
