const userPath = require('@userRouter/userPath');
const userModel = require('@userModel/addUser');
const { userActivityLog } = require('@middleware/commonMiddleware');
const bcrypt = require('bcrypt');
const { registrationMail } = require('@middleware/mailer');

// add user action
const addUser = async (req, res) => {
    try {
        const { fname, lname, email, phoneNumber, password, status, role, verifyPass } = req.body;
        // check required fields
        if (phoneNumber && !/^\d+$/.test(phoneNumber)) {
            return res.status(200).json({ error: res.__("Phone number must contain only numbers") });
        }
        // get current user detais
        const currentUserDetails = await userModel.userDetails(req.session.userId);

        const verfiyPass = await bcrypt.compare(verifyPass, currentUserDetails.password);
        if (!verfiyPass) return res.status(200).json({ error: res.__("The logged-in user's password and the verification password do not match. Please try again.") });

        // check if user already exist
        const userResult = await userModel.checkUserExist(email);
        if (userResult) return res.status(200).json({ error: res.__("The User already exits, please try again") });

        const userData = {
            firstname: fname,
            lastname: lname ?? '',
            email,
            phoneNumber: phoneNumber || '',
            password: await bcrypt.hash(password, 10),
            status,
            role,
        }
        // add user
        const userId = await userModel.addUser(userData);

        if (userId) {
            registrationMail({
                name: `${fname} ${lname || ''}`,
                message: res.__("Your system user account has been created. you can contact the administrator for your login credentials."),
                email: email,
                subject: res.__('New user create'),
                footer: res.__("Thanks"),
                support_team: res.__("The Support Teams"),
            })
        }

        if (userId) {
            // user activity
            await userActivityLog(req, req.session.userId, userPath.USER_LIST_VIEW, "The User has been added successfully.", "Add");
            return res.status(200).json({ success: res.__("The User has been added successfully.") });
        }
        return res.status(200).json({ error: res.__("Technical issue add user, please try again") });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    addUser
}