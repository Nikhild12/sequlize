const express = require("express");

const emrWorkflowRouter = require("./emr.workflow.route");
const patientChiefRoute = require("./patient_chief_complaints.route");
const emrPatientVitalRouter = require("./emr.patient.vitals.route");
const encounterRouter = require("./encounter.route");
const dashboardRouter = require("./dash_board.route");
const encounterTypeRouter = require("./encounter.type.route");
const patientDiagnosisRouter = require("./patient.diagnosis.route");
const patientAttachmentsRouter = require("./patient_attachments.route");
const patientTreatmentRoute = require("./patient_treatment.route");

const favouriteRoutes = require("./favourite_master_route");
const templateRoutes = require("./template_master.route");
const allergyMasterRoutes = require("./allergyMaster.route");
const allergyTypeRoutes = require("./allergyType.route");
const chiefComplaintCategoryRoutes = require("./chiefComplaintCategory.route");
const chiefComplaintsRoutes = require("./chiefComplaints.route");
const immunizationsRoutes = require("./immunizations.route");
const immunizationScheduleRoutes = require("./immunizationSchedule.route");
const vitalMasterRoutes = require("./vital_master_route");
const vitalMasterUOMRoutes = require("./vital_master_uoms.route");
const vitallonicRoutes = require("./vital_loinc.route");
const dischargeSummaryRoute = require("./discharge.summary.settings.route");

const facilityUsageDetailsRouter = require("./facility_usage_details.route"); // H30-48834- Api facility usage details (khurshid)
const diagnosisSearchRoutes = require('./diagnosis_search.route');  // H30-48750 Api for diagnosis search (khurshid)
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
const emrCccSetCtrl = require("./emr_ccc_settings.route");
const bodySideRoute = require("./body_side.route");

const surgeryPositionRoute = require("./surgery.position.route");

const profilesRouter = require("./profiles.route");

// Import Diseases Controller
const diseasesRoute = require("./diseases.route");

// Patient History routes
const patientAllergieRoute = require("./patient_allergies.route");
const familyHistoryRoute = require("./family_history.route");
const surgeryHistoryRoute = require("./patient_surgeries.route");
const referralHistoryRoute = require("./patient_referral.route");
const patientTransferRoute = require("./patient_transfer.route");
//LabResult routes

const labResultRoute = require("./labresult.route");

//RadiologyResult routes

const radiologyResultRoute = require("./radiology_result.route");


//Import ReferalReasons routes

const referalReasonsroute = require("./referal_reasons.route");

const trsnferReasonsRoute = require("./transfer_reasons.route");

//EMR CRITICAL CARE CHARTS ROUTES
const CCCRoute = require("./CC_charts.route");

const myPatientListRoute = require("./my.patient-list-filters.route");
// const myPatientListRoute = require("./my.patient-list-filters.route");
const specialitySketcheRoute = require("./speciality_Sketches.route");
const cccRoute = require("./cccMaster.route");

const patientImmunizationRoute = require("./patient_immunization_schedules.route");

//OPNotes sections routes
const sectionsRouter = require("./sections.route");

//OPNotes categories routes
const categoriesRouter = require("./categories.route");

//patient certificate routes
const certificateRouter = require("./patient_certificates.route");

//patient specality sketch routes
const sketchRouter = require("./patient_speciality_sketches.route");

//snomed details routes
const smRouter = require("./snomed_details.route");

//progress Notes details routes
const progressRoute = require("./progress_notes.route");

//clinical Notes details routes
const clinicalRoute = require("./clinical_notes.route");

//notes details routes
const notesRoute = require("./emr_patient_notes.route");

const serviceRouter = express.Router();

//Discharge summary
const dischargeSummary = require("./discharge_summary.route");

// Favourite Type
const favouriteType = require('./favourite_type.route');

//investigation results
const investigationResult = require('./emr_investigation_results.route');

//drug frequency results
const drugfrequencyRoutes = require('./drug-frequency-results.route');

// health history
const healthHistoryRoutes = require('./health_history.route');

// glass prescription
const glassPrescriptionRoutes = require('./glass_prescription.route');
// glass prescription details
const glassPrescriptionDetailsRoutes = require('./glass_prescription_details.route');

// history routes
const historyRoutes = require('./history.route');

// examination routes
const examinationRoutes = require('./examination.route');

// patient examination routes
const patientExaminationRoutes = require('./patient_examination.route');

// patient history routes
const patientHistoryRoutes = require('./patient_history.route');

// Diet Kitchen routes
const dietKitchenRoutes = require('./diet_kitchen.route');

const getSpecificPatientVitalRoutes = require('./getSpecficPatVital.route');

const getSpecilaitywisereferRoutes = require('./specialitywisepatRefer.route');


const getCommunitywisereferRoutes = require('./communityWiseRefer.route');




const depDiagnosiscountRoutes = require('./depDiagnosiscount.route');

const patientemrcensusRoutes = require('./patientemrcensus.route');

const patientopemrcensusRoutes = require('./patient_op_emr_census.route');

// EMR Work Flow Settings Routes

serviceRouter.use("/Dep_Diagnosis_count", depDiagnosiscountRoutes);

serviceRouter.use("/speciality_wise_refer_out", getSpecilaitywisereferRoutes);

serviceRouter.use("/community_wise_refer_report", getCommunitywisereferRoutes);



serviceRouter.use("/getSpecPatientVital", getSpecificPatientVitalRoutes);




serviceRouter.use("/emr-workflow-settings", emrWorkflowRouter);

serviceRouter.use("/patient-diagnosis", patientDiagnosisRouter);

serviceRouter.use("/patientattachments", patientAttachmentsRouter);
// Patient Chief Complaints
serviceRouter.use("/patient-chief-complaints", patientChiefRoute);

// Patient Vitals
serviceRouter.use("/emr-patient-vitals", emrPatientVitalRouter);

//EMR Dashboard
serviceRouter.use("/dashboard", dashboardRouter);
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

// Vital Master UOM Routes
serviceRouter.use("/vitalMasterUOM", vitalMasterUOMRoutes);

serviceRouter.use("/facilitydetails", facilityUsageDetailsRouter); // H30-48834 Api for facility usage details (khurshid)
// Diagnosis Routes
serviceRouter.use("/diagnosisNew", diagnosisSearchRoutes); // H30-48750 Api for diagnosis search (khurshid)
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

//LabResult
serviceRouter.use("/lab-result", labResultRoute);

//RadiologyResult

serviceRouter.use("/radiology_result", radiologyResultRoute);

//ReferalReasons routes

serviceRouter.use("/referal-reasons", referalReasonsroute);

serviceRouter.use("/transfer-reasons", trsnferReasonsRoute);
//Patient Allergy History Routes

serviceRouter.use("/patient-allergy", patientAllergieRoute);

// Family History Routes

serviceRouter.use("/family-history", familyHistoryRoute);

// Surgery History Routes
serviceRouter.use("/surgery-history", surgeryHistoryRoute);

// Referral History Routes
serviceRouter.use("/patient-referral", referralHistoryRoute);

// Patient Transfer ROutes
serviceRouter.use("/patient-transfer", patientTransferRoute);

// EMR History Settings Routes
serviceRouter.use("/emr-history-settings", emrHisSetCtrl);

// EMR ccc Settings Routes
serviceRouter.use("/emr-ccc-settings", emrCccSetCtrl);

// EMR Profiles Routes
serviceRouter.use("/profiles", profilesRouter);

//EMR Critical Care Routes
serviceRouter.use("/CC-charts", CCCRoute);

// My Patient List Routes
serviceRouter.use("/my-patient-list", myPatientListRoute);

//speciality Routes
serviceRouter.use("/speciality", specialitySketcheRoute);

//CCC Master Routes
serviceRouter.use("/ccc", cccRoute);

//EMR Patient Immunization Schedules  Routes
serviceRouter.use("/immunization", patientImmunizationRoute);

// Discharge Summary Settings
serviceRouter.use("/discharge-summary", dischargeSummaryRoute);

// EMR section Routes
serviceRouter.use("/sections", sectionsRouter);

// EMR categories Routes
serviceRouter.use("/categories", categoriesRouter);

// Body Sides Routes
serviceRouter.use("/body-side", bodySideRoute);

// Surgery Position Routes
serviceRouter.use("/surgery-position", surgeryPositionRoute);

// Patient Treatment Routes
serviceRouter.use("/patient-treatment", patientTreatmentRoute);
// Discharge Summary Routes
serviceRouter.use("/discharge-summary", dischargeSummary);

// patient certificate Routes
serviceRouter.use("/certificates", certificateRouter);

//snomed details Routes
serviceRouter.use("/snomed", smRouter);

//patient specality skecth Routes
serviceRouter.use("/patient-speciality-sketch", sketchRouter);

// Diseases Routes
serviceRouter.use("/diseases", diseasesRoute);

// progressNotes Routes
serviceRouter.use("/progress", progressRoute);

// clinicalNotes Routes
serviceRouter.use("/clinical", clinicalRoute);

// progressNotes Routes
serviceRouter.use("/emr-notes", notesRoute);

// favourite Type
serviceRouter.use('/favourite-type', favouriteType);

// investigation result
serviceRouter.use('/investigation_result', investigationResult);
// drugfrequency result
serviceRouter.use('/drug-frequencyResult', drugfrequencyRoutes);
// health_history
serviceRouter.use("/health_history", healthHistoryRoutes);
//glass prescription
serviceRouter.use("/glass_prescription", glassPrescriptionRoutes);
//glass prescription details
serviceRouter.use("/glass_prescription_details", glassPrescriptionDetailsRoutes);

//history
serviceRouter.use("/history", historyRoutes);

//examination
serviceRouter.use("/examination", examinationRoutes);

//patient examination
serviceRouter.use("/patient_examination", patientExaminationRoutes);

//patient examination
serviceRouter.use("/patient_history", patientHistoryRoutes);

//diet kitchen
serviceRouter.use("/diet_kitchen", dietKitchenRoutes);

//  route config for patient emr census controller
// Bhaskar H30-46770 - New API for Emr census Count Entry
serviceRouter.use('/patientemrcensus', patientemrcensusRoutes); 
// Bhaskar H30-46770 - New API for Emr census Count Entry

//  route config for patient op emr census controller
serviceRouter.use('/patientopemrcensus', patientopemrcensusRoutes); 

module.exports = serviceRouter;