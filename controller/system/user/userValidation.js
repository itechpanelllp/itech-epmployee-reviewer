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
const userField = [
    body('fname').notEmpty().withMessage((_, { req }) => req.__('First name is required')),
    body('status').notEmpty().withMessage((_, { req }) => req.__('Status is Required')),
    body('email').notEmpty().withMessage((_, { req }) => req.__('Email is required')).bail().isEmail().withMessage(('Invalid email format')),
    body('password').notEmpty().withMessage((_, { req }) => req.__('Password is required')),
    body('role').notEmpty().withMessage((_, { req }) => req.__('Role is required')),
    body('verifyPass').notEmpty().withMessage((_, { req }) => req.__('Verify password is required')),
    validationHandler
];

const userUpdateField = [
    body('fname').notEmpty().withMessage((_, { req }) => req.__('First name is required')),
    body('email').notEmpty().withMessage((_, { req }) => req.__('Email is required')).bail().isEmail().withMessage(('Invalid email format')),
    body('verifyPass').notEmpty().withMessage((_, { req }) => req.__('Verify password is required')),
    validationHandler
]

module.exports = {
    userField,
    userUpdateField

};
