// package Imports
const express = require('express');

// EMR Workflow Controller Import
const PatientChiefComplaints = require('../controllers/patient_chief_complaints');

// Express Router Initialize
const PatientChiefCompRoutes = express.Router();

PatientChiefCompRoutes.route('/create').post(PatientChiefComplaints.createChiefComplaints)

module.exports = PatientChiefCompRoutes;