// package Imports
const express = require('express');

// EMR Workflow Controller Import
const PatientDiagnosisCtrl = require('../controllers/patient.diagnosis.controller');

// Express Router Initialize
const PatientDiagnosisRoutes = express.Router();

PatientDiagnosisRoutes.route('/create').post(PatientDiagnosisCtrl.createPatientDiagnosis);
PatientDiagnosisRoutes.route('/getByFilters').get(PatientDiagnosisCtrl.getPatientDiagnosisByFilters);
PatientDiagnosisRoutes.route('/getPatientDiagnosis').get(PatientDiagnosisCtrl.getPatientDiagnosisHistory);
PatientDiagnosisRoutes.route('/getPatientDiagnosisById').get(PatientDiagnosisCtrl.getPatientDiagnosisHistoryById);
PatientDiagnosisRoutes.route('/updatePatientDiagnosis').put(PatientDiagnosisCtrl.updatePatientDiagnosisHistory);

module.exports = PatientDiagnosisRoutes;