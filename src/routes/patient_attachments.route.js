const express = require("express");
const patientattachmentCtrl = require("../controllers/patient_attachments.controller");

const router = express.Router(); 

router.route("/upload").post(patientattachmentCtrl.upload);
router.route("/getattachmenttype").get(patientattachmentCtrl.getattachmenttype);
router.route("/getlistBytype").get(patientattachmentCtrl.getlistBytype);

module.exports = router;