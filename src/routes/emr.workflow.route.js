// package Imports
const express = require('express');

const emrWorkflowController = require('../controllers/emr.workflow.controller');

const emrWorkflowRoute = express.Router();

emrWorkflowRoute.route('/create').post(emrWorkflowController.createEMRWorkFlow);

module.exports = emrWorkflowRoute;