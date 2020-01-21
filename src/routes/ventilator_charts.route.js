const express = require("express");
const ventilatorCtrl = require("../controllers/ventilator_charts.controller");

const router = express.Router(); 

router.route("/create").post(ventilatorCtrl.createVentilator);
router.route("/getventilatorbypatientid").get(ventilatorCtrl.getventilatorbypatientid);
router.route("/updateventilatorbypatientid").put(ventilatorCtrl.updateventilatorbypatientid);
router.route("/deleteVentilatorDetails").put(ventilatorCtrl.deleteVentilatorDetails);
router.route("/getventilatorcomparedata").get(ventilatorCtrl.getventilatorcomparedata);
router.route("/getcccdetails").get(ventilatorCtrl.getcccdetails);
router.route("/getventilatormodes").get(ventilatorCtrl.getventilatormodes);
module.exports = router;