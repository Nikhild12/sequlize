const express = require("express");
const abgCtrl = require("../controllers/abg_charts.controller");

const router = express.Router(); 

router.route("/create").post(abgCtrl.createabg);
router.route("/getabgbypatientid").get(abgCtrl.getabgbypatientid);
router.route("/updateabgbypatientid").put(abgCtrl.updateabgbypatientid);
router.route("/getabgcomparedata").get(abgCtrl.getabgcomparedata);
module.exports = router;