const express = require("express");
const router = express.Router();

const facilityusagedetailsCtrl = require("../controllers/facility_usage_details.controller");

router.route("/getFacilityUsageDetails").post(facilityusagedetailsCtrl.getfacilityusagedetails);  // ---- Khurshid ------- H30-48834---Facility Usage Details API

module.exports = router;