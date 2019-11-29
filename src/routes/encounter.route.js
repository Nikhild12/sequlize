// package Imports
const express = require('express');

// EMR Workflow Controller Import
const Encounter = require('../controllers/encounter.controller');

// Express Router Initialize
const EncounterRoutes = express.Router();

EncounterRoutes.route('/create').post(Encounter.createPatientEncounter);
EncounterRoutes.route('/getEncounterByDocAndPatientId').get(Encounter.getEncounterByDocAndPatientId);

module.exports = EncounterRoutes;