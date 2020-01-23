const express = require("express");
const bpCtrl = require("../controllers/bp_charts.controller");

const router = express.Router(); 

router.route("/create").post(bpCtrl.createbp);
router.route("/getbpbypatientid").get(bpCtrl.getbpbypatientid);
router.route("/updatebpbypatientid").put(bpCtrl.updatebpbypatientid);
router.route("/getbpcomparedata").get(bpCtrl.getbpcomparedata);
module.exports = router;