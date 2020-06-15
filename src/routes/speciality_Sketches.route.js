const express = require("express");
const specialitySketchesMasterCtrl = require("../controllers/specialitySketchesMaster.controller");

const specialityRoutes = express.Router(); // eslint-disable-line new-cap

const middleware = require('../middleware/middleware');


// specialityRoutes.route("/getDFilter").get(proceduresCtrl.getDiagnosisFilter);
// specialityRoutes.route("/search").post(proceduresCtrl.getDiagnosisSearch);

specialityRoutes.route("/createSpeciality").post(middleware.multerupload('/ssketch').array('file', 10), specialitySketchesMasterCtrl.postSpecialitySketcheMaster);
specialityRoutes.route("/getAllSpeciality").post(specialitySketchesMasterCtrl.getAllSpecialitySketcheMaster);

specialityRoutes.route("/deleteSpeciality").post(specialitySketchesMasterCtrl.deleteSpecialitySketcheMaster);
specialityRoutes.route("/updateSpecialityById").post(middleware.multerupload('/ssketch').array('file', 10), specialitySketchesMasterCtrl.updateSpecialitySketcheMasterById);
specialityRoutes.route("/getSpecialityById").post(specialitySketchesMasterCtrl.getSpecialitySketcheMasterById);

module.exports = specialityRoutes;