// Package Import
const express = require("express");

// Clinical Favourite Controller Import
const mypatientListController = require("../controllers/my_patient_list.controller");

// Initilazing Favourite Route
const myPatientListRouter = express.Router();

myPatientListRouter
  .route("/getMyPatientList")
  .post(mypatientListController.getMyPatientListByFilters);

/**H30-49671 - OP EMR - My Patient List - Elumalai Govindan - Start */
myPatientListRouter
  .route("/getMyPatientListNew")
  .post(mypatientListController.getMyOPPatientList);
/**H30-49671 - OP EMR - My Patient List - Elumalai Govindan - End */

module.exports = myPatientListRouter;
