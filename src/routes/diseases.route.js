// package Imports
const express = require("express");

// Express Router Initialize
const diseasesRoutes = express.Router();

const diseasesController = require("../controllers/diseases.controller");

diseasesRoutes
  .route("/get-by-filters")
  .get(diseasesController.getDiseasesByFilters);

diseasesRoutes
  .route("/create")
  .post(diseasesController.createDiseases);

module.exports = diseasesRoutes;
