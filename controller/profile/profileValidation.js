
const { body, validationResult } = require('express-validator');
const validationHandler = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let errorResponse = errors.array().reduce((acc, error) => {
            acc[error.path] = error.msg;
            return acc;
        }, {});
        return res.status(200).json({ errors: errorResponse });
    }
    next();
};


const profileValidation = [
    body('fname').notEmpty().withMessage((_, { req }) => req.__('First name is required')),
    body('email').notEmpty().withMessage((_, { req }) => req.__('Email is required')).bail().isEmail().withMessage(('Invalid email format')),,
 
    validationHandler
    
];


module.exports = {
    profileValidation
}