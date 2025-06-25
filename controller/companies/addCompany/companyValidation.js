const { body, validationResult } = require('express-validator');
//error handler
const validationHandler = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorResponse = errors.array().reduce((acc, { path, msg }) => {
            const normalizedPath = path.replace(/[\[\]\.]/g, '_');
            acc[normalizedPath] = msg;
            return acc;
        }, {});
        return res.status(200).json({ errors: errorResponse });
    }
    next();
};


const requiredUnlessHidden = (field, msg) => body(field)
    .custom((val, { req }) => {
        const hiddenFields = (req.body.hiddenFields || '').split(',');
        if (hiddenFields.includes(field)) return true;
        return val && val.trim() !== '';
    })
    .withMessage((_, { req }) => req.__(msg));

// Validation rules
const companiesValidation = [
    body('businessName').notEmpty().withMessage((_, { req }) => req.__('Business name is required')),
    body('businessEmail').notEmpty().withMessage((_, { req }) => req.__('Business email is required')).bail().isEmail().withMessage(('Invalid email format')),
    body('businessType').notEmpty().withMessage((_, { req }) => req.__('Business type is required')),
    body('password').notEmpty().withMessage((_, { req }) => req.__('Password is required')),
    body('companyStatus').notEmpty().withMessage((_, { req }) => req.__('Business status is required')),
    body('employeeStrength').notEmpty().withMessage((_, { req }) => req.__('Employee strength is required')),
    body('businessPhone').notEmpty().withMessage((_, { req }) => req.__('Business Phone number is required')).bail().matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9 (e.g., 9876543210)'),
    body('contactPersonName').notEmpty().withMessage((_, { req }) => req.__('Contact Person Name is required')),
    body('contactPersonEmail').notEmpty().withMessage((_, { req }) => req.__('Contact Person Email is required')).bail().isEmail().withMessage(('Invalid email format')), ,
    body('contactPersonPhone').notEmpty().withMessage((_, { req }) => req.__('Contact Person Phone is required')).bail().matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9 (e.g., 9876543210)'),
    body('country').notEmpty().withMessage((_, { req }) => req.__('Country is required')),
    requiredUnlessHidden('state', 'State is required'),
    requiredUnlessHidden('city', 'City is required'),
    body('address').notEmpty().withMessage((_, { req }) => req.__('Address is required')),
    body('postalCode').notEmpty().withMessage((_, { req }) => req.__('Postal Code is required')).bail().matches(/^[1-9][0-9]{5}$/).withMessage((_, { req }) => req.__('Please enter a valid 6-digit Postal Code')),
    body('operationalCountry').notEmpty().withMessage((_, { req }) => req.__('Operational Address Country is required')),
    requiredUnlessHidden('operationalState', 'Operational State is required'),
    requiredUnlessHidden('operationalCity', 'Operational City is required'),
    body('operationalAddress').notEmpty().withMessage((_, { req }) => req.__('Operational Address is required')),
    body('operationalPostalCode').notEmpty().withMessage((_, { req }) => req.__('Operational Address Postal Code is required')).bail().matches(/^[1-9][0-9]{5}$/).withMessage((_, { req }) => req.__('Please enter a valid 6-digit Operational Postal Code')),
    body('company[gstNumber]').if((value, { req }) => req.body.company?.gstCheck).notEmpty().withMessage((_, { req }) => req.__('GST Number is required')).bail().matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).withMessage((_, { req }) => req.__('Invalid GST number format')),
    body('gstFile').if((value, { req }) => req.body.company?.gstCheck).custom((value, { req }) => { if (!req.files || !req.files.gstFile) { throw new Error(req.__('GST Document is required')); } return true; }),
    body('company[panNumber]').notEmpty().withMessage((_, { req }) => req.__('PAN Number is required')).bail().matches(/^[A-Z]{5}[0-9]{4}[A-Z]$/).withMessage((_, { req }) => req.__('Invalid PAN number format')),
    body('panFile').custom((value, { req }) => { if (!req.files || !req.files.panFile) { throw new Error(req.__('PAN Document is required')); } return true; }),
    //    body('aadhaarFront').custom((value, { req }) => { if (!req.files || !req.files.aadhaarFront) { throw new Error(req.__('Aadhaar Front Document is required')); } return true; }),
    //    body('aadhaarBack').custom((value, { req }) => { if (!req.files || !req.files.aadhaarBack) { throw new Error(req.__('Aadhaar Back Document is required')); } return true; }),
    body('businessWebsite').optional({ checkFalsy: true }).isURL({ require_protocol: true }).withMessage((_, { req }) => req.__('Please enter a valid website URL format')),
    body('company[govermentDoc]').notEmpty().withMessage((_, { req }) => req.__('Goverment Document is required')),

    validationHandler
];

const updateCompany = [
    body('businessName').notEmpty().withMessage((_, { req }) => req.__('Business name is required')),
    body('businessEmail').notEmpty().withMessage((_, { req }) => req.__('Business email is required')).bail().isEmail().withMessage(('Invalid email format')),
    body('businessType').notEmpty().withMessage((_, { req }) => req.__('Business type is required')),
    body('companyStatus').notEmpty().withMessage((_, { req }) => req.__('Business status is required')),
    body('employeeStrength').notEmpty().withMessage((_, { req }) => req.__('Employee strength is required')),
    body('businessPhone').notEmpty().withMessage((_, { req }) => req.__('Business Phone number is required')).bail().matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9 (e.g., 9876543210)'),
    body('businessWebsite').optional({ checkFalsy: true }).isURL({ require_protocol: true }).withMessage((_, { req }) => req.__('Please enter a valid website URL format')),
    validationHandler
]
const updateContact = [
    body('contactPersonName').notEmpty().withMessage((_, { req }) => req.__('Contact Person Name is required')),
    body('contactPersonEmail').notEmpty().withMessage((_, { req }) => req.__('Contact Person Email is required')).bail().isEmail().withMessage(('Invalid email format')), ,
    body('contactPersonPhone').notEmpty().withMessage((_, { req }) => req.__('Contact Person Phone is required')).bail().matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9 (e.g., 9876543210)'),
    validationHandler
]

const updateAddress = [
    body('country').notEmpty().withMessage((_, { req }) => req.__('Country is required')),
    requiredUnlessHidden('state', 'State is required'),
    requiredUnlessHidden('city', 'City is required'),
    body('address').notEmpty().withMessage((_, { req }) => req.__('Address is required')),
    body('postalCode').notEmpty().withMessage((_, { req }) => req.__('Postal Code is required')).bail().matches(/^[1-9][0-9]{5}$/).withMessage((_, { req }) => req.__('Please enter a valid 6-digit Postal Code')),
    body('operationalCountry').notEmpty().withMessage((_, { req }) => req.__('Operational Address Country is required')),
    requiredUnlessHidden('operationalState', 'Operational State is required'),
    requiredUnlessHidden('operationalCity', 'Operational City is required'),
    body('operationalAddress').notEmpty().withMessage((_, { req }) => req.__('Operational Address is required')),
    body('operationalPostalCode').notEmpty().withMessage((_, { req }) => req.__('Operational Address Postal Code is required')).bail().matches(/^[1-9][0-9]{5}$/).withMessage((_, { req }) => req.__('Please enter a valid 6-digit Operational Postal Code')),
    validationHandler
]

const updateDocuments = [
    body('company[gstNumber]').notEmpty().withMessage((_, { req }) => req.__('GST Number is required')).bail().matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).withMessage((_, { req }) => req.__('Invalid GST number format')),
    body('company[panNumber]').notEmpty().withMessage((_, { req }) => req.__('PAN Number is required')).bail().matches(/^[A-Z]{5}[0-9]{4}[A-Z]$/).withMessage((_, { req }) => req.__('Invalid PAN number format')),
    validationHandler
]
const updatePassword = [
    body('password').notEmpty().withMessage((_, { req }) => req.__('Password is required')),
    body('confirmPassword').notEmpty().withMessage((_, { req }) => req.__('Confirm Password is required')),
    validationHandler
]



module.exports = {
    companiesValidation,
    updateCompany,
    updateContact,
    updateAddress,
    updateDocuments,
    updatePassword

};
