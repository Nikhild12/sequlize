//package Imports
const Express = require('express');

//EMR Workflow Controller Import
const profilesController = require('../controllers/profiles.controller');

//Express Router Initialize
const profilesRoute = Express.Router();

//profilesRoute.route('/getByFilters').get(profilesController.getProfilesByFilters);
profilesRoute.route('/create').post(profilesController.createProfileOpNotes);
profilesRoute.route('/getAll').post(profilesController.getAllProfiles);
profilesRoute.route('/delete').put(profilesController.deleteProfiles);
profilesRoute.route('/getById').get(profilesController.getProfileById);
profilesRoute.route('/update').put(profilesController.updateProfiles);
profilesRoute.route('/getAllValueTypes').get(profilesController.getAllValueTypes);
profilesRoute.route('/getAllProfileTypes').get(profilesController.getAllProfileNotesTypes);
profilesRoute.route('/getAllProfileTypepost').post(profilesController.getAllProfileNotesTypes);
profilesRoute.route('/getProfilesDefault').get(profilesController.getDefaultProfiles);
profilesRoute.route('/setProfilesDefault').post(profilesController.setDefaultProfiles);
profilesRoute.route('/get-notes-by-type').get(profilesController.getNotesByType);
profilesRoute.route('/get-profile-section-by-profile-id').get(profilesController.getProfileSectionsByProfileId);
profilesRoute.route('/get-profile-section-categories-by-profile-section-id').get(profilesController.getProfileSectionsCategoriesByProfileSectionId);

module.exports = profilesRoute;
