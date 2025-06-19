const loginPath = require('@authRouter/login/loginPath');
const loginModel = require('@authModel/login/login');
const bcrypt = require('bcrypt');
const i18n = require('i18n');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const TWO_FACTOR_SECRET = process.env.TWO_FACTOR_JWT_SECRET;
const { userActivityLog } = require('@middleware/commonMiddleware');

// login  view page
 const loginView = async (req, res) => {
    try {
        if (req.session?.email) {
            return res.redirect('/');
        }
        const error = req.flash('error');
        res.render('auth/login/login', {
            title: 'Login',
            error,
            login_action: loginPath.AUTH_LOGIN_ACTION_URL,
            forgot_password_view: loginPath.FORGOT_PASSWORD_VIEW_PAGE,
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }

}

// login action
const loginAction = async (req, res) => {
    try {
        const { email, password } = req.body;
        const __ = res.__;
        if (!email && !password) return res.json({ error: __("Email and password are required fields") });
        if (!email) return res.json({ error: __("Email address is required") });
        if (!validator.isEmail(email)) return res.json({ error: __("Please enter a valid email address.") });
        if (!password) return res.json({ error: __("Password is required") });

        const user = await loginModel.userData(email);
        if (!user) return res.json({ error: __("No account found with that email address.") });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            const attempts = Math.min(user.login_attempts + 1, 5);
            await loginModel.userFailAttempUpdate(user.id, attempts);
            if (attempts >= 5) await loginModel.userStatusUpdate(user.id);
            return res.json({ error: __("Incorrect email or password.") });
        }

        if (!user || ['0', '2', '3'].includes(String(user.status))) return res.status(200).json({ error: res.__("Your account is inactive, blocked, or has been removed. Please contact support.") });

        await loginModel.updateLoginAttemp(user.id);

        if (user.twoFactor_status === 1) {
            const token = jwt.sign({ id: user.id }, TWO_FACTOR_SECRET, { expiresIn: '30m' });
            const twoFactorUrl = `${loginPath.TWO_FACTOR_AUTH_VIEW_PAGE}?token=${token}`;
            return res.json({ success: __("Login successful! Complete your login with 2FA."), twoFactor: twoFactorUrl });
        }

        // Set session
        Object.assign(req.session, {
            fname: user.firstname,
            lname: user.lastname,
            email: user.email,
            userId: user.id,
            userRole: user.role,
            userStatus: user.status,
            userLang: user.userLang || process.env.DEFAULT_LANG
        });

        i18n.setLocale(req, req.session.userLang);
        res.cookie('lang', req.session.userLang);

        await userActivityLog(req, user.id, loginPath.AUTH_LOGIN_ACTION_URL, 'Success! User logged in successfully.', 'Login');
        return res.json({ success: __("Success! User logged in successfully.") });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};



// logout action
const logoutAction = async (req, res) => {
    try {
        // user activity log
        await userActivityLog(req, req.session.userId, loginPath.AUTH_LOGOUT, 'Logout successfully!', 'Logout');
        req.session.destroy();
        res.clearCookie('lang');
        res.status(200).json({ success: res.__("Logout successfully!") });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
module.exports = {
    loginView,
    loginAction,
    logoutAction
  
}