
const bcrypt = require("bcrypt");
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
var year = new Date().getFullYear();
var month = new Date().getMonth() + 1;
var day = new Date().getDate();
var uploadprofile = `profileImage/${year}/${month}/${day}`;
var img_url = process.env.IMG_BASE_URL;
const profilePath = require('@ProfileRouter/profilePath');
const profileModel = require('@ProfileModel/profile');
const { userActivityLog, deleteImage } = require('@middleware/commonMiddleware');

// profile view page
const profileViewPage = async (req, res) => {
    try {
        const userId = req.session.userId;
        const [data, country, role, metaData] = await Promise.all([
            profileModel.getUserData(userId),
            profileModel.getCountry(),
            profileModel.getRole(),
            profileModel.getUserMetaData(userId),
        ]);

        const secretKey = data.twoFactor_key || speakeasy.generateSecret({ length: 20 }).base32;
        const otpUrl = speakeasy.otpauthURL({
            secret: secretKey,
            label: req.session.email,
            issuer: process.env.TWOFACTOR_KEY,
            encoding: 'base32',
        });

        const qrcodeData = await qrcode.toDataURL(otpUrl);

        res.render("profile/profile", {
            title: res.__("Profile"),
            data,
            session: req.session,
            img_url,
            country,
            role,
            metaData,
            qrcode: qrcodeData,
            secret: secretKey,
            profile_update: profilePath.PROFILE_UPDATE_ACTION_URL,
            get_state: profilePath.PROFILE_GET_STATE_ACTION,
            get_city: profilePath.PROFILE_GET_CITY_ACTION,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// get state
const getState = async (req, res) => {
    try {
        const state = await profileModel.getState(req.body.country);
        return res.status(200).json({ state: state });

    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
};
// get state
const getCity = async (req, res) => {
    try {
        const city = await profileModel.getCity(req.body.state);
        return res.status(200).json({ city: city });

    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
};

// update profile
const updateProfile = async (req, res) => {
    try {
        const id = req.session.userId;
        const { fname, lname = '',  phoneNumber, password, user, token, twoFactorStatus, twoFactorKey, profileOldImg, removeImage } = req.body;
        // get user data
        const data = await profileModel.getUserData(id);

        const tokenValue = Array.isArray(token) ? token.join('') : '';
        if (twoFactorStatus == 1 && data.twoFactor_key == null) {
            if (!speakeasy.totp.verify({ secret: twoFactorKey, encoding: 'base32', token: tokenValue, window: 0 })) {
                return res.status(200).json({ error: res.__("Please complete the 2FA setup.") });
            }
        }

        // user updated data
       const userdata = {
            firstname: fname,
            lastname: lname,
            ...(password && { password: await bcrypt.hash(password, 10) }),
            ...(phoneNumber && { phoneNumber }),
            ...(twoFactorStatus && { twoFactor_status: twoFactorStatus }),
            ...(twoFactorKey && { twoFactor_key: twoFactorKey })
        };
        const setkeys = Object.keys(userdata).map(key => `${key} = ?`).join(", ");
        const setvalues = [...Object.values(userdata), id];

        // update profile
        const updateResult = await profileModel.updateProfile(setkeys, setvalues);

        user.profile_img = profileOldImg;
        if(req.file?.filename) {
            user.profile_img = `${uploadprofile}/${req.file.filename}`;
            // Remove old image if exists
            deleteImage(profileOldImg);
            // Case 2: No new image, but user removed old image
        } else if (removeImage === '1') {
            deleteImage(profileOldImg);
            user.profile_img = '';
        }
        // delete user image
        if (removeImage === '1') {
            deleteImage(profileOldImg);
            user.profile_img = '';
        }

        // update user
        const userMetaData = Object.entries(user).filter(([_, v]) => v?.toString().trim()).map(([key, value]) => ({
            user_id: id,
            meta_key: key,
            meta_value: value,
        }));

        // detete user meta 
        await profileModel.deleteUserMeta(id);
        // insert user meta
        await Promise.all(userMetaData.map(meta => profileModel.insertUserMeta(meta)));

        // user activity log
        await userActivityLog(req, id, profilePath.PROFILE_UPDATE_ACTION_URL, 'Profile updated successfully.', 'Update');
        return res.status(200).json({ success: res.__("Profile updated successfully.") });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};



module.exports = {
    profileViewPage,
    getState,
    getCity,
    updateProfile
}
