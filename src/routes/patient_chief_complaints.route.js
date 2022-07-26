// package Imports
const express = require("express");

// EMR Workflow Controller Import
const PatientChiefComplaints = require("../controllers/patient_chief_complaints");

// Express Router Initialize
const PatientChiefCompRoutes = express.Router();

PatientChiefCompRoutes.route("/create").post(
  PatientChiefComplaints.createChiefComplaints
);
PatientChiefCompRoutes.route("/getByFilters").get(
  PatientChiefComplaints.getPatientChiefComplaints
);
PatientChiefCompRoutes.route("/getMockJson").get(
  PatientChiefComplaints.getMobileMockAPI
);
PatientChiefCompRoutes.route("/get-prev-pat-cc-by-patientId").get(
  PatientChiefComplaints.getPreviousChiefComplaintsByPatientId
);
PatientChiefCompRoutes.route("/create_chief_complaints_section_and_section_value").post(  PatientChiefComplaints.create_chief_complaints_section_and_section_values);
module.exports = PatientChiefCompRoutes;
