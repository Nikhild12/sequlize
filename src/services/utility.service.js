const emr_constants = require("../config/constants");
const Sequelize = require("sequelize");
const moment = require("moment");
const momentTimezone = require('moment-timezone');
const request = require("request");
const rp = require("request-promise");
const config = require("../config/config");
const Op = Sequelize.Op;

const httpStatus = require("http-status");

const _getActiveAndStatusObject = is_active => {
  return {
    is_active: is_active ? emr_constants.IS_ACTIVE : emr_constants.IS_IN_ACTIVE,
    status: is_active ? emr_constants.IS_ACTIVE : emr_constants.IS_IN_ACTIVE
  };
};

const _createIsActiveAndStatus = (create_object, userId) => {
  create_object.modified_by = create_object.created_by = userId;
  create_object.is_active = create_object.status = emr_constants.IS_ACTIVE;
  create_object.created_date = create_object.modified_date = new Date();
  create_object.revision = 1;
  return create_object;
};

const _assignDefaultValuesAndUUIdToObject = (
  target,
  assign,
  userId,
  assignCol
) => {
  // assigning Default Values
  target = _createIsActiveAndStatus(target, userId);

  // assigning Master Id to child tables
  target[assignCol] = (assign && assign.uuid) || 0;

  return target;
};

// #Wild Card Search Changes - Chief Complaints name/ code start with the characters By Elumalai
const _getFilterByThreeQueryForCodeAndName = searchValue => {
  return {
    is_active: emr_constants.IS_ACTIVE,
    status: emr_constants.IS_ACTIVE,
    [Op.or]: [
      {
        name: {
          [Op.like]: `${searchValue}%`
        }
      },
      {
        code: {
          [Op.like]: `${searchValue}%`
        }
      }
    ]
  };
};

const _getDateQueryBtwColumn = (columnName, from, to) => {
  return {
    [columnName]: {
      [Op.and]: [
        Sequelize.where(
          Sequelize.fn("date", Sequelize.col(`${columnName}`)),
          ">=",
          moment(from).format("YYYY-MM-DD")
        ),
        Sequelize.where(
          Sequelize.fn("date", Sequelize.col(`${columnName}`)),
          "<=",
          moment(to).format("YYYY-MM-DD")
        )
      ]
    }
  };
};

const _comparingDateAndTime = (col, fromDate, toDate) => {
  return {
    [col]: {
      [Op.between]: [fromDate, toDate]
    }
  };
};


const _checkTATIsPresent = array => {
  return (isEveryEleTATHaving = array.every(pD => {
    return pD.tat_start_time && pD.tat_end_time;
  }));
};

const _checkTATIsValid = array => {
  return array.every(pD => {
    return (
      moment(pD.tat_start_time).isValid() && moment(pD.tat_end_time).isValid()
    );
  });
};
const _postRequest = async (api, headers, data) => {
  return new Promise((resolve, reject) => {
    request.post({ uri: api, headers: headers, json: data },
      function (error, response, body) {
        console.log("\n body...", api, headers, data);
        console.log("\n body...", body);
        if (error) {
          reject(error);
        }
        else if (body && !body.status && !body.status === "error") {
          if (body.responseContent || body.responseContents || body.benefMembers || body.req) {
            resolve(body.responseContent || body.responseContents || body.benefMembers || body.req);
          }
        }
        else if (body && body.status == "error") {
          reject(body);
        }
        else if (body && body.status == 422) {
          reject(body);
        }
        else {
          if (body.statusCode && (body.statusCode === 200 || body.statusCode === 201)) {
            resolve(body.responseContent || body.responseContents || body.benefMembers || body.req);
          }
          else if (body && body.status == true) {
            resolve(body);
          }
          else {
            reject(body);
          }
        }
      }
    );
  });
};

const _deleteRequest = async (url, req, data) => {
  try {
    let options = {
      uri: url,
      headers: { Authorization: req },
      method: "DELETE",
      json: true, // Automatically parses the JSON string in the response
    };
    if (data) {
      options.body = { "id": JSON.stringify(data.Id) };
    }
    const results = await rp(options);
    return { block_chain_response: results };

  } catch (err) {
    const errorMsg = err.errors ? err.errors[0].message : err.message;
    return { status: false, message: errorMsg };
  }
};

const _getBlockChainRequest = async (url, req, data) => {
  try {
    let options = {
      uri: url,
      headers: { Authorization: req },
      method: "GET",
      json: true, // Automatically parses the JSON string in the response
    };
    const results = await rp(options);
    return { block_chain_response: results };

  } catch (err) {
    const errorMsg = err.errors ? err.errors[0].message : err.message;
    return { status: false, message: errorMsg };
  }
};

const _putBlockChainRequest = async (url, req, data) => {
  try {
    let options = {
      uri: url,
      headers: { Authorization: req },
      method: "PUT",
      json: true, // Automatically parses the JSON string in the response
    };

    if (data) {
      options.body = data;
    }
    const results = await rp(options);
    return { block_chain_response: results };

  } catch (err) {
    const errorMsg = err.errors ? err.errors[0].message : err.message;
    return { status: false, message: errorMsg };
  }
};

const _putRequest = async (api, headers, data) => {
  return new Promise((resolve, reject) => {
    request.put({ uri: api, headers: headers, json: data },
      function (error, response, body) {
        console.log("\n body...", body);
        if (error) {
          reject(error);
        }
        else if (body && !body.status && !body.status === "error") {
          if (body.responseContent || body.responseContents || body.benefMembers || body.req) {
            resolve(body.responseContent || body.responseContents || body.benefMembers || body.req);
          }
        }
        else if (body && body.status == "error") {
          reject(body);
        }
        else {
          if (body.statusCode && (body.statusCode === 200 || body.statusCode === 201)) {
            resolve(body.responseContent || body.responseContents || body.benefMembers || body.req);
          }
          else if (body && body.status == true) {
            resolve(body);
          }
          else {
            reject(body);
          }
        }
      }
    );
  });
};

const _isNumberValid = value => {
  value = Number(value);
  return !isNaN(value);
};

const _isStringValid = value => {
  return typeof value === "string";
  u;
};

const _getResponseCodeForSuccessRequest = records => {
  return records && records.length > 0 ? httpStatus.OK : httpStatus.NO_CONTENT;
};

const _isAllNumber = (...args) => {
  return args.every(a => {
    return typeof Number(a) === "number";
  });
};

/**
 *
 * @param {*} code response code
 * @param {*} mName module Name
 * Based on the response code and module name
 * will return message
 */

const responseMessage = {
  cc: emr_constants.CHIEF_COMPLIANT,
  dis: emr_constants.DISEASES_SUCCESS,
  p: emr_constants.PREVIOUS_PAT_CC_SUCCESS, // Previous Patient Chief Complaints,
  pssf: emr_constants.PATIENT_SPECIALITY_SKETCH_FETCHED, // Patient Speciality Sketch Fe,
  favty: emr_constants.FAVOURITE_TYPE, // Favourite Type,
  pas: emr_constants.PATIENT_ALLERGY_STATUS_FETCH_SUCCESS, // Patient Allergy Status Fetch Success,
  als: emr_constants.ALLERGY_SOURCE_SUCCESS, // Allergy Source Fetch Success,
  lRS: emr_constants.LAB_RESULT_SUCCESS,
  rRS: emr_constants.RADIOLOGY_RESULT_SUCCESS,
  iRS: emr_constants.INVESTIGATION_RESULT_SUCCESS
};

const _getResponseMessageForSuccessRequest = (code, mName) => {
  return code === 204 ? emr_constants.NO_RECORD_FOUND : responseMessage[mName];
};

const _indiaTz = (date) => {
  if (date && _checkDateValid(date)) {
    return momentTimezone.tz(moment(date).toDate(), "Asia/Kolkata");
  }
  return momentTimezone.tz(Date.now(), "Asia/Kolkata");
};

const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

const _checkDateValid = dateVar => {
  if ((dateVar instanceof Date) || moment.isMoment(dateVar)) {
    return true;
  }
  const parsedDate = Date.parse(dateVar);
  return (isNaN(dateVar) && !isNaN(parsedDate));
};

const _deployedBlockChainUrl = () => {
  const urlobj = {
    TN: 'http://3.6.97.35:8080/api/troondx/v1',
    PUNE: 'http://3.6.97.35:8080/api/troondx/v2'
  };
  return urlobj[config.blockChainURL];
};

const _getDeployedStateLogo = () => {
  const statedep = {
    TN: { left: '/assets/images/tnlogo.png', right: '' },
    PUNE: '/assets/images/punelogo.png'
  };
  return statedep[config.state] ? statedep[config.state] : statedep.TN;
};

module.exports = {
  getActiveAndStatusObject: _getActiveAndStatusObject,
  createIsActiveAndStatus: _createIsActiveAndStatus,
  assignDefaultValuesAndUUIdToObject: _assignDefaultValuesAndUUIdToObject,
  getFilterByThreeQueryForCodeAndName: _getFilterByThreeQueryForCodeAndName,
  getDateQueryBtwColumn: _getDateQueryBtwColumn,
  checkTATIsPresent: _checkTATIsPresent,
  checkTATIsValid: _checkTATIsValid,
  postRequest: _postRequest,
  putRequest: _putRequest,
  isNumberValid: _isNumberValid,
  getResponseCodeForSuccessRequest: _getResponseCodeForSuccessRequest,
  getResponseMessageForSuccessRequest: _getResponseMessageForSuccessRequest,
  isStringValid: _isStringValid,
  isAllNumber: _isAllNumber,
  isEmpty: isEmpty,
  indiaTz: _indiaTz,
  comparingDateAndTime: _comparingDateAndTime,
  checkDateValid: _checkDateValid,
  deployedBlockChainUrl: _deployedBlockChainUrl,
  deleteRequest: _deleteRequest,
  getBlockChainRequest: _getBlockChainRequest,
  putBlockChainRequest: _putBlockChainRequest,
  getDeployedStateLogo: _getDeployedStateLogo
};
