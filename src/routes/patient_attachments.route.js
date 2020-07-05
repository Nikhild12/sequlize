const express = require("express");
const patientattachmentCtrl = require("../controllers/patient_attachments.controller");

const router = express.Router(); 

router.route("/upload").post(patientattachmentCtrl.upload);
router.route("/getattachmenttype").get(patientattachmentCtrl.getattachmenttype);
router.route("/getlistBytype").get(patientattachmentCtrl.getlistBytype);
router.route("/getAllAttachments").get(patientattachmentCtrl.getAllAttachments);
router.route("/download").get(patientattachmentCtrl.download);
router.route("/deleteAttachmentDetails").put(patientattachmentCtrl.deleteAttachmentDetails);
module.exports = router;