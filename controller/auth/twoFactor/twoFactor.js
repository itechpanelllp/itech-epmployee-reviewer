const speakeasy = require('speakeasy');
const path = require('@twoFactorRouter/twoFactorPath');
const twoFactorModule = require('@twoFactorModel/twoFactor');
const jwt = require('jsonwebtoken');
const TWO_FACTOR_SECRET = process.env.TWO_FACTOR_JWT_SECRET;
const i18n = require('i18n');
const { userActivityLog } = require('@middleware/commonMiddleware');


// get bar code 
const twoFactorView = async (req, res) => {
    try {
        const token = req.query.token;
        if (!token) {
            req.flash('error', res.__("Token is required"));
            return res.redirect(`/${path.LOGIN_VIEW_PAGE}`);
        }

        jwt.verify(token, TWO_FACTOR_SECRET, (err, decoded) => {
            if (err) {
                // If token is invalid or expired, redirect to login
                req.flash('error', res.__("Invalid or expired token"));
                return res.redirect(`/${path.LOGIN_VIEW_PAGE}`);
            }
            // If valid, render 2FA view
            res.render('auth/twoFactor/twoFactor', {
                title: res.__("Two-factor authentication"),
                token,
                two_factor_action: path.TWO_FACTOR_AUTH_VERIFY,
                two_factor_reset: path.TWO_FACTOR_AUTH_RESET
            });
        })

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// two factor verify
const twoFactorVerify = async (req, res) => {
    try {
        const { code, token } = req.body;
        let decoded;
        try {
            decoded = jwt.verify(token, TWO_FACTOR_SECRET);
        } catch (err) {
            return res.status(200).json({ error: res.__("Invalid or expired token") });
        }

        const userId = decoded.id;
        const userData = await twoFactorModule.getUserData(userId);

        // Check if user exists
        if (!userData) return res.status(200).json({ error: res.__("User not found") });

        // Check if the user has a 2FA secret key
        if (!userData.twoFactor_key) return res.status(200).json({ error: res.__("2FA key not found") });

        // Verify the 2FA code with speakeasy
        const isValidToken = speakeasy.totp.verify({
            secret: userData.twoFactor_key,
            encoding: 'base32',
            token: code,
            window: 0
        });

        if (!isValidToken) return res.status(200).json({ error: res.__("Invalid 2FA code") });

        // Set session variables
        req.session.fname = userData.firstname;
        req.session.lname = userData.lastname;
        req.session.email = userData.email;
        req.session.userId = userId;
        req.session.userRole = userData.role;
        req.session.userStatus = userData.status;
        req.session.userLang = userData.userLang || process.env.DEFAULT_LANG;

        // Set the locale for i18n
        i18n.setLocale(req, req.session.userLang);
        res.cookie('lang', req.session.userLang);

             // user activity log
        await userActivityLog(req, req.session.userId, path.TWO_FACTOR_AUTH_VERIFY, '2FA verification successfully', 'Two-factor authentication');
        return res.status(200).json({ success: res.__("2FA verification successfully") });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};



module.exports = {
    twoFactorView,
    twoFactorVerify
};