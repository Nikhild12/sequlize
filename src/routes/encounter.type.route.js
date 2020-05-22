// package Imports
const express = require('express');

// EMR Workflow Controller Import
const EncounterType = require('../controllers/encounter.type.controller');

// Express Router Initialize
const EncounterTypeRoutes = express.Router();

EncounterTypeRoutes.route('/getEncounterType').get(EncounterType.getEncounterTypeList);
EncounterTypeRoutes.route('/getEncounterType').post(EncounterType.getEncounterTypeList);


module.exports = EncounterTypeRoutes;
