// package Imports
const express = require('express');

// EMR Workflow Controller Import
const emrCccSettingsController = require('../controllers/emr_ccc_settings.controller');

// Express Router Initialize
const emrHistorySettingsRoute = express.Router();


emrHistorySettingsRoute.route('/create').post(emrCccSettingsController.createEmrCccSettings);
emrHistorySettingsRoute.route('/delete').put(emrCccSettingsController.deleteEMRCccSettings);
emrHistorySettingsRoute.route('/update').put(emrCccSettingsController.updateEMRCccSettings);
module.exports = emrHistorySettingsRoute;