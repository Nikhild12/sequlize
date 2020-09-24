const express = require("express");
const allergymasterCtrl = require("../controllers/allergyMaster.controller");

const router = express.Router(); // eslint-disable-line new-cap

router.route("/addAllergyMaster").post(allergymasterCtrl.postAlleryMaster);
router.route("/getAllergyMaster").post(allergymasterCtrl.getAllergyMaster);

router.route("/updateAlleryMasterById").post(allergymasterCtrl.updateAlleryMasterById);
router.route("/deleteAllergyMaster").post(allergymasterCtrl.deleteAlleryMaster);

router.route("/getAlleryMasterById").post(allergymasterCtrl.getAlleryMasterById);

router.route("/get-allergy-source-auto").post(allergymasterCtrl.getAllergySourceAutoComplete);



module.exports = router;