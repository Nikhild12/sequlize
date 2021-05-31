const express = require("express");
const glassPrescriptionDetailsCtrl = require("../controllers/glass_prescription_details.controller");

const router = express.Router();

router.route("/create").post(glassPrescriptionDetailsCtrl.postGlassPrescriptionDetails);
router.route("/get").post(glassPrescriptionDetailsCtrl.getGlassPrescriptionDetails);
router.route("/getbyid").post(glassPrescriptionDetailsCtrl.getGlassPrescriptionDetailsById);
router.route("/updatebyid").post(glassPrescriptionDetailsCtrl.updateGlassPrescriptionDetailsById);
router.route("/deletebyid").post(glassPrescriptionDetailsCtrl.deleteGlassPrescriptionDetailsById);

module.exports = router;