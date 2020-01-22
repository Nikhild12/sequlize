// package Imports
const express = require('express');

// EMR Workflow Controller Import
const emrPatientVitalsController = require('../controllers/emr.patient.vitals.controller');

// Express Router Initialize
const emrPatientVitalRoute = express.Router();

// EMR Workflow Routes

emrPatientVitalRoute.route('/create').post(emrPatientVitalsController.createPatientVital);
emrPatientVitalRoute.route('/getVitalsByTemplateID').get(emrPatientVitalsController.getVitalsByTemplateID);
emrPatientVitalRoute.route('/getPatientVitals').get(emrPatientVitalsController.getPatientVitals);
emrPatientVitalRoute.route('/getHistoryPatientVitals').get(emrPatientVitalsController.getHistoryPatientVitals);
emrPatientVitalRoute.route('/getPreviousPatientVitals').get(emrPatientVitalsController.getPreviousPatientVitals);

// emrPatientVitalRoute.route('/delete').put(emrWorkflowController.deleteEMRWorkflow);
// emrPatientVitalRoute.route('/getEMRWorkflowByUserId').get(emrWorkflowController.getEMRWorkFlowByUserId);

// Exporting EMR Workflow Route
module.exports = emrPatientVitalRoute;