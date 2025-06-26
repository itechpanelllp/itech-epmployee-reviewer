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
    }).withMessage((_, { req }) => req.__(msg));
// Custom validator for dynamic documents
const validateDynamicDocs = (value, { req }) => {
    const metadataRaw = req.body.selectedDocMeta;
    if (!metadataRaw) throw new Error(req.__('Missing document metadata'));

    let docMeta;
    try {
        docMeta = JSON.parse(metadataRaw);
    } catch (e) {
        throw new Error(req.__('Invalid document metadata format'));
    }

    const { docName, docLabel, docType, side } = docMeta;
    if (!docName || !docLabel || !side) {
        throw new Error(req.__('Incomplete document metadata'));
    }

    const numberField = req.body.company?.[docName];

    if (!numberField || numberField.trim() === '') {
        const error = new Error(req.__(`${docLabel} number is required`));
        error.path = `company_${docName}`;
        throw error;
    }

    ['front', 'back'].forEach(fileSide => {
        if (side === fileSide || side === 'both') {
            const fieldKey = `${docType.charAt(0).toLowerCase() + docType.slice(1)}_${fileSide}`;
            const fileExists = req.files?.[fieldKey];
            if (!fileExists) {
                const fileError = new Error(req.__(`${docLabel} (${fileSide}) document is required`));
                // 🔥 Set the proper path for file-side errors
                fileError.path = fieldKey;
                throw fileError;
            }
        }
    });

    return true;
};



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

    body('businessWebsite').optional({ checkFalsy: true }).isURL({ require_protocol: true }).withMessage((_, { req }) => req.__('Please enter a valid website URL format')),
    body('company[govermentDoc]').notEmpty().withMessage((_, { req }) => req.__('Goverment Document is required')),
    //  body().custom(validateDynamicDocs),
    body('companyLogo').optional().custom((value, { req }) => {
        if (req.files?.companyLogo) {
            const logo = req.files.companyLogo[0];
            if (!['image/jpeg', 'image/jpg', 'image/png'].includes(logo.mimetype)) {
                throw new Error(req.__('Company logo must be a JPEG or PNG image'));
            }
        }
        return true;
    }),
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
    body('company[gstNumber]').if((value, { req }) => req.body.company?.gstCheck).notEmpty().withMessage((_, { req }) => req.__('GST Number is required')).bail().matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).withMessage((_, { req }) => req.__('Invalid GST number format')),
    body('gstFile').if((value, { req }) => req.body.company?.gstCheck).custom((value, { req }) => { if (!req.files || !req.files.gstFile) { throw new Error(req.__('GST Document is required')); } return true; }),
    body('company[panNumber]').notEmpty().withMessage((_, { req }) => req.__('PAN Number is required')).bail().matches(/^[A-Z]{5}[0-9]{4}[A-Z]$/).withMessage((_, { req }) => req.__('Invalid PAN number format')),
    body('panFile').custom((value, { req }) => { if (!req.files || !req.files.panFile) { throw new Error(req.__('PAN Document is required')); } return true; }),
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
