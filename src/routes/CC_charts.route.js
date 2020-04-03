const express = require("express");
const CCCCtrl = require("../controllers/critical_care_charts.controller");

const router = express.Router();

router.route("/create").post(CCCCtrl.createCCC);
router.route("/getCCCbypatientid").get(CCCCtrl.getCCCbypatientid);
//router.route("/updateCCCbypatientid").put(CCCCtrl.updateCCCbypatientid);
router.route("/updateCCCbypatientid").post(CCCCtrl.updateCCCbypatientid);
router.route("/getCCCcomparedata").get(CCCCtrl.getCCCcomparedata);
router.route("/getcccdetails").get(CCCCtrl.getcccdetails);
module.exports = router;
