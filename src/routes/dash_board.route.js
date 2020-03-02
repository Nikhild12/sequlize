//Package Import

const express = require('express');

//Controllers Import
const dashBoardCtrl = require('../controllers/dashboard.controller');

const router = express.Router();

router.route('/getDashBoard').get(dashBoardCtrl.getDashBoard);
module.exports = router;