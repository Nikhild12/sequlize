// package Imports
const express = require('express');

// EMR Workflow Controller Import
const treatmentKitController = require('../controllers/treatment.kit.controller');

// Express Router Initialize
const treatmentKitRoute = express.Router();

treatmentKitRoute.route('/create').post(treatmentKitController.createTreatmentKit);
module.exports = treatmentKitRoute;