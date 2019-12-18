const express = require("express");
const chiefComplaintsCtrl = require("../controllers/chiefComplaints.controller");

const router = express.Router(); // eslint-disable-line new-cap

router.route("/addChiefComplaints").post(chiefComplaintsCtrl.postchiefComplaints);
router.route("/getchiefComplaints").post(chiefComplaintsCtrl.getchiefComplaints);

router.route("/getchiefComplaintsById").post(chiefComplaintsCtrl.getchiefComplaintsById);
router.route("/deletechiefComplaintsById").post(chiefComplaintsCtrl.deletechiefComplaintsById);
router.route("/updatechiefComplaintsById").post(chiefComplaintsCtrl.updatechiefComplaintsById);



module.exports = router;
