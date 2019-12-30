const express = require("express");
const genderctrl = require("../controllers/common_reference_group.controller");


const router = express.Router();
router.route("/addReference").post(genderctrl.addReference);
router.route("/updateReference").post(genderctrl.updateReference);
router.route("/deleteReference").post(genderctrl.deleteReference);
router.route("/getReference").post(genderctrl.getReference);
router.route("/getReferenceNameId").post(genderctrl.getReferenceIdName);

router.route("/getReferenceById").post(genderctrl.getReferenceById);


module.exports = router;