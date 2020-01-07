const express = require("express");
const vitalloincCtrl = require("../controllers/vital_loinc.controller");

const vitalloincRoute = express.Router(); // eslint-disable-line new-cap

vitalloincRoute.route("/addvitalslonic").post(vitalloincCtrl.postvitalslonic);
vitalloincRoute.route("/getvitalslonic").post(vitalloincCtrl.getvitalslonic);

vitalloincRoute.route("/updatevitalslonicById").post(vitalloincCtrl.updatevitalslonicById);
vitalloincRoute.route("/deletevitalslonic").post(vitalloincCtrl.deletevitalslonic);

vitalloincRoute.route("/getvitalslonicById").post(vitalloincCtrl.getvitalslonicById);



module.exports = vitalloincRoute;