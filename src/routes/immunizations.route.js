const express = require("express");
const immunizationsCtrl = require("../controllers/immunizations.controller");

const router = express.Router(); // eslint-disable-line new-cap

router.route("/addimmunization").post(immunizationsCtrl.postimmunization);
router.route("/getimmunization").post(immunizationsCtrl.getimmunization);

router.route("/getimmunizationById").post(immunizationsCtrl.getimmunizationById);
router.route("/deleteimmunizationById").post(immunizationsCtrl.deleteimmunizationById);
router.route("/updateimmunizationById").post(immunizationsCtrl.updateimmunizationById);




module.exports = router;
