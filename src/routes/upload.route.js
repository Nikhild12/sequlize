const express = require('express');

// EMR Workflow Controller Import
const upload = require('../controllers/upload.controller');

// Express Router Initialize
const uploadRoutes = express.Router();

uploadRoutes.route('/upload').post(upload.upload);

module.exports = uploadRoutes;