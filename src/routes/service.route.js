const express = require('express');

const emrWorkflowRouter = require('./emr.workflow.route');

const serviceRoute = express.Router();

serviceRoute.use('/emr-workflow-settings', emrWorkflowRouter);

module.exports = serviceRoute;