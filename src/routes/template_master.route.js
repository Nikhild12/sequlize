const express = require("express");
const tempmastrCtrl = require("../controllers/template_master.controller");

const router = express.Router(); 

router.route("/create").post(tempmastrCtrl.createTemplate);
router.route("/gettemplateByID").get(tempmastrCtrl.gettemplateByID);
router.route("/gettempdetails").get(tempmastrCtrl.gettempdetails);
router.route("/deleteTemplateDetails").put(tempmastrCtrl.deleteTemplateDetails);
router.route("/updateTemplateByID").put(tempmastrCtrl.updateTemplateById);
router.route("/getalltemplates").post(tempmastrCtrl.getalltemplates);

router.route("/updateTemplateDetailsByID").put(tempmastrCtrl.updateTemplateDetailsByID); //dynamic function route



module.exports = router;
