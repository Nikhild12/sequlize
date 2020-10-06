// package Imports
const express = require('express');

// EMR Workflow Controller Import
const emrWorkflowController = require('../controllers/emr.workflow.controller');

// Express Router Initialize
const emrWorkflowRoute = express.Router();

// EMR Workflow Routes
emrWorkflowRoute.route('/create').post(emrWorkflowController.createEMRWorkFlow);
emrWorkflowRoute.route('/update').put(emrWorkflowController.updateEMRWorkFlow);
emrWorkflowRoute.route('/delete').put(emrWorkflowController.deleteEMRWorkflow);
emrWorkflowRoute.route('/getEMRWorkflowByUserId').get(emrWorkflowController.getEMRWorkFlowByUserId);
emrWorkflowRoute.route('/getEMRWorkflowByUserIdsearch').post(emrWorkflowController.getEMRWorkFlowByUserId);

// Exporting EMR Workflow Route
module.exports = emrWorkflowRoute;