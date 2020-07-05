const express = require("express");
const allergyseverityCtrl = require("../controllers/allergy_severity.controller");

const router = express.Router(); // eslint-disable-line new-cap

// router.route("/addAllergyMaster").post(allergymasterCtrl.postAlleryMaster);
router.route("/getAllergyMaster").post(allergyseverityCtrl.getAallergySeverity);

// router.route("/updateAlleryMasterById").post(allergymasterCtrl.updateAlleryMasterById);
// router.route("/deleteAllergyMaster").post(allergymasterCtrl.deleteAlleryMaster);

// router.route("/getAlleryMasterById").post(allergymasterCtrl.getAlleryMasterById);


module.exports = router;