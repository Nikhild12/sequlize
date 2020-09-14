// Package Import
const httpStatus = require("http-status");
const moment = require("moment");

const rp = require("request-promise");
const config = require("../config/config");

// Sequelizer Import
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

// Sequelizer Import
const sequelizeDb = require("../config/sequelize");

// EMR Utilities
const emr_utility = require("../services/utility.service");

// Encounter Attributes
const enc_att = require("../attributes/encounter.attributes");

const encounter_tbl = sequelizeDb.encounter;
const encounter_doctors_tbl = sequelizeDb.encounter_doctors;
const encounter_type_tbl = sequelizeDb.encounter_type;
const vw_patientdoc = sequelizeDb.vw_patient_doctor_details;
const vw_encounterDetailsTbl = sequelizeDb.vw_emr_encounter_details;
const vw_latest_encounter = sequelizeDb.vw_latest_encounter;

const emr_constants = require("../config/constants");

const emr_mock_json = require("../config/emr_mock_json");
const utilityService = require("../services/utility.service");


// Query
function getActiveEncounterQuery(pId, dId, deptId, etypeId, fId) {
  let encounterQuery = {
    order: [["uuid", "desc"]],
    where: {
      patient_uuid: pId,
      is_active_encounter: emr_constants.IS_ACTIVE,
      is_active: emr_constants.IS_ACTIVE,
      status: emr_constants.IS_ACTIVE,
      encounter_type_uuid: etypeId,
      facility_uuid: fId
    },
    include: [
      {
        model: encounter_doctors_tbl,
        attributes: ["uuid", "doctor_uuid"],
        where: {
          doctor_uuid: dId,
          department_uuid: deptId,
          is_active: emr_constants.IS_ACTIVE,
          status: emr_constants.IS_ACTIVE,
        },
      },
    ],
  };

  if (etypeId === 1) {
    encounterQuery.where[Op.and] = [
      Sequelize.where(
        Sequelize.fn("date", Sequelize.col("encounter_date")),
        "=",
        utilityService.indiaTz().format("YYYY-MM-DD")
      ),
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
    const { user_uuid, facility_uuid } = req.headers;
    let { patientId, doctorId, from_date, to_date, departmentId, encounterType, } = req.query;

    try {
      const is_mobile_request =
        (doctorId === 0 || doctorId == 0) && (departmentId == 0 || departmentId === 0) &&
        (encounterType == 0 || encounterType === 0);
      if (user_uuid && patientId && is_mobile_request && from_date && to_date) {
        const encounterData = await encounter_tbl.findAll(
          getEncounterQuery(patientId, from_date, to_date)
        );
        return res.status(200).send({
          code: httpStatus.OK,
          message: "Fetched Encounter Successfully",
          responseContents: encounterData,
        });
      } else if (
        user_uuid && patientId && patientId > 0 &&
        doctorId && doctorId > 0 && departmentId && encounterType
      ) {
        encounterType = +(encounterType);
        let encounterData = await encounter_tbl.findAll(
          getActiveEncounterQuery(
            patientId, doctorId, departmentId, encounterType, facility_uuid
          )
        );

        if (encounterData && encounterData.length > 0) {
          encounterData = [encounterData[0]];
        }
        return res.status(200).send({
          code: httpStatus.OK,
          message: "Fetched Encounter Successfully",
          responseContents: encounterData,
        });
      } else {
        return res.status(400).send({
          code: httpStatus[400],
          message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`,
        });
      }
    } catch (ex) {
      console.log(ex);
      return res
        .status(400)
        .send({ code: httpStatus.BAD_REQUEST, message: ex.message });
    }
  };

  const _getEncounterByPatientIdAndVisitdate = async (req, res) => {
    const { user_uuid } = req.headers;
    const { e_patient_uuid, e_encounter_date, is_active_encounter } = req.query;

    try {
      if (
        (user_uuid && e_patient_uuid) ||
        (e_patient_uuid && e_encounter_date)
      ) {
        const encounterData = await vw_encounterDetailsTbl.findAll(
          { attributes: { exclude: ["id", "createdAt", "updatedAt"] } },
          { where: is_active_encounter == 2 }
        );
        return res.status(200).send({
          code: httpStatus.OK,
          message: "Fetched Encounter Successfully",
          responseContents: encounterData,
        });
      } else {
        return res.status(400).send({
          code: httpStatus[400],
          message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`,
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

    const isAllReqFieldsInEncIsPres = enc_att.checkRequiredFieldsInEncounter(encounter);
    const isAllReqFieldsInEncDocIsPres = enc_att.checkRequiredFieldsInEncounterDoc(encounterDoctor);

    if (user_uuid && isAllReqFieldsInEncIsPres && isAllReqFieldsInEncDocIsPres && encounterDoctor) {

      let { encounter_type_uuid, patient_uuid, facility_uuid } = encounter;
      const { doctor_uuid, department_uuid } = encounterDoctor;
      const { tat_start_time, tat_end_time } = encounterDoctor;

      encounter_type_uuid = +(encounter_type_uuid);
      if (tat_start_time && tat_end_time) {
        if (!moment(tat_start_time).isValid() || !moment(tat_end_time).isValid()) {
          return res.status(400)
            .send(getSendResponseObject(httpStatus[400], `${emr_constants.PLEASE_PROVIDE} ${emr_constants.VALID_START_DATE} ${emr_constants.OR} ${emr_constants.VALID_END_DATE}`));
        }
      } else {
        return res.status(400)
          .send(getSendResponseObject(httpStatus[400], `${emr_constants.PLEASE_PROVIDE} ${emr_constants.START_DATE} ${emr_constants.OR} ${emr_constants.END_DATE}`));
      }

      try {

        // Assigning
        encounter = enc_att.assignDefaultValuesToEncounter(encounter, user_uuid);
        encounterDoctor = enc_att.assignDefaultValuesToEncounterDoctor(encounterDoctor, encounter, user_uuid);

        let encounterDoctorData, encounterData, is_enc_avail, is_enc_doc_avail;
        encounterData = await getEncounterQueryByPatientId(patient_uuid, encounter_type_uuid, facility_uuid);
        is_enc_avail = encounterData && encounterData.length > 0;
        if (is_enc_avail) {
          encounterDoctorData = await getEncounterDoctorsQueryByPatientId(encounterData[0].uuid, doctor_uuid, department_uuid);
        }

        is_enc_doc_avail = encounterDoctorData && encounterDoctorData.length > 0;
        if (([1, 2, 3].includes(encounter_type_uuid)) && is_enc_avail && is_enc_doc_avail) {
          return res.status(400).send({
            code: httpStatus.BAD_REQUEST, message: emr_constants.DUPLICATE_ENCOUNTER,
            existingDetails: getExisitingEncounterDetails(),
          });
        }

        if (!is_enc_avail) {

          // closing all previous active encounters patient
          const encounterUpdate = await encounter_tbl.update(
            enc_att.getEncounterUpdateAttributes(user_uuid),
            enc_att.getEncounterUpdateQuery(patient_uuid, facility_uuid, encounter_type_uuid)
          );

          // if (encounter_type_uuid === 1) {

          // }

        }
        const createdEncounter = await encounter_tbl.create(encounter, { returning: true, });
        if (createdEncounter) {

          const encounterId = is_enc_avail && !is_enc_doc_avail ? encounterData[0].uuid : createdEncounter.uuid;
          encounter.uuid = encounterDoctor.encounter_uuid = encounterId;

          // checking for Primary Doctor
          encounterDoctor.is_primary_doctor = !is_enc_avail ? emr_constants.IS_ACTIVE : emr_constants.IS_IN_ACTIVE;

          const createdEncounterDoctorData = await encounter_doctors_tbl.create(
            encounterDoctor, { returning: true }
          );
          encounterDoctor.uuid = createdEncounterDoctorData.uuid;
          return res.status(200)
            .send({ ...getSendResponseObject(httpStatus.OK, emr_constants.ENCOUNTER_SUCCESS), responseContents: { encounter, encounterDoctor } });
        }
      } catch (ex) {
        console.log(ex);
        return res
          .status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
      }
    } else {
      return res.status(400)
        .send(getSendResponseObject(httpStatus[400], `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}`));
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
            responseContentLength: visit_history.length,
          },
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
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`,
      });
    }
  };

  const _deleteEncounterById = async (req, res) => {
    const { user_uuid } = req.headers;
    const { encounterId } = req.query;

    if (user_uuid && encounterId && !isNaN(+encounterId)) {
      let encounterPromise = [];
      try {
        // enDelTransaction = await sequelizeDb.sequelize.transaction();
        encounterPromise = [
          ...encounterPromise,
          encounter_tbl.update(
            { is_active_encounter: emr_constants.IS_IN_ACTIVE, is_active: emr_constants.IS_IN_ACTIVE, status: emr_constants.IS_IN_ACTIVE },
            { where: { uuid: encounterId } }
          ),
          encounter_doctors_tbl.update(
            { encounter_doctor_status: emr_constants.IS_IN_ACTIVE, is_active: emr_constants.IS_IN_ACTIVE, status: emr_constants.IS_IN_ACTIVE },
            { where: { encounter_uuid: encounterId } }
          ),
        ];

        let deleteEnPromise = await Promise.all(encounterPromise);
        deleteEnPromise = [].concat.apply([], deleteEnPromise);

        const responseMessage = isAllDeleted ? emr_constants.UPDATED_ENC_SUCCESS : emr_constants.NO_RECORD_FOUND;
        return res.status(200)
          .send({ code: httpStatus.OK, message: responseMessage });
      } catch (ex) {
        console.log(ex);
        return res.status(400)
          .send({ code: httpStatus.BAD_REQUEST, message: ex.message });
      }
    } else {
      return res.status(400).send({
        code: httpStatus[400],
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`,
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
      modified_date: new Date(),
      is_active_encounter: emr_constants.IS_IN_ACTIVE
    };
    try {
      if (user_uuid && updatedata) {
        const ec_updated = await encounter_tbl.update(ec_updateData, {
          where: {
            facility_uuid: updatedata.facility_uuid,
            uuid: updatedata.encounter_uuid,
            patient_uuid: updatedata.patient_uuid,
            encounter_type_uuid: updatedata.encounter_type_uuid,
          },
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
            modified_date: new Date(),
          },
          {
            where: { uuid: encounterDoctorId },
          }
        );

        const returnMessage =
          updatedEncounter[0] === 1
            ? emr_constants.UPDATED_ENC_DOC_TAT_TIME
            : emr_constants.NO_CONTENT_MESSAGE;
        return res.status(200).send({
          code: httpStatus.OK,
          message: returnMessage,
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
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.PLEASE_PROVIDE} ${emr_constants.END_DATE}`,
      });
    }
  };

  const _getPatientDoc = async (req, res) => {
    const { user_uuid } = req.headers;
    const { patient_uuid, enc_uuid } = req.query;

    try {
      if (user_uuid && patient_uuid) {
        let wher_con = { ed_patient_uuid: patient_uuid };
        if (enc_uuid) {
          wher_con.ed_encounter_uuid = enc_uuid;
        }
        const docList = await vw_patientdoc.findAll({
          attributes: { exclude: ["id", "createdAt", "updatedAt"] },
          where: wher_con,
          //group: ['ed_created_date']
        });
        if (docList) {
          //const getdepdetails = await getdepDetails(user_uuid, docList[0].department_uuid, req.headers.authorization);
          //const getuDetails = await getuserDetails(user_uuid,docList[0].doctor_uuid, req.headers.authorization);
          return res
            .status(httpStatus.OK)
            .json({ statusCode: 200, req: "", responseContents: docList });
        } else {
          return res.status(400).send({
            code: httpStatus[400],
            message: "patient information not found",
          });
        }
      } else {
        return res.status(400).send({
          code: httpStatus[400],
          message: "No Request Body or Search key Found ",
        });
      }
    } catch (ex) {
      const errorMsg = ex.errors ? ex.errors[0].message : ex.message;
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ status: "error", msg: errorMsg });
    }
  };

  const _closeEncounter = async (req, res) => {
    const { user_uuid } = req.headers;
    const { encounterId } = req.query;

    if (user_uuid && emr_utility.isNumberValid(encounterId)) {
      try {
        const updateVal = {
          is_active: emr_constants.IS_IN_ACTIVE,
          modified_by: user_uuid,
          is_active_encounter: emr_constants.IS_IN_ACTIVE,
        };
        const updateEncQuery = {
          where: { uuid: encounterId },
        };
        const updateEncDocQuery = {
          where: { encounter_uuid: encounterId },
        };
        let encPromise = [];
        encPromise = [
          ...encPromise,
          encounter_tbl.update(updateVal, updateEncQuery),
          encounter_doctors_tbl.update(updateVal, updateEncDocQuery),
        ];
        const encounterPromise = await Promise.all(encPromise);
        const responseCode =
          encounterPromise[0][0] === 1 ? httpStatus.OK : httpStatus.NO_CONTENT;
        const responseMessage =
          encounterPromise[0][0] === 1
            ? emr_constants.ENCOUNTER_CLOSED_SUCCESS
            : emr_constants.NO_RECORD_FOUND;
        return res.status(200).send({
          code: responseCode,
          message: responseMessage,
        });
      } catch (ex) {
        console.log("Exception happened", ex);
        return res
          .status(500)
          .send({ code: httpStatus.INTERNAL_SERVER_ERROR, message: ex });
      }
    } else {
      return res.status(400).send({
        code: httpStatus[400],
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}`,
      });
    }
  };

  const _getLatestEncounterByPatientId = async (req, res) => {
    const { user_uuid } = req.headers;
    const { patientId, encounterTypeId } = req.query;

    if (
      emr_utility.isNumberValid(patientId) &&
      emr_utility.isNumberValid(encounterTypeId) &&
      user_uuid
    ) {
      try {
        const latestEncounterRecord = await vw_latest_encounter.findAll({
          attributes: enc_att.getLatestEncounterAttributes(),
          where: enc_att.getLatestEncounterQuery(patientId, encounterTypeId),
          order: [["ed_uuid", "desc"]],
        });

        const {
          responseCode,
          responseMessage,
        } = enc_att.getLatestEncounterResponse(latestEncounterRecord);
        return res.status(200).send({
          code: responseCode,
          message: responseMessage,
          responseContents: enc_att.modifiedLatestEncounterRecord(
            latestEncounterRecord
          )[0],
        });
      } catch (error) {
        console.log(error);

        return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
          code: httpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        });
      }
    } else {
      return res.status(400).send({
        code: httpStatus[400],
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`,
      });
    }
  };

  const _createEncounterBulk = async (req, res) => {
    const { user_uuid } = req.headers;
    const encounters = req.body;

    let encs = [], encDocs = [];
    const isEncs = encounters && Array.isArray(encounters) && encounters.length > 0;
    if (isEncs) {
      encs = encounters.map((e) => e.encounter);
      encDocs = encounters.map((e) => e.encounterDoctor);

      if (encDocs.length !== encs.length) {
        return res.status(400).send({
          code: httpStatus[400], message: 'Please Provide Proper Encounter List'
        });
      }
    }

    const {
      isEncTypeId,
      isEncPatId,
      isEncDeptId,
      isEncDocttId,
      isEncDocDeptId,
    } = enc_att.checkingAllRequiredFields(encs, encDocs);

    if (
      user_uuid &&
      isEncs &&
      isEncTypeId &&
      isEncPatId &&
      isEncDeptId &&
      isEncDocttId &&
      isEncDocDeptId
    ) {
      try {

        encs.forEach((e) => {
          e = emr_utility.createIsActiveAndStatus(e, user_uuid);
          e.is_active_encounter = emr_constants.IS_ACTIVE;
          e.encounter_date = new Date();
        });

        const createdEncounter = await encounter_tbl.bulkCreate(encs, { returning: true });

        encDocs.forEach((e, idx) => {
          e = emr_utility.createIsActiveAndStatus(e, user_uuid);
          e.encounter_uuid = createdEncounter[idx] && createdEncounter[idx].uuid || 0;
          e.patient_uuid = createdEncounter[idx] && createdEncounter[idx].patient_uuid || 0;
        });
        const createdEncounterDoctor = await encounter_doctors_tbl.bulkCreate(encDocs, { returning: true });



        return res.status(200).send({
          code: httpStatus.OK,
          message: "Inserted Encounters Successfully",
          requestedContents: encounters,
          responseContents: createdEncounter.map((cE, idx) => {
            return { encounters: cE, encounterDoctor: createdEncounterDoctor[idx] };
          }),
        });

      } catch (ex) {
        console.log(ex);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
          code: httpStatus.INTERNAL_SERVER_ERROR,
          message: ex.message,
        });
      }
    } else {
      const message = enc_att.createEncounterBulk400Message(isEncs, isEncTypeId, isEncPatId, isEncDeptId,
        isEncDocttId,
        isEncDocDeptId);

      return res.status(400).send({
        code: httpStatus[400],
        message
      });
    }
  };

  const _getEncounterByAdmissionId = async (req, res) => {
    const { user_uuid } = req.headers;

    const { admission_id } = req.query;

    if (user_uuid && emr_utility.isNumberValid(admission_id)) {
      try {
        const encounterData = await encounter_tbl.findAll(enc_att.getEncounterByAdmissionQuery(admission_id));
        return res.status(200).send(
          {
            code: httpStatus.OK,
            message: "Fetched Encounter Successfully",
            responseContents: encounterData,
          });
      } catch (ex) {
        console.log(ex);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
          code: httpStatus.INTERNAL_SERVER_ERROR,
          message: ex.message,
        });
      }
    } else {
      return res.status(400).send({
        code: httpStatus[400],
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`,
      });
    }
  };

  return {
    getEncounterByDocAndPatientId: _getEncounterByDocAndPatientId,
    createPatientEncounter: _createPatientEncounter,
    getVisitHistoryByPatientId: _getVisitHistoryByPatientId,
    deleteEncounterById: _deleteEncounterById,
    updateECdischarge: _updateECdischarge,
    updateTATTimeInEncounterDoctor: _updateTATTimeInEncounterDoctor,
    getPatientDoc: _getPatientDoc,
    closeEncounter: _closeEncounter,
    getEncounterByPatientIdAndVisitdate: _getEncounterByPatientIdAndVisitdate,
    getLatestEncounterByPatientId: _getLatestEncounterByPatientId,
    createEncounterBulk: _createEncounterBulk,
    getEncounterByAdmissionId: _getEncounterByAdmissionId
  };
};

module.exports = Encounter();

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
          ),
        ],
      },
      is_active_encounter: emr_constants.IS_ACTIVE,
      is_active: emr_constants.IS_ACTIVE,
      status: emr_constants.IS_ACTIVE,
    },
    include: [
      {
        model: encounter_type_tbl,
        attributes: ["uuid", "code", "name"],
        where: {
          is_active: emr_constants.IS_ACTIVE,
          status: emr_constants.IS_ACTIVE,
        },
      },
    ],
  };
}

async function getEncounterQueryByPatientId(pId, etypeId, fId) {
  let query = {
    order: [["uuid", "desc"]],
    where: {
      patient_uuid: pId,
      is_active_encounter: emr_constants.IS_ACTIVE,
      is_active: emr_constants.IS_ACTIVE,
      status: emr_constants.IS_ACTIVE,
      encounter_type_uuid: etypeId,
      facility_uuid: fId,
    },
  };
  if (etypeId === 1) {
    query.where[Op.and] = [
      Sequelize.where(
        Sequelize.fn("date", Sequelize.col("encounter_date")),
        ">=",
        moment().format("YYYY-MM-DD")
      ),
      Sequelize.where(
        Sequelize.fn("date", Sequelize.col("encounter_date")),
        "<=",
        moment().format("YYYY-MM-DD")
      ),
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
      encounter_uuid: enId,
    },
  });
}

const getExisitingEncounterDetails = (encounter, encounterDoctor) => {
  return {
    encounter_id: (encounter && encounter[0].uuid) || 0,
    encounter_doctor_id:
      (encounterDoctor && encounterDoctor[0].uuid) || 0,
  };
};

const getSendResponseObject = (code, message) => {
  return {
    code,
    message
  };
};


