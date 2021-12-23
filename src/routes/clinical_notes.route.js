//package Imports
const Express = require('express');

// Controller Import
const clinicalNotesController = require('../controllers/clinical_notes.controller');

//Express Router Initialize
const clinicalNotesRoute = Express.Router();

clinicalNotesRoute.route('/create').post(clinicalNotesController.createClinicalNotes);
clinicalNotesRoute.route('/delete').put(clinicalNotesController.deleteClinicalNotes);
clinicalNotesRoute.route('/getById').get(clinicalNotesController.getClinicalNotesDetailsById);
clinicalNotesRoute.route('/update').put(clinicalNotesController.updateClinicalNotes);
clinicalNotesRoute.route('/getAll').get(clinicalNotesController.getAllClinicalNotesDetails);
clinicalNotesRoute.route('/getClinicalNotesByVisitId').get(clinicalNotesController.getClinicalNotesByVisitId);

module.exports = clinicalNotesRoute;
