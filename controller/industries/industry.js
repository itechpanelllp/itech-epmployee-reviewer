
const { userActivityLog, slug } = require('@middleware/commonMiddleware');
const industryPath = require('@industryRouter/industryPath');
const industryModel = require('@industryModel/industries');
const { checkPermissionEJS } = require('@middleware/checkPermission');
const slugify = require('slugify');

// show industry list
const industryList = async (req, res) => {
    try {
        const addPermission = await checkPermissionEJS('industry', 'add', req);
        const updatePermission = await checkPermissionEJS('industry', 'update', req);
        const dltPermission = await checkPermissionEJS('industry', 'delete', req);

        res.render('industries/industry-list', {
            title: res.__("Industries-list"),
            session: req.session,
            addPermission,
            updatePermission,
            dltPermission,
            industry_dataTable_url: industryPath.INDUSTRY_DATATABLE_ACTION_URL,
            industry_add_url: industryPath.INDUSTRY_ADD_ACTION_URL,
            industry_status_url: industryPath.INDUSTRY_STATUS_UPDATE_URL,
            industry_edit_url: industryPath.INDUSTRY_EDIT_ACTION_URL,
            industry_delete_url: industryPath.INDUSTRY_DELETE_ACTION_URL,
        })
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// show industry dataTable
const industryDataTable = async (req, res) => {
    try {
        const { draw = 1, search, start = 0, length: limit = 10, order = [{ column: 0, dir: "DESC" }], columns } = req.body;
        const term = search?.value || "";
        const columnIndex = order[0]?.column || 0;
        const sort = columns[columnIndex]?.data || "id";
        const sortOrder = order[0]?.dir || "DESC";
        const where = term ? `1=1 AND (i.id LIKE '%${term}%' OR info.name LIKE '%${term}%' OR i.status LIKE '%${term}%')` : `1=1`;

        var records = await industryModel.industryDataTable(where, start, limit, sort, sortOrder);

        records = JSON.parse(JSON.stringify(records, (_, value) => (typeof value === "bigint" ? value.toString() : value)));
        var total_records = records != '' ? records[0].total : 0;

        // check permission
        const updatePer = await checkPermissionEJS('industry', 'update', req);
        const deletePer = await checkPermissionEJS('industry', 'delete', req);
        var data_arr = [];
        if (records.length > 0) {
            for (i = 0; i < records.length; i++) {
                var row = records[i];

                var status = updatePer ? `<div class="form-check form-switch form-switch-lg" dir="ltr"><input type="checkbox" class="form-check-input industries-status" data-status = ${row.status} row-id = ${row.id} id="industry-status" ${row.status == 'active' ? 'checked' : ''} ><label class="form-check-label" for="industries-status"></label></div>` : row.status == 'active' ? res.__("ACTIVE") : res.__("INACTIVE")

                var editBtn = updatePer ? `<button type="button" class="border-0 bg-transparent editIndustry" row-id = ${row.id} data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight" aria-controls="offcanvasRight" style="color: #5156be !important;"><i class="font-size-18 fas fa-edit"></i></button>` : '-';

                var deleteBtn = deletePer ? `<button type="button" class="delete_industries border-0 bg-transparent deleteIndustry" data-url = ${industryPath.INDUSTRY_DELETE_ACTION_URL} data-id = ${row.id}><i class="font-size-18 fas fa-trash" style="color:#d73328"></i></button>` : '';

                var actionBtn = `${editBtn}${deleteBtn}`;
                data_arr.push({
                    id: row.id,
                    name: row.name,
                    status: status,
                    action: `<div class="d-flex items-center gap-3 cursor-pointer">${actionBtn || '-'}</div>`,
                });
            }
        }

        var data = {
            'draw': draw,
            'recordsTotal': total_records,
            'recordsFiltered': total_records,
            'data': data_arr
        };

        res.json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// update industry status
const updateIndustryStatus = async (req, res) => {
    try {
        // update status
        const result = await industryModel.updateIndustryStatus(req.body.id, req.body.status);

        // user activity 
        await userActivityLog(req, req.session.userId, industryPath.INDUSTRY_LIST_VIEW_PAGE, "Industry status update successfully", "UPDATE");

        return res.status(200).json({ success: res.__("Industry status update successfully"), });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// add industry
const addIndustry = async (req, res) => {
    try {
        const { name, status } = req.body;
        const result = await industryModel.checkIndustry(name);
        if (result) return res.status(200).json({ error: res.__("Industry name already exits") });

        let baseSlug = slugify(name, { lower: true, strict: true });

        let finalSlug = baseSlug, count = 1;

        if (slug) {
            const data = await industryModel.checkIndustry(finalSlug)
            if (data) return res.status(200).json({ error: res.__('Slug must be unique. This slug already exists.') })
        }


        while (await industryModel.checkSlug(finalSlug)) {
            finalSlug = `${baseSlug}-${count++}`;
        }
        // insert industry
        const industryId = await industryModel.addIndustry(finalSlug, status);

        // insert industry meta
        const metaData = {
            industry_id: industryId,
            name,
        }
        const metaResult = await industryModel.addIndustryInfo(metaData);
        if (industryId && metaResult) {
            // user activity
            await userActivityLog(req, req.session.userId, industryPath.INDUSTRY_LIST_VIEW_PAGE, "Industry added successfully", "ADD");
            return res.status(200).json({ success: res.__("Industry added successfully") });
        }
        return res.status(200).json({ error: res.__("") });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// edit idustry
const editIndustry = async (req, res) => {
    try {
        const result = await industryModel.getIndustryData(req.body.id);
        const updatePer = await checkPermissionEJS('industries', 'update', req);

        if (!result) return res.status(200).json({ error: res.__("Industry not exits, please try again") });
        return res.status(200).json({ result: result, update_url: industryPath.INDUSTRY_UPDATE_ACTION_URL + req.body.id, updatePer: updatePer });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// update industry
const updateIndustry = async (req, res) => {
    try {

        const { name, status } = req.body;
        const result = await industryModel.getIndustryData(req.params.id);
        if (!result) return res.status(200).json({ error: res.__("Industry not exits") });

        const data = await industryModel.updateIndustry(name, status, req.params.id);

        if (data) {
            // user activity
            await userActivityLog(req, req.session.userId, industryPath.INDUSTRY_LIST_VIEW_PAGE, "Industry updated successfully", "UPDATE");
            return res.status(200).json({ success: res.__("Industry updated successfully") });
        }
        return res.status(200).json({ error: res.__("Technical issue update industry, please try again") });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// delete industry
const deleteIndustry = async (req, res) => {
    const result = await industryModel.getIndustryData(req.params.id);
    if (!result) return res.status(200).json({ error: res.__("Industry not exits") });
    const data = await industryModel.deleteIndustry(req.params.id);
    if (!data) return res.status(200).json({ error: res.__("Technical issue delete industry, please try again") });
    await userActivityLog(req, req.session.userId, industryPath.INDUSTRY_DELETE_ACTION_URL + req.params.id, "Industry delete successfully", "Delete");
    return res.status(200).json({ success: res.__("Industry delete successfully") });
}








module.exports = {
    industryList,
    industryDataTable,
    updateIndustryStatus,
    addIndustry,
    editIndustry,
    updateIndustry,
    deleteIndustry
}

