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
const companiesValidation = [
    body('businessName').notEmpty().withMessage((_, { req }) => req.__('Business name is required')),
    body('businessEmail').notEmpty().withMessage((_, { req }) => req.__('Business email is required')).bail().isEmail().withMessage(('Invalid email format')),
    body('businessType').notEmpty().withMessage((_, { req }) => req.__('Business type is required')),
    body('employeeStrength').notEmpty().withMessage((_, { req }) => req.__('Employee strength is required')),
    body('businessPhone').notEmpty().withMessage((_, { req }) => req.__('Business Phone number is required')).bail().matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9 (e.g., 9876543210)'),
    body('contactPersonName').notEmpty().withMessage((_, { req }) => req.__('Contact Person Name is required')),
    body('contactPersonEmail').notEmpty().withMessage((_, { req }) => req.__('Contact Person Email is required')).bail().isEmail().withMessage(('Invalid email format')), ,
    body('contactPersonPhone').notEmpty().withMessage((_, { req }) => req.__('Contact Person Phone is required')).bail().matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9 (e.g., 9876543210)'),
    body('country').notEmpty().withMessage((_, { req }) => req.__('Country is required')),
    body('state').notEmpty().withMessage((_, { req }) => req.__('State is required')),
    body('city').notEmpty().withMessage((_, { req }) => req.__('City is required')),
    body('address').notEmpty().withMessage((_, { req }) => req.__('Address is required')),
    body('postalCode').notEmpty().withMessage((_, { req }) => req.__('Postal Code is required')).bail().matches(/^[1-9][0-9]{5}$/).withMessage((_, { req }) => req.__('Please enter a valid 6-digit Postal Code')),
    body('operationalCountry').notEmpty().withMessage((_, { req }) => req.__('Operational Address Country is required')),
    body('operationalState').notEmpty().withMessage((_, { req }) => req.__('Operational Address State is required')),
    body('operationalCity').notEmpty().withMessage((_, { req }) => req.__('Operational Address City is required')),
    body('operationalAddress').notEmpty().withMessage((_, { req }) => req.__('Operational Address is required')),
    body('operationalPostalCode').notEmpty().withMessage((_, { req }) => req.__('Operational Address Postal Code is required')).bail().matches(/^[1-9][0-9]{5}$/).withMessage((_, { req }) => req.__('Please enter a valid 6-digit Operational Postal Code')), ,
    body('company[gstNumber]').notEmpty().withMessage((_, { req }) => req.__('GST Number is required')).matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).withMessage((_, { req }) => req.__('Invalid GST number format')),
    body('company[panNumber]').notEmpty().withMessage((_, { req }) => req.__('PAN Number is required')).matches(/^[A-Z]{5}[0-9]{4}[A-Z]$/).withMessage((_, { req }) => req.__('Invalid PAN number format')),
    body('businessWebsite').optional({ checkFalsy: true }).isURL({ require_protocol: true }).withMessage((_, { req }) => req.__('Please enter a valid website URL format')),

    validationHandler
];



module.exports = {
    companiesValidation

};
