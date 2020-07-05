const express = require("express");
const allergytypeCtrl = require("../controllers/allergyType.controller");

const router = express.Router(); // eslint-disable-line new-cap

router.route("/addAllergyType").post(allergytypeCtrl.postAlleryType);
router.route("/getAllergyType").post(allergytypeCtrl.getAllergyType);

router.route("/getallergyTypeById").post(allergytypeCtrl.getallergyTypeById);
router.route("/deleteAllergyTypeById").post(allergytypeCtrl.deleteAllergyTypeById);
router.route("/updateAllergyTypeById").post(allergytypeCtrl.updateAllergyTypeById);



module.exports = router;
