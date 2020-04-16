// package Imports
const express = require('express');

// EMR LabResult Controller Import
const labResultController = require('../controllers/labresults.controller');

// Express Router Initialize
const labResultRoute = express.Router();

labResultRoute.route('/getLabResultById').get(labResultController.getlabreusltsbyid);

module.exports = labResultRoute;