// package Import 
const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const path = require('path');

// Swagger UI and Json import
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

// Config Import
const config = require('./config');

// Index route 
const indexRoute = require('../routes/index.route');

// Express Initialize
const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enabling CORS for Accepting cross orgin req
app.use(cors());

// Enabling CORS for Accepting cross orgin req
app.use(helmet());

//for upload purpose
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../src/assets")));
app.use(bodyParser.urlencoded({ extended: false }));

// Enabling Log only for dev
if (config.env === 'develoment') {
	app.use(logger('dev'))
}

// Initialzing Index Route to Express Middleware
app.use('/', indexRoute);

// Swagger UI Middleware
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = app;

