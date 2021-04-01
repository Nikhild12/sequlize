const express = require("express");
const glassPrescriptionCtrl = require("../controllers/glass_prescription.controller");

const router = express.Router();

router.route("/create").post(glassPrescriptionCtrl.postGlassPrescription);
router.route("/get").post(glassPrescriptionCtrl.getGlassPrescription);
router.route("/getbyid").post(glassPrescriptionCtrl.getGlassPrescriptionById);
router.route("/updatebyid").post(glassPrescriptionCtrl.updateGlassPrescriptionById);
router.route("/deletebyid").post(glassPrescriptionCtrl.deleteGlassPrescriptionById);

module.exports = router;