// package Imports
const express = require('express');

// EMR Workflow Controller Import
const surgeryHistoryController = require('../controllers/patient_surgeries.controller');

// Express Router Initialize
const surgeryHistoryRoute = express.Router();

surgeryHistoryRoute.route('/create').post(surgeryHistoryController.addSurgery);
surgeryHistoryRoute.route('/getSurgeryHistory').get(surgeryHistoryController.getSurgeryHistory);
surgeryHistoryRoute.route('/getSurgeryById').get(surgeryHistoryController.getSurgeryHistoryById);
surgeryHistoryRoute.route('/updateSurgery').put(surgeryHistoryController.updateSurgeryHistory);
module.exports = surgeryHistoryRoute;