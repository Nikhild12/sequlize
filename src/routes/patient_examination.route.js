// package Imports
const express = require('express');

// EMR Workflow Controller Import
const patientExamination = require('../controllers/patient_examination.controller');

// Express Router Initialize
const patientExaminationRoutes = express.Router();

patientExaminationRoutes.route('/createPatientExamination').post(patientExamination.create_patient_examination);
patientExaminationRoutes.route('/getPatientExaminationByVisit').post(patientExamination.get_patient_examination_by_visit);

module.exports = patientExaminationRoutes;