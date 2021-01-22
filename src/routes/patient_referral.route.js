// package Imports
const express = require('express');

// EMR Workflow Controller Import
const referralHistoryController = require('../controllers/patient_referral.controller');

// Express Router Initialize
const referralHistoryRoute = express.Router();

referralHistoryRoute.route('/getReferralHistory').get(referralHistoryController.getReferralHistory);
referralHistoryRoute.route('/getPatientReferral').get(referralHistoryController.getPatientReferral);
referralHistoryRoute.route('/createPatientReferral').post(referralHistoryController.createPatientReferral);
referralHistoryRoute.route('/updatePatientReferral').post(referralHistoryController.updatePatientReferral);
referralHistoryRoute.route('/updatePatientIsAdmitted').post(referralHistoryController.updatePatientIsAdmitted);
module.exports = referralHistoryRoute;