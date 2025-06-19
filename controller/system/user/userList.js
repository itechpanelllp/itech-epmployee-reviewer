
const userPath = require('@userRouter/userPath');
const userModel = require('@userModel/userList');
const base_url = process.env.BASE_URL;
const { userActivityLog } = require('@middleware/commonMiddleware');
const { checkPermissionEJS } = require('@middleware/checkPermission');

// user list
const userList = async (req, res) => {
    try {
        const role = await userModel.getRole();
        const addUserPer = await checkPermissionEJS('system-users', 'add', req);
        res.render('system/user/userList', {
            title: res.__("User-list"),
            session: req.session,
            role,
            addUserPer,
            user_dataTable: userPath.USER_DATATABLE_ACTION,
            add_user: userPath.USER_ADD_ACTION,
            update_status: userPath.USER_STATUS_UPDATE_ACTION,
            trash_user: userPath.TRASH_USER_ACTION,
        })
    } catch (error) {
        return res.status(500).json({ error: error.message });

    }
}

// user datatable
const userDataTable = async (req, res) => {
    try {
        const { draw = 1, search, start = 0, length: limit = 10, order = [{ column: 0, dir: "DESC" }], columns } = req.body;
        const term = search?.value || "";
        const columnIndex = order[0]?.column || 0;
        const sort = columns[columnIndex]?.data || "u.id";
        const sortOrder = order[0]?.dir || "DESC";

        let where = `1=1 AND u.status != '3'${term ? ` AND (u.id LIKE '%${term}%' OR u.firstname LIKE '%${term}%' OR u.lastname LIKE '%${term}%' OR u.email LIKE '%${term}%' OR r.role_name LIKE '%${term}%' OR u.status LIKE '%${term}%')` : ''}`;


        // get role data
        let records = await userModel.userDataTable(where, start, limit, sort, sortOrder);

        records = JSON.parse(JSON.stringify(records, (_, value) => (typeof value === "bigint" ? value.toString() : value)));

        const totalRecords = records?.[0]?.total || 0;

        // check permission
        const dltUserPer = await checkPermissionEJS('system-users', 'delete', req);
        const updateUserPer = await checkPermissionEJS('system-users', 'update', req);

        const dataArr = records.map((row) => {
            var status = updateUserPer ? `<div class="form-check form-switch form-switch-lg" dir="ltr"><input type="checkbox" class="form-check-input user_status" data-status = ${row.status} row-id = ${row.id} id="usertatus" ${row.status == 1 ? "checked" : ""} ><label class="form-check-label" for="usertatus"></label></div>` : row.status == 1 ? res.__("Active") : res.__("Inactive");

            var editBtn = `<a href="${base_url + userPath.USER_EDIT_VIEW}${row.id}" class="editRole" row-id = ${row.id} ><i class="font-size-18 far fa-eye"></i></a>`;

            var deleteBtn = dltUserPer ? `<button type="button" class="delete_menu border-0 bg-transparent delete_user" data-url = "${userPath.USER_DELETE_ACTION}" data-id="${row.id}"><i class="font-size-18 fas fa-trash" style="color:#d73328"></i></button>` : '-';
            return {
                id: row.id,
                role: row.role_name,
                firstname: row.firstname + " " + row.lastname,
                email: row.email,
                status: status,
                action: `<div class="d-flex items-center gap-3 cursor-pointer">${editBtn}${deleteBtn}</div>`,

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

// update role status
const updateUserStatus = async (req, res) => {
    try {
        const { id, status } = req.body;

        if (req.session.userId == id) return res.status(200).json({ error: res.__("You can not change change status of your own account.") });

        // update role status
        const result = await userModel.updateUserStatus(id, status);
        if (result) {
            // user activity 
            await userActivityLog(req, req.session.userId, userPath.USER_LIST_VIEW, "User status update successfully", "Update");

            return res.status(200).json({ success: res.__("User status update successfully") });
        }
        return res.status(200).json({ error: res.__("Technical issue update user status, please try again") });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// user delete
const deleteUser = async (req, res) => {
    try {
        // delete user  
        const result = await userModel.deleteUser(req.params.id);
        if (result) {
            // user activity
            await userActivityLog(req, req.session.userId, userPath.USER_LIST_VIEW, "User deleted successfully", "Delete");
            return res.status(200).json({ success: res.__("User deleted successfully") });
        }
        return res.status(200).json({ error: res.__("Technical issue delete user, please try again") });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
// show all trash user
const showTrashUser = async (req, res) => {
    try {
        let trashUsers = await userModel.getTrashUsers();
        trashUsers = JSON.parse(JSON.stringify(trashUsers, (_, value) => (typeof value === "bigint" ? value.toString() : value)));
        const totalRecords = trashUsers?.[0]?.total || 0;
        // check permisision
        const updateUserPer = await checkPermissionEJS('system-users', 'update', req);
        const dltUserPer = await checkPermissionEJS('system-users', 'delete', req);
        const dataArr = trashUsers.map((row) => {
            var restoreBtn = updateUserPer ? `<button type="button" class="border-0 bg-transparent userRestore"  data-url = "${userPath.USER_RESTORE_ACTION_URL}" data-id="${row.id}" ><i class="font-size-18 fas fa-trash-restore" style="color:#d73328"></i></button>`: '-';
            var deleteBtn =  dltUserPer ? `<button type="button" class="border-0 bg-transparent userPerDelete" data-url = "${userPath.USER_PERMANENT_ACTION_URL}" data-id="${row.id}"><i class="font-size-18 fas fa-trash" style="color:#d73328"></i></button>`: '-';
            return {
                id: row.id,
                role: row.role_name,
                firstname: row.firstname + " " + row.lastname,
                email: row.email,
                status: row.status == '3' ? 'trash' : '',
                action: `<div class="d-flex items-center gap-3 cursor-pointer">${restoreBtn}${deleteBtn}</div>`,

            };
        });
        res.json({
            draw: req.body.draw || 1,
            recordsTotal: totalRecords,
            recordsFiltered: totalRecords,
            data: dataArr,
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// restore user
const restoreUser = async (req, res) => {
    try {
        const user = await userModel.restoreUserAction(req.params.id);
        if (user) {
            // user activity 
            await userActivityLog(req, req.session.userId, userPath.USER_LIST_VIEW, "User restored successfully.", "Update");
            return res.status(200).json({ success: res.__("User restored successfully.") })
        }

        return res.status(200).json({ error: res.__("Technical issue restore user, please try again") })

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// permanent  user delete
const permanentUserDelete = async (req, res) => {
    try {

        const result = await userModel.permanentUserDelete(req.params.id);
        if (result) {
            // user activity 
            await userActivityLog(req, req.session.userId, userPath.USER_LIST_VIEW, "The User has been deleted successfully.", "Delete");

            return res.status(200).json({ success: res.__("The User has been deleted successfully.") });
        }
        return res.status(200).json({ error: res.__("Technical issue delete user, please try again") });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    userList,
    userDataTable,
    updateUserStatus,
    deleteUser,
    showTrashUser,
    restoreUser,
    permanentUserDelete,
}