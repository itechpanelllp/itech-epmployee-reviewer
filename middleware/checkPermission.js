
const  permissionModel = require('@checkPermissionModel/checkPermission');
module.exports = {
    checkPermission: (key, permissionCode) => {
        return async (req, res, next) => {
            var role = req.session.userRole;
            const userPermissions = await permissionModel.getPermission(role);
            const permissionsObject = userPermissions?.permissions ? JSON.parse(userPermissions.permissions) : null;
            const permissionsForKey = permissionsObject?.[key];
            if (permissionsForKey && permissionsForKey.includes(permissionCode)) {
                next();
            } else {
                return res.redirect('/login');
            }   
        };
    },
    checkPermissionEJS: async (key, permissionCode, req) => {
        var role = req.session.userRole;
        const userPermissions = await permissionModel.getPermission(role);
        const permissionsObject = userPermissions?.permissions ? JSON.parse(userPermissions.permissions) : null;
        const permissionsForKey = permissionsObject?.[key];
        if (permissionsForKey && permissionsForKey.includes(permissionCode)) {
            return true;
        }
        return false;
       
    }
  
}