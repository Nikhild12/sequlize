//package Imports
const Express = require('express');

//EMR Workflow Controller Import
const patientSketchesController = require('../controllers/patient_speciality_sketches.controller');

//Express Router Initialize
const sketchRoute = Express.Router();

// Multer Middleware
const middleware = require('../middleware/middleware');

sketchRoute.route('/create').post(middleware.multerupload('/pssketch').array('file', 10), patientSketchesController.createPatientSpecalitySketch);
sketchRoute.route('/get-prev-by-patient').get(patientSketchesController.getPrevPatientSpecialitySketch);


module.exports = sketchRoute;
