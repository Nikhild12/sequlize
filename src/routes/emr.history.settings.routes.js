// package Imports
const express = require('express');

// EMR Workflow Controller Import
const emrHistorySettingsController = require('../controllers/emr.history.settings.controller');

// Express Router Initialize
const emrHistorySettingsRoute = express.Router();


emrHistorySettingsRoute.route('/create').post(emrHistorySettingsController.createEmrHistorySettings);
emrHistorySettingsRoute.route('/getById').get(emrHistorySettingsController.getEMRHistorySettingsByUserId);
emrHistorySettingsRoute.route('/delete').put(emrHistorySettingsController.deleteEMRHisSettings);
emrHistorySettingsRoute.route('/update').put(emrHistorySettingsController.updateEMRHistorySettings);
module.exports = emrHistorySettingsRoute;