// package Imports
const express = require('express');

// Service Route Import
const serviceRoute = require('./service.route');

// Authenticate Service Import
const authenticateService = require('../services/authenticate.service');

// Creating Index route
const indexRoute = express.Router();

// Middleware
indexRoute.use('/HMIS-EMR/v1/api', authenticateService, serviceRoute);

// Exporting Index Route
module.exports = indexRoute;