// package Imports
const express = require('express');

// EMR Workflow Controller Import
const ChiefComplaints = require('../controllers/chief_complaints.controller');

// Express Router Initialize
const ChiefComplaintsRoutes = express.Router();

ChiefComplaintsRoutes.route('/getByFilters').get(ChiefComplaints.getChiefComplaintsFilter);
ChiefComplaintsRoutes.route('/create').post(ChiefComplaints.createChiefComplaints);
ChiefComplaintsRoutes.route('/getAll').post(ChiefComplaints.getChiefComplaints);

ChiefComplaintsRoutes.route('/getById').get(ChiefComplaints.getChiefComplaintsById);
ChiefComplaintsRoutes.route('/update').put(ChiefComplaints.updateChiefComplaintsById);
ChiefComplaintsRoutes.route('/delete').put(ChiefComplaints.deleteChiefComplaints);

module.exports = ChiefComplaintsRoutes;