// package Imports
const express = require('express');

// EMR Workflow Controller Import
const history = require('../controllers/history.controller');

// Express Router Initialize
const historyRoutes = express.Router();

historyRoutes.route('/getHistoryAndSectionsByNameorCode').post(history.getHistoryAndSectionsByNameorCode);
historyRoutes.route('/createOrUpdateHistory').post(history.createHistory);  //H30-47434-Saju-Migrate history master api from JAVA to NODE

module.exports = historyRoutes;