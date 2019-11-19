// package Imports
const express = require('express');

// EMR Workflow Controller Import
const emrPatientVitalsController = require('../controllers/emr.patient.vitals.controller');

// Express Router Initialize
const emrPatientVitalRoute = express.Router();

// EMR Workflow Routes

emrPatientVitalRoute.route('/create').post(emrPatientVitalsController.createPatientVital);
// emrPatientVitalRoute.route('/update').put(emrWorkflowController.updateEMRWorkFlow);
// emrPatientVitalRoute.route('/delete').put(emrWorkflowController.deleteEMRWorkflow);
// emrPatientVitalRoute.route('/getEMRWorkflowByUserId').get(emrWorkflowController.getEMRWorkFlowByUserId);

// Exporting EMR Workflow Route
module.exports = emrPatientVitalRoute;