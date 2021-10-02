// package Imports
const express = require('express');

// EMR Workflow Controller Import
const history = require('../controllers/history.controller');

// Express Router Initialize
const historyRoutes = express.Router();

historyRoutes.route('/getHistoryAndSectionsByNameorCode').post(history.getHistoryAndSectionsByNameorCode);

module.exports = historyRoutes;