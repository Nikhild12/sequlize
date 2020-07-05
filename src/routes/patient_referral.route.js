// package Imports
const express = require('express');

// EMR Workflow Controller Import
const referralHistoryController = require('../controllers/patient_referral.controller');

// Express Router Initialize
const referralHistoryRoute = express.Router();

referralHistoryRoute.route('/getReferralHistory').get(referralHistoryController.getReferralHistory);
referralHistoryRoute.route('/createPatientReferral').post(referralHistoryController.createPatientReferral);
module.exports = referralHistoryRoute;