//package Imports
const Express = require('express');

//EMR Workflow Controller Import
const notesController = require('../controllers/emr_patient_notes');

//Express Router Initialize
const notesRoute = Express.Router();
notesRoute.route('/add').post(notesController.addProfiles);
notesRoute.route('/get-prev-by-patient').get(notesController.getPreviousPatientOPNotes);
notesRoute.route('/get-patient-by-id').get(notesController.getOPNotesDetailsById);
notesRoute.route('/get-patient-by-patientId').get(notesController.getOPNotesDetailsByPatId);
notesRoute.route('/update').post(notesController.updatePreviousPatientOPNotes);

module.exports = notesRoute;