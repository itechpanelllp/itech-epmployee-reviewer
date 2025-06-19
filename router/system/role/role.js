const  express = require('express');
const app = express.Router();
const roleController = require('@roleController/role');
const roleListController = require('@roleController/roleList');
const roleEditController = require('@roleController/roleEdit');
const path = require('./rolePath');
const {checkSession} = require("@middleware/session");
const {roleValidation} = require('@roleController/roleValidation');


// Role list view
app.get(`/${path.ROLE_LIST_VIEW}`, checkSession, roleListController.roleList);

// Role data table
app.post(`/${path.ROLE_DATATABLE_ACTION}`, checkSession, roleListController.roleDataTable);

// Role status update
app.post(`/${path.ROLE_STATUS_ACTION}`, checkSession, roleListController.updateRoleStatus);

// Add role view
app.get(`/${path.ROLE_ADD_VIEW}`, checkSession,  roleController.addRole);

// Add role action
app.post(`/${path.ROLE_ADD_ACTION}`, checkSession, roleValidation, roleController.addRoleAction);

// Edit role view
app.get(`/${path.ROLE_EDIT_ACTION}:id`, checkSession, roleEditController.editRole);

// Update role action
app.post(`/${path.ROLE_UPDATE_ACTION}:id`, checkSession, roleValidation, roleEditController.updateRoleAction);

// Delete role action
app.post(`/${path.ROLE_DELETE_ACTION}:id`, checkSession, roleListController.deleteRole);




module.exports = app;