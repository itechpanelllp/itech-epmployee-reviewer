const companyPath = require('@companyRouter/companiesPath')
const companyModel = require('@companyModel/editCompany/editEmployee')
const { userActivityLog, formatDateLocal, deleteImage } = require('@middleware/commonMiddleware');
const { checkPermissionEJS } = require('@middleware/checkPermission');
const now = new Date();
let uploadprofile = `employees/${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;
const bcrypt = require('bcrypt');
let img_url = process.env.IMG_BASE_URL;

// edit employee form view
const editEmployeeView = async (req, res) => {
    try {
        const { id } = req.params;
        const { empId } = req.params;

        const data = await companyModel.companyData(id);
        if (!data) {
            return res.redirect(`/${companyPath.COMPANIES_LIST_VIEW}`);
        }
        const employeeData = await companyModel.getEmployeeData(empId);
        if (!employeeData) {
            return res.redirect(`/${companyPath.COMPANIES_EMPLOYEES_VIEW + id}`);
        }
        const country = await companyModel.getCountry();
        const designation = await companyModel.getDesignation();
        const workingDays = await companyModel.getWorkingDays();

        const addPermission = await checkPermissionEJS('companies', 'update', req);
        if (employeeData?.dob) {
            employeeData.dob = formatDateLocal(employeeData.dob);
        }

        return res.render('companies/editCompany/addEmployee', {
            session: req.session,
            title: res.__("Edit Employee"),
            country,
            designation,
            workingDays,
            addPermission,
            employeeData,
            img_url,
            add_employees: companyPath.COMPANIES_EMPLOYEES_ADD_ACTION + id,
            get_state: companyPath.COMPANIES_STATE_ACTION,
            get_city: companyPath.COMPANIES_CITY_ACTION,
            employee_list: companyPath.COMPANIES_EMPLOYEES_VIEW + id,
            update_action: companyPath.COMPANIES_EMPLOYEES_UPDATE_ACTION + id + '/' + empId,
            update_documents_status: companyPath.COMPANIES_EMPLOYEES_UPDATE_DOCUMENTS_STATUS_ACTION + id + '/' + empId
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// upate employee
const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const employeeId  = req.params.empId;
        const { empId, firstName, lastName, email, PhoneNumber, dob, gender, password, status, salary, hoursRate, designation, otherDetails, workingDays, country, state, city, address, postalCode, bankName, accountNumber, accountHolder, accountType, ifscCode, branchName, employee = {}, panFileOld, removePanImg, aadhaarFrontOld, removeAadhaarFrontImg, aadhaarBackOld, removeAadhaarBackImg, employeeImageOld, removeemployeeImage } = req.body;

        const getImagePath = (key, oldPath, removeFlag) => {
            const file = req.files?.[key]?.[0];
            if (file) {
                if (oldPath) deleteImage(oldPath);
                return `${uploadprofile}/${file.filename}`;
            }
            if (removeFlag === '1' && oldPath) {
                deleteImage(oldPath);
                return '';
            }
            return oldPath;
        };

        const panPath = getImagePath('panFile', panFileOld, removePanImg);
        const aadharFrontPath = getImagePath('aadhaarFront', aadhaarFrontOld, removeAadhaarFrontImg);
        const aadharBackPath = getImagePath('aadhaarFront', aadhaarBackOld, removeAadhaarBackImg);
        const employeeImage = getImagePath('employeeImage', employeeImageOld, removeemployeeImage);

        // this is for get all documents
        const documents = await companyModel.getDocuments(employeeId);
        console.log(documents);
        
        const existingDocMap = Object.fromEntries(
            documents.map(doc => [doc.meta_key, (doc.meta_value || '').trim()])
        );


        const data = {
            emp_id: empId,
            first_name: firstName,
            last_name: lastName,
            email: email,
            phone_number: PhoneNumber,
            dob: dob,
            gender: gender,
            status: status,
            salary: salary,
            hours_rate: hoursRate,
            designation_id: designation,
            other_details: otherDetails,
            employee_image: employeeImage,
            ...(password && { password: await bcrypt.hash(password, 10) }),
        }
        const setKey = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const setValues = [...Object.values(data), employeeId];
        const updateResult = await companyModel.updateEmployee(setKey, setValues);


        // employee address
        const addressData = {
            country,
            state,
            city,
            address,
            postal_code: postalCode,
        }
        const setAddressKey = Object.keys(addressData).map(key => `${key} = ?`).join(', ');
        const setAddressValues = [...Object.values(addressData), employeeId];
        const updateAddressResult = await companyModel.updateAddress(setAddressKey, setAddressValues);


        //employee financial details
        const financialData = {
            bank_name: bankName || '',
            account_number: accountNumber || '',
            account_holder_name: accountHolder || '',
            account_type: accountType || '',
            ifsc_code: ifscCode || '',
            branch_name: branchName || '',

        }
        const setFinancialKey = Object.keys(financialData).map(key => `${key} = ?`).join(', ');
        const setFinancialValues = [...Object.values(financialData), employeeId];
        const updateFinancialResult = await companyModel.updateFinancial(setFinancialKey, setFinancialValues);


        // employee documents
        let docs = [];
        const insertedKeys = new Set();
        // PAN Docs
        const panNumber = (employee.panNumber || '').trim();
        if (panNumber && panNumber !== existingDocMap['panNumber']) docs.push({ key: 'panNumber', value: panNumber });
        if (panPath && panPath !== existingDocMap['panFile']) docs.push({ key: 'panFile', value: panPath, status: 'pending' });

        // adhaar Docs
        const aadhaarNumber = (employee.aadhaarNumber || '').trim();
        if (aadhaarNumber && aadhaarNumber !== existingDocMap['aadhaarNumber']) docs.push({ key: 'aadhaarNumber', value: aadhaarNumber });
        if (aadharFrontPath && aadharFrontPath !== existingDocMap['aadhaarFront']) docs.push({ key: 'aadhaarFront', value: aadharFrontPath, status: 'pending' });
        if (aadharBackPath && aadharBackPath !== existingDocMap['aadhaarBack']) docs.push({ key: 'aadhaarBack', value: aadharBackPath, status: 'pending' });

        for (const doc of docs) {
            await companyModel.updateOrInsertDocument(employeeId, doc.key, doc.value, doc.status);
            insertedKeys.add(doc.key);
        }
        // insert working days
        if (workingDays && workingDays.length > 0) {
            await companyModel.deleteWorkingDays(employeeId);
            for (const day of workingDays) {
                const data = {
                    employee_id: employeeId,
                    meta_key: 'workingDays',
                    meta_value: day
                }
                await companyModel.addEmployeeMetaData(data);
            }
        }

        await userActivityLog(req, req.session.userId, companyPath.COMPANIES_EMPLOYEES_ADD_ACTION + id, "Employee updated successfully", "Update");

        return res.status(200).json({ success: res.__("Employee updated successfully") });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}


module.exports = {
    editEmployeeView,
    updateEmployee

}