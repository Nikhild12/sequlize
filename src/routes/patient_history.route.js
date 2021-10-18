// package Imports
const express = require('express');

// EMR Workflow Controller Import
const patientHistory = require('../controllers/patient_history.controller');

// Express Router Initialize
const patientHistoryRoutes = express.Router();

patientHistoryRoutes.route('/createPatientHistory').post(patientHistory.create_patient_history);
// patientHistoryRoutes.route('/create_patient_history_section_values').post(patientHistory.create_patient_history_section_and_section_values);


module.exports = patientHistoryRoutes;