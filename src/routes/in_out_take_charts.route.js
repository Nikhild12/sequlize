const express = require("express");
const in_out_takeCtrl = require("../controllers/in_out_take_charts.controller");

const router = express.Router(); 

router.route("/create").post(in_out_takeCtrl.createin_out_take);
router.route("/getin_out_takebypatientid").get(in_out_takeCtrl.getin_out_takebypatientid);
router.route("/updatein_out_takebypatientid").put(in_out_takeCtrl.updatein_out_takebypatientid);
router.route("/getin_out_takecomparedata").get(in_out_takeCtrl.getin_out_takecomparedata);
module.exports = router;