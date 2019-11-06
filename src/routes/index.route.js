// package Imports
const express = require('express');

// Service Route Import
const serviceRoute = require('./service.route');

// Creating Index route
const indexRoute = express.Router();

// Middleware
indexRoute.use('/api',serviceRoute);

// Exporting Index Route
module.exports = indexRoute;