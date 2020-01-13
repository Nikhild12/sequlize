// Package Import
const express = require("express");

// Clinical Favourite Controller Import
const mypatientListController = require("../controllers/my_patient_list.controller");

// Initilazing Favourite Route
const myPatientListRouter = express.Router();

myPatientListRouter
  .route("/getMyPatientList")
  .get(mypatientListController.getMyPatientListByFilters);

module.exports = myPatientListRouter;
