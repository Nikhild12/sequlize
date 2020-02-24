// Package Import
const httpStatus = require("http-status");
const moment = require("moment");

const rp = require('request-promise');
var config = require('../config/config');

// Sequelizer Import
var Sequelize = require("sequelize");
var Op = Sequelize.Op;

// Sequelizer Import
const sequelizeDb = require("../config/sequelize");

const emr_utility = require("../services/utility.service");

const encounter_tbl = sequelizeDb.encounter;
const encounter_doctors_tbl = sequelizeDb.encounter_doctors;
const encounter_type_tbl = sequelizeDb.encounter_type;
const vw_patientdoc = sequelizeDb.vw_patient_doctor_details;

const emr_constants = require("../config/constants");

const emr_mock_json = require("../config/emr_mock_json");

let pageNo = 0;
let sortOrder = "DESC";
let sortField = "ec_performed_date";
let pageSize = 10;
let offset;

// Query
function getActiveEncounterQuery(pId, dId, deptId, etypeId) {
  let encounterQuery = {
    where: {
      patient_uuid: pId,
      is_active_encounter: emr_constants.IS_ACTIVE,
      is_active: emr_constants.IS_ACTIVE,
      status: emr_constants.IS_ACTIVE,
      encounter_type_uuid: etypeId
    },
    include: [
      {
        model: encounter_doctors_tbl,
        attributes: ["uuid", "doctor_uuid"],
        where: {
          doctor_uuid: dId,
          department_uuid: deptId,
          is_active: emr_constants.IS_ACTIVE,
          status: emr_constants.IS_ACTIVE
        }
      }
    ]
  };

  if (etypeId === 1) {
    encounterQuery.where[Op.and] = [
      Sequelize.where(
        Sequelize.fn("date", Sequelize.col("encounter_date")),
        "<=",
        moment().format("YYYY-MM-DD")
      )
    ];
  } else if (etypeId === 2 || etypeId === "2") {
    delete encounterQuery.include[0].where.doctor_uuid;
    delete encounterQuery.include[0].where.department_uuid;
  }
  return encounterQuery;
}

const Encounter = () => {
  /**
   *
   * @param {*} req
   * @param {*} res
   */

  const _getEncounterByDocAndPatientId = async (req, res) => {
    const { user_uuid } = req.headers;
    const {
      patientId,
      doctorId,
      from_date,
      to_date,
      departmentId,
      encounterType
    } = req.query;

    try {
      const is_mobile_request =
        (doctorId === 0 || doctorId == 0) &&
        (departmentId == 0 || departmentId === 0) &&
        (encounterType == 0 || encounterType === 0);
      if (user_uuid && patientId && is_mobile_request && from_date && to_date) {
        const encounterData = await encounter_tbl.findAll(
          getEncounterQuery(patientId, from_date, to_date)
        );
        return res.status(200).send({
          code: httpStatus.OK,
          message: "Fetched Encounter Successfully",
          responseContents: encounterData
        });
      } else if (
        user_uuid &&
        patientId &&
        patientId > 0 &&
        doctorId &&
        doctorId > 0 &&
        departmentId &&
        encounterType
      ) {
        const encounterData = await encounter_tbl.findAll(
          getActiveEncounterQuery(
            patientId,
            doctorId,
            departmentId,
            encounterType
          )
        );
        return res.status(200).send({
          code: httpStatus.OK,
          message: "Fetched Encounter Successfully",
          responseContents: encounterData
        });
      } else {
        return res.status(400).send({
          code: httpStatus[400],
          message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`
        });
      }
    } catch (ex) {
      console.log(ex);
      return res
        .status(400)
        .send({ code: httpStatus.BAD_REQUEST, message: ex.message });
    }
  };

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  const _createPatientEncounter = async (req, res) => {
    const { user_uuid } = req.headers;
    let { encounter, encounterDoctor } = req.body;
    let encounterPromise = [];
    let encounterTransStatus = false;
    let encounterTransaction;
    const is_all_req_fields_in_enc_is_pres =
      encounter &&
      encounter.encounter_type_uuid &&
      encounter.patient_uuid &&
      encounter.department_uuid;
    const is_all_req_fields_in_encDoc_is_pres =
      encounterDoctor &&
      encounterDoctor.doctor_uuid &&
      encounterDoctor.department_uuid;

    if (
      user_uuid &&
      is_all_req_fields_in_enc_is_pres &&
      is_all_req_fields_in_encDoc_is_pres &&
      encounterDoctor
    ) {
      const { encounter_type_uuid, patient_uuid } = encounter;
      const { doctor_uuid, department_uuid } = encounterDoctor;

      const { tat_start_time, tat_end_time } = encounterDoctor;

      if (tat_start_time && tat_end_time) {
        if (
          !moment(tat_start_time).isValid() ||
          !moment(tat_end_time).isValid()
        ) {
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
      // Assigning
      encounter = emr_utility.createIsActiveAndStatus(encounter, user_uuid);
      encounter.is_active_encounter = emr_constants.IS_ACTIVE;
      encounter.encounter_date = new Date();
      // Assigning
      encounterDoctor = emr_utility.createIsActiveAndStatus(
        encounterDoctor,
        user_uuid
      );
      encounterDoctor.patient_uuid = encounter.patient_uuid;
      encounterDoctor.consultation_start_date = new Date();

      try {
        // if Encounter Type is 2 then check
        // for active encounter for type 1 if exists
        // closing it
        // encounterTransaction = await sequelizeDb.sequelize.transaction();
        let encounterDoctorData, encounterData;
        let is_enc_avail, is_enc_doc_avail;

        encounterData = await getEncounterQueryByPatientId(
          patient_uuid,
          encounter_type_uuid
        );

        is_enc_avail = encounterData && encounterData.length > 0;
        if (is_enc_avail) {
          encounterDoctorData = await getEncounterDoctorsQueryByPatientId(
            encounterData[0].uuid,
            doctor_uuid,
            department_uuid
          );
        }

        is_enc_doc_avail =
          encounterDoctorData && encounterDoctorData.length > 0;
        if (encounter_type_uuid === 2) {
          if (encounterData && encounterData.length > 0) {
            encounterPromise = [
              ...encounterPromise,
              encounter_tbl.update(
                {
                  is_active_encounter: emr_constants.IS_IN_ACTIVE,
                  is_active: emr_constants.IS_IN_ACTIVE,
                  status: emr_constants.IS_IN_ACTIVE
                },
                {
                  where: { uuid: encounterData[0].uuid }
                }
              ),
              encounter_doctors_tbl.update(
                {
                  encounter_doctor_status: emr_constants.IS_IN_ACTIVE,
                  is_active: emr_constants.IS_IN_ACTIVE,
                  status: emr_constants.IS_IN_ACTIVE
                },
                {
                  where: { encounter_uuid: encounterData[0].uuid }
                }
              )
            ];
          }
        } else if (
          encounter_type_uuid === 1 &&
          is_enc_avail &&
          is_enc_doc_avail
        ) {
          return res.status(400).send({
            code: httpStatus.BAD_REQUEST,
            message: emr_constants.DUPLICATE_ENCOUNTER
          });
        }

        if (!is_enc_avail) {
          encounterPromise = [
            ...encounterPromise,
            encounter_tbl.create(encounter, {
              returning: true
            })
          ];
        }
        const createdEncounterData = await Promise.all(encounterPromise);

        if (createdEncounterData) {
          if (is_enc_avail && !is_enc_doc_avail) {
            encounter.uuid = encounterDoctor.encounter_uuid =
              encounterData[0].uuid;
          } else {
            encounter.uuid = encounterDoctor.encounter_uuid = getCreatedEncounterId(
              createdEncounterData
            );
          }

          const createdEncounterDoctorData = await encounter_doctors_tbl.create(
            encounterDoctor,
            { returning: true }
          );
          encounterDoctor.uuid = createdEncounterDoctorData.uuid;
          // await encounterTransaction.commit();
          // encounterTransStatus = true;
          return res.status(200).send({
            code: httpStatus.OK,
            message: "Inserted Encounter Successfully",
            responseContents: { encounter, encounterDoctor }
          });
        }
      } catch (ex) {
        console.log(ex);
        // if (encounterTransaction) {
        //   await encounterTransaction.rollback();
        //   encounterTransStatus = true;
        // }

        return res
          .status(400)
          .send({ code: httpStatus.BAD_REQUEST, message: ex.message });
      } finally {
        // if (encounterTransaction && !encounterTransStatus) {
        //   encounterTransaction.rollback();
        // }
      }
    } else {
      return res.status(400).send({
        code: httpStatus[400],
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}`
      });
    }
  };

  const _getVisitHistoryByPatientId = async (req, res) => {
    let { page_no, page_size } = req.query;
    const { patientId } = req.query;

    if (patientId && !isNaN(+patientId) && page_no && !isNaN(+page_no)) {
      try {
        const mockJson = emr_mock_json.patientVisitHistoryJson.sort((a, b) => {
          return new Date(b.encounter_date) - new Date(a.encounter_date);
        });
        let visit_history = [];
        if (+page_no === 0 && +page_size === 10) {
          visit_history = mockJson.slice(0, 10);
        } else if (+page_no === 1 && +page_size === 10) {
          visit_history = mockJson.slice(10, 20);
        }
        return res.status(200).send({
          code: 200,
          message: "Records Fetched Successfully",
          response_content: {
            total_records: mockJson.length,
            total_pages: 2,
            current_page: +page_no + 1,
            visit_history,
            responseContentLength: visit_history.length
          }
        });
      } catch (ex) {
        console.log(ex);
        return res
          .status(400)
          .send({ code: httpStatus.BAD_REQUEST, message: ex.message });
      }
    } else {
      return res.status(400).send({
        code: httpStatus[400],
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`
      });
    }
  };

  const _deleteEncounterById = async (req, res) => {
    const { user_uuid } = req.headers;
    const { encounterId } = req.query;

    let enDelTransaction;
    let enDelTransStatus = false;
    if (user_uuid && encounterId && !isNaN(+encounterId)) {
      let encounterPromise = [];
      try {
        // enDelTransaction = await sequelizeDb.sequelize.transaction();
        encounterPromise = [
          ...encounterPromise,
          encounter_tbl.update(
            {
              is_active_encounter: emr_constants.IS_IN_ACTIVE,
              is_active: emr_constants.IS_IN_ACTIVE,
              status: emr_constants.IS_IN_ACTIVE
            },
            {
              where: { uuid: encounterId }
            }
          ),
          encounter_doctors_tbl.update(
            {
              encounter_doctor_status: emr_constants.IS_IN_ACTIVE,
              is_active: emr_constants.IS_IN_ACTIVE,
              status: emr_constants.IS_IN_ACTIVE
            },
            {
              where: { encounter_uuid: encounterId }
            }
          )
        ];

        let deleteEnPromise = await Promise.all(encounterPromise);
        // const isAllDeleted = deleteEnPromise.every(d => {
        //   return d === 1;
        // });

        // if (isAllDeleted) {
        //   await enDelTransaction.commit();
        // } else {
        //   await enDelTransaction.rollback();
        // }

        // enDelTransStatus = true;
        deleteEnPromise = [].concat.apply([], deleteEnPromise);

        const responseMessage = isAllDeleted
          ? emr_constants.UPDATED_ENC_SUCCESS
          : emr_constants.NO_RECORD_FOUND;
        return res.status(200).send({
          code: httpStatus.OK,
          message: responseMessage
        });
      } catch (ex) {
        console.log(ex);
        // if (enDelTransaction) {
        //   await enDelTransaction.rollback();
        //   enDelTransStatus = true;
        // }

        return res
          .status(400)
          .send({ code: httpStatus.BAD_REQUEST, message: ex.message });
      } finally {
        // if (enDelTransaction && !enDelTransStatus) {
        //   enDelTransaction.rollback();
        // }

        console.log("Finally");
        
      }
    } else {
      return res.status(400).send({
        code: httpStatus[400],
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`
      });
    }
  };

  const _updateECdischarge = async (req, res) => {
    const { user_uuid } = req.headers;
    const updatedata = req.body;
    const ec_updateData = {
      discharge_type_uuid: req.body.discharge_type_uuid,
      discharge_date: req.body.discharge_date,
      modified_by: user_uuid,
      modified_date: new Date()
    };
    try {
      if (user_uuid && updatedata) {
        const ec_updated = await encounter_tbl.update(ec_updateData, {
          where: {
            facility_uuid: updatedata.facility_uuid,
            uuid: updatedata.encounter_uuid,
            patient_uuid: updatedata.patient_uuid,
            encounter_type_uuid: updatedata.encounter_type_uuid
          }
        });
        if (ec_updated) {
          return res
            .status(200)
            .send({ code: httpStatus[200], message: "updated sucessfully" });
        }
      } else {
        return res
          .status(400)
          .send({ code: httpStatus[400], message: "No Request Body Found" });
      }
    } catch (ex) {
      return res
        .status(400)
        .send({ code: httpStatus.BAD_REQUEST, message: ex.message });
    }
  };

  const _updateTATTimeInEncounterDoctor = async (req, res) => {
    const { user_uuid } = req.headers;

    const { encounterDoctorId, tat_end_time } = req.body;

    const isValidEndTime = moment(tat_end_time).isValid();
    if (user_uuid && encounterDoctorId && isValidEndTime) {
      try {
        const updatedEncounter = await encounter_doctors_tbl.update(
          {
            tat_end_time: tat_end_time,
            modified_by: user_uuid,
            modified_date: new Date()
          },
          {
            where: { uuid: encounterDoctorId }
          }
        );

        const returnMessage =
          updatedEncounter[0] === 1
            ? emr_constants.UPDATED_ENC_DOC_TAT_TIME
            : emr_constants.NO_CONTENT_MESSAGE;
        return res.status(200).send({
          code: httpStatus.OK,
          message: returnMessage
        });
      } catch (ex) {
        console.log(ex);
        return res
          .status(400)
          .send({ code: httpStatus.BAD_REQUEST, message: ex.message });
      }
    } else {
      return res.status(400).send({
        code: httpStatus[400],
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.PLEASE_PROVIDE} ${emr_constants.END_DATE}`
      });
    }
  };

  const _getPatientDoc = async (req, res) => {
    const { user_uuid } = req.headers;
    const { patient_uuid } = req.query;

    try {
      if (user_uuid && patient_uuid) {

        const docList = await vw_patientdoc.findAll(
          {
            attributes: { "exclude": ['id', 'createdAt', 'updatedAt'] },
            where: { ed_patient_uuid: patient_uuid }
          }
        );
        if (docList) {
          //const getdepdetails = await getdepDetails(user_uuid, docList[0].department_uuid, req.headers.authorization);
          //const getuDetails = await getuserDetails(user_uuid,docList[0].doctor_uuid, req.headers.authorization);
          return res
            .status(httpStatus.OK)
            .json({ statusCode: 200, req: '', responseContents: docList });
        } else {
          return res.status(400).send({ code: httpStatus[400], message: "patient information not found" });
        }
      } else {
        return res.status(400).send({ code: httpStatus[400], message: "No Request Body or Search key Found " });
      }
    }
    catch (ex) {
      const errorMsg = ex.errors ? ex.errors[0].message : ex.message;
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ status: "error", msg: errorMsg });
    }
  };

  return {
    getEncounterByDocAndPatientId: _getEncounterByDocAndPatientId,
    createPatientEncounter: _createPatientEncounter,
    getVisitHistoryByPatientId: _getVisitHistoryByPatientId,
    deleteEncounterById: _deleteEncounterById,
    updateECdischarge: _updateECdischarge,
    updateTATTimeInEncounterDoctor: _updateTATTimeInEncounterDoctor,
    getPatientDoc: _getPatientDoc
  };
};

module.exports = Encounter();

function getCreatedEncounterId(createdEncounterData) {
  return createdEncounterData.length > 1
    ? createdEncounterData[2].uuid
    : createdEncounterData[0].uuid;
}

function getEncounterQuery(pId, from_date, to_date) {
  return {
    where: {
      patient_uuid: pId,
      encounter_date: {
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn("date", Sequelize.col("encounter_date")),
            ">=",
            moment(from_date).format("YYYY-MM-DD")
          ),
          Sequelize.where(
            Sequelize.fn("date", Sequelize.col("encounter_date")),
            "<=",
            moment(to_date).format("YYYY-MM-DD")
          )
        ]
      },
      is_active_encounter: emr_constants.IS_ACTIVE,
      is_active: emr_constants.IS_ACTIVE,
      status: emr_constants.IS_ACTIVE
    },
    include: [
      {
        model: encounter_type_tbl,
        attributes: ["uuid", "code", "name"],
        where: {
          is_active: emr_constants.IS_ACTIVE,
          status: emr_constants.IS_ACTIVE
        }
      }
    ]
  };
}

async function getEncounterQueryByPatientId(pId, etypeId) {
  let query = {
    where: {
      patient_uuid: pId,
      is_active_encounter: emr_constants.IS_ACTIVE,
      is_active: emr_constants.IS_ACTIVE,
      status: emr_constants.IS_ACTIVE,
      encounter_type_uuid: etypeId
    }
  };
  if (etypeId === 1) {
    query.where[Op.and] = [
      Sequelize.where(
        Sequelize.fn("date", Sequelize.col("encounter_date")),
        "<=",
        moment().format("YYYY-MM-DD")
      )
    ];
  }
  return encounter_tbl.findAll(query);
}

async function getEncounterDoctorsQueryByPatientId(enId, dId, deptId) {
  return encounter_doctors_tbl.findAll({
    attributes: ["uuid", "doctor_uuid"],
    where: {
      doctor_uuid: dId,
      department_uuid: deptId,
      is_active: emr_constants.IS_ACTIVE,
      status: emr_constants.IS_ACTIVE,
      encounter_uuid: enId
    }
  });
}

async function getuserDetails(user_uuid, docid, authorization) {
  //console.log(user_uuid, authorization);
  let options = {
    //uri: config.wso2AppUrl + 'users/getusersById',
    //uri: 'https://qahmisgateway.oasyshealth.co/DEVAppmaster/v1/api/users/getusersById',
    uri: 'https://qahmisgateway.oasyshealth.co/DEVAppmaster/v1/api/userProfile/GetAllDoctors',
    method: 'POST',
    headers: {
      "Authorization": authorization,
      "user_uuid": user_uuid
    },
    //body: { "Id": docid },
    body: {},
    json: true
  };
  const user_details = await rp(options);
  return user_details;
}

async function getdepDetails(user_uuid, depid, authorization) {
  console.log(depid);
  let options = {
    //uri: config.wso2AppUrl + 'department/getDepartmentOnlyById',
    //uri: 'https://qahmisgateway.oasyshealth.co/DEVAppmaster/v1/api/department/getDepartmentOnlyById',
    uri: 'https://qahmisgateway.oasyshealth.co/DEVAppmaster/v1/api/department/getAllDepartments',
    method: 'POST',
    headers: {
      "Authorization": authorization,
      "user_uuid": user_uuid
    },
    //body: { "uuid": depid },
    body: { "pageNo": 0,
    "paginationSize": 100},
    json: true
  };
  const dep_details = await rp(options);
  return dep_details;
}

function getpddata(docList, getuDetails, getdep) {
  //let dsdList = [];
  let doc_name = getuDetails.responseContents.title.name + '.' + getuDetails.responseContents.first_name;
  //let nur_name = getnDetails.responseContents.title.name + '.' + getnDetails.responseContents.first_name;
  if (docList && docList.length > 0) {
    doc_data = {
      patient_uuid: docList[0].patient_uuid,
      encounter_uuid: docList[0].encounter_uuid,
      created_date: docList[0].created_date,
      doctor_uuid: docList[0].doctor_uuid,
      doctor_name: doc_name,
      department_uuid: docList[0].department_uuid,
      department_name: getdep.responseContent.name
    };

    return { "Doc_info": doc_data };
  }
  else {
    return {};
  }

}



