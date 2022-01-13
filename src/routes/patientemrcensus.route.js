// Bhaskar H30-46770 - New API for Emr census Count Entry
const express = require("express");
const patientEmrCensusCtrl = require("../controllers/patient_emr_census_count.controller");
const router = express.Router(); // eslint-disable-line new-cap
/**
 * end points for emr census controller
 */
router.route("/addEMRCensusCount").post(patientEmrCensusCtrl.addEMRCensusCount);

module.exports = router;
// Bhaskar H30-46770 - New API for Emr census Count Entry