// package Imports
const express = require('express');

// EMR Workflow Controller Import
const examination = require('../controllers/examination.controller');

// Express Router Initialize
const examinationRoutes = express.Router();

examinationRoutes.route('/getExaminationAndSectionsByNameorCode').post(examination.getExaminationAndSectionsByNameorCode);

module.exports = examinationRoutes;