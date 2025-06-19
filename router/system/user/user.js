const express = require('express');
const app = express.Router();
const userController = require('@userController/userList');
const {userField, userUpdateField} = require('@userController/userValidation');
const addUserController = require('@userController/addUser');
const editUserController = require('@userController/editUser');
const { checkSession } = require('@middleware/session');
const { checkPermission } = require('@middleware/checkPermission');
const path = require('./userPath');


// user list
app.get(`/${path.USER_LIST_VIEW}`, checkSession, checkPermission('system-users','view'), userController.userList);

// user datatable
app.post(`/${path.USER_DATATABLE_ACTION}`, checkSession,  checkPermission('system-users','view'), userController.userDataTable);

// user status update
app.post(`/${path.USER_STATUS_UPDATE_ACTION}`, checkSession,  checkPermission('system-users','update'), userController.updateUserStatus);

// user add
app.post(`/${path.USER_ADD_ACTION}`, checkSession,  checkPermission('system-users','add'), userField, addUserController.addUser);

// user edit
app.get(`/${path.USER_EDIT_VIEW}:id`, checkSession,  checkPermission('system-users','view'), editUserController.editUserView);

// user update
app.post(`/${path.USER_UPDATE_ACTION}:id`, checkSession,  checkPermission('system-users','update'), userUpdateField, editUserController.updateUser);

// get state
app.post(`/${path.USER_STATE_ACTION}`, checkSession, editUserController.getState);
// get city
app.post(`/${path.USER_CITY_ACTION}`, checkSession, editUserController.getCity);

// user delete
app.post(`/${path.USER_DELETE_ACTION}:id`, checkSession,  checkPermission('system-users','delete'), userController.deleteUser);

// user trash
app.post(`/${path.TRASH_USER_ACTION}`, checkSession, checkPermission('system-users','view'), userController.showTrashUser);

// user permanent delete
app.post(`/${path.USER_PERMANENT_ACTION_URL}:id`, checkSession, checkPermission('system-users','delete'), userController.permanentUserDelete);
// user restore
app.post(`/${path.USER_RESTORE_ACTION_URL}:id`, checkSession,  checkPermission('system-users','update'), userController.restoreUser);



module.exports = app;