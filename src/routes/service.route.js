const express = require('express');

const emrWorkflowRouter = require('./emr.workflow.route');
const chiefDurationRoute = require('./chief_complaints_duration.route');
const patientChiefRoute = require('./patient_chief_complaints.route');

const serviceRoute = express.Router();

serviceRoute.use('/emr-workflow-settings', emrWorkflowRouter);
serviceRoute.use('/chief-complaints-duration', chiefDurationRoute);
serviceRoute.use('/patient-chief-complaints', patientChiefRoute);

module.exports = serviceRoute;