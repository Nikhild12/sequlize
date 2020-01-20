// package Imports
const express = require('express');

// EMR Workflow Controller Import
const familyHistoryController = require('../controllers/family_history.controller');

// Express Router Initialize
const familyHistoryRoute = express.Router();

familyHistoryRoute.route('/create').post(familyHistoryController.addFamilyHistory);

module.exports = familyHistoryRoute;