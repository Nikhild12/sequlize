// package Imports
const express = require('express');

// EMR Workflow Controller Import
const patientHistory = require('../controllers/patient_history.controller');

// Express Router Initialize
const patientHistoryRoutes = express.Router();

patientHistoryRoutes.route('/createPatientHistory').post(patientHistory.create_patient_history);
patientHistoryRoutes.route('/getPatientHistoryByVisit').post(patientHistory.get_patient_history_by_visit);


module.exports = patientHistoryRoutes;