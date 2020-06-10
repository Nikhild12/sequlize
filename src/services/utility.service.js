const emr_constants = require("../config/constants");
const Sequelize = require("sequelize");
const moment = require("moment");
const momentTimezone = require('moment-timezone');
const request = require("request");
const rp = require("request-promise");
const Op = Sequelize.Op;

const httpStatus = require("http-status");

const _getActiveAndStatusObject = is_active => {
  return {
    is_active: is_active ? emr_constants.IS_ACTIVE : emr_constants.IS_IN_ACTIVE,
    status: is_active ? emr_constants.IS_ACTIVE : emr_constants.IS_IN_ACTIVE
  };
};

const _createIsActiveAndStatus = (create_object, userId) => {
  create_object.modified_by = create_object.user_uuid = create_object.created_by = userId;
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

const _getFilterByThreeQueryForCodeAndName = searchValue => {
  return {
    is_active: emr_constants.IS_ACTIVE,
    status: emr_constants.IS_ACTIVE,
    [Op.or]: [
      {
        name: {
          [Op.like]: `%${searchValue}%`
        }
      },
      {
        code: {
          [Op.like]: `%${searchValue}%`
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
  console.log({ api });
  console.log("\n");
  console.log({ headers });

  return new Promise((resolve, reject) => {
    request.post(
      {
        uri: api,
        headers: headers,
        json: data
      },
      function (error, response, body) {
        console.log("\n body...", body);

        if (error) {
          reject(error);
        } else if (body && !body.status && !body.status === "error") {
          if (
            body.responseContent ||
            body.responseContents ||
            body.benefMembers ||
            body.req
          ) {
            resolve(
              body.responseContent ||
              body.responseContents ||
              body.benefMembers ||
              body.req
            );
          }
        } else if (body && body.status == "error") {
          reject(body);
        } else {
          if (
            body.statusCode &&
            (body.statusCode === 200 || body.statusCode === 201)
          ) {
            resolve(
              body.responseContent ||
              body.responseContents ||
              body.benefMembers ||
              body.req
            );
          } else {
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
  pssf: emr_constants.PATIENT_SPECIALITY_SKETCH_FETCHED // Patient Speciality Sketch Fe
};

const _getResponseMessageForSuccessRequest = (code, mName) => {
  if (code === 204) {
    return emr_constants.NO_RECORD_FOUND;
  } else {
    return responseMessage[mName];
  }
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


module.exports = {
  getActiveAndStatusObject: _getActiveAndStatusObject,
  createIsActiveAndStatus: _createIsActiveAndStatus,
  assignDefaultValuesAndUUIdToObject: _assignDefaultValuesAndUUIdToObject,
  getFilterByThreeQueryForCodeAndName: _getFilterByThreeQueryForCodeAndName,
  getDateQueryBtwColumn: _getDateQueryBtwColumn,
  checkTATIsPresent: _checkTATIsPresent,
  checkTATIsValid: _checkTATIsValid,
  postRequest: _postRequest,
  isNumberValid: _isNumberValid,
  getResponseCodeForSuccessRequest: _getResponseCodeForSuccessRequest,
  getResponseMessageForSuccessRequest: _getResponseMessageForSuccessRequest,
  isStringValid: _isStringValid,
  isAllNumber: _isAllNumber,
  isEmpty: isEmpty,
  indiaTz: _indiaTz,
  comparingDateAndTime: _comparingDateAndTime,
  checkDateValid: _checkDateValid
};
