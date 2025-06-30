const companyPath = require('@companyRouter/companiesPath')
const companyModel = require('@companyModel/editCompany/employeeList')
const { userActivityLog } = require('@middleware/commonMiddleware');
const { checkPermissionEJS } = require('@middleware/checkPermission');
const base_url = process.env.BASE_URL;


// employees list view page
const employeesListView = async (req, res) => {
    try {
        let id = req.params.id;
        const data = await companyModel.companyData(id);
        if (!data) {
            return res.redirect(`/${companyPath.COMPANIES_LIST_VIEW}`);
        }
        const urls = {
            business_info: companyPath.COMPANIES_EDIT_VIEW + id,
            contact_info: companyPath.COMPANIES_CONTACT_INFO_VIEW + id,
            address: companyPath.COMPANIES_ADDRESS_VIEW + id,
            employees: companyPath.COMPANIES_EMPLOYEES_VIEW + id,
            password: companyPath.COMPANIES_PASSWORD_VIEW + id,
        };
        data.update_action = companyPath.COMPANIES_APPROVAL_STATUS_UPDATE_ACTION;
        const updatePer = await checkPermissionEJS('companies', 'update', req);
       
        res.render('companies/editCompany/employeesList', {
            title: res.__("Employee details"),
            session: req.session,
            updatePer,
            urls,
            data,
            update_employee_status: companyPath.COMPANIES_EMPLOYEES_STATUS_UPDATE_ACTION + id,
            employees_dataTable: companyPath.COMPANIES_EMPLOYEES_DATA_TABLE_ACTION + id,
            add_employees: companyPath.COMPANIES_EMPLOYEES_ADD_VIEW + id,
            currentPage: 'employees',

        })
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// employee data table
const employeesDataTable = async (req, res) => {
    try {
        let id = req.params.id;
        const { draw = 1, search, start = 0, length: limit = 10, order = [{ column: 0, dir: "DESC" }], columns } = req.body;
        const term = search?.value || "";
        const columnIndex = order[0]?.column || 0;
        const sort = columns[columnIndex]?.data || "id";
        const sortOrder = order[0]?.dir || "DESC";

        const where = term ? `1 = 1 AND (e.id LIKE '%${term}%' OR CONCAT(e.first_name, ' ', e.last_name) LIKE '%${term}%'  OR e.first_name LIKE '%${term}%' OR e.last_name LIKE '%${term}%' OR e.email LIKE '%${term}%' OR d.title LIKE '%${term}%' OR c.name LIKE '%${term}%' OR st.name LIKE '%${term}%' OR ci.name LIKE '%${term}%' OR e.status LIKE '%${term}%')` : `1 = 1`;
        // get role data
        let records = await companyModel.companiesDataTable(where, start, limit, sort, sortOrder);

        records = JSON.parse(JSON.stringify(records, (_, value) => (typeof value === "bigint" ? value.toString() : value)));
        const totalRecords = records?.[0]?.total || 0;
        // check permission
        const dltPer = await checkPermissionEJS('companies', 'delete', req);
        const updatPer = await checkPermissionEJS('companies', 'update', req);
        const dataArr = records.map((row) => {

            var status = updatPer ? `<div class="form-check form-switch form-switch-lg" dir="ltr"><input type="checkbox" class="form-check-input employeesStatus" data-status = ${row.status} row-id = ${row.id} id="employeesStatus_${row.id}" ${row.status == 'active' ? 'checked' : ''} ><label class="form-check-label" for="companystatus_${row.id}"></label></div>` : row.status == 'active' ? res.__("ACTIVE") : res.__("INACTIVE")
            const editBtn = `<a href="${base_url + companyPath.COMPANIES_EMPLOYEES_EDIT_VIEW}${id}/${row.id}"><i class="font-size-18 fas fa-edit"></i></a>`;

            const dltBtn = dltPer ? `<button type="button" class="delete_employee border-0 bg-transparent" data-url = "${companyPath.COMPANIES_EMPLOYEES_DELETE_ACTION}" data-id="${row.id}"><i class="font-size-18 fas fa-trash" style="color:#d73328"></i></button>` : '-';
            return {
                id: row.id,
                first_name: ` <div> <div class="fw-semibold">${row.first_name} ${row.last_name ? row.last_name : ''}</div><div class="text-muted small">${row.email}</div> <div class="text-muted small">${row.designation}</div></div> `,
                country: row.countryName,
                state: row.stateName,
                city: row.cityName,
                status: status,
                action: `<div class="d-flex items-center gap-3 cursor-pointer">${editBtn}${dltBtn}</div>`,

            };
        });

        res.json({
            draw,
            recordsTotal: totalRecords,
            recordsFiltered: totalRecords,
            data: dataArr,
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// update employee status
const updateEmployeeStatus = async (req, res) => {
    try {
        // update status
        const result = await companyModel.updateEmployeeStatus(req.body.id, req.body.status);

        // user activity 
        await userActivityLog(req, req.session.userId, companyPath.COMPANIES_EMPLOYEES_STATUS_UPDATE_ACTION + req.body.id, "Employee status update successfully", "UPDATE");

        return res.status(200).json({ success: res.__("Employee status update successfully"), });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// delete employee
const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await companyModel.deleteEmployee(id);
        if (result) {
            // user activity
            await userActivityLog(req, req.session.userId, companyPath.COMPANIES_DELETE_ACTION + id, "Employee deleted successfully", "Delete");
        }
        return res.status(200).json({
            [result ? 'success' : 'error']: res.__(result ? 'Employee deleted successfully' : 'Failed to delete employee, please try again')
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}



module.exports = {
    employeesListView,
    employeesDataTable,
    updateEmployeeStatus,
    deleteEmployee
}
