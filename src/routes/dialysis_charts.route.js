const express = require("express");
const dialysisCtrl = require("../controllers/dialysis_charts.controller");

const router = express.Router(); 

router.route("/create").post(dialysisCtrl.createdialysis);
router.route("/getdialysisbypatientid").get(dialysisCtrl.getdialysisbypatientid);
router.route("/updatedialysisbypatientid").put(dialysisCtrl.updatedialysisbypatientid);
router.route("/getdialysiscomparedata").get(dialysisCtrl.getdialysiscomparedata);
module.exports = router;