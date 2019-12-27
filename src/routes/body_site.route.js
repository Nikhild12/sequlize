

const express = require("express");
const bodysiteCtrl = require("../controllers/body_site.controller");

const bodysiteRoutes = express.Router(); // eslint-disable-line new-cap





bodysiteRoutes.route("/create").post(bodysiteCtrl.postBodySite);
bodysiteRoutes.route("/gete").post(bodysiteCtrl.getBodySite);


bodysiteRoutes.route("/getById").post(bodysiteCtrl.getBodySiteById);
bodysiteRoutes.route("/getfilter").post(bodysiteCtrl.getBodySitefilter);

module.exports = bodysiteRoutes;