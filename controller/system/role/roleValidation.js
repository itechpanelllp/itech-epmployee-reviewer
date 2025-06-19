
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


const roleValidation = [
    body('roleName').notEmpty().withMessage((_, { req }) => req.__('Role name is required')),
  
    validationHandler
    
];


module.exports = {
    roleValidation
}