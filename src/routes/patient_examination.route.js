// package Imports
const express = require('express');

// EMR Workflow Controller Import
const patientExamination = require('../controllers/patient_examination.controller');

// Express Router Initialize
const patientExaminationRoutes = express.Router();

patientExaminationRoutes.route('/createPatientExamination').post(patientExamination.create_patient_examination);
patientExaminationRoutes.route('/create_exmination_section_and_section_values').post(patientExamination.create_exmination_section_and_section_values);

module.exports = patientExaminationRoutes;