
const settingPath = require('@settingRouter/settingPath');
const settingModel = require('@settingModel/setting');
const { userActivityLog } = require('@middleware/commonMiddleware');
const i18n = require('i18n');

// setting view page
const settingViewPage = async (req, res) => {
    try {
        // get country
        const country = await settingModel.getCountry();
        const siteData = await settingModel.getSiteConfigData();
        res.render('setting/setting', {
            title: res.__("Setting"),
            session: req.session,
            country,
            siteData,
            state_get_url: settingPath.SETTING_STATE_ACTION_URL,
            city_get_url: settingPath.SETTING_CITY_ACTION_URL,
            add_url: settingPath.SETTING_ADD_ACTION,
        })
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// get state
const getSettingState = async (req, res) => {
    try {
        const state = await settingModel.getSettingState(req.body.country);
        return res.status(200).json({ state: state });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
// get city
const getSettingCity = async (req, res) => {
    try {
        const city = await settingModel.getSettingCity(req.body.state);
        return res.status(200).json({ city: city });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// insert setting
const insertSetting = async (req, res) => {
    try {

        // Delete data
        const setttingData = await settingModel.deleteSiteData();
        if (!setttingData) return res.status(200).json({ error: res.__("Technical issue, please try again") });

        const { setting: settingValues } = req.body;
        const phone = settingValues.phoneNumber;
        const phoneRegex = /^[6-9]\d{9}$/;
        if (phone && !phoneRegex.test(phone)) {
            return res.status(200).json({ error: res.__("Please enter 10 digit phone number example: 9876543210") });
        }
        const settingData = Object.entries(settingValues).filter(([_, value]) => value).map(([key, value]) => ({
                meta_key: key,
                meta_value: value,
            }));

        // // Handle language setting and set session cookies
        // const language = settingValues.language || process.env.DEFAULT_LANG;
        // req.session.userLang = language;
        // res.cookie('lang', language);
        // i18n.setLocale(req, language);


        // Insert all settings into the database
        await Promise.all(settingData.map(meta => settingModel.insertSettingData(meta)));

        await userActivityLog(req, req.session.userId, settingPath.SETTING_ADDFORM_VIEW_PAGE, "Setting Added successfully", "Add");

        res.status(200).json({ success: res.__("Setting Added successfully") });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};








module.exports = {
    settingViewPage,
    getSettingState,
    getSettingCity,
    insertSetting,

}