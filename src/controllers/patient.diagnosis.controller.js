// Package Import
const httpStatus = require("http-status");

const moment = require("moment");

// Sequelizer Import
const sequelizeDb = require("../config/sequelize");

var Sequelize = require("sequelize");
var Op = Sequelize.Op;

const emr_mock_json = require("../config/emr_mock_json");

const patient_diagnosis_tbl = sequelizeDb.patient_diagnosis;
const diagnosis_tbl = sequelizeDb.diagnosis;
const encounter_type_tbl = sequelizeDb.encounter_type;

const emr_constants = require("../config/constants");
const utilityService = require("../services/utility.service");
const getActiveAndStatusObject = is_active => {
  return {
    is_active: is_active ? emr_constants.IS_ACTIVE : emr_constants.IS_IN_ACTIVE,
    status: is_active ? emr_constants.IS_ACTIVE : emr_constants.IS_IN_ACTIVE
  };
};

const getPatientDiagnosisAttributes = () => {
  return [
    "uuid",
    "diagnosis_uuid",
    "other_diagnosis",
    "is_snomed",
    "is_patient_condition",
    "condition_type_uuid",
    "condition_date",
    "comments",
    "performed_date",
    "created_date",
    "modified_date",
    "performed_by",
    "encounter_type_uuid"
  ];
};

const PatientDiagnsis = () => {
  const _createPatientDiagnosis = async (req, res) => {
    const { user_uuid } = req.headers;
    const patientsDiagnosisData = req.body;

    // checking user id and
    // req data length
    if (user_uuid && patientsDiagnosisData.length > 0) {
      try {
        // if the bit is not set
        // setting it to `0`

        if (utilityService.checkTATIsPresent(patientsDiagnosisData)) {
          if (!utilityService.checkTATIsValid(patientsDiagnosisData)) {
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

        const patientDiagnosisCreatedData = await _helperCreatePatientDiagnosis(
          patientsDiagnosisData,
          user_uuid
        );
        return res.status(200).send({
          code: httpStatus.OK,
          message: "Inserted Patient Diagnosis Complaints Successfully",
          responseContents: appendUUIDToReqData(
            patientsDiagnosisData,
            patientDiagnosisCreatedData
          )
        });
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

  const _getPatientDiagnosisFilters = async (req, res) => {
    try {
      const { user_uuid } = req.headers;
      const {
        searchKey,
        searchValue,
        patientId,
        departmentId,
        facility_uuid,
        from_date,
        to_date
      } = req.query;

      if (
        (user_uuid &&
          searchKey &&
          searchValue &&
          patientId &&
          departmentId &&
          facility_uuid &&
          from_date,
          to_date)
      ) {
        const patientDiagnosisData = await patient_diagnosis_tbl.findAll(
          getPatientFiltersQuery1(
            searchKey,
            searchValue,
            patientId,
            departmentId,
            user_uuid,
            facility_uuid,
            from_date,
            to_date
          )
        );
        //console.log("----------",patientDiagnosisData);
        return res.status(200).send({
          code: httpStatus.OK,
          message: "Fetched Patient Diagnosis Successfully",
          responseContents: getPatientData(patientDiagnosisData)
        });
        //console.log("----------",patientDiagnosisData);
        //return res.status(200).send({ code: httpStatus.OK, message: "Fetched Patient Diagnosis Successfully", responseContents: patientDiagnosisData });
      } else if (
        user_uuid &&
        searchKey &&
        searchValue &&
        patientId &&
        departmentId
      ) {
        const patientDiagnosisData = await patient_diagnosis_tbl.findAll(
          getPatientFiltersQuery(
            searchKey,
            searchValue,
            patientId,
            departmentId,
            user_uuid
          )
        );
        return res.status(200).send({
          code: httpStatus.OK,
          message: "Fetched Patient Diagnosis Successfully",
          responseContents: getPatientData(patientDiagnosisData)
        });
      } else {
        return res.status(422).send({
          code: httpStatus[400],
          message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`
        });
      }
    } catch (ex) {
      return res
        .status(422)
        .send({ code: httpStatus.BAD_REQUEST, message: ex.message });
    }
  };

  const _getPatientDiagnosisHistoryById = async (req, res) => {
    const { user_uuid } = req.headers;
    const { uuid } = req.query;
    try {
      if (user_uuid) {
        const patientDiagnosisData = await patient_diagnosis_tbl.findOne(
          { where: { uuid: uuid } },
          { returning: true }
        );
        return res
          .status(200)
          .send({ code: httpStatus.OK, responseContent: patientDiagnosisData });
      } else {
        return res.status(400).send({
          code: httpStatus.UNAUTHORIZED,
          message: emr_constants.NO_USER_ID
        });
      }
    } catch (err) {
      console.log("Exception happened", ex);
      return res
        .status(400)
        .send({ code: httpStatus.BAD_REQUEST, message: ex });
    }
  };

  const _updatePatientDiagnosisHistory = async (req, res) => {
    const { user_uuid } = req.headers;
    const { patient_diagnosis_id, patient_uuid, department_uuid } = req.query;
    let postData = req.body;
    let selector = {
      where: {
        uuid: patient_diagnosis_id,
        patient_uuid: patient_uuid,
        department_uuid: department_uuid
      }
    };
    try {
      if (user_uuid && patient_diagnosis_id && postData && Object.keys(postData).length != 0) {
        // let fetchedData = await patient_diagnosis_tbl.findOne(selector);
        // let fetchedDate = fetchedData.created_date;
        // fetchedDate = moment(fetchedDate).format("YYYY-MM-DD");
        // let currentDate = moment(Date.now()).format("YYYY-MM-DD");
        // if (fetchedDate != currentDate) {
        //   return res.status(400).send({
        //     code: httpStatus[400],
        //     message: "Only today date able to update"
        //   });
        // }


        const diagnosisData = await patient_diagnosis_tbl.update(
          postData,
          selector,
          { returning: true }
        );
        if (diagnosisData == 1) {
          return res
            .status(200)
            .send({ code: httpStatus.OK, message: "Updated Successfully" });
        } else {
          return res.status(400).send({ code: 400, message: 'failed to update' });
        }
      } else {
        return res
          .status(400)
          .send({ code: httpStatus[400], message: "No Request Body Found" });
      }
    } catch (ex) {
      console.log("Exception happened", ex);
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
        response_content: emr_mock_json.patientDiagnosisJson
      });
    } else {
      return res
        .status(422)
        .send({ code: httpStatus[400], message: "No Request Param Found" });
    }
  };

  const _deletePatientDiagnosisById = async (req, res) => {
    const { user_uuid } = req.headers;
    const { diagnosisId } = req.body;

    if (user_uuid && diagnosisId) {
      const updateData = await _helperdelPatDignsById(diagnosisId);
      let deleteResponseMessage = emr_constants.DELETE_SUCCESSFUL;
      if (updateData && !updateData[0]) {
        deleteResponseMessage = emr_constants.NO_CONTENT_MESSAGE;
      }
      return res.status(200).send({
        code: httpStatus.OK,
        message: deleteResponseMessage,
        responseContent: updateData
      });
    } else {
      return res.status(422).send({
        code: httpStatus[400],
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`
      });
    }
  };


  return {
    createPatientDiagnosis: _createPatientDiagnosis,
    getPatientDiagnosisByFilters: _getPatientDiagnosisFilters,
    getPatientDiagnosisHistoryById: _getPatientDiagnosisHistoryById,
    updatePatientDiagnosisHistory: _updatePatientDiagnosisHistory,
    getMobileMockAPI: _getMobileMockAPI,
    deletePatientDiagnosisById: _deletePatientDiagnosisById,
    helperCreatePatientDiagnosis: _helperCreatePatientDiagnosis,
    helperdelPatDignsById: _helperdelPatDignsById,
  };
};

module.exports = PatientDiagnsis();

/**
 *
 * @param {*} req i.e. body
 * @param {*} res i.e created data
 */
function appendUUIDToReqData(req, res) {
  req.forEach((r, idx) => {
    r.uuid = res[idx].uuid;
  });
  return req;
}

/**
 *
 * @param {*} key search key
 * @param {*} value search key value
 * @param {*} pId patient Id
 * @param {*} dId department Id
 * @param {*} uId user Id
 */
function getPatientFiltersQuery(key, value, pId, dId, uId, from_date, to_date) {
  let filtersQuery = {};
  switch (key) {
    case "getLatestDiagnosis":
      filtersQuery = {
        limit: +value,
        attributes: getPatientDiagnosisAttributes(),
        order: [["uuid", "DESC"]]
      };
      break;

    default:
      break;
  }

  filtersQuery.include = [
    {
      model: diagnosis_tbl,
      attributes: ["code", "name"],
      required: false

    }
  ];
  filtersQuery.where = {
    department_uuid: dId,
    patient_uuid: pId,
    performed_by: uId
  };

  filtersQuery.attributes = getPatientDiagnosisAttributes();
  Object.assign(
    filtersQuery.where,
    utilityService.getActiveAndStatusObject(emr_constants.IS_ACTIVE)
  );
  return filtersQuery;
}

function getPatientFiltersQuery1(
  key,
  value,
  pId,
  dId,
  uId,
  facility_uuid,
  from_date,
  to_date
) {
  let filtersQuery = {};
  switch (key) {
    case "date":
      filtersQuery = {
        attributes: getPatientDiagnosisAttributes(),
        order: [["uuid", "DESC"]]
      };

      break;
    default:
      break;
  }

  filtersQuery.include = [
    {
      model: diagnosis_tbl,
      attributes: ["code", "name"],
      required: false
    },
  ];

  filtersQuery.where = {
    patient_uuid: pId,
    facility_uuid: facility_uuid,
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
  };

  filtersQuery.attributes = getPatientDiagnosisAttributes();
  Object.assign(
    filtersQuery.where,
    utilityService.getActiveAndStatusObject(emr_constants.IS_ACTIVE)
  );
  return filtersQuery;
}

function getPatientData(responseData) {
  return responseData.map(rD => {
    return {
      patient_diagnosis_id: rD.uuid || 0,
      encounter_type_id: rD.encounter_type_uuid || 0,
      diagnosis_performed_date: rD.performed_date,
      diagnosis_created_date: rD.created_date,
      diagnosis_modified_date: rD.modified_date,
      diagnosis_performed_by: rD.performed_by,
      diagnosis_comments: rD.comments,

      diagnosis_name:
        rD.diagnosis && rD.diagnosis.name ? rD.diagnosis.name : rD.other_diagnosis,
      diagnosis_code:
        rD.diagnosis && rD.diagnosis.code ? rD.diagnosis.code : rD.diagnosis_uuid,
      diagnosis_is_snomed: rD.is_snomed[0] === 1 ? true : false
    };
  });
}

function getPatientDiagnosisHistory(patient_uuid) {
  let query = {
    order: [["performed_date", "DESC"]],
    where: {
      patient_uuid: patient_uuid,
      is_active: 1,
      status: 1
    },
    include: [
      {
        model: encounter_type_tbl,
        as: "encounter_type",
        attributes: ["uuid", "name"],
        where: { is_active: 1, status: 1 }
      },
      {
        model: diagnosis_tbl,
        attributes: ["uuid", "name"],
        where: { is_active: 1, status: 1 }
      }
    ]
  };

  return patient_diagnosis_tbl.findAll(query);
}

async function _helperdelPatDignsById(diagnosisId) {
  return await patient_diagnosis_tbl.update(
    {
      status: emr_constants.IS_IN_ACTIVE,
      is_active: emr_constants.IS_IN_ACTIVE
    },
    {
      where: { uuid: diagnosisId }
    }
  );
}

async function _helperCreatePatientDiagnosis(patientsDiagnosisData, user_uuid) {
  patientsDiagnosisData.forEach(pD => {
    pD.is_snomed = pD.is_snomed;
    pD.is_patient_condition =
      pD.is_patient_condition || emr_constants.IS_ACTIVE;
    pD.is_chronic = pD.is_chronic || emr_constants.IS_ACTIVE;

    pD = utilityService.createIsActiveAndStatus(pD, user_uuid);
    pD.performed_by = user_uuid;
  });

  return await patient_diagnosis_tbl.bulkCreate(patientsDiagnosisData, {
    returning: true
  });
}


