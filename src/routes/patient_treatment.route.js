// package Imports
const express = require('express');

// EMR Workflow Controller Import
const patientTreatmentCtrl = require('../controllers/patient_treatments.controller');

// Express Router Initialize
const patientTKRoute = express.Router();

patientTKRoute.route('/create').post(patientTreatmentCtrl.createPatientTreatment);
patientTKRoute.route('/prevKitOrdersById').get(patientTreatmentCtrl.prevKitOrdersById);
patientTKRoute.route('/repeatOrderDetails').post(patientTreatmentCtrl.repeatOrderById);

module.exports = patientTKRoute;