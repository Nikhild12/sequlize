// package Imports
const express = require('express');

// EMR Workflow Controller Import
const diet_kitchen = require('../controllers/diet_kitchen.controller');

// Diet Kitchen Router Initialize
const dietKitchenRoutes = express.Router();

dietKitchenRoutes.route('/getDietMaster').post(diet_kitchen.getDietMaster);

module.exports = dietKitchenRoutes;