const express = require("express");
const healthHistoryCtrl = require("../controllers/health_history.controller");

const router = express.Router(); // eslint-disable-line new-cap

router.route("/get").post(healthHistoryCtrl.gethealthHistory);

module.exports = router;