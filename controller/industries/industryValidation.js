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
    body('name').notEmpty().withMessage((_, { req }) => req.__('Industry name is required')),
    validationHandler
];


module.exports = industryField
