// package Imports
const express = require('express');

// EMR TranferReason Controller Import
const transferReasonController = require('../controllers/transfer_reasons.controller');

// Express Router Initialize
const transferReasonsRoute = express.Router();

transferReasonsRoute.route('/getTransferReasons').get(transferReasonController.getTransferReasons);

module.exports = transferReasonsRoute;