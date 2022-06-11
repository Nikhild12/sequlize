
const express = require("express");
const patientOPEmrCensusCtrl = require("../controllers/patient_op_emr_census_count.controller");
const router = express.Router(); // eslint-disable-line new-cap
/**
 * end points for emr census controller
 */
router.route("/addOPEMRCensusCount").post(patientOPEmrCensusCtrl.addOPEMRCensusCount);
router.route("/getDepartmentWisePatCount").post(patientOPEmrCensusCtrl.getDepartmentWisePatCount);
router.route("/getSessionWisePatCount").post(patientOPEmrCensusCtrl.getSessionWisePatCount);
router.route("/getDayWisePatientList").post(patientOPEmrCensusCtrl.getDayWisePatientList);//H30-47544-Saju-OP Back entry	OP Back entry> Registration date and time mismaches with the day wise patient report
router.route("/getDayWisePatientCount").post(patientOPEmrCensusCtrl.getDayWisePatientCount);//H30-47544-Saju-OP Back entry	OP Back entry> Registration date and time mismaches with the day wise patient report
router.route("/getTotalRegCount").get(patientOPEmrCensusCtrl.getTotalRegCount); //H30-49098-Saju-Create new api for get patient total registration count
router.route("/update_op_emr_census_count").post(patientOPEmrCensusCtrl.updateOPEMRCensusCount); /**H30-49778-Update OP EMR Census Count During Prescribing Doctor - Elumalai Govindan */
router.route("/getopcensusdetails").post(patientOPEmrCensusCtrl.getOPCensusDetails); /**H30-49798-OP - EMR Patient Search Response should come with Prescribed Flag - Elumalai Govindan */
// H30-50195 - EMR - getSessionreport getSessionWisePatCount need to update API -- jevin -- Start 
router.route("/getSessionWisePatCountDetails").post(patientOPEmrCensusCtrl.getSessionWisePatCountDetails);
// H30-50195 - EMR - getSessionreport getSessionWisePatCount need to update API -- jevin -- Start 
module.exports = router;