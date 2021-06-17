// Importing Sequelize Package
const sequelizeDb = require("../config/sequelize");

// Importing EMR Constants
const emr_constants = require("../config/constants");

// Importing EMR UTILITIES
const emr_utility = require("../services/utility.service");

// Intializing Chief Complaints tbl
const chief_complaints_tbl = sequelizeDb.chief_complaints;
const chief_complaints_duration_tbl =
  sequelizeDb.chief_complaint_duration_periods;

const _getPreviousPatCCQuery = (eId, pId, limit) => {
  return {
    order: [["uuid", "desc"]],
    limit: Number(limit),
    where: {
      encounter_type_uuid: eId,
      patient_uuid: pId,
      status: emr_constants.IS_ACTIVE,
      is_active: emr_constants.IS_ACTIVE
    },
    include: [
      {
        model: chief_complaints_tbl,
        attributes: ["code", "name"]
      },
      {
        model: chief_complaints_duration_tbl,
        attributes: ["code", "name"]
      }
    ]
  };
};

const _getResponseCodeAndMessage = records => {
  const responseCode = emr_utility.getResponseCodeForSuccessRequest(records);
  const responseMessage = emr_utility.getResponseMessageForSuccessRequest(
    responseCode,
    "p"
  );
  return { responseCode, responseMessage };
};

const _getPreviousPatCCModifiedResponse = records => {
  return records.map(r => {
    console.log('rrrrrr', r)
    return {
      patientCCId: r.uuid,
      chiefComplaintName: r.chief_complaint && r.chief_complaint.name,
      chiefComplaintCode: r.chief_complaint && r.chief_complaint.code,
      chiefComplaintDuration: r.chief_complaint_duration,
      chiefComplaintUUId: r.chief_complaint_uuid,
      chiefComplaintDurationUUId: r.chief_complaint_duration_period_uuid,
      createdDate: r.created_date,
      performedBy: r.performed_by,
      chiefComplaintDurationName:
        r.chief_complaint_duration_period &&
        r.chief_complaint_duration_period.name
    };
  });
};

module.exports = {
  getPreviousPatCCQuery: _getPreviousPatCCQuery,
  getResponseCodeAndMessage: _getResponseCodeAndMessage,
  getPreviousPatCCModifiedResponse: _getPreviousPatCCModifiedResponse
};
