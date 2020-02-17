const emr_constants = require("../config/constants");
const Sequelize = require("sequelize");
const moment = require("moment");
const request = require("request");
const rp = require('request-promise');
const Op = Sequelize.Op;

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

const _postRequest = async (api, headers, data) => {
  console.log('headers', headers, 'data', data);
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
              body.responseContent || body.responseContents || body.benefMembers || body.req
            );
          }
        } else if (body && body.status == "error") {
          reject(body);
        } else {
          if (body.statusCode && (body.statusCode === 200 || body.statusCode === 201)) {
            resolve(
              body.responseContent || body.responseContents || body.benefMembers || body.req
            );
          } else {
            reject(body);
          }
        }
      }
    );
  });
};


module.exports = {
  getActiveAndStatusObject: _getActiveAndStatusObject,
  createIsActiveAndStatus: _createIsActiveAndStatus,
  assignDefaultValuesAndUUIdToObject: _assignDefaultValuesAndUUIdToObject,
  getFilterByThreeQueryForCodeAndName: _getFilterByThreeQueryForCodeAndName,
  getDateQueryBtwColumn: _getDateQueryBtwColumn,
  postRequest: _postRequest
};
