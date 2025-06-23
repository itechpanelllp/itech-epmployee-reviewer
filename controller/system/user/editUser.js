const userPath = require('@userRouter/userPath');
const userModel = require('@userModel/editUser');
const bcrypt = require('bcrypt');
const { userActivityLog } = require('@middleware/commonMiddleware');
const { checkPermissionEJS } = require('@middleware/checkPermission');

// edit user view
const editUserView = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await userModel.getUserData(userId);
        const metaData = await userModel.userMeta(userId);
        const role = await userModel.getRole();
        const country = await userModel.getCountry();
        const updateUserPer = await checkPermissionEJS('users', 'update', req);
        if (!user) {
            return res.redirect(`/${userPath.USER_LIST_VIEW}`);
        }
        return res.status(200).render('system/user/userEdit', {
            title: res.__("Edit User"),
            user,
            session: req.session,
            metaData,
            role,
            country,
            updateUserPer,
            get_state: userPath.USER_STATE_ACTION,
            get_city: userPath.USER_CITY_ACTION,
            user_update: userPath.USER_UPDATE_ACTION + userId,
            user_list: userPath.USER_LIST_VIEW,
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// get state
const getState = async (req, res) => {
    try {
        const state = await userModel.getState(req.body.country);
        return res.status(200).json({ state: state });

    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
};
// get city
const getCity = async (req, res) => {
    try {
         const { country, state } = req.body;
        const city = await userModel.getCity({ country, state });
        return res.status(200).json({ city: city });
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
};
// update user
const updateUser = async (req, res) => {
    try {
        const { fname, lname = '', email, phoneNumber, password, status, role, verifyPass, user } = req.body;
        // check required fields
        if (phoneNumber && !/^\d+$/.test(phoneNumber)) {
            return res.status(200).json({ error: res.__("Phone number must contain only numbers") });
        }
        // get current user detais
        const currentUserDetails = await userModel.getUserData(req.session.userId);

        const verfiyPass = await bcrypt.compare(verifyPass, currentUserDetails.password);
        if (!verfiyPass) return res.status(200).json({ error: res.__("The logged-in user's password and the verification password do not match. Please try again.") });

        const userData = {
            firstname: fname,
            lastname: lname,
            email,
            role,
            ...(password && { password: await bcrypt.hash(password, 10) }),
            ...(phoneNumber && { phoneNumber }),
            ...(status && { status, })
        };


        const setkeys = Object.keys(userData).map(key => `${key} = ?`).join(", ");
        const setvalues = [...Object.values(userData), req.params.id];

        // update user
        const result = await userModel.updateUser(setkeys, setvalues);

        const userMeta = await userModel.deleteUserMeta(req.params.id);
        const metaUpdates = Object.entries(user).map(([key, value]) => ({
            user_id: req.params.id,
            meta_key: key,
            meta_value: value
        }));

        await Promise.all(metaUpdates.map(meta => userModel.insertUserMeta(meta)));

        // user activity
        await userActivityLog(req, req.session.userId, `${userPath.USER_EDIT_VIEW}${req.params.id}`, "The User has been updated successfully.", "Update");
        return res.status(200).json({ success: res.__("The User has been updated successfully.") });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}


module.exports = {
    editUserView,
    getState,
    getCity,
    updateUser
}