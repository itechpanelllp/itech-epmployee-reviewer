const rolePath = require('@roleRouter/rolePath')
const roleModel = require('@roleModel/roleList')
const base_url = process.env.BASE_URL;
const {userActivityLog,  formatted_date} = require('@middleware/commonMiddleware');


// role list view
const roleList = async (req, res) => {
    try {
        res.render('system/role/roleList', {
            title: res.__("Role-list"),
            session: req.session,
            add_role: rolePath.ROLE_ADD_VIEW,
            role_dataTable: rolePath.ROLE_DATATABLE_ACTION,
            role_status: rolePath.ROLE_STATUS_ACTION,

        })
    } catch (error) {
        return res.status(500).json({ error: error.message });

    }
}

// role data table
const roleDataTable = async (req, res) => {
    try {
        const { draw = 1, search, start = 0, length: limit = 10, order = [{ column: 0, dir: "DESC" }], columns } = req.body;
        const term = search?.value || "";
        const columnIndex = order[0]?.column || 0;
        const sort = columns[columnIndex]?.data || "id";
        const sortOrder = order[0]?.dir || "DESC";

        const where = term ? `1 = 1 AND (id LIKE '%${term}%' OR role_name LIKE '%${term}%' OR status LIKE '%${term}%')` : `1 = 1`;
        // get role data
        let records = await roleModel.roleDataTable(where, start, limit, sort, sortOrder);

        records = JSON.parse(JSON.stringify(records, (_, value) => (typeof value === "bigint" ? value.toString() : value)));
        const totalRecords = records?.[0]?.total || 0;
        // check permission

        const dataArr = records.map((row) => {
            const isGlobal = row.isglobal === 1;
            const editBtn = `<a href="${base_url + rolePath.ROLE_EDIT_ACTION}${row.id}" class="editRole" row-id="${row.id}"><i class="font-size-18 fas fa-edit"></i></a>`;

            const dltBtn = `<button type="button" class="delete_menu border-0 bg-transparent" onclick="roleDelete('delete-role', '${rolePath.ROLE_DELETE_ACTION}', '${row.id}')"><i class="font-size-18 fas fa-trash" style="color:#d73328"></i></button>`;
            return {
                role_name: row.role_name,
                status: isGlobal ? "" : `<div class="form-check form-switch form-switch-lg" dir="ltr"><input type="checkbox" class="form-check-input role_status" data-status="${row.status}" row-id="${row.id}" id="roleStatus" ${row.status == 1 ? "checked" : ""}> <label class="form-check-label" for="roleStatus"></label></div>`,
                created_at: formatted_date( row.created_at),
                action: isGlobal ? "" : `<div class="d-flex items-center gap-3 cursor-pointer">${editBtn}${dltBtn}</div>`,

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

// update role status
const updateRoleStatus = async (req, res) => {
    try {
        const { id, status } = req.body;
        // check role assign
        const roleAssign = await roleModel.checkRoleAssign(id);
        if (roleAssign) return res.status(200).json({ error: res.__("This role is assigned to users and its status cannot be changed.") });

        // check role is global
        const isGlobal = await roleModel.checkRoleIsGloble(id);
        if (isGlobal) return res.status(200).json({ error: res.__("This is a global role. Status cannot be changed.") });

        // update status
        const result = await roleModel.updateRoleStatus(id, status);
         await userActivityLog(req, req.session.userId, rolePath.ROLE_STATUS_ACTION, "Role status updated successfully", "Update");
        return res.status(200).json({
            [result ? 'success' : 'error']: res.__(result ? 'Role status updated successfully' : 'Failed to update role status, please try again')
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// delete role
const deleteRole = async (req, res) => {
    try {
        const { id } = req.params;
        // check role assign
        const roleAssign = await roleModel.checkRoleAssign(id);
        if (roleAssign) return res.status(200).json({ error: res.__("This role is assigned to users and cannot be deleted.") });

        // check role is global
        const isGlobal = await roleModel.checkRoleIsGloble(id);
        if (isGlobal) return res.status(200).json({ error: res.__("This is a global role. Cannot be deleted.") });

        // delete role
        const result = await roleModel.deleteRole(id);

        // Log user activity
        if(result) {
            await userActivityLog(req, req.session.userId, rolePath.ROLE_DELETE_ACTION, "Role deleted successfully", "Delete");
        }
        return res.status(200).json({
            [result ? 'success' : 'error']: res.__(result ? 'Role deleted successfully' : 'Failed to delete role, please try again')
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

module.exports = {
    roleList,
    roleDataTable,
    updateRoleStatus,
    deleteRole
}