// package Imports
const express = require('express');

// EMR Workflow Controller Import
const emrWorkflowController = require('../controllers/emr.workflow.controller');

// Express Router Initialize
const emrWorkflowRoute = express.Router();

// EMR Workflow Routes
emrWorkflowRoute.route('/create').post(emrWorkflowController.createEMRWorkFlow);

// Exporting EMR Workflow Route
module.exports = emrWorkflowRoute;