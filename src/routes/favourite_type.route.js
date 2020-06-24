// Package Import
const express = require('express');

// Clinical Favourite Controller Import
const favouriteTypeController = require('../controllers/favourite_type.controller');

// Initilazing Favourite Type Route
const favouriteTypeRoute = express.Router();

favouriteTypeRoute.route('/get-type').get(favouriteTypeController.getFavouriteType);


module.exports = favouriteTypeRoute;