const express = require('express');

const emrWorkflowRouter = require('./emr.workflow.route');
const patientChiefRoute = require('./patient_chief_complaints.route');
const emrPatientVitalRouter = require('./emr.patient.vitals.route');
const encounterRouter = require('./encounter.route');
const encounterTypeRouter = require('./encounter.type.route');
const patientDiagnosisRouter = require('./patient.diagnosis.route');
const uploadRouter = require('./upload.route');
const serviceRoute = express.Router();

const favouriteRoutes = require('./favourite_master_route');
const templateRoutes = require('./template_master.route');
const allergyMasterRoutes = require("./allergyMaster.route");
const allergyTypeRoutes = require("./allergyType.route");
const chiefComplaintCategoryRoutes = require("./chiefComplaintCategory.route");
const chiefComplaintsRoutes = require("./chiefComplaints.route");
const immunizationsRoutes = require("./immunizations.route");
const immunizationScheduleRoutes = require("./immunizationSchedule.route");
const vitalMasterRoutes = require("./vital_master_route");
const diagnosisRoutes = require("./diagnosis.route");
const chiefComplaintsRouter = require('./chief.complaints.route');
const chiefDurationRoute = require('./chief_complaints_duration.route');

const serviceRouter = express.Router();

// EMR Work Flow Settings Routes
serviceRouter.use('/emr-workflow-settings', emrWorkflowRouter);

serviceRoute.use('/patient-diagnosis', patientDiagnosisRouter);
serviceRoute.use('/upload',uploadRouter);
// Patient Chief Complaints
serviceRouter.use('/patient-chief-complaints', patientChiefRoute);

// Patient Vitals
serviceRouter.use('/emr-patient-vitals', emrPatientVitalRouter);

// Encounter Routes
serviceRouter.use('/encounter', encounterRouter);
serviceRouter.use('/encounter-type', encounterTypeRouter);

// Patient Diagnosis
serviceRouter.use('/patient-diagnosis', patientDiagnosisRouter);

serviceRouter.use('/favourite', favouriteRoutes);
serviceRouter.use('/template', templateRoutes);

// Allergy Routes
serviceRouter.use('/allergyMaster', allergyMasterRoutes);
serviceRouter.use('/allergyType', allergyTypeRoutes);

// Immunization Routes
serviceRouter.use('/immunizationSchedule', immunizationScheduleRoutes);
serviceRouter.use('/immunizations', immunizationsRoutes);

// Vital Master Routes
serviceRouter.use('/vitalMaster', vitalMasterRoutes);

// Diagnosis Routes
serviceRouter.use('/diagnosis', diagnosisRoutes);

// Chief Complaints Routes
serviceRouter.use('/chiefComplaints', chiefComplaintsRoutes);
serviceRouter.use('/chief-complaints-duration', chiefDurationRoute);
serviceRouter.use('/chief-complaints-master', chiefComplaintsRouter);
serviceRouter.use('/chiefComplaintCategory', chiefComplaintCategoryRoutes);

module.exports = serviceRouter;
