//Logging - 19_02_2020
const winston = require("winston");

const config = require("../config/config");

let logdata = [
	new winston.transports.File({
		name: 'access-file',
		filename: 'access-info.log',
		level: 'info' //This setting is what i need to change for access lines only
	}),
	new winston.transports.File({
		name: 'access-file',
		filename: 'access-error.log',
		level: 'error' //This setting is what i need to change for access lines only
	})
];
if (config.env == 'local' || config.env == 'development' ||
	config.env == 'DEV') {
	logdata.push(new winston.transports.Console({
		json: true,
		colorize: true
	}));
}
const logger = winston.createLogger({
	transports: logdata,
	exitOnError: false,
});
module.exports = logger;
//Logging - 19_02_2020