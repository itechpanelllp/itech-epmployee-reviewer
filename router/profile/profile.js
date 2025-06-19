const express = require('express');
const app = express.Router();
const profileController = require("@ProfileController/profile");
const {profileValidation} = require("@ProfileController/profileValidation");
const path = require("@ProfileRouter/profilePath");
const {checkSession} = require("@middleware/session");
const{ upload }=  require('@middleware/uploader');
var year = new Date().getFullYear();
var month = new Date().getMonth() + 1;
var day = new Date().getDate();
var uploadprofile = upload(`./public/uploads/profileImage/${year}/${month}/${day}`).single('profileImg');
const multerErrorHandler = require('@middleware/multerErrorHandler');
const uploadWithErrorHandler = multerErrorHandler(uploadprofile);

// profile view 
app.get(`/${path.PROFILE_VIEW_PAGE}`, checkSession, profileController.profileViewPage);

// get state
app.post(`/${path.PROFILE_GET_STATE_ACTION}`, checkSession, profileController.getState);

// get city
app.post(`/${path.PROFILE_GET_CITY_ACTION}`, checkSession, profileController.getCity);

// update profile
app.post(`/${path.PROFILE_UPDATE_ACTION_URL}`, checkSession, uploadWithErrorHandler, profileValidation, profileController.updateProfile);

module.exports = app;