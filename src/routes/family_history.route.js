// package Imports
const express = require('express');

// EMR Workflow Controller Import
const familyHistoryController = require('../controllers/family_history.controller');

// Express Router Initialize
const familyHistoryRoute = express.Router();

familyHistoryRoute.route('/create').post(familyHistoryController.addFamilyHistory);
familyHistoryRoute.route('/getFamilyHistory').get(familyHistoryController.getFamilyHistory);
familyHistoryRoute.route('/deleteFamilyHistory').put(familyHistoryController.deleteFamilyHistory);
familyHistoryRoute.route('/getFamilyHistoryById').get(familyHistoryController.getFamilyHistoryById);
familyHistoryRoute.route('/updateFamilyHistory').put(familyHistoryController.updateFamilyHistory);
module.exports = familyHistoryRoute;