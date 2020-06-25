//package import
const express = require('express');

//emr inesvtigation result controller import
const investigationResultController = require('../controllers/emr_investigation_results.controller');

//express  routes intializer
const investigationRoute = express.Router();

investigationRoute.route('/getInvestigationResultById').get(investigationResultController.getInvestigationResultById);

module.exports = investigationRoute;