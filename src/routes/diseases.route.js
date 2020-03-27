// package Imports
const express = require("express");

// Express Router Initialize
const diseasesRoutes = express.Router();

const diseasesController = require("../controllers/diseases.controller");

diseasesRoutes
  .route("/get-by-filters")
  .get(diseasesController.getDiseasesByFilters);

module.exports = diseasesRoutes;
