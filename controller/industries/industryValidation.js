const { body, validationResult } = require('express-validator');
//error handler
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


// Validation rules
const industryField = [
    body('industry').notEmpty().withMessage((_, { req }) => req.__('INDUSTRY_NAME_REQ')),
    validationHandler
];


module.exports = industryField
