//Package Import

const express = require('express');

//Controllers Import
const dashBoardCtrl = require('../controllers/dashboard.controller');
const dashBctrl = require ('../controllers/emr_dashboard.controller');

const router = express.Router();

router.route('/getDashBoard').get(dashBoardCtrl.getDashBoard);
router.route('/getDashBoarddata').get(dashBctrl.getDashBoard);
module.exports = router;