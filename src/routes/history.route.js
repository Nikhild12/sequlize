// package Imports
const express = require('express');

// EMR Workflow Controller Import
const history = require('../controllers/history.controller');

// Express Router Initialize
const historyRoutes = express.Router();

historyRoutes.route('/getHistoryAndSectionsByNameorCode').post(history.getHistoryAndSectionsByNameorCode);
historyRoutes.route('/createHistory').post(history.createHistory);  //H30-47434-Saju-Migrate history master api from JAVA to NODE
historyRoutes.route('/getAllActiveCategory').get(history.getAllActiveCategory);  //H30-47434-Saju-Migrate get category api from JAVA to NODE
historyRoutes.route('/getAllActiveSubCategory').get(history.getAllActiveSubCategory);  //H30-47434-Saju-Migrate get category api from JAVA to NODE
historyRoutes.route('/getHistoryByUuid').get(history.getHistoryByUuid);  //H30-47434-Saju-Migrate get history by uuid api from JAVA to NODE
historyRoutes.route('/hitoryList').post(history.getHitoryList);  //H30-47434-Saju-Migrate get history list api from JAVA to NODE
historyRoutes.route('/updateHistory').post(history.updateHistory);  //H30-47434-Saju-Migrate history master api from JAVA to NODE
historyRoutes.route('/deleteHistory').post(history.deleteHistory);  //H30-47434-Saju-Migrate history master api from JAVA to NODE

module.exports = historyRoutes;