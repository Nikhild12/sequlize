const express = require("express");

const bodySideRoute = express.Router();

const bodySideCtrl = require("../controllers/body_side.controller");


bodySideRoute.route('/get-list').get(bodySideCtrl.getBodySideList);
module.exports = bodySideRoute;