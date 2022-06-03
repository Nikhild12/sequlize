const express = require("express");
const router = express.Router();

const daywisepatientlistCtrl = require("../controllers/dayWisePatientList.controller");

router.route("/getDaywiseNewPatientList").post(daywisepatientlistCtrl.getdaywisepatientdetails);  // H30-50055 ----Day wise Patient List API -Khurshid 
module.exports = router;