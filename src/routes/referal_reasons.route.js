// package Imports
const express = require('express');

// EMR Workflow Controller Import
const referralReasonController = require('../controllers/referal_reasons.controller');

// Express Router Initialize
const referralReasonsRoute = express.Router();

referralReasonsRoute.route('/getReferralReasons').get(referralReasonController.getReferalReasons);

module.exports = referralReasonsRoute;