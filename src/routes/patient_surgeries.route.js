// package Imports
const express = require('express');

// EMR Workflow Controller Import
const surgeryHistoryController = require('../controllers/patient_surgeries.controller');

// Express Router Initialize
const surgeryHistoryRoute = express.Router();

surgeryHistoryRoute.route('/create').post(surgeryHistoryController.addSurgery);
module.exports = surgeryHistoryRoute;