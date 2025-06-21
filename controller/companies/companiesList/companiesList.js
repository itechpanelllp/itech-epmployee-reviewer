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

        const where = term ? `1 = 1 AND (id LIKE '%${term}%' OR name LIKE '%${term}%' OR status LIKE '%${term}%')` : `1 = 1`;
        // get role data
        let records = await companyModel.companiesDataTable(where, start, limit, sort, sortOrder);

        records = JSON.parse(JSON.stringify(records, (_, value) => (typeof value === "bigint" ? value.toString() : value)));
        const totalRecords = records?.[0]?.total || 0;
        // check permission

        const dataArr = records.map((row) => {
            
            const editBtn = `<a href="${base_url + companyPath.COMPANIES_EDIT_ACTION}${row.id}"><i class="font-size-18 fas fa-edit"></i></a>`;

            const dltBtn = `<button type="button" class="delete_company border-0 bg-transparent" data-url = "${companyPath.COMPANIES_DELETE_ACTION}" data-id="${row.id}"><i class="font-size-18 fas fa-trash" style="color:#d73328"></i></button>`;
            return {
                name: row.name,
                
                created_at: formatted_date(row.created_at),
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

// delete company
const deleteCompany = async (req, res) => {
    try {
        const { id } = req.params;

        // delete role
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
   
}