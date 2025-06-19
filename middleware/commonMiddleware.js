const moment = require("moment");
const timezone = require('moment-timezone');
const activityModule = require('@userActivityModel/userActivity');
const fs = require("fs");
const path = require("path");
const img_url = process.env.IMG_BASE_URL;

module.exports = {
    current_date: function () {
        return moment.tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
    },
    formatted_date: function (date_time, format = '') {
        if (date_time === "" || date_time === "0000-00-00 00:00:00") {
            return "N/A";
        } else {
            const defaultFormat = "DD-MMM-YYYY hh:mm A";
            return moment(date_time).tz("Asia/Kolkata").format(format !== '' ? format : defaultFormat);
        }
    },
    //user activity log
    userActivityLog: async (req, id, url, activity, type) => {
        if (!(req && id && url && activity && type)) {
            return { error: req.__("Invalid parameters: user activity log requires all fields (req, id, url, activity, type).") };
        }
        const clientIp = (req.ips[0] || req.ip).replace(/^::ffff:/, '');
        const browserName = req.useragent?.browser;
        const data = {
            user_id: id,
            type,
            activity,
            action: url,
            browser: `${browserName}, ${clientIp}`,
        }
        try {
            const result = await activityModule.insertActivity(data);
            return result;
        } catch (error) {
            console.error("Error logging user activity:", error.message);
            return { error: error.message };
        }
    },

    //laguage file
    languageFile: (lng) => {
        try {
            const language = lng || process.env.DEFAULT_LANG;
            const filePath = path.join(__dirname, "../locales", `${language}.json`);
            return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : {};
        } catch {
            return {};
        }
    },

    // delete image from folder
    deleteImage: (relativeImagePath) => {
        if (!relativeImagePath) return false;
        const fullPath = path.join('public', img_url, relativeImagePath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            return true;
        }
        return false;
    },

    // Currency Format
    currencyFormat: (amount, decimalPlaces = 2) => {
        if (isNaN(amount)) return '';
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces, }).format(amount);
    },

 







}