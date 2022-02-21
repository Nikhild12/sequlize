// package Imports
const express = require('express');

// EMR Workflow Controller Import
const examination = require('../controllers/examination.controller');

// Express Router Initialize
const examinationRoutes = express.Router();

examinationRoutes.route('/getExaminationAndSectionsByNameorCode').post(examination.getExaminationAndSectionsByNameorCode);
examinationRoutes.route('/createExamination').post(examination.createExamination); //H30-47434-Saju-Migrate history master api from JAVA to NODE
examinationRoutes.route('/getAllActiveCategory').get(examination.getAllActiveCategory);  //H30-47434-Saju-Migrate get category api from JAVA to NODE
examinationRoutes.route('/getAllActiveSubCategory').get(examination.getAllActiveSubCategory);  //H30-47434-Saju-Migrate get category api from JAVA to NODE
examinationRoutes.route('/getExaminationByUuid').get(examination.getExaminationByUuid);  //H30-47434-Saju-Migrate get examination by uuid api from JAVA to NODE
examinationRoutes.route('/examinationList').post(examination.getExaminationList);  //H30-47434-Saju-Migrate get history list api from JAVA to NODE
examinationRoutes.route('/updateExamination').post(examination.updateExamination); //H30-47434-Saju-Migrate history master api from JAVA to NODE

module.exports = examinationRoutes;