// package Imports
const express = require('express');

// Service Route Import
const serviceRoute = require('./service.route');

// Authenticate Service Import
const authenticateService = require('../services/authenticate.service');

// Creating Index route
const indexRoute = express.Router();

// Middleware
indexRoute.use('/api', authenticateService, serviceRoute);

//Logging - 19_02_2020
const config = require("../config/config");
config.requestDate =  new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Kolkata'
});
//Logging - 19_02_2020

const moment = require("moment");

const utcMoment = moment.utc();
config.requestDate = new Date(utcMoment.format());

// Exporting Index Route
module.exports = indexRoute;