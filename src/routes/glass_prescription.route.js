const express = require("express");
const glassPrescriptionCtrl = require("../controllers/glass_prescription.controller");

const router = express.Router();

router.route("/create").post(glassPrescriptionCtrl.postGlassPrescription);

module.exports = router;