//package Imports
const Express = require('express');

// Controller Import
const progressNotesController = require('../controllers/progress_notes.controller');

//Express Router Initialize
const progressNotesRoute = Express.Router();

progressNotesRoute.route('/create').post(progressNotesController.createProgressNotes);
progressNotesRoute.route('/delete').put(progressNotesController.deleteProgressNotes);
progressNotesRoute.route('/getById').get(progressNotesController.getProgressNotesDetailsById);
progressNotesRoute.route('/update').put(progressNotesController.updateProgressNotes);
progressNotesRoute.route('/getAll').get(progressNotesController.getAllProgressNotesDetails);



module.exports = progressNotesRoute;
