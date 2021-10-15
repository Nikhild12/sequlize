// Package Import
const httpStatus = require("http-status");
const moment = require("moment");

// Sequelizer Import
const sequelizeDb = require("../config/sequelize");

// Config Import
const emr_config = require('../config/config');

var Sequelize = require("sequelize");
var Op = Sequelize.Op;

const emr_utility = require("../services/utility.service");

const emr_mock_json = require("../config/emr_mock_json");

const patientAttributes = require("../attributes/patient_chief_complaints.attribute");

const chiefComplaintBlockChain = require('../blockChain/chief.complaint.master.blockchain');
// Initialize EMR Workflow
const patient_chief_complaints_tbl = sequelizeDb.patient_chief_complaints;
const chief_complaints_tbl = sequelizeDb.chief_complaints;
const chief_complaints_duration_tbl =
  sequelizeDb.chief_complaint_duration_periods;
const encounter_tbl = sequelizeDb.encounter;
const patient_chief_complaints_section_tbl = sequelizeDb.patient_chief_complaint_sections;
const patient_chief_complaints_section_value_tbl = sequelizeDb.patient_chief_complaint_section_values

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
    const { facility_uuid } = req.headers;
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
          cD.performed_date = new Date();
          cD.performed_by = user_uuid;
          cD.facility_uuid = facility_uuid || 0;
        });
        const addData = chiefComplaintsData.filter((i) => i && !i.uuid);
        const updateData = chiefComplaintsData.filter((i) => i && i.uuid);

        // To avoid Chief Complaints duplication for the patient - Added by Elumalai -- Start 
        if (addData && addData.length > 0) {
          let chiefId = addData.map(objc => {
            return objc.chief_complaint_uuid;
          });
          const duplicateChief = await patient_chief_complaints_tbl.findAll({
            attributes: ['uuid', 'chief_complaint_uuid', 'encounter_type_uuid', 'encounter_uuid', 'patient_uuid'],
            include: [{
              model: chief_complaints_tbl,
              attributes: ['uuid', 'code', 'name'],
              required: false
            }],
            where: {
              chief_complaint_uuid: {
                [Op.in]: chiefId
              },
              encounter_type_uuid: addData[0].encounter_type_uuid,
              encounter_uuid: addData[0].encounter_uuid,
              patient_uuid: addData[0].patient_uuid,
              is_active: 1, status: 1
            },
            group: ['chief_complaint_uuid']
          });

          if (duplicateChief && duplicateChief.length > 0) {
            const chiefName = addData.reduce((acc, curr) => {
              const index = duplicateChief.findIndex(item => item.chief_complaint_uuid == curr.chief_complaint_uuid);
              if (index > -1 && duplicateChief[index].chief_complaint) {
                acc.push(duplicateChief[index].chief_complaint.name);
              }
              return acc;
            }, []);

            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
              status: 'error',
              statusCode: httpStatus.UNPROCESSABLE_ENTITY,
              msg: chiefName && chiefName.length > 0 ? 'Already Exists ' + chiefName.join(',') : 'No data found',
              responseContents: duplicateChief
            });
          }
        }
        // To avoid Chief Complaints duplication for the patient - Added by Elumalai -- End 

        const chiefComplaintsCreatedData = await patient_chief_complaints_tbl.bulkCreate(
          addData,
          { returning: true }
        );
        if (updateData && updateData.length) {
          const singleData = updateData[0];
          await patient_chief_complaints_tbl.update({
            chief_complaint_uuid: singleData.chief_complaint_uuid,
            chief_complaint_duration_period_uuid: singleData.chief_complaint_duration_period_uuid,
            chief_complaint_duration: singleData.chief_complaint_duration,
          }, {
            where: {
              uuid: singleData.uuid
            }
          });
        }
        // if (chiefComplaintsCreatedData && chiefComplaintsCreatedData.length > 0) {
        //   const duplicate_msg =
        //     chiefComplaintsCreatedData[0].is_active[0] === 1
        //       ? duplicate_active_msg
        //       : duplicate_in_active_msg;
        //   return res
        //     .status(400)
        //     .send({ code: "DUPLICATE_RECORD", message: duplicate_msg });
        // }
        if (chiefComplaintsCreatedData) {
          if (emr_config.isBlockChain === 'ON' && emr_config.blockChainURL) {
            chiefComplaintBlockChain.createChiefComplaintMasterBlockChain(chiefComplaintsCreatedData);
          }
          return res.status(200).send({
            code: httpStatus.OK,
            message: "Inserted Patient Chief Complaints Successfully",
            responseContents: attachUUIDTOCreatedData(
              addData,
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

  const _getPreviousChiefComplaintsByPatientId = async (req, res) => {
    // Plucking the data from Req
    const { user_uuid } = req.headers;
    const { encounterTypeId, patientId, limit } = req.query;

    // Checking whether the Query Values
    // are valid i.e. all are number
    const isQueryParamsValid = emr_utility.isAllNumber(
      encounterTypeId,
      patientId,
      limit
    );

    if (user_uuid && isQueryParamsValid) {
      try {
        const patPrevData = await patient_chief_complaints_tbl.findAll(
          patientAttributes.getPreviousPatCCQuery(
            encounterTypeId,
            patientId,
            limit
          )
        );
        const {
          responseCode,
          responseMessage
        } = patientAttributes.getResponseCodeAndMessage(patPrevData);
        return res.status(200).send({
          code: responseCode,
          message: responseMessage,
          responseContents: patientAttributes.getPreviousPatCCModifiedResponse(
            patPrevData
          )
        });
      } catch (ex) {
        console.log(ex);
        return res.status(500).send({
          code: httpStatus.INTERNAL_SERVER_ERROR,
          message: ex.message
        });
      }
    } else {
      return res.status(400).send({
        code: httpStatus[400],
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`
      });
    }
  };

  //H30-44040 patient chief complaints, chief complaints section and section value insert api is done by vignesh k
  const _create_chief_complaints_section_and_section_values = async (req, res) => {

    const { user_uuid } = req.headers;
    const chiefComplaintsSectionValuesData = req.body;

    if (user_uuid > 0 && chiefComplaintsSectionValuesData) {
      try {

        let patientChiefComplaintsArr = [];
        for (let i = 0; i < chiefComplaintsSectionValuesData.length; i++) {
          const patientChiefComplaints_obj = {
            facility_uuid: chiefComplaintsSectionValuesData[i].facility_uuid,
            department_uuid: chiefComplaintsSectionValuesData[i].department_uuid,
            patient_uuid: chiefComplaintsSectionValuesData[i].patient_uuid,
            encounter_uuid: chiefComplaintsSectionValuesData[i].encounter_uuid,
            encounter_doctor_uuid: chiefComplaintsSectionValuesData[i].encounter_doctor_uuid,
            treatment_kit_uuid: chiefComplaintsSectionValuesData[i].treatment_kit_uuid,
            patient_treatment_uuid: chiefComplaintsSectionValuesData[i].patient_treatment_uuid,
            encounter_type_uuid: chiefComplaintsSectionValuesData[i].encounter_type_uuid,
            consultation_uuid: chiefComplaintsSectionValuesData[i].consultation_uuid,
            chief_complaint_uuid: chiefComplaintsSectionValuesData[i].chief_complaint_uuid,
            chief_complaint_duration: chiefComplaintsSectionValuesData[i].chief_complaint_duration,
            chief_complaint_duration_period_uuid: chiefComplaintsSectionValuesData[i].chief_complaint_duration_period_uuid,
            start_date: chiefComplaintsSectionValuesData[i].start_date,
            end_date: chiefComplaintsSectionValuesData[i].end_date,
            performed_date: chiefComplaintsSectionValuesData[i].performed_date,
            performed_by: user_uuid,
            comments: chiefComplaintsSectionValuesData[i].comments,
            status: 1,
            is_active: 1,
            created_by: user_uuid,
            modified_by: user_uuid,
            created_date: new Date(),
            modified_date: new Date(),
            revision: 1
          }
          patientChiefComplaintsArr.push(patientChiefComplaints_obj);
        }

        const patientChiefComplaintCreatedData = await patient_chief_complaints_tbl.bulkCreate(
          patientChiefComplaintsArr,
          { returning: true }
        );


        let patientChiefComplaintsSectionArr = [];
        let patientChiefComplaintsSectionValuesArr = [];
        for (let i = 0; i < chiefComplaintsSectionValuesData.length; i++) {
          for (let j = 0; j < patientChiefComplaintCreatedData.length; j++) {
            if (
              chiefComplaintsSectionValuesData[i].facility_uuid == patientChiefComplaintCreatedData[j].facility_uuid &&
              chiefComplaintsSectionValuesData[i].department_uuid == patientChiefComplaintCreatedData[j].department_uuid &&
              chiefComplaintsSectionValuesData[i].patient_uuid == patientChiefComplaintCreatedData[j].patient_uuid &&
              chiefComplaintsSectionValuesData[i].encounter_uuid == patientChiefComplaintCreatedData[j].encounter_uuid &&
              chiefComplaintsSectionValuesData[i].encounter_type_uuid == patientChiefComplaintCreatedData[j].encounter_type_uuid &&
              chiefComplaintsSectionValuesData[i].chief_complaint_uuid == patientChiefComplaintCreatedData[j].chief_complaint_uuid) {
              const p_cc_sections = chiefComplaintsSectionValuesData[i].patient_chief_complaint_sections;
              for (let k = 0; k < p_cc_sections.length; k++) {
                patientChiefComplaintsSectionValuesArr.push(p_cc_sections[k]);
                const cc_sectionObj = {
                  patient_chief_complaint_uuid: patientChiefComplaintCreatedData[j].uuid,
                  chief_complaint_section_uuid: p_cc_sections[k].chief_complaint_section_uuid,
                  chief_complaint_section_name: p_cc_sections[k].chief_complaint_section_name,
                  value_type_uuid: p_cc_sections[k].value_type_uuid,
                  value_type_name: p_cc_sections[k].value_type_name,
                  comments: p_cc_sections[k].comments,
                  status: 1,
                  is_active: 1,
                  created_by: user_uuid,
                  modified_by: user_uuid,
                  created_date: new Date(),
                  modified_date: new Date(),
                  revision: 1
                }
                patientChiefComplaintsSectionArr.push(cc_sectionObj);
              }
            }
          }
        }

        const patientChiefComplaintSectionCreatedData = await patient_chief_complaints_section_tbl.bulkCreate(
          patientChiefComplaintsSectionArr,
          { returning: true }
        );


        let patientChiefComplaintSectionValuesArr_final = [];
        for (let i = 0; i < patientChiefComplaintSectionCreatedData.length; i++) {
          for (let j = 0; j < patientChiefComplaintsSectionValuesArr.length; j++) {
            if (
              patientChiefComplaintSectionCreatedData[i].chief_complaint_section_uuid == patientChiefComplaintsSectionValuesArr[j].chief_complaint_section_uuid &&
              patientChiefComplaintSectionCreatedData[i].chief_complaint_section_name == patientChiefComplaintsSectionValuesArr[j].chief_complaint_section_name &&
              patientChiefComplaintSectionCreatedData[i].value_type_uuid == patientChiefComplaintsSectionValuesArr[j].value_type_uuid
            ) {
              let cc_section_values = patientChiefComplaintsSectionValuesArr[j].patient_chief_complaint_section_values;
              for (let k = 0; k < cc_section_values.length; k++) {
                const ccSectionValuesObj = {
                  patient_chief_complaint_section_uuid: patientChiefComplaintSectionCreatedData[i].uuid,
                  chief_complaint_section_value_uuid: cc_section_values[k].chief_complaint_section_value_uuid,
                  chief_complaint_section_value_name: cc_section_values[k].chief_complaint_section_value_name,
                  status: 1,
                  is_active: 1,
                  created_by: user_uuid,
                  modified_by: user_uuid,
                  created_date: new Date(),
                  modified_date: new Date(),
                  revision: 1
                }
                patientChiefComplaintSectionValuesArr_final.push(ccSectionValuesObj);
              }
            }
          }
        }

        const patientChiefComplaintSectionValueCreatedData = await patient_chief_complaints_section_value_tbl.bulkCreate(
          patientChiefComplaintSectionValuesArr_final,
          { returning: true }
        );

        if (patientChiefComplaintCreatedData &&
          patientChiefComplaintSectionCreatedData &&
          patientChiefComplaintSectionValueCreatedData) {
          return res.status(200).send({
            statusCode: 200,
            message: "Patient chief complaints, Patient chief complaints sections and Patient chief complaints section values inserted successfully",
            responseContents: {
              patientChiefComplaintCreatedData: patientChiefComplaintCreatedData,
              patientChiefComplaintSectionCreatedData: patientChiefComplaintSectionCreatedData,
              patientChiefComplaintSectionValueCreatedData: patientChiefComplaintSectionValueCreatedData
            }
          });
        }

      } catch (ex) {
        console.log(ex.message);
        return res.status(400).send({ statusCode: 400, message: ex.message });
      }
    } else {
      return res
        .status(400)
        .send({ code: httpStatus[400], message: "No Request Body Found" });
    }
  }


  return {
    createChiefComplaints: _createChiefComplaints,
    getPatientChiefComplaints: _getPatientChiefComplaints,
    getMobileMockAPI: _getMobileMockAPI,
    getPreviousChiefComplaintsByPatientId: _getPreviousChiefComplaintsByPatientId,
    create_chief_complaints_section_and_section_values: _create_chief_complaints_section_and_section_values
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
