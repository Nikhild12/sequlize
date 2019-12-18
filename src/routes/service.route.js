const express = require('express');

const emrWorkflowRouter = require('./emr.workflow.route');
const patientChiefRoute = require('./patient_chief_complaints.route');
const emrPatientVitalRouter = require('./emr.patient.vitals.route');
const emrDiagnosisRouter = require('./emr.diagnosis.route');
const encounterRouter = require('./encounter.route');
const encounterTypeRouter = require('./encounter.type.route');
const patientDiagnosisRouter = require('./patient.diagnosis.route');
const uploadRouter = require('./upload.route');
const serviceRoute = express.Router();

serviceRoute.use('/emr-workflow-settings', emrWorkflowRouter);
serviceRoute.use('/patient-chief-complaints', patientChiefRoute);

serviceRoute.use('/emr-patient-vitals', emrPatientVitalRouter);
serviceRoute.use('/emr-diagnosis', emrDiagnosisRouter);

serviceRoute.use('/encounter', encounterRouter);
serviceRoute.use('/encounter-type', encounterTypeRouter);

serviceRoute.use('/patient-diagnosis', patientDiagnosisRouter);
serviceRoute.use('/upload',uploadRouter);

module.exports = serviceRoute;
