const httpStatus = require("http-status");
const db = require("../config/sequelize");


const Sequelize = require('sequelize');
var Op = Sequelize.Op;

const emr_const = require('../config/constants');

const allergyseverity = db.allergy_severity;


// module.exports = diagnosisController();