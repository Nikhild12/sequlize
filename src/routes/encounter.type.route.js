// package Imports
const express = require('express');

// EMR Workflow Controller Import
const EncounterType = require('../controllers/encounter.type.controller');

// Express Router Initialize
const EncounterTypeRoutes = express.Router();

EncounterTypeRoutes.route('/getEncounterType').get(EncounterType.getEncounterTypeList);
EncounterTypeRoutes.route('/getEncounterTypeByPost').post(EncounterType.getEncounterTypeList);


module.exports = EncounterTypeRoutes;
