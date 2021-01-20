// package Imports
const express = require('express');

// EMR Workflow Controller Import
const patientImmunizationController = require('../controllers/patient_immunization_schedules.controller');

// Express Router Initialize
const patientImmunizationRoute = express.Router();

patientImmunizationRoute.route('/addPatientImmunizations').post(patientImmunizationController.addPatientImmunizations);
patientImmunizationRoute.route('/create').post(patientImmunizationController.addPatientImmunizationSchedules);
patientImmunizationRoute.route('/delete').put(patientImmunizationController.deletePatientImmunizationSchedules);
patientImmunizationRoute.route('/update').put(patientImmunizationController.updatePatientImmunizationSchedules);
patientImmunizationRoute.route('/getById').get(patientImmunizationController.getPatientImmunizationSchedulesById);
patientImmunizationRoute.route('/getAll').get(patientImmunizationController.getAllPatientImmunizationSchedules);



module.exports = patientImmunizationRoute;