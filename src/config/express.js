// package Import 
const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
//const bodyParser = require('body-parser');
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

app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(express.json());
// Enabling CORS for Accepting cross orgin req
app.use(cors());

// Enabling CORS for Accepting cross orgin req
app.use(helmet());

//for upload purpose
//app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../src/assets")));
//app.use(bodyParser.urlencoded({ extended: false }));

// Enabling Log only for dev
if (config.env === 'develoment') {
	app.use(logger('dev'));
}

// Initialzing Index Route to Express Middleware
app.use('/', indexRoute);

// Swagger UI Middleware
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


const makeServiceCall = (req, res) => {
	const modulename = "EMR"; // Modulename
	let userLogActivityObj = {};
	let logObj = {};
	let partUrl = req.url;
	if (partUrl !== '/api/userslog/getUsersLogById') {
		if (partUrl !== '/api/userslog/getUsersLog') {
			if (req.headers) {
				userLogActivityObj = {
					userID: req.headers[`user_uuid`] || null,
					facilityID: req.headers[`facility_uuid`] || null,
					hostName: req.headers['host-name'] || null,
					ModuleName: modulename || null,
					APIName: req.url || null,
					reqId: req.headers[`session_id`] || null,
					IPAddress: req.headers[`ip_address`] || null,
					Token: req.headers[`authorization`] || null,
					request: req.body,
					response: res.body,
					errorResponse: res.body,
					LoginDate: new Date()
				};
				logObj = JSON.parse(JSON.stringify(userLogActivityObj));
				let filename = "sql.txt";
				let content = fs.readFileSync(process.cwd() + "/" + filename).toString();
				if (res && res.body && (res.body.code === 200 || res.body.statusCode === 200)) {
					logObj.LogLevel = 'info';
					logObj.errorResponse = null;
				} else {
					logObj.LogLevel = 'error';
					logObj.response = null;
				}
				const zoneplace = moment.tz.guess();
				const zonetime = moment().format('Z');
				logObj.UTCFormat = zoneplace + ' ' + zonetime;
				logObj.APIRequestTime = moment(config.requestDate).format();
				logObj.APIResponseTime = moment().format();
				logObj.APISpendTime = (moment.duration(moment().diff(config.requestDate))) || null;
				logObj.url = req.url;
				logObj.sqlquery = content || null;
			}
		}
	}
	console.log('\n config.wso2_logurl,...', config.wso2_logurl);
	request.post({
		uri: config.wso2_logurl,
		headers: {
			'Content-Type': 'application/json',
			'accept-language': 'en',
			'user_uuid': req.headers.user_uuid,
			"facility_uuid": req.headers.facility_uuid,
			"Authorization": req.headers.authorization
		},
		json: {
			req: logObj,
			res: res
		}
	}, function (error, response, body) { });
};

var myLogger = function (req, res, next) {
	res.on('finish', () => {
		if (config.logging === 1) {
			makeServiceCall(req, res);
			fs.writeFile('./sql.txt', '', function () {
				return true;
			});
		}
	});
	next();
};

app.use(myLogger);

console.log(config.logging);

module.exports = app;

