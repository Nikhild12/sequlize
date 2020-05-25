const express = require("express");
const path = require("path");
const logger = require("morgan");
const bodyParser = require("body-parser");
// const cookieParser = require("cookie-parser");
const compress = require("compression");
const methodOverride = require("method-override");
const cors = require("cors");
// const httpStatus = require("http-status");
const expressWinston = require("express-winston");
const expressValidation = require("express-validation");
const helmet = require("helmet");
const winstonInstance = require("./winston");
const routes = require("../routes/index.route");
const config = require("./config");

const multer = require("multer");
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const fs = require("fs");
const request = require("request");
const moment = require("moment");
const app = express();

if (config.env === "development") {
	app.use(logger("dev"));
}

// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

// app.use(cookieParser());
app.use(compress());
app.use(methodOverride());

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

//Logging - 19_02_2020
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
//Logging - 19_02_2020



app.use("/assets", express.static(path.join(__dirname, "../uploads")));


var upload = multer({
	storage: multer.diskStorage({
		destination: function (req, file, callback) {
			callback(null, path.join(__dirname + '../../../public/uploads'));
		},
		filename: function (req, file, callback) {
			callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
		}
	}),
	fileFilter: function (req, file, callback) {
		var ext = path.extname(file.originalname);
		if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
			return callback( /*res.end('Only images are allowed')*/ null, false);
		}
		callback(null, true);
	}
});

app.post('/api/image/imageUpload', upload.any(), function (req, res) {
	const files = req.files;
	const postData = req.body;
	const finalData = [];
	console.log(files);
	if (!req.body && !req.files) {
		res.send({
			status: "failed",
			msg: 'failed to upload file',
			responseContents: postData
		});
	} else {
		files.forEach(item => {
			finalData.push(item.filename);
		});
		var final = {
			module: postData.module,
			uploadDate: postData.uploadDate,
			imagePath: finalData
		};
		res.send({
			statusCode: '200',
			msg: "image uploaded",
			responseContents: final
		});
	}
});


app.get('/api/getAPIVersion', function (req, res) {
	const pkg = require('../../package.json');
	let versiondata = {
		'dev': pkg.version,
		'qa': pkg.qaversion,
		'uat':pkg.uatversion,
		'prod':pkg.prodversion
	};
	return res.send({
		statusCode: '200',
		msg: versiondata,
		responseContents: versiondata
	});
});



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
					Status:  res.body.statusCode || null,
					statusCode: res.body.statusCode || null,
					reqId: req.headers['session_id'] || null,
					IPAddress: req.headers['ip_address'] || null,
					Token: req.headers['authorization'] || null,
					LoginDate: getCurrentDateTime(null)
				};
				var logObj = JSON.parse(JSON.stringify(userLogActivityObj));
				if (res && res.body
					&& (!res.body.statusCode ||
						(res.body.statusCode >= 200 && res.body.statusCode <= 299))) {
					logObj.LogLevel = 'info';
					logObj.errorResponse = ' Log-Level: ' + res.body.loglevel + ' - ' + ' statusCode: ' + res.body.statusCode;
				} else {
					logObj.LogLevel = 'error';
					logObj.response = 'Log-Level: ' + res.body.loglevel + ' - ' + 'statusCode: ' + res.body.statusCode;
				}
				const zoneplace = moment.tz.guess();
				const zonetime = moment().format('Z');
				logObj.UTCFormat = zoneplace + ' ' + zonetime;
				logObj.APIRequestTime = moment(getCurrentDateTime(config.requestDate)).format('YYYY-MM-DD HH:mm:ss');
				logObj.APIResponseTime = moment(getCurrentDateTime(resp_dt)).format('YYYY-MM-DD HH:mm:ss');
				logObj.APISpendTime = res.responseTime + ' milliseconds' || null;
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
	}, function (error, response, body) {});
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
		metadata.res = metainfo.meta.res || {};
		metadata.res.responseTime = metainfo.meta.responseTime;
		if (metadata.req && metadata.res) {
			makeServiceCall(metadata.req, metadata.res);
		}
	} catch (ex) {
		metainfo = '';
	}
};

var myLogger = function (req, res, next) {
	res.on('finish', () => {
		if (config.logging === "1") {
			let filename = "sql.txt";
			let sqlcontent = fs.readFileSync(process.cwd() + "/" + filename).toString();
			console.log('Query :' + sqlcontent);
			filename = "access-info.log";
			let reqrescontent = fs.readFileSync(process.cwd() + "/" + filename).toString();
			if (reqrescontent) {
				sendLog(reqrescontent, sqlcontent);
			}
			filename = "access-error.log";
			reqrescontent = fs.readFileSync(process.cwd() + "/" + filename).toString();
			if (reqrescontent) {
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

const numeral = require('numeral');
setInterval(() => {
  const {rss, heapTotal} = process.memoryUsage();
  console.log('rss', numeral(rss).format('0.0.ib'),
     'heapTotal', numeral(heapTotal).format('0.0.ib'));
}, 5000);


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// mount all routes on /api path
app.use("/", routes);

module.exports = app;
// all good