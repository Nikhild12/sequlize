
const express = require("express");
const patientOPEmrCensusCtrl = require("../controllers/patient_op_emr_census_count.controller");
const router = express.Router(); // eslint-disable-line new-cap
/**
 * end points for emr census controller
 */
router.route("/addOPEMRCensusCount").post(patientOPEmrCensusCtrl.addOPEMRCensusCount);
router.route("/getDepartmentWisePatCount").post(patientOPEmrCensusCtrl.getDepartmentWisePatCount);
router.route("/getSessionWisePatCount").post(patientOPEmrCensusCtrl.getSessionWisePatCount);
module.exports = router;