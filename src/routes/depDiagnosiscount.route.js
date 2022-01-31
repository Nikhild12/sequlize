
const express = require('express');

const depDiagnosisCtrl = require('../controllers/depDiagnosispatientcount.controller');

const router = express.Router();

router.route('/depDiagnosis').post(depDiagnosisCtrl.view_depDiagnosis);
router.route('/docDiagnosis').post(depDiagnosisCtrl.view_docDiagnosis);


module.exports = router;