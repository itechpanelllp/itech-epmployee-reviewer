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
        const cleanPath = relativeImagePath.replace(/^\/+/, '');
        const fullPath = path.resolve(__dirname, '../public', img_url, cleanPath);
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
    formatDateLocal: (dateStr) => {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    // india gov vaild id proof
    validateGovtIdProof: (type, value) => {
        const val = (value || '').toString().trim().replace(/\s+/g, '');
        const patterns = {
            aadhaar: /^[2-9]{1}[0-9]{11}$/,
            pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
            voter: /^[A-Z]{3}[0-9]{7}$/,
            driving_license: /^[A-Z]{2}[0-9]{2}\s?[0-9]{11,15}$/,
            passport: /^[A-PR-WY][0-9]{7}$/,  // excludes Q, X, Z
            ration: /^[A-Z]{2}[0-9]{10,12}$/,
            gstin: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
            uan: /^[0-9]{12}$/,
            tan: /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/
        };
        const messages = {
            aadhaar: "Invalid Aadhaar number. Must be 12 digits and start with 2–9.",
            pan: "Invalid PAN format. Format: ABCDE1234F.",
            voter: "Invalid Voter ID. Format: ABC1234567.",
            driving_license: "Invalid Driving License. Format: MH12 20110012345.",
            passport: "Invalid Passport number. Format: K1234567.",
            ration: "Invalid Ration Card number.",
            gstin: "Invalid GSTIN. Format: 22AAAAA0000A1Z5.",
            uan: "Invalid UAN. Must be a 12-digit number.",
            tan: "Invalid TAN number. Format: ABCD12345E."
        };
        if (!patterns[type]) {
            return { valid: false, message: "Unknown ID type." };
        }

        const isValid = patterns[type].test(val);
        return {
            valid: isValid,
            message: isValid ? "" : messages[type]
        };

    }









}