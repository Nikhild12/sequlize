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
notesRoute.route('/getReviewNotes').get(notesController.getReviewNotes);
notesRoute.route('/update').post(notesController.updatePreviousPatientOPNotes);
notesRoute.route('/print').get(notesController.print_previous_opnotes);
notesRoute.route('/addConsultations').post(notesController.addConsultations);
notesRoute.route('/updateconsultations').post(notesController.updateConsultations);
notesRoute.route('/getConsultations').get(notesController.getConsultations);

module.exports = notesRoute;