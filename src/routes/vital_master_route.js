// Package Import
const express = require('express');

// Clinical Favourite Controller Import
const vitalController = require('../controllers/vitalMaster.controller');

// Initilazing Favourite Route
const vitalRoute = express.Router();

vitalRoute.route('/create').post(vitalController.createVital);
vitalRoute.route('/getVitals').get(vitalController.getVitals);//get default vitals

vitalRoute.route('/getAllVitals').get(vitalController.getAllVitals);

vitalRoute.route('/getVitalByID').get(vitalController.getVitalByID);


module.exports = vitalRoute;