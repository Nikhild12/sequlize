const express = require('express');
const vitalUOMController = require('../controllers/vitalMasterUOM.controller');
const vitalUOMRoute = express.Router();

vitalUOMRoute.route("/addvitaluoms").post(vitalUOMController.addvitaluoms);
//vitalUOMRoute.route("/updatevitaluoms").post(vitalUOMController.updatevitaluoms);
vitalUOMRoute.route("/deletevitaluoms").post(vitalUOMController.deletevitaluoms);
//vitalUOMRoute.route("/getvitaluoms").post(vitalUOMController.getvitaluoms);
//vitalUOMRoute.route("/getuomvitals").post(vitalUOMController.getuomvitals);
//vitalUOMRoute.route("/getvitaluomsbyid").post(vitalUOMController.getvitaluomsbyid);
vitalUOMRoute.route("/getuomsbyvitalid").post(vitalUOMController.getuomsbyvitalid);

module.exports = vitalUOMRoute;