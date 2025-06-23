const companyPath = require('@companyRouter/companiesPath')
const companyModel = require('@companyModel/companiesList/companiesList')
const base_url = process.env.BASE_URL;
const { userActivityLog, formatted_date } = require('@middleware/commonMiddleware');
const { checkPermissionEJS } = require('@middleware/checkPermission');


// companies list view
const companiesList = async (req, res) => {
    try {
        const addPermission = await checkPermissionEJS('industry', 'add', req);
        res.render('companies/companiesList/companiesList', {
            title: res.__("Companies-list"),
            session: req.session,
            addPermission,
            add_company_view: companyPath.COMPANIES_ADD_VIEW,
            company_dataTable: companyPath.COMPANIES_DATATABLE_ACTION,
            company_list: companyPath.COMPANIES_LIST_VIEW,
            update_status: companyPath.COMPANIES_STATUS_UPDATE_ACTION
        })
    } catch (error) {
        return res.status(500).json({ error: error.message });

    }
}

// companies data table
const companiesDataTable = async (req, res) => {
    try {
        const { draw = 1, search, start = 0, length: limit = 10, order = [{ column: 0, dir: "DESC" }], columns } = req.body;
        const term = search?.value || "";
        const columnIndex = order[0]?.column || 0;
        const sort = columns[columnIndex]?.data || "id";
        const sortOrder = order[0]?.dir || "DESC";

        const where = term ? `1 = 1 AND (c.id LIKE '%${term}%' OR c.business_name LIKE '%${term}%' OR c.business_email LIKE '%${term}%' OR ct.name LIKE '%${term}%' OR cb.name LIKE '%${term}%' OR ci.name LIKE '%${term}%' OR c.status LIKE '%${term}%')` : `1 = 1`;
        // get role data
        let records = await companyModel.companiesDataTable(where, start, limit, sort, sortOrder);
      
        records = JSON.parse(JSON.stringify(records, (_, value) => (typeof value === "bigint" ? value.toString() : value)));
        const totalRecords = records?.[0]?.total || 0;
        // check permission
        const dltPer = await checkPermissionEJS('companies', 'delete', req);
        const updatPer = await checkPermissionEJS('companies', 'update', req);
        const dataArr = records.map((row) => {

              var status = updatPer ? `<div class="form-check form-switch form-switch-lg" dir="ltr"><input type="checkbox" class="form-check-input companystatus" data-status = ${row.status} row-id = ${row.id} id="companystatus" ${row.status == 'active' ? 'checked' : ''} ><label class="form-check-label" for="companystatus"></label></div>` : row.status == 'active' ? res.__("ACTIVE") : res.__("INACTIVE")
            const editBtn = `<a href="${base_url + companyPath.COMPANIES_EDIT_ACTION}${row.id}"><i class="font-size-18 fas fa-edit"></i></a>`;

            const dltBtn = dltPer ? `<button type="button" class="delete_company border-0 bg-transparent" data-url = "${companyPath.COMPANIES_DELETE_ACTION}" data-id="${row.id}"><i class="font-size-18 fas fa-trash" style="color:#d73328"></i></button>` : '-';
            return {
                id: row.id,
                name: ` <div> <div class="fw-semibold">${row.business_name}</div><div class="text-muted small">${row.business_email}</div> <div class="text-muted small">${row.company_type_name}</div></div> `,
                country: row.Regcountry,
                city: row.Regcity,
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
}

// update status

const updateCompanyStatus = async (req, res) => {
    try {
        // update status
        const result = await companyModel.updateCompanyStatus(req.body.id, req.body.status);

        // user activity 
        await userActivityLog(req, req.session.userId, companyPath.COMPANIES_LIST_VIEW, "Company status update successfully", "UPDATE");

        return res.status(200).json({ success: res.__("Company status update successfully"), });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// delete company
const deleteCompany = async (req, res) => {
    try {
        const { id } = req.params;


        // delete company
        const result = await companyModel.deleteCompany(id);

        // Log user activity
        if (result) {
            await userActivityLog(req, req.session.userId, companyPath.COMPANIES_DELETE_ACTION + id, "Company deleted successfully", "Delete");
        }
        return res.status(200).json({
            [result ? 'success' : 'error']: res.__(result ? 'Company deleted successfully' : 'Failed to delete company, please try again')
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

module.exports = {
    companiesList,
    companiesDataTable,
    deleteCompany,
    updateCompanyStatus

}