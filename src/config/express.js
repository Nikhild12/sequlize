// package Import 
const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
//const bodyParser = require('body-parser');
const path = require('path');
const fs = require("fs");

// Swagger UI and Json import
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

// Config Import
const config = require('./config');

// Index route 
const indexRoute = require('../routes/index.route');

const expressWinston = require("express-winston");
const winstonInstance = require("./winston");
// Express Initialize
const app = express();


if (config.env === "development") {
	app.use(logger("dev"));
}

// Middlewares
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(express.json());
// Enabling CORS for Accepting cross orgin req
app.use(cors());

// Enabling CORS for Accepting cross orgin req
app.use(helmet());


expressWinston.requestWhitelist.push("body");
expressWinston.responseWhitelist.push("body");
app.use(
	expressWinston.logger({
		winstonInstance,
		meta: true, // optional: log meta data about request (defaults to true)
		msg: "HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}} ms ",
		colorStatus: true // Color the status code (default green, 3XX cyan, 4XX yellow, 5XX red).
	})
);

app.use(
	expressWinston.errorLogger({
		winstonInstance
	})
);

//for upload purpose
//app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../src/assets")));
//app.use(bodyParser.urlencoded({ extended: false }));

// Enabling Log only for dev
// if (config.env === 'develoment') {

// }
//app.use(logger('tiny'));
// Initialzing Index Route to Express Middleware

//Logging - 19_02_2020
const makeServiceCall = (req, res, next) => {
	const modulename = "EMR";
	let partUrl = req.url;
	if (partUrl !== '/api/userslog/getUsersLogById') {
		if (partUrl !== '/api/userslog/getUsersLog') {
			if (req.headers) {
				var userLogActivityObj = {
					userID: req.headers['user_uuid'] || null,
					facilityID: req.headers['facility_uuid'] || null,
					hostName: req.headers['host-name'] || null,
					ModuleName: modulename || null,
					APIName: req.url || null,
					reqId: req.headers['session_id'] || null,
					IPAddress: req.headers['ip_address'] || null,
					Token: req.headers['authorization'] || null,
					LoginDate: getCurrentDateTime(null)
				};
				var logObj = JSON.parse(JSON.stringify(userLogActivityObj));
				if (res && res.body && res.body.statusCode == 200) {
					logObj.LogLevel = 'info';
					logObj.errorResponse = ' Log-Level: ' + res.body.loglevel + ' - ' + ' statusCode: ' + res.body.statusCode;
				} else {
					logObj.LogLevel = 'error';
					logObj.response = 'Log-Level: ' + res.body.loglevel + ' - ' + 'statusCode: ' + res.body.statusCode;
				}
				const zoneplace = moment.tz.guess();
				const zonetime = moment().format('Z');
				logObj.UTCFormat = zoneplace + ' ' + zonetime;
				logObj.APIRequestTime = getCurrentDateTime(config.requestDate);
				logObj.APIResponseTime = getCurrentDateTime(null);
				logObj.APISpendTime = (moment.duration(moment(logObj.APIResponseTime).diff(config.requestDate))) || null;
				logObj.url = req.url;
				logObj.sqlquery = res.body.sql || null;
				delete res.body.sql;
				logObj.request = req.body;
				if (res && res.body && res.body.statusCode == 200) logObj.response = res.body;
				else logObj.errorResponse = res.body;

			}
		}
	}
	console.log(config.wso2_logurl);
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

function getCurrentDateTime(givendt) {
	let istdatetime = new Date().toLocaleString('en-US', {
		timeZone: 'Asia/Kolkata'
	});
	if (givendt) {
		istdatetime = new Date(givendt).toLocaleString('en-US', {
			timeZone: 'Asia/Kolkata'
		});
	}
	return new Date(istdatetime);
}

var sendLog = function (reqrescontent, sqlcontent) {
	try {
		let metadata = {
			req: '',
			res: '',
		};
		metainfo = JSON.parse((reqrescontent));
		if (metainfo && metainfo.meta &&
			metainfo.meta.res) {
			metainfo.meta.res.body.sql = sqlcontent;
			metainfo.meta.res.body.loglevel = metainfo.level;
		}
		metadata.req = metainfo.meta.req;
		metadata.res = metainfo.meta.res;
		if (metadata.req && metadata.res) {
			makeServiceCall(metadata.req, metadata.res);
		}
	} catch (ex) {
		metainfo = '';
	}
};

var myLogger = function (req, res, next) {
	res.on('finish', () => {
		console.log("after finish-------");
		if (config.logging === "1") {
			console.log("config.logiing-------");
			let filename = "sql.txt";
			let sqlcontent = fs.readFileSync(process.cwd() + "/" + filename).toString();
			//console.log('Query :' + sqlcontent);
			filename = "access-info.log";
			let reqrescontent = fs.readFileSync(process.cwd() + "/" + filename).toString();
			if (reqrescontent) {
				console.log("reqresconentss---------");
				sendLog(reqrescontent, sqlcontent);
			}
			filename = "access-error.log";
			console.log(filename);
			reqrescontent = fs.readFileSync(process.cwd() + "/" + filename).toString();
			//console.log(reqrescontent);
			if (reqrescontent) {
				console.log("afgter read readfilesynd------");
				sendLog(reqrescontent, sqlcontent);
			}
			fs.writeFile('./sql.txt', '', function () {
				return true;
			});
			fs.writeFile('./access-info.log', '', function () {
				return true;
			});
			fs.writeFile('./access-error.log', '', function () {
				return true;
			});
		}
	});
	next();
};

app.use(myLogger);
//Logging - 19_02_2020

// Swagger UI Middleware
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/', indexRoute);

module.exports = app;

