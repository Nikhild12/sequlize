const express = require('express');

const emrWorkflowRouter = require('./emr.workflow.route');
const patientChiefRoute = require('./patient_chief_complaints.route');
const emrPatientVitalRouter = require('./emr.patient.vitals.route');
const emrDiagnosisRouter = require('./emr.diagnosis.route');
const serviceRoute = express.Router();

serviceRoute.use('/emr-workflow-settings', emrWorkflowRouter);
serviceRoute.use('/patient-chief-complaints', patientChiefRoute);

serviceRoute.use('/emr-patient-vitals', emrPatientVitalRouter);
serviceRoute.use('/emr-diagnosis', emrDiagnosisRouter);

module.exports = serviceRoute;
