
const express = require('express');

const depDiagnosisCtrl = require('../controllers/depDiagnosispatientcount.controller');

const router = express.Router();

router.route('/depDiagnosis').post(depDiagnosisCtrl.view_depDiagnosis);
router.route('/docDiagnosis').post(depDiagnosisCtrl.view_docDiagnosis);
router.route('/docDiagnosisGenderWise').post(depDiagnosisCtrl.view_docDiagnosisGengerwise);
router.route('/view_docDiagnosisVisitwise').post(depDiagnosisCtrl.view_docDiagnosisVisitwise);
router.route('/view_docDiagnosiscount').post(depDiagnosisCtrl.view_docDiagnosiscount);




module.exports = router;