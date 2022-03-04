const express = require('express');

const vitalCtrl = require('../controllers/getSpecifPatientVital.controller')

const router = express.Router();

router.route('/getSpecificVital').post(vitalCtrl.view_patVitals);






module.exports = router;