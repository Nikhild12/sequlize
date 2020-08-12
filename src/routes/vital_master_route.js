// Package Import
const express = require('express');

// Clinical Favourite Controller Import
const vitalController = require('../controllers/vitalMaster.controller');

// Initilazing Favourite Route
const vitalRoute = express.Router();

vitalRoute.route('/create').post(vitalController.createVital);
vitalRoute.route('/getVitals').get(vitalController.getVitals);//get default vitals

vitalRoute.route('/getAllVitals').get(vitalController.getAllVitals);
vitalRoute.route('/getALLVitalsFilter').post(vitalController.getAllVitalsFilter);

vitalRoute.route('/getVitalByID').post(vitalController.getVitalByID);

vitalRoute.route('/getALLVitalsmaster').post(vitalController.getALLVitalsmaster);
vitalRoute.route('/updatevitals').post(vitalController.updatevitalsById);

vitalRoute.route('/deletevitals').post(vitalController.deletevitals);
vitalRoute.route('/getVitalsByUUID').post(vitalController.getVitalsByUUID);
vitalRoute.route('/getdefultVitals').get(vitalController.getdefultVitals);

module.exports = vitalRoute;