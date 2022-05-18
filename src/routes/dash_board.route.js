//Package Import

const express = require('express');

//Controllers Import
const dashBoardCtrl = require('../controllers/dashboard.controller');
const dashBctrl = require('../controllers/emr_dashboard.controller');

const router = express.Router();

router.route('/getDashBoard').get(dashBoardCtrl.getDashBoard);
router.route('/getDashBoarddata').get(dashBctrl.getDashBoard);
router.route('/diagnosis_dashboard').get(dashBoardCtrl.diagnosis_dashboard) /**H30-49718-EMR Diagnosis Dashboard --> 1. Need Diagnosis filter, 2. Total patient count - Elumalai Govindan - Start */
module.exports = router;