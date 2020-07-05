//package Imports
const Express = require('express');

//EMR Workflow Controller Import
const patientSketchesController = require('../controllers/patient_speciality_sketches.controller');

//Express Router Initialize
const sketchRoute = Express.Router();

sketchRoute.route('/create').post(patientSketchesController.createPatientSpecalitySketch);
sketchRoute.route('/get-prev-by-patient').get(patientSketchesController.getPrevPatientSpecialitySketch);


module.exports = sketchRoute;
