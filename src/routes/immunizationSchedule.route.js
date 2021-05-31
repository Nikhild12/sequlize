const express = require("express");
const immunizationsCtrl = require("../controllers/immunizationSchedule.controller");

const router = express.Router(); // eslint-disable-line new-cap

router.route("/addimmunizationSchedule").post(immunizationsCtrl.postimmunizationSchedule);


router.route("/getimmunizationSchedule").post(immunizationsCtrl.getimmunizationSchedule);
router.route("/getpatientImmunizationSchedule").post(immunizationsCtrl.getpatientImmunizationSchedule);
router.route("/getimmunizationScheduleById").post(immunizationsCtrl.getimmunizationScheduleById);
router.route("/deleteimmunizationScheduleById").post(immunizationsCtrl.deleteimmunizationScheduleById);
router.route("/updateimmunizationScheduleById").post(immunizationsCtrl.updateimmunizationScheduleById);



module.exports = router;
