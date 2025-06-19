
const roleModel = require('@roleModel/role');
const rolePath = require('@roleRouter/rolePath');
const { userActivityLog } = require('@middleware/commonMiddleware');

// Add role view
const addRole = async (req, res) => {
    try {
        // Fetching role permissions
        const permissionMenu = await roleModel.getRolePermissionsMenus();
        const langData = JSON.parse(JSON.stringify(res.locals.lngData));

        const toNested = (items, parentId = 0) => items.filter(item => item.parent === parentId)
            .map(item => {
                const trimmedName = item.name?.trim(); 
                return {
                    ...item,
                    name:  langData[trimmedName] || trimmedName, 
                    children: toNested(items, item.id),
                };
            });


        const menusList = Array.isArray(permissionMenu) ? toNested(permissionMenu) : [];
        res.render('system/role/role', {
            title: res.__('Add-role'),
            session: req.session,
            menusList,
            roleData: '',
            add_role: rolePath.ROLE_ADD_ACTION,
        })
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// Add role action
const addRoleAction = async (req, res) => {
    try {
        const { roleName, roleStatus, permissions } = req.body;
        
        // Check if the role name already exists
        const existingRole = await roleModel.getRoleByName(roleName);
        if (existingRole) return res.status(200).json({ error: res.__('Role name already exists') });

        const roleData = { role_name: roleName, status: roleStatus, permissions };
        const result = await roleModel.addRole(roleData);

        // Log user activity
        if (result) {
            await userActivityLog(req, req.session.userId, rolePath.ROLE_ADDFORM_VIEW_PAGE, "Role added successfully", "Add");
        }
        return res.status(200).json({
            [result ? 'success' : 'error']: res.__(result ? 'Role added successfully' : 'Failed to add role, please try again')
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}


module.exports = {
    addRole,
    addRoleAction
}
