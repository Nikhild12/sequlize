const express = require("express");
const ventilatorCtrl = require("../controllers/ventilator_charts.controller");

const router = express.Router(); 

router.route("/create").post(ventilatorCtrl.createVentilator);
router.route("/getventilatorbypatientid").get(ventilatorCtrl.getventilatorbypatientid);
router.route("/updateventilatorbypatientid").put(ventilatorCtrl.updateventilatorbypatientid);
router.route("/deleteVentilatorDetails").put(ventilatorCtrl.deleteVentilatorDetails);
//router.route("/download").get(patientattachmentCtrl.download);
//router.route("/deleteAttachmentDetails").put(patientattachmentCtrl.deleteAttachmentDetails);
module.exports = router;