// package Imports
const express = require('express');

// EMR Workflow Controller Import
const ChiefComplaints = require('../controllers/chief_complaints.controller');

// Express Router Initialize
const ChiefComplaintsRoutes = express.Router();

ChiefComplaintsRoutes.route('/getByFilters').get(ChiefComplaints.getChiefComplaintsFilter);
ChiefComplaintsRoutes.route('/getBySearch').post(ChiefComplaints.getChiefComplaintsSearch);
ChiefComplaintsRoutes.route('/create').post(ChiefComplaints.createChiefComplaints);
ChiefComplaintsRoutes.route('/getAll').post(ChiefComplaints.getChiefComplaints);

ChiefComplaintsRoutes.route('/getById').post(ChiefComplaints.getChiefComplaintsById);
ChiefComplaintsRoutes.route('/update').post(ChiefComplaints.updateChiefComplaintsById);
ChiefComplaintsRoutes.route('/delete').post(ChiefComplaints.deleteChiefComplaints);

module.exports = ChiefComplaintsRoutes;