const companyPath = require('@companyRouter/companiesPath')
const companyModel = require('@companyModel/emailVerification/emailVerification')
const { userActivityLog } = require('@middleware/commonMiddleware');
const { emailVerifiedMail } = require('@middleware/mailer');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

// email verification
const emailVerification = async (req, res) => {
    try {
        const token = req.params.token;
        const decoded = jwt.verify(token, JWT_SECRET);
        const id = decoded.id;
        const result = await companyModel.emailVerification(id, token);
        if (!result) {
            return res.status(200).json({ error: res.__("Invalid or expired token") });
        }
        const verified = await companyModel.updateEmailVerification(id, token);

        if (verified) {
            const emailVerification = {
                name: result.business_name,
                message: res.__("Your email has been successfully verified. Thank you for confirming your address. You can now access all features of your account."),
                footer: res.__("Thanks"),
                support_team: res.__("The Support Team"),
                email: result.business_email,
                subject: res.__("Email Verified Successfully")
            };
            emailVerifiedMail(emailVerification);
            res
            // user activity log
            await userActivityLog(req, id, companyPath.COMPANY_EMAIL_VERIFICATION + id, 'Email verification successfully', 'Email verification');
            return res.redirect(`/${companyPath.COMPANIES_LIST_VIEW}`);
        }

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }

}



module.exports = {
    emailVerification,

}