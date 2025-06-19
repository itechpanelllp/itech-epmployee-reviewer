const express = require('express');
const router = express.Router();
const loginController = require('@authController/login/login');
const path = require('./loginPath');

// login view page
router.get(`/${path.LOGIN_VIEW}`, loginController.loginView);

// login action
router.post(`/${path.AUTH_LOGIN_ACTION_URL}`, loginController.loginAction);


// logout action
router.post(`/${path.AUTH_LOGOUT_ACTION}`, loginController.logoutAction);

module.exports = router;