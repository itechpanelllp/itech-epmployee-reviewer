const express = require('express');
const app = express.Router();
const emailController = require('@companyController/emailVerification/emailVerification');
const path = require('./companiesPath');




// email verification action
app.get(`/${path.COMPANY_EMAIL_VERIFICATION}:token`, emailController.emailVerification);


module.exports = app;