// Package Import
const express = require('express');

// Clinical Favourite Controller Import
const vitalController = require('../controllers/vitalMaster.controller');

// Initilazing Favourite Route
const vitalRoute = express.Router();

vitalRoute.route('/create').post(vitalController.createVital);
vitalRoute.route('/getVitals').post(vitalController.getVitals);//get default vitals

vitalRoute.route('/getAllVitals').post(vitalController.getAllVitals);

vitalRoute.route('/getVitalByID').post(vitalController.getVitalByID);

vitalRoute.route('/getALLVitalsmaster').post(vitalController.getALLVitalsmaster);
vitalRoute.route('/updatevitals').post(vitalController.updatevitalsById);

vitalRoute.route('/deletevitals').post(vitalController.deletevitals);


module.exports = vitalRoute;