// package Imports
const express = require('express');

// EMR Workflow Controller Import
const emrDiagnosisController = require('../controllers/emr.diagnosis.controller');

// Express Router Initialize
const emrDiagnosisRoute = express.Router();

// EMR Workflow Routes

emrDiagnosisRoute.route('/getEmrDiagnosis').post(emrDiagnosisController.getEmrDiagnosis);
emrDiagnosisRoute.route('/getEmrDiagnosisById').get(emrDiagnosisController.getEmrDiagnosisById);

// Exporting EMR Workflow Route
module.exports = emrDiagnosisRoute;