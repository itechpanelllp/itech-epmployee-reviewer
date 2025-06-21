const express = require('express');
const app = express.Router();
const { userActivityLog } = require('@middleware/commonMiddleware');
const industryPath = require('@industryRouter/industriesPath');
const industryModel = require('@industryModel/industries');
const { checkPermissionEJS } = require('@middleware/permissionCheck');
const { slug } = require('@middleware/common_middleware');

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
            industry_bulk_act_url: industryPath.INDUSTRY_BULK_ACTION_URL,
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
    const where = term ? `1=1 AND (ci.id LIKE '%${term}%' OR cim.name LIKE '%${term}%' OR cim.status LIKE '%${term}%')` : `1=1`;

    var records = await industryModel.industryDataTable(where, start, limit, sort, sortOrder);

    records = JSON.parse(JSON.stringify(records, (_, value) => (typeof value === "bigint" ? value.toString() : value)));
    var total_records = records != '' ? records[0].total : 0;

    // check permission
    const updatePer = await checkPermissionEJS('industries', 'update', req);
    const deletePer = await checkPermissionEJS('industries', 'delete', req);
    var data_arr = [];
    if (records.length > 0) {
        for (i = 0; i < records.length; i++) {
            var row = records[i];

            var status = updatePer ? `<div class="form-check form-switch form-switch-lg" dir="ltr"><input type="checkbox" class="form-check-input industries-status" data-status = ${row.status} row-id = ${row.id} id="industry-status" ${row.status == 1 ? 'checked' : ''} ><label class="form-check-label" for="industries-status"></label></div>` : row.status == 1 ? res.__("ACTIVE") : res.__("INACTIVE")

            var editBtn = updatePer ? `<button type="button" class="border-0 bg-transparent editIndustry" row-id = ${row.industryId} data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight" aria-controls="offcanvasRight" style="color: #5156be !important;"><i class="font-size-18 fas fa-edit"></i></button>`: '-';

            // var deleteBtn = deletePer ? `<button type="button" class="delete_industries border-0 bg-transparent deleteIndustry" data-url = ${industryPath.INDUSTRY_DELETE_ACTION_URL} data-id = ${row.id}><i class="font-size-18 fas fa-trash" style="color:#d73328"></i></button>` : '';

            var actionBtn = `${editBtn}`;
            data_arr.push({
                id: row.industryId,
                name: row.name,
                categories: row.category_count,
                status: `<span class="badge rounded-pill ${row.status == 1 ? 'bg-success' : 'bg-danger'}">${row.status == 1 ? 'Enable' : 'Disable'}</span>`,
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
        await activity_log(req, req.session.userId, industryPath.INDUSTRY_LIST_VIEW_PAGE, "INDUSTRY_STATUS_UPDATE", "UPDATE");

        return res.status(200).json({ success: res.__("INDUSTRY_STATUS_UPDATE"), });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// add industry
const addIndustry = async (req, res) => {
    try {
        const { industry, status } = req.body;
        const result = await industryModel.checkIndustry(industry);
        if (result) return res.status(200).json({ error: res.__("INDUSTRRY_ALREADY_EXIST") });
        // insert industry
        const industryId = await industryModel.addIndustry(slug(industry));
        // insert industry meta
        const metaData = {
            catalog_industry_id: industryId,
            name: industry,
            status,
        }
        const metaResult = await industryModel.addIndustryMeta(metaData);
        if (industryId && metaResult) {
            // user activity
            await activity_log(req, req.session.userId, industryPath.INDUSTRY_LIST_VIEW_PAGE, "INDUSTRY_ADDED", "ADD");
            return res.status(200).json({ success: res.__("INDUSTRY_ADDED") });
        }
        return res.status(200).json({ error: res.__("INDUSTRY_ADD_ERROR") });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// edit idustry
const editIndustry = async (req, res) => {
    try {
        const result = await industryModel.getIndustryData(req.body.id);
        const updatePer = await checkPermissionEJS('industries', 'update', req);

        if (!result) return res.status(200).json({ error: res.__("INDUSTRY_NOT_EXITS") });
        return res.status(200).json({ result: result, update_url: industryPath.INDUSTRY_UPDATE_ACTION_URL + req.body.id, updatePer:updatePer });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// update industry
const updateIndustry = async (req, res) => {
    try {

        const { industry, status } = req.body;
        const result = await industryModel.getIndustryData(req.params.id);
        if (!result) return res.status(200).json({ error: res.__("INDUSTRY_NOT_EXITS") });

        const data = await industryModel.updateIndustry(slug(industry), industry, status, req.params.id);

        if (data) {
            // user activity
            await activity_log(req, req.session.userId, industryPath.INDUSTRY_LIST_VIEW_PAGE, "INDUSTRY_UPDATE", "UPDATE");
            return res.status(200).json({ success: res.__("INDUSTRY_UPDATE") });
        }
        return res.status(200).json({ error: res.__("INDUSTRY_UPDATE_ERROR") });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// delete industry
const bulkAction = async (req, res) => {
    try {

        const { actionVal, indIds } = req.body;
        const ids = Array.isArray(indIds) ? indIds : [indIds];
        const industryData = await industryModel.checkIndustryUseInProduct(ids);
        let result = false;

        if (actionVal != 2) {
            result = await Promise.all(ids.map(id => industryModel.bulkActionStatus(id, actionVal)));
            await activity_log(req, req.session.userId, industryPath.INDUSTRY_LIST_VIEW_PAGE, "INDUSTRY_STATUS_UPDATE", "UPDATE");
            return res.status(200).json({ success: result ? res.__("INDUSTRY_STATUS_UPDATE") : res.__("INDUSTRY_STATUS_UPDATE_ERROR") });
        } else {
            if (industryData.length > 0) {
                return res.status(200).json({ error: res.__("INDUSTRY_IN_USE") });
            }
            result = await Promise.all(ids.map(id => industryModel.bulkActionDelete(id)));
            await activity_log(req, req.session.userId, industryPath.INDUSTRY_LIST_VIEW_PAGE, "INDUSTRY_DELETE", "DELETE");
            return res.status(200).json({ success: result ? res.__("INDUSTRY_DELETE") : res.__("INDUSTRY_DELETE_ERROR") });
        }
       
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};






module.exports = {
    industryList,
    industryDataTable,
    updateIndustryStatus,
    addIndustry,
    editIndustry,
    updateIndustry,
    bulkAction


}

