const express = require("express");
const chiefComplaintCategoryCtrl = require("../controllers/chiefComplaintCategory.controller");

const router = express.Router(); // eslint-disable-line new-cap

router.route("/addChiefComplaintCategory").post(chiefComplaintCategoryCtrl.postChiefComplaintCategory);
router.route("/getChiefComplaintCategory").post(chiefComplaintCategoryCtrl.getChiefComplaintCategory);

router.route("/getChiefComplaintCategoryById").post(chiefComplaintCategoryCtrl.getChiefComplaintCategoryById);
router.route("/deleteChiefComplaintCategoryById").post(chiefComplaintCategoryCtrl.deleteChiefComplaintCategoryById);
router.route("/updateChiefComplaintCategoryById").post(chiefComplaintCategoryCtrl.updateChiefComplaintCategoryById);



module.exports = router;
