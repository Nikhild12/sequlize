// Package Import
const httpStatus = require("http-status");
const moment = require("moment");

// Sequelizer Import
const sequelizeDb = require("../config/sequelize");

var Sequelize = require("sequelize");
var Op = Sequelize.Op;

const emr_utility = require("../services/utility.service");

const emr_mock_json = require("../config/emr_mock_json");

// Initialize EMR Workflow
const patient_chief_complaints_tbl = sequelizeDb.patient_chief_complaints;
const chief_complaints_tbl = sequelizeDb.chief_complaints;
const chief_complaints_duration_tbl =
  sequelizeDb.chief_complaint_duration_periods;
const encounter_tbl = sequelizeDb.encounter;

const emr_constants = require("../config/constants");

const utilityService = require("../services/utility.service");

function getPatientSearchQuery(searchKey, searchValue) {
  let searchObject;
  searchKey = searchKey.toLowerCase();
  switch (searchKey) {
    case "encounterId":
      searchObject = "encounter_uuid";
      break;
    case "patientId":
    default:
      searchObject = "patient_uuid";
      break;
  }

  return {
    where: {
      [searchObject]: searchValue,
      is_active: emr_constants.IS_ACTIVE,
      status: emr_constants.IS_ACTIVE
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
}

function getCCQuery(searchKey, facility_uuid, searchValue, from_date, to_date) {
  //let searchObject;
  searchKey = searchKey.toLowerCase();
  return {
    where: {
      patient_uuid: searchValue,
      is_active: emr_constants.IS_ACTIVE,
      status: emr_constants.IS_ACTIVE,
      performed_date: {
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn("date", Sequelize.col("performed_date")),
            ">=",
            moment(from_date).format("YYYY-MM-DD")
          ),
          Sequelize.where(
            Sequelize.fn("date", Sequelize.col("performed_date")),
            "<=",
            moment(to_date).format("YYYY-MM-DD")
          )
        ]
      }
    },
    include: [
      {
        model: chief_complaints_tbl,
        attributes: ["code", "name"]
      },
      {
        model: chief_complaints_duration_tbl,
        attributes: ["code", "name"]
      },
      {
        model: encounter_tbl,
        attributes: ["uuid", "facility_uuid"],
        where: { facility_uuid: facility_uuid }
      }
    ]
  };
}

const PatientChiefComplaints = () => {
  /**
   *
   * @param {*} req
   * @param {*} res
   */
  const _createChiefComplaints = async (req, res) => {
    const { user_uuid } = req.headers;
    const chiefComplaintsData = req.body;

    if (chiefComplaintsData && chiefComplaintsData.length > 0 && user_uuid) {
      if (utilityService.checkTATIsPresent(chiefComplaintsData)) {
        if (!utilityService.checkTATIsValid(chiefComplaintsData)) {
          return res.status(400).send({
            code: httpStatus[400],
            message: `${emr_constants.PLEASE_PROVIDE} ${emr_constants.VALID_START_DATE} ${emr_constants.OR} ${emr_constants.VALID_END_DATE}`
          });
        }
      } else {
        return res.status(400).send({
          code: httpStatus[400],
          message: `${emr_constants.PLEASE_PROVIDE} ${emr_constants.START_DATE} ${emr_constants.OR} ${emr_constants.END_DATE}`
        });
      }
      try {
        chiefComplaintsData.forEach(cD => {
          cD = emr_utility.createIsActiveAndStatus(cD, user_uuid);
        });

        const chiefComplaintsCreatedData = await patient_chief_complaints_tbl.bulkCreate(
          chiefComplaintsData,
          { returning: true }
        );
        if (chiefComplaintsCreatedData) {
          return res.status(200).send({
            code: httpStatus.OK,
            message: "Inserted Patient Chief Complaints Successfully",
            responseContents: attachUUIDTOCreatedData(
              chiefComplaintsData,
              chiefComplaintsCreatedData
            )
          });
        }
      } catch (ex) {
        return res
          .status(400)
          .send({ code: httpStatus.BAD_REQUEST, message: ex.message });
      }
    } else {
      return res.status(400).send({
        code: httpStatus[400],
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}`
      });
    }
  };

  /**
   * This is a filter API
   * Key is - Patient Id and Encounter Id
   * Otherwise it return entire list
   */
  const _getPatientChiefComplaints = async (req, res) => {
    const {
      searchKey,
      searchValue,
      facility_uuid,
      from_date,
      to_date
    } = req.query;

    try {
      if (searchKey && searchValue && facility_uuid && from_date && to_date) {
        const patChiefComplaintsData = await patient_chief_complaints_tbl.findAll(
          getCCQuery(searchKey, searchValue, facility_uuid, from_date, to_date),
          { returning: true }
        );
        return res.status(200).send({
          code: httpStatus.OK,
          message: "Fetched Patient Chief Complaints Successfully",
          responseContents: patChiefComplaintsData
        });
      } else if (searchKey && searchValue) {
        const patChiefComplaintsData = await patient_chief_complaints_tbl.findAll(
          getPatientSearchQuery(searchKey, searchValue)
        );
        return res.status(200).send({
          code: httpStatus.OK,
          message: "Fetched Patient Chief Complaints Successfully",
          responseContents: getPatientsChiefComplaintsInReadable(
            patChiefComplaintsData
          )
        });
      } else {
        return res
          .status(422)
          .send({ code: httpStatus[400], message: "No Request Param Found" });
      }
    } catch (ex) {
      console.log(ex.message);
      return res
        .status(400)
        .send({ code: httpStatus.BAD_REQUEST, message: ex.message });
    }
  };

  const _getMobileMockAPI = async (req, res) => {
    const { user_uuid } = req.headers;
    const { patientId, cDate } = req.query;

    if (user_uuid) {
      return res.status(200).send({
        code: 200,
        message: "Records Fetched Successfully",
        response_content: emr_mock_json.patientChiefComplaintsJson
      });
    } else {
      return res
        .status(422)
        .send({ code: httpStatus[400], message: "No Request Param Found" });
    }
  };

  const _getTopComplaints = async (req, res) => {
    const { user_uuid } = req.headers;
    let filterQuery = {
      encounter_doctor_uuid: user_uuid,
      status: emr_constants.IS_ACTIVE,
      is_active: emr_constants.IS_ACTIVE
    };
    try {
      if (user_uuid) {
        const topComplaints = await patient_chief_complaints_tbl.findAll({
          include: [{
            model: chief_complaints_tbl,
            attributes: ['uuid', 'name'],
          }],
          where: filterQuery,
          group: ['chief_complaint_uuid'],
          attributes: ['uuid', 'encounter_doctor_uuid', 'chief_complaint_uuid',
            [Sequelize.fn('COUNT', Sequelize.col('chief_complaint_uuid')), 'Count']
          ],
          order: [[Sequelize.fn('COUNT', Sequelize.col('chief_complaint_uuid')), 'DESC']]

        });
        const returnMsg = topComplaints.length > 0 ? 'Patient Chief complaints fetched Successfully' : emr_constants.NO_RECORD_FOUND;
        return res.status(200).send({ code: httpStatus.OK, msg: returnMsg, responseContents: topComplaints });
      } else {
        return res.status(400).send({
          code: httpStatus.UNAUTHORIZED,
          message: emr_constants.NO_USER_ID
        });
      }
    } catch (ex) {
      console.log('Exception happened', ex);
      return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex });

    }
  };

  return {
    createChiefComplaints: _createChiefComplaints,
    getPatientChiefComplaints: _getPatientChiefComplaints,
    getMobileMockAPI: _getMobileMockAPI,
    getTopComplaints: _getTopComplaints
  };
};

module.exports = PatientChiefComplaints();

function attachUUIDTOCreatedData(reqData, createdData) {
  reqData.forEach((rD, idx) => {
    rD.uuid = createdData[idx].uuid;
  });

  return reqData;
}

function getPatientsChiefComplaintsInReadable(fetchedData) {
  let patientChiefComplaints = [];
  fetchedData.forEach(fD => {
    patientChiefComplaints = [
      ...patientChiefComplaints,
      {
        patient_chief_complaint_id: fD.uuid,
        encounter_id: fD.encounter_uuid,
        encounter_type_id: fD.encounter_type_uuid,
        consulation_id: fD.consulation_uuid,
        chief_complaint_id: fD.chief_complaint_uuid,
        chief_complaint_name:
          fD.chief_complaint && fD.chief_complaint.name
            ? fD.chief_complaint.name
            : "",
        chief_complaint_code:
          fD.chief_complaint && fD.chief_complaint.code
            ? fD.chief_complaint.code
            : "",
        chief_complaint_duration_id: fD.chief_complaint_duration_period_uuid,
        chief_complaint_duration_name:
          fD.chief_complaint_duration_period &&
            fD.chief_complaint_duration_period.name
            ? fD.chief_complaint_duration_period.name
            : "",
        chief_complaint_duration_code:
          fD.chief_complaint_duration_period &&
            fD.chief_complaint_duration_period.code
            ? fD.chief_complaint_duration_period.code
            : "",
        is_active: fD.is_active[0] === 1 ? true : false,
        status: fD.status[0] === 1 ? true : false,
        created_by: fD.created_by,
        modified_by: fD.modified_by,
        created_date: fD.created_date,
        modified_date: fD.modified_date
      }
    ];
  });
  return patientChiefComplaints;
}
