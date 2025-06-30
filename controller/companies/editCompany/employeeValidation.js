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
// Validation rules
const employeeValidation = [
    body('empId').notEmpty().withMessage((_, { req }) => req.__('Employee ID is required')),
    body('firstName').notEmpty().withMessage((_, { req }) => req.__('First name is required')),
    body('email').isEmail().withMessage((_, { req }) => req.__('Email address is required')).bail().isEmail().withMessage(('Invalid email format')),
    body('PhoneNumber').notEmpty().withMessage((_, { req }) => req.__('Phone number is required')).bail().matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9 (e.g., 9876543210)'),
    body('dob').notEmpty().withMessage((_, { req }) => req.__('Date of birth is required')),
    body('gender').notEmpty().withMessage((_, { req }) => req.__('Gender is required')),
    body('status').notEmpty().withMessage((_, { req }) => req.__('Status is required')),
    body('salary').notEmpty().withMessage((_, { req }) => req.__('Salary is required')),
    body('hoursRate').notEmpty().withMessage((_, { req }) => req.__('Hours Rate is required')),
    body('designation').notEmpty().withMessage((_, { req }) => req.__('Designation is required')),
    body('workingDays').notEmpty().withMessage((_, { req }) => req.__('Working days is required')),
    body('otherDetails').notEmpty().withMessage((_, { req }) => req.__('Employee other details is required')),
    body('country').notEmpty().withMessage((_, { req }) => req.__('Country is required')),
    requiredUnlessHidden('state', 'State is required'),
    requiredUnlessHidden('city', 'City is required'),
    body('address').notEmpty().withMessage((_, { req }) => req.__('Address is required')),
    body('postalCode').notEmpty().withMessage((_, { req }) => req.__('Postal Code is required')),
    body('employee[panNumber]').notEmpty().withMessage((_, { req }) => req.__('Pan Number is required')).bail().matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).withMessage((_, { req }) => req.__('Invalid PAN number format')),
    body('panFile').custom((value, { req }) => { if (!req.files || !req.files.panFile) { throw new Error(req.__('PAN Document is required')); } return true; }),
    body('employee[aadhaarNumber]').notEmpty().withMessage((_, { req }) => req.__('Aadhaar Number is required')).bail().matches(/^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/).withMessage((_, { req }) => req.__('Invalid Aadhaar number format')),
    body('aadhaarFront').custom((value, { req }) => { if (!req.files || !req.files.panFile) { throw new Error(req.__('Aadhaar Front is required')); } return true; }),
    body('aadhaarBack').custom((value, { req }) => { if (!req.files || !req.files.panFile) { throw new Error(req.__('Aadhaar Back is required')); } return true; }),
    validationHandler
]
const employeeUpdateValidation = [
    body('empId').notEmpty().withMessage((_, { req }) => req.__('Employee ID is required')),
    body('firstName').notEmpty().withMessage((_, { req }) => req.__('First name is required')),
    body('email').isEmail().withMessage((_, { req }) => req.__('Email address is required')).bail().isEmail().withMessage(('Invalid email format')),
    body('PhoneNumber').notEmpty().withMessage((_, { req }) => req.__('Phone number is required')).bail().matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9 (e.g., 9876543210)'),
    body('dob').notEmpty().withMessage((_, { req }) => req.__('Date of birth is required')),
    body('gender').notEmpty().withMessage((_, { req }) => req.__('Gender is required')),
    body('status').notEmpty().withMessage((_, { req }) => req.__('Status is required')),
    body('salary').notEmpty().withMessage((_, { req }) => req.__('Salary is required')),
    body('hoursRate').notEmpty().withMessage((_, { req }) => req.__('Hours Rate is required')),
    body('designation').notEmpty().withMessage((_, { req }) => req.__('Designation is required')),
    body('workingDays').notEmpty().withMessage((_, { req }) => req.__('Working days is required')),
    body('otherDetails').notEmpty().withMessage((_, { req }) => req.__('Employee other details is required')),
    body('country').notEmpty().withMessage((_, { req }) => req.__('Country is required')),
    requiredUnlessHidden('state', 'State is required'),
    requiredUnlessHidden('city', 'City is required'),
    body('address').notEmpty().withMessage((_, { req }) => req.__('Address is required')),
    body('postalCode').notEmpty().withMessage((_, { req }) => req.__('Postal Code is required')),
    body('employee[panNumber]').notEmpty().withMessage((_, { req }) => req.__('Pan Number is required')).bail().matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).withMessage((_, { req }) => req.__('Invalid PAN number format')),
    body('panFile').custom((_, { req }) => { const removed = req.body.removePanImg == '1'; const hasNew = req.files?.panFile; if (removed && !hasNew) throw new Error(req.__('PAN Document is required')); return true; }),
    body('employee[aadhaarNumber]').notEmpty().withMessage((_, { req }) => req.__('Aadhaar Number is required')).bail().matches(/^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/).withMessage((_, { req }) => req.__('Invalid Aadhaar number format')),
    body('aadhaarFront').custom((_, { req }) => { const removed = req.body.removeAadhaarFront == '1'; const hasNew = req.files?.aadhaarFront; if (removed && !hasNew) { throw new Error(req.__('Aadhaar Front is required')); } return true; }),
    body('aadhaarBack').custom((_, { req }) => { const removed = req.body.removeAadhaarBack == '1'; const hasNew = req.files?.aadhaarBack; if (removed && !hasNew) { throw new Error(req.__('Aadhaar Back is required')); } return true; }),
    validationHandler
]



module.exports = {
    employeeValidation,
    employeeUpdateValidation

};
