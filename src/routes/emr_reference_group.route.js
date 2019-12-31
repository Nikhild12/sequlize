const express = require("express");
const emrreferenceCtrl = require("../controllers/emr_reference_group.controller");

const emrrefereneRoutes = express.Router(); // eslint-disable-line new-cap



emrrefereneRoutes.route("/getreference").post(emrreferenceCtrl.getreferenceGroupController);

module.exports = emrrefereneRoutes;