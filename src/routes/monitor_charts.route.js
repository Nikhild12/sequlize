const express = require("express");
const monitorCtrl = require("../controllers/monitor_charts.controller");

const router = express.Router(); 

router.route("/create").post(monitorCtrl.createmonitor);
router.route("/getmonitorbypatientid").get(monitorCtrl.getmonitorbypatientid);
router.route("/updatemonitorbypatientid").put(monitorCtrl.updatemonitorbypatientid);
router.route("/getmonitorcomparedata").get(monitorCtrl.getmonitorcomparedata);
module.exports = router;