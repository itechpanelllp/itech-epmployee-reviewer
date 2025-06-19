const path = require('@authRouter/forgotPassword/forgotPassPath');
const forgotPassModel = require('@authModel/forgotPassword/forgotPassword');
const jwt = require('jsonwebtoken');
const { base_url, JWT_SECRET } = process.env;
const moment = require('moment');
const { forgotPassMail } = require('@middleware/mailer');
const validator = require('validator');
const { userActivityLog } = require('@middleware/commonMiddleware');

// forgot password view
const forgotPassView = async (req, res) => {
    try {
        res.render('auth/forgotPassword/forgotPassword', {
            title: res.__("Forgot password"),
            forgotPassword: path.FORGOT_PASSWORD_ACTION,
        });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}

// forgot password action
const forgotPassAction = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) return res.status(200).json({ error: res.__("Email address is required") });
        if (!validator.isEmail(email)) return res.status(200).json({ error: "Please enter a valid email address." });

        const user = await forgotPassModel.userData(email);
        if (!user) return res.status(200).json({ error: "No account found with that email address." });

        // Check if a token already exists and hasn't expired
        if (user.reset_token && moment().isBefore(user.reset_token_expire)) {
            return res.status(200).json({ error: res.__("Link has already been sent. Please check your email or wait until the link expires.")
            });
        }
        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '30m' });
        const expires = moment().add(30, 'minutes').format("YYYY-MM-DD HH:mm:ss");
        await forgotPassModel.updateResetToken(user.id, token, expires);

        const restPasslink = `${base_url}${path.RESET_PASSWORD_VIEW}/${token}`;

        const forgotEmailLink = {
            name: `${user.firstname} ${user.lastname || ''}`,
            message: res.__("We received a request to reset the password for your account. If this was you, please click the button below to proceed with resetting your password. If you did not make this request, you can safely ignore this message."),
            link: restPasslink,
            reset_text: res.__("Reset password"),
            footer: res.__("Thanks"),
            support_team: res.__("The Support Teams"),
            expire_message: res.__("Link is valid for 30 minutes."),
            email: user.email,
            subject: res.__("User password reset")
        };

        // send link in email address
        forgotPassMail(forgotEmailLink);

        // user activity log
        await userActivityLog(req, user.id, path.FORGOT_PASSWORD_ACTION, 'A password reset link has been sent to your email address.', 'Forgot password');
        
        res.status(200).json({ success: res.__('A password reset link has been sent to your email address.') });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}




module.exports = {
    forgotPassView,
    forgotPassAction
}
