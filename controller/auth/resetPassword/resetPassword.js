const path = require('@authRouter/resetPassword/resetPasswordPath');
const resetPassModel = require('@authModel/resetPassword/resetPassword');
const jwt = require('jsonwebtoken');
const { base_url, JWT_SECRET } = process.env;
const moment = require('moment');
const { updatePassMail } = require('@middleware/mailer');
const bcrypt = require('bcrypt');
const { userActivityLog } = require('@middleware/commonMiddleware');


// reset password view
const resetPassView = async (req, res) => {
    try {
        const { token } = req.params;
        if (!token) {
            req.flash('error', res.__("Invalid password reset link."));
            return res.redirect(`/${path.LOGIN_VIEW}`);
        }

        const user = await resetPassModel.userData(token);

        if (!user) {
            req.flash('error', res.__("Invalid or expired link."));
            return res.redirect(`/${path.LOGIN_VIEW}`);
        }

        try {
            jwt.verify(token, JWT_SECRET);
            if (moment().isAfter(user.reset_token_expire)) {
                req.flash('error', res.__("This reset link has expired."));
                return res.redirect(`/${path.LOGIN_VIEW}`);
            }

        } catch {
            req.flash('error', res.__("Invalid or expired token"));
            return res.redirect(`/${path.LOGIN_VIEW}`);
        }

        return res.render('auth/resetPassword/resetPassword', {
            title: res.__("Reset password"),
            reset_password: path.RESET_PASSWORD_ACTION,
            login_view: path.LOGIN_VIEW,
            token
        });

    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};

// reset password action
const resetPassAction = async (req, res) => {
    try {
        const { token, password, cfmpassword} = req.body;
        if(password !== cfmpassword) return res.status(200).json({ error: res.__("Passwords do not match. Please ensure both fields are identical.") });
        
        const user = await resetPassModel.userData(token);
        if (user.reset_token !== token) return res.status(200).json({ error: res.__("Invalid or expired link.") });

        const hashedPassword = await bcrypt.hash(password, 10);
        await resetPassModel.updatePassword(token, hashedPassword);
        //  send to email
        updatePassMail({
            name:  `${user.firstname} ${user.lastname || ""}`,
            message: res.__("We wanted to let you know that your password was successfully updated. If you made this change, no further action is required."),
            pass_reset_support: res.__("If you did not make this change, please contact us immediately as this may indicate unauthorized access to your account."),
            email: user.email,
            subject: res.__("Password Updated"),
            link: `${base_url}${path.LOGIN_VIEW}`,
            login_text: res.__("Login"),
            footer: res.__("Thanks"),
            support_team: res.__("The Support Teams"),
          });
    
            // user activity log
        await userActivityLog(req, user.id, path.RESET_PASSWORD_ACTION, 'Password reset successfully', 'Reset password');
        res.status(200).json({ success: res.__("Password reset successfully") });
    }
    catch (error) {
        return res.status(500).send({ error: error.message });
    }
}

module.exports = {
    resetPassView,
    resetPassAction,
};
