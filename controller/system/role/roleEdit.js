
const roleModel = require('@roleModel/roleEdit');
const rolePath = require('@roleRouter/rolePath');
const { userActivityLog } = require('@middleware/commonMiddleware');

// edit role view
const editRole = async (req, res) => {
    try {
        // Fetching role permissions
        const permissionMenu = await roleModel.getRolePermissionsMenus();
        const toNested = (items, parentId = 0) => items.filter(item => item.parent === parentId)
            .map(item => ({
                ...item,
                name: item.name || item.code,
                children: toNested(items, item.id),
            }));
        const menusList = Array.isArray(permissionMenu) ? toNested(permissionMenu) : [];

        const roleData = await roleModel.getRoleData(req.params.id);

        res.render('system/role/role', {
            title: res.__('Edit-role'),
            session: req.session,
            menusList,
            roleData,
            update_role: rolePath.ROLE_UPDATE_ACTION + req.params.id,

        })
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// update role action
const updateRoleAction = async (req, res) => {
    try {
        const { roleName, permissions } = req.body;
        const roleData = { role_name: roleName, permissions};
       
        const result = await roleModel.updateRole(roleData, req.params.id);
        // Log user activity
        if (result) {
            await userActivityLog(req, req.session.userId, rolePath.ROLE_EDIT_ACTION + req.params.id, "Role updated successfully", "Update");
        }
        return res.status(200).json({
            [result ? 'success' : 'error']: res.__(result ? 'Role updated successfully' : 'Failed to update role, please try again')
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}


module.exports = {
    editRole,
    updateRoleAction
}
