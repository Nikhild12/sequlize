const express = require("express");

const surgeryPositionCtrl = require('../controllers/surgery.position.controller');

const surgeryPositionRouter = express.Router();

surgeryPositionRouter.route('/get-list').get(surgeryPositionCtrl.getSurgeryPosition);

module.exports = surgeryPositionRouter;