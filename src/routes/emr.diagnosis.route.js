// package Imports
const express = require('express');

// EMR Workflow Controller Import
const emrDiagnosisController = require('../controllers/emr.diagnosis.controller');

// Express Router Initialize
const emrWorkflowRoute = express.Router();

// EMR Workflow Routes

emrWorkflowRoute.route('/getEmrDiagnosis').post(emrDiagnosisController.getEmrDiagnosis);

// Exporting EMR Workflow Route
module.exports = emrWorkflowRoute;