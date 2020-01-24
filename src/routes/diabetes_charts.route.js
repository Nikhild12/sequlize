const express = require("express");
const diabetesCtrl = require("../controllers/diabetes_charts.controller");

const router = express.Router(); 

router.route("/create").post(diabetesCtrl.creatediabetes);
router.route("/getdiabetesbypatientid").get(diabetesCtrl.getdiabetesbypatientid);
router.route("/updatediabetesbypatientid").put(diabetesCtrl.updatediabetesbypatientid);
router.route("/getdiabetescomparedata").get(diabetesCtrl.getdiabetescomparedata);
module.exports = router;