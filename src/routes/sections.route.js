//package Imports
const Express = require('express');

//EMR Workflow Controller Import
const sectionsController = require('../controllers/sections.controller');

//Express Router Initialize
const sectionsRoute = Express.Router();

sectionsRoute.route('/create').post(sectionsController.addSections);
sectionsRoute.route('/getAll').get(sectionsController.getAllSections);
sectionsRoute.route('/delete').put(sectionsController.deleteSections);
sectionsRoute.route('/getById').post(sectionsController.getSectionsById);
sectionsRoute.route('/update').put(sectionsController.updateSections);

module.exports = sectionsRoute;
