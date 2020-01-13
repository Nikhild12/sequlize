//package Imports
const Express = require('express');

//EMR Workflow Controller Import
const profilesController  = require('../controllers/profiles.controller')

//Express Router Initialize
const profilesRoute = Express.Router();

//profilesRoute.route('/getByFilters').get(profilesController.getProfilesByFilters);
profilesRoute.route('/create').post(profilesController.createProfileOpNotes);
profilesRoute.route('/getAll').get(profilesController.getAllProfiles)
module.exports = profilesRoute;
