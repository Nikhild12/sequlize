// Package Import
const express = require('express');

// Clinical Favourite Controller Import
const favouriteController = require('../controllers/favourite_master.controller');

// Initilazing Favourite Route
const favouriteRoute = express.Router();

favouriteRoute.route('/create').post(favouriteController.createTickSheetMaster);
favouriteRoute.route('/getFavourite').get(favouriteController.getFavourite);
favouriteRoute.route('/getFavouriteById').get(favouriteController.getFavouriteById);
favouriteRoute.route('/updateFavouriteById').put(favouriteController.updateFavouriteById);
favouriteRoute.route('/delete').put(favouriteController.deleteFavourite);
favouriteRoute.route('/getTreatmentKitFavourite').get(favouriteController.getTreatmentKitFavourite);
favouriteRoute.route('/getTreatmentKitFavouriteById').get(favouriteController.getTreatmentFavById);
favouriteRoute.route('/getDietFavourite').get(favouriteController.getFavouriteDiet);
favouriteRoute.route('/getAllFavourites').post(favouriteController.getAllFavourites);
module.exports = favouriteRoute;