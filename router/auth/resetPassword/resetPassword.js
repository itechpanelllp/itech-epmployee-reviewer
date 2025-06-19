const express = require('express');
const app = express.Router();
const resetPassController = require('@authController/resetPassword/resetPassword');
const path = require('./resetPasswordPath');

// reset password view
app.get(`/${path.RESET_PASSWORD_VIEW}/:token`, resetPassController.resetPassView);

// reset password action
app.post(`/${path.RESET_PASSWORD_ACTION}`, resetPassController.resetPassAction);

module.exports = app;
