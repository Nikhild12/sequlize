const express = require("express");
const CCCCtrl = require("../controllers/critical_care_charts.controller");

const router = express.Router(); 

router.route("/create").post(CCCCtrl.createCCC);
router.route("/getCCCbypatientid").get(CCCCtrl.getCCCbypatientid);
//router.route("/updateabgbypatientid").put(abgCtrl.updateabgbypatientid);
//router.route("/getabgcomparedata").get(abgCtrl.getabgcomparedata);
module.exports = router;
