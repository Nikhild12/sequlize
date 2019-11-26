// package Imports
const express = require('express');

// EMR Workflow Controller Import
const ChiefComplaints = require('../controllers/chief_complaints.controller');

// Express Router Initialize
const ChiefComplaintsRoutes = express.Router();

ChiefComplaintsRoutes.route('/getByFilters').get(ChiefComplaints.getChiefComplaintsFilter);

module.exports = ChiefComplaintsRoutes;