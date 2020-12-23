// package Imports
const express = require('express');

// EMR Workflow Controller Import
const patientTransferController = require('../controllers/patient_transfer.controller');

// Express Router Initialize
const patientTransferRoute = express.Router();

patientTransferRoute.route('/create').post(patientTransferController.addPatientTransfer);
patientTransferRoute.route('/update').post(patientTransferController.updatePatientTransfer);

module.exports = patientTransferRoute;