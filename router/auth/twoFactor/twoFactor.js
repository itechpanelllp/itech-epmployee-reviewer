const express = require('express');
const app = express.Router();
const twoFactorCont = require('@twoFactorController/twoFactor');
const path = require('@twoFactorRouter/twoFactorPath');

// * GET two factor page. */
app.get(`/${path.TWO_FACTOR_AUTH_VIEW_PAGE}`, twoFactorCont.twoFactorView);

// * POST two factor verify. */
app.post(`/${path.TWO_FACTOR_AUTH_VERIFY}`, twoFactorCont.twoFactorVerify);


module.exports = app;