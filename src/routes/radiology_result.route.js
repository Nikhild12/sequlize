// package Imports
const express = require('express');

// EMR RadiologyResult Controller Import
const radiologyResultController = require('../controllers/radiology_result.controller');

// Express Router Initialize
const radiologyResultRoute = express.Router();

radiologyResultRoute.route('/getRadiologyResultById').get(radiologyResultController.getRadiologyReusltsById);

module.exports = radiologyResultRoute;