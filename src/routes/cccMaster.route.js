const express = require("express");
const cccmasterCtrl = require("../controllers/cccmaster.controller");

const router = express.Router(); // eslint-disable-line new-cap

router.route("/addCccMaster").post(cccmasterCtrl.postcccMaster);
router.route("/getAllCccMaster").post(cccmasterCtrl.getAllcccMaster);

router.route("/updateCccMasterById").post(cccmasterCtrl.updatecccMasterById);
router.route("/deleteCccMaster").post(cccmasterCtrl.deletecccMaster);

router.route("/getCccMasterById").post(cccmasterCtrl.getcccMasterById);


module.exports = router;