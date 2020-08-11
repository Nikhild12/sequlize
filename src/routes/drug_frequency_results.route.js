const express = require("express");
const drugfrequencyCtrl = require("../controllers/drugfrequency.controller");

const drugfrequencyRoutes = express.Router(); // eslint-disable-line new-cap



drugfrequencyRoutes.route("/getdrugfrequency").get(drugfrequencyCtrl.getDrugFrequency);

module.exports = drugfrequencyRoutes;