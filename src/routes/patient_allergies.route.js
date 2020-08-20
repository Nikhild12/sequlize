// package Imports
const express = require('express');

// EMR Workflow Controller Import
const patientAllergiesController = require('../controllers/patient_allergies.controller');

// Express Router Initialize
const patientAllergiesRoute = express.Router();

patientAllergiesRoute.route('/create').post(patientAllergiesController.addNewAllergy);
patientAllergiesRoute.route('/getPatientAllergies').get(patientAllergiesController.getPatientAllergies);
patientAllergiesRoute.route('/getPatientAllergiesById').get(patientAllergiesController.getPatientAllergiesByUserId);
patientAllergiesRoute.route('/updatePatientAllergy').put(patientAllergiesController.updatePatientAllergy);
patientAllergiesRoute.route('/delete').put(patientAllergiesController.deletePatientAllergy);
patientAllergiesRoute.route('/patient-allergy-status').get(patientAllergiesController.getPatientAllergyStatus);

module.exports = patientAllergiesRoute;