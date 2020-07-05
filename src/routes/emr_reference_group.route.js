const express = require("express");
const emrreferenceCtrl = require("../controllers/emr_reference_group.controller");

const emrrefereneRoutes = express.Router(); // eslint-disable-line new-cap

emrrefereneRoutes.route("/getreference").post(emrreferenceCtrl.getreferenceGroupController);
emrrefereneRoutes.route("/addreference").post(emrreferenceCtrl.addreferenceGroup);
emrrefereneRoutes.route("/getAllreference").post(emrreferenceCtrl.getAllreference);

module.exports = emrrefereneRoutes;