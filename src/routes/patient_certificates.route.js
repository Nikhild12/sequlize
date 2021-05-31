//package Imports
const Express = require('express');

//EMR Workflow Controller Import
const certfticateController = require('../controllers/patient_certificates.controller');

//Express Router Initialize
const certificateRoute = Express.Router();

//profilesRoute.route('/getByFilters').get(profilesController.getProfilesByFilters);
certificateRoute.route('/create').post(certfticateController.createPatientCertificates);
certificateRoute.route('/getAll').get(certfticateController.getPatientCertificates);
certificateRoute.route('/previouscertificatesbyid').get(certfticateController.previous_certificatebyid);
certificateRoute.route('/printpreviouscertificates').get(certfticateController.print_previous_certificates);

module.exports = certificateRoute;
