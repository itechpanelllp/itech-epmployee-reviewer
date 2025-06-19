const tables = require('@config/table');
const db = require('@config/db');
const userPath = require('../router/system/user/userPath');
const img_url = process.env.IMG_BASE_URL;

const headerMiddleware = async (req, res, next) => {
    if (req.session && req.session.userId) {

        const userData = await db.query(`SELECT u.id, u.email, u.firstname, u.lastname, r.permissions, MAX(CASE WHEN um.meta_key = 'profile_img' THEN um.meta_value END) AS profileImg FROM ${tables.user} AS u LEFT JOIN ${tables.user_meta} AS um ON um.user_id = u.id LEFT JOIN ${tables.role} AS r ON u.role = r.id AND r.status = '1' WHERE u.id = ? GROUP BY u.id`, [req.session.userId]);

        res.locals.userData =  userData[0];
        res.locals.img_url = img_url;
        res.locals.userActivity = userPath.USER_ACTIVITY_VIEW;
        res.locals.userProfile = userPath.USER_PROFILE_VIEW;
        res.locals.userLogout = userPath.AUTH_LOGOUT;
    } else {
        res.locals.userData = null;
        res.locals.img_url = null;
        res.locals.userActivity = null;
        res.locals.userProfile = null;
        res.locals.userLogout = null;
    }

    next();
};

module.exports = headerMiddleware;
