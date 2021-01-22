// package Imports
const express = require('express');

// EMR Workflow Controller Import
const patientTransferController = require('../controllers/patient_transfer.controller');

// Express Router Initialize
const patientTransferRoute = express.Router();

patientTransferRoute.route('/create').post(patientTransferController.addPatientTransfer);
patientTransferRoute.route('/update').post(patientTransferController.updatePatientTransfer);
patientTransferRoute.route('/getByPatientId').get(patientTransferController.getPatientTransferByPatientId);

module.exports = patientTransferRoute;