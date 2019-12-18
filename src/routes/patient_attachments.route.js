const express = require("express");
const patientattachmentCtrl = require("../controllers/patient_attachments.controller");

const router = express.Router(); 

router.route("/upload").post(patientattachmentCtrl.upload);
router.route("/getvisittype").get(patientattachmentCtrl.getvisittype);

module.exports = router;