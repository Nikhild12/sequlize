//package Imports
const Express = require('express');

//EMR Workflow Controller Import
const patientSketchesController = require('../controllers/patient_speciality_sketches.controller');

//Express Router Initialize
const sketchRoute = Express.Router();

sketchRoute.route('/create').post(patientSketchesController.createPatientSpecalitySketch);


module.exports = sketchRoute;
