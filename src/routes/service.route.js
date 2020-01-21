const express = require("express");

const emrWorkflowRouter = require("./emr.workflow.route");
const patientChiefRoute = require("./patient_chief_complaints.route");
const emrPatientVitalRouter = require("./emr.patient.vitals.route");
const encounterRouter = require("./encounter.route");
const encounterTypeRouter = require("./encounter.type.route");
const patientDiagnosisRouter = require("./patient.diagnosis.route");
const patientAttachmentsRouter = require("./patient_attachments.route");
//const serviceRoute = express.Router();

const favouriteRoutes = require("./favourite_master_route");
const templateRoutes = require("./template_master.route");
const allergyMasterRoutes = require("./allergyMaster.route");
const allergyTypeRoutes = require("./allergyType.route");
const chiefComplaintCategoryRoutes = require("./chiefComplaintCategory.route");
const chiefComplaintsRoutes = require("./chiefComplaints.route");
const immunizationsRoutes = require("./immunizations.route");
const immunizationScheduleRoutes = require("./immunizationSchedule.route");
const vitalMasterRoutes = require("./vital_master_route");
const vitallonicRoutes = require("./vital_loinc.route");

const diagnosisRoutes = require("./diagnosis.route");
const diagnosisVersionRoutes = require("./diagnosis_version.route");
const diagnosisTypeRoutes = require("./diagnosis_type.route");
const diagnosisCategoryRoutes = require("./diagnosis_category.route");
const diagnosisGradeRoutes = require("./diagnosis_grade.route");
const diagnosisRegionRoutes = require("./diagnosis_region.route");
const bodysiteRoutes = require("./body_site.route");
const emrrefereneRoutes = require("./emr_reference_group.route");
const commonRouter = require("./commonReference.route");
const notetemplateRoutes = require("./note_templates.route");
const proceduresRoutes = require("./procedures.route");
const procedureNoteTemplatesRoutes = require("./procedure_note_templates.route");

const chiefComplaintsRouter = require("./chief.complaints.route");
const chiefDurationRoute = require("./chief_complaints_duration.route");
const treatmentKitRoute = require("./treatment.kit.routes");

const emrHisSetCtrl = require("./emr.history.settings.routes");

const profilesRouter = require("./profiles.route");

const patientAllergieRoute = require("./patient_allergies.route");
const familyHistoryRoute = require('./family_history.route');
const surgeryHistoryRoute = require('./patient_surgeries.route');

const ventilatorRoute = require("./ventilator_charts.route");
const abgRoute = require("./abg_charts.route");

const myPatientListRoute = require("./my.patient-list-filters.route");
const serviceRouter = express.Router();

// EMR Work Flow Settings Routes
serviceRouter.use("/emr-workflow-settings", emrWorkflowRouter);

serviceRouter.use("/patient-diagnosis", patientDiagnosisRouter);

serviceRouter.use("/patientattachments", patientAttachmentsRouter);
// Patient Chief Complaints
serviceRouter.use("/patient-chief-complaints", patientChiefRoute);

// Patient Vitals
serviceRouter.use("/emr-patient-vitals", emrPatientVitalRouter);

// Encounter Routes
serviceRouter.use("/encounter", encounterRouter);
serviceRouter.use("/encounter-type", encounterTypeRouter);

// Patient Diagnosis
serviceRouter.use("/patient-diagnosis", patientDiagnosisRouter);

serviceRouter.use("/favourite", favouriteRoutes);
serviceRouter.use("/template", templateRoutes);

// Allergy Routes
serviceRouter.use("/allergyMaster", allergyMasterRoutes);
serviceRouter.use("/allergyType", allergyTypeRoutes);

// Immunization Routes
serviceRouter.use("/immunizationSchedule", immunizationScheduleRoutes);
serviceRouter.use("/immunizations", immunizationsRoutes);

// Vital Master Routes

serviceRouter.use("/procedures", proceduresRoutes);
serviceRouter.use("/proceduresNoteTemplate", procedureNoteTemplatesRoutes);

serviceRouter.use("/vitalMaster", vitalMasterRoutes);
serviceRouter.use("/vitalLonic", vitallonicRoutes);
serviceRouter.use("/notetemplate", notetemplateRoutes);

// Diagnosis Routes
serviceRouter.use("/diagnosis", diagnosisRoutes);
serviceRouter.use("/diagnosisType", diagnosisTypeRoutes);
serviceRouter.use("/diagnosisVersion", diagnosisVersionRoutes);
serviceRouter.use("/diagnosisCategory", diagnosisCategoryRoutes);
serviceRouter.use("/diagnosisGrade", diagnosisGradeRoutes);
serviceRouter.use("/diagnosisRegion", diagnosisRegionRoutes);
serviceRouter.use("/bodysite", bodysiteRoutes);
serviceRouter.use("/bodyside", bodysiteRoutes);

serviceRouter.use("/Reference", emrrefereneRoutes);
serviceRouter.use("/commonReference", commonRouter);

// Chief Complaints Routes
serviceRouter.use("/chiefComplaints", chiefComplaintsRoutes);
serviceRouter.use("/chief-complaints-duration", chiefDurationRoute);
serviceRouter.use("/chief-complaints-master", chiefComplaintsRouter);
serviceRouter.use("/chiefComplaintCategory", chiefComplaintCategoryRoutes);

// Treatment Kit Routes
serviceRouter.use("/treatment-kit", treatmentKitRoute);

//Patient Allergy History Routes

serviceRouter.use('/patient-allergy', patientAllergieRoute);

// Family History Routes

serviceRouter.use('/family-history', familyHistoryRoute);

// Surgery History Routes

serviceRouter.use('/surgery-history', surgeryHistoryRoute);


// EMR History Settings Routes
serviceRouter.use("/emr-history-settings", emrHisSetCtrl);

// EMR Profiles Routes
serviceRouter.use("/profiles", profilesRouter);
//EMR Critical Care Routes
serviceRouter.use("/ventilator-charts", ventilatorRoute);
serviceRouter.use("/abg-charts", abgRoute);

// My Patient List Routes
serviceRouter.use("/my-patient-list", myPatientListRoute);

module.exports = serviceRouter;
