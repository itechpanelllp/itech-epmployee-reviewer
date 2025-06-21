const { body, validationResult } = require('express-validator');

const validationHandler = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorResponse = errors.array().reduce((acc, { path, msg }) => {
            acc[path] = msg;
            return acc;
        }, {});
        return res.status(200).json({ errors: errorResponse });
    }
    next();
};

const settingField = [
    body('setting[name]').notEmpty().withMessage((_, { req }) => req.__('Name is required')),
    body('setting[email]').notEmpty().withMessage((_, { req }) => req.__('Email is required')).bail().isEmail().withMessage(('Invalid email format')),
    body('setting[invoice_prefix]').notEmpty().withMessage((_, { req }) => req.__('Invoice prefix is required')),
    body('setting[businessName]').notEmpty().withMessage((_, { req }) => req.__('Business name is required')),
    body('setting[company_gst]') .notEmpty() .withMessage((_, { req }) => req.__('GST is required')).bail().matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/) .withMessage((_, { req }) => req.__('Invalid GST number format')),
    body('setting[meta_title]').notEmpty().withMessage((_, { req }) => req.__('Meta title is required')),
    body('setting[meta_description]').notEmpty().withMessage((_, { req }) => req.__('Meta description is required')),
    validationHandler
];



module.exports = {
    settingField
}
