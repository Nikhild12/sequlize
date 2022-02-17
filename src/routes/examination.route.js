// package Imports
const express = require('express');

// EMR Workflow Controller Import
const examination = require('../controllers/examination.controller');

// Express Router Initialize
const examinationRoutes = express.Router();

examinationRoutes.route('/getExaminationAndSectionsByNameorCode').post(examination.getExaminationAndSectionsByNameorCode);
examinationRoutes.route('/createExamination').post(examination.createExamination); //H30-47434-Saju-Migrate history master api from JAVA to NODE

module.exports = examinationRoutes;