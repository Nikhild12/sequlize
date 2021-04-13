// package Imports
const express = require('express');

// EMR Workflow Controller Import
const PatientDiagnosisCtrl = require('../controllers/patient.diagnosis.controller');

// Express Router Initialize
const PatientDiagnosisRoutes = express.Router();

PatientDiagnosisRoutes.route('/create').post(PatientDiagnosisCtrl.createPatientDiagnosis);
PatientDiagnosisRoutes.route('/getByFilters').get(PatientDiagnosisCtrl.getPatientDiagnosisByFilters);
PatientDiagnosisRoutes.route('/getdiagnosiscount').get(PatientDiagnosisCtrl.getPatientDiagnosisCount);
PatientDiagnosisRoutes.route('/getPatientDiagnosisById').get(PatientDiagnosisCtrl.getPatientDiagnosisHistoryById);
PatientDiagnosisRoutes.route('/updatePatientDiagnosis').put(PatientDiagnosisCtrl.updatePatientDiagnosisHistory);
PatientDiagnosisRoutes.route('/getMockJson').get(PatientDiagnosisCtrl.getMobileMockAPI);
PatientDiagnosisRoutes.route('/updateById').put(PatientDiagnosisCtrl.deletePatientDiagnosisById);
PatientDiagnosisRoutes.route('/getPreviousDiagnosisByPatiendId').get(PatientDiagnosisCtrl.getPreviousPatientDiagnosisByPatientId);
module.exports = PatientDiagnosisRoutes;