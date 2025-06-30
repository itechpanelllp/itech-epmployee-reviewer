const companyPath = require('@companyRouter/companiesPath')
const companyModel = require('@companyModel/editCompany/addEmployee')
const { userActivityLog } = require('@middleware/commonMiddleware');
const { checkPermissionEJS } = require('@middleware/checkPermission');
const now = new Date();
let uploadprofile = `employees/${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;
const bcrypt = require('bcrypt');

// add employee form view
const addEmployeeView = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await companyModel.companyData(id);
        if (!data) {
            return res.redirect(`/${companyPath.COMPANIES_LIST_VIEW}`);
        }
        const country = await companyModel.getCountry();
        const designation = await companyModel.getDesignation();
        const workingDays = await companyModel.getWorkingDays();

        const addPermission = await checkPermissionEJS('companies', 'update', req);
        return res.render('companies/editCompany/addEmployee', {
            session: req.session,
            title: res.__("Add Employee"),
            country,
            designation,
            workingDays,
            addPermission,
            add_employees: companyPath.COMPANIES_EMPLOYEES_ADD_ACTION + id,
            get_state: companyPath.COMPANIES_STATE_ACTION,
            get_city: companyPath.COMPANIES_CITY_ACTION,
            employee_list: companyPath.COMPANIES_EMPLOYEES_VIEW + id,
            update_action:'',
            employeeData:'',
            update_documents_status:''
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// add employee
const addEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const { empId, firstName, lastName, email, PhoneNumber, dob, gender, password, status, salary, hoursRate, designation, otherDetails, workingDays, country, state, city, address, postalCode, bankName, accountNumber, accountHolder, accountType, ifscCode, branchName, employee = {} } = req.body;

        const getFile = key => req.files?.[key]?.[0]?.filename || '';
        const employeeImage = getFile('employeeImage');

        // check email exist
        const checkEmail = await companyModel.checkEmployee(email);
        if (checkEmail) {
            return res.status(200).json({ error: res.__("Email already exist") });
        }

        const data = {
            emp_id: empId,
            first_name: firstName,
            last_name: lastName,
            email: email,
            phone_number: PhoneNumber,
            dob: dob,
            gender: gender,
            password: await bcrypt.hash(password, 10),
            status: status,
            salary: salary,
            hours_rate: hoursRate,
            designation_id: designation,
            other_details: otherDetails,
            employee_image: employeeImage ? `${uploadprofile}/${employeeImage}` : '',
        }
        // add employee
        const employeeId = await companyModel.addEmployee(data);
        if (!employeeId) {
            return res.status(200).json({ error: res.__('Failed to add employee, please try again') });
        }

        // employee address
        const addressData = {
            employee_id: employeeId,
            country,
            state,
            city,
            address,
            postal_code: postalCode,
        }
        const resultAddress = await companyModel.addEmployeeAddress(addressData);

        //employee financial details
        const financialData = {
            employee_id: employeeId,
            bank_name: bankName || '',
            account_number: accountNumber || '',
            account_holder_name: accountHolder || '',
            account_type: accountType || '',
            ifsc_code: ifscCode || '',
            branch_name: branchName || '',

        }
        const hasFinancialInfo = bankName || accountNumber || accountHolder || accountType || ifscCode || branchName;
        if (hasFinancialInfo) {
            const resultFinancial = await companyModel.addEmployeeFinancial(financialData);
        }

        // employee documents
        const docs = [
            { key: 'panNumber', value: employee.panNumber, file: '', fileKey: '' },
            { key: 'panFile', value: '', file: getFile('panFile'), fileKey: 'panFile' },
            { key: 'aadhaarNumber', value: employee.aadhaarNumber, file: '', fileKey: '' },
            { key: 'aadhaarFront', value: '', file: getFile('aadhaarFront'), fileKey: 'aadhaarFront' },
            { key: 'aadhaarBack', value: '', file: getFile('aadhaarBack'), fileKey: 'aadhaarBack' },

        ];

        for (const doc of docs) {
            if (doc.value) {
                await companyModel.addDocument({
                    employee_id: employeeId,
                    meta_key: doc.key,
                    meta_value: doc.value
                });
            }
            if (doc.file) {
                await companyModel.addDocument({
                    employee_id: employeeId,
                    meta_key: doc.fileKey || `${doc.key}File`,
                    meta_value: `${uploadprofile}/${doc.file}`
                });
            }

        }

        // insert working days
        if (workingDays && workingDays.length > 0) {
            for (const day of workingDays) {
                const data = {
                    employee_id: employeeId,
                    meta_key: 'workingDays',
                    meta_value: day
                }
                await companyModel.addEmployeeMetaData(data);
            }
        }

        await userActivityLog(req, req.session.userId, companyPath.COMPANIES_EMPLOYEES_ADD_ACTION + id, "Employee added successfully", "Add");

        return res.status(200).json({ success: res.__("Employee added successfully") });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}


module.exports = {
    addEmployeeView,
    addEmployee
}