

const express = require("express");
const bodysideCtrl = require("../controllers/body_side.controller");

const bodysideRoutes = express.Router(); // eslint-disable-line new-cap





bodysideRoutes.route("/create").post(bodysiteCtrl.postBodySide);
bodysideRoutes.route("/gete").post(bodysiteCtrl.getBodySide);


bodysideRoutes.route("/getById").post(bodysiteCtrl.getBodySideById);
bodysideRoutes.route("/getfilter").post(bodysiteCtrl.getBodySidefilter);

module.exports = bodysiteRoutes;