// package Imports
const express = require('express');

// EMR Workflow Controller Import
const PatientDiagnosisCtrl = require('../controllers/patient.diagnosis.controller');

// Express Router Initialize
const PatientDiagnosisRoutes = express.Router();

PatientDiagnosisRoutes.route('/create').post(PatientDiagnosisCtrl.createPatientDiagnosis);

module.exports = PatientDiagnosisRoutes;