
const express = require('express');

const depDiagnosisCtrl = require('../controllers/depDiagnosispatientcount.controller');

const router = express.Router();

router.route('/depDiagnosis').post(depDiagnosisCtrl.view_depDiagnosis);
router.route('/docDiagnosis').post(depDiagnosisCtrl.view_docDiagnosis);
router.route('/docDiagnosisGenderWise').post(depDiagnosisCtrl.view_docDiagnosisGengerwise);
router.route('/view_docDiagnosisVisitwise').post(depDiagnosisCtrl.view_docDiagnosisVisitwise);
router.route('/view_docDiagnosiscount').post(depDiagnosisCtrl.view_docDiagnosiscount);
router.route('/view_docwisepatcount').post(depDiagnosisCtrl.view_docwisepatientcount);


router.route('/docDiagnosisGenderWiseOP').post(depDiagnosisCtrl.view_docDiagnosisGengerwiseOP);
router.route('/view_docDiagnosiscount_op').post(depDiagnosisCtrl.view_docDiagnosiscountop);
router.route('/view_docwisepatcountOP').post(depDiagnosisCtrl.view_docwisepatientcountop);



module.exports = router;