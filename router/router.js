const express = require('express');
const router = express.Router();

router.use('/', require('./auth/login/login'));
router.use('/', require('./auth/forgotPassword/forgotPassword'));
router.use('/', require('./auth/resetPassword/resetPassword'));
router.use('/', require('./auth/twoFactor/twoFactor'));
router.use('/', require('./dashboard/dashboard'));
router.use('/', require('./system/user/user'));
router.use('/', require('./system/role/role'));
router.use('/', require('./profile/profile'));
router.use('/', require('./setting/setting'));
router.use('/', require('./industries/industries'));
router.use('/', require('./companies/companies'));
router.use('/', require('./companies/editCompany'));
router.use('/', require('./companies/conatctDetails'));
router.use('/', require('./companies/addressDetails'));
// router.use('/', require('./companies/employeeList'));
router.use('/', require('./companies/password'));
router.use('/', require('./companies/emailVerification'));





module.exports = router;