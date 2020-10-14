// Package Import
const httpStatus = require("http-status");
const moment = require("moment");

var Sequelize = require("sequelize");
var Op = Sequelize.Op;
const sequelizeDb = require("../config/sequelize");

const emrConstants = require("../config/constants");

// blockChain Import
const blockChain = require('../blockChain/vital.master.blockchain');

// Config Import
const emr_config = require('../config/config');

// Initialize EMR Workflow
const emr_patientvitals_Tbl = sequelizeDb.patient_vitals;

// Initialize EMR Views
const vw_patientVitalsTbl = sequelizeDb.vw_patient_vitals;

const emr_mock_json = require("../config/emr_mock_json");
const validate = require("../config/validate");

const utilityService = require("../services/utility.service");
const EMRPatientVitals = () => {
  const _createPatientVital = async (req, res) => {

    let emr_patient_vitals_response;
    const emrPatientVitalReqData = req.body;

    try {
      const { user_uuid } = req.headers;
      if (Object.keys(req.body).length != 0) {
        //validating the keys in req.body
        for (let detail of req.body) {
          let body_details_validation_result = validate.validate(detail, [
            "facility_uuid",
            "department_uuid",
            "patient_uuid",
            "encounter_uuid",
            "encounter_type_uuid",
            "vital_group_uuid", 
            "vital_type_uuid",
            "vital_master_uuid",
            "vital_qualifier_uuid",
            "vital_value_type_uuid",
            "vital_uom_uuid",
            "patient_vital_status_uuid"
          ]);
          if (!body_details_validation_result.status) {
            return res
              .status(400)
              .send({
                code: httpStatus[400],
                message: body_details_validation_result.errors
              });
          }
        }
        if (
          user_uuid &&
          emrPatientVitalReqData &&
          emrPatientVitalReqData.length > 0
        ) {

          if (utilityService.checkTATIsPresent(emrPatientVitalReqData)) {
            if (!utilityService.checkTATIsValid(emrPatientVitalReqData)) {
              return res.status(400).send({
                code: httpStatus[400],
                message: `${emrConstants.PLEASE_PROVIDE} ${emrConstants.VALID_START_DATE} ${emrConstants.OR} ${emrConstants.VALID_END_DATE}`
              });
            }
          } else {
            return res.status(400).send({
              code: httpStatus[400],
              message: `${emrConstants.PLEASE_PROVIDE} ${emrConstants.START_DATE} ${emrConstants.OR} ${emrConstants.END_DATE}`
            });
          }

          emrPatientVitalReqData.forEach(eRD => {
            eRD.performed_date = new Date();
            eRD.doctor_uuid = eRD.modified_by = eRD.created_by = user_uuid;
            eRD.is_active = eRD.status = true;
            eRD.created_date = eRD.modified_date = new Date();
            eRD.revision = 1;
          });
          emr_patient_vitals_response = await emr_patientvitals_Tbl.bulkCreate(
            emrPatientVitalReqData,
            { returning: true }
          );

          emrPatientVitalReqData.forEach((ePV, index) => {
            ePV.uuid = emr_patient_vitals_response[index].uuid;
          });

          if (emr_config.isBlockChain === 'ON' && emr_config.blockChainURL) {
            const patientVitalBlockchain = await blockChain.createVitalMasterBlockChain(emr_patient_vitals_response);
          }
          if (emr_patient_vitals_response) {
            return res.status(200).send({
              code: httpStatus.OK,
              message: emrConstants.PATIENT_VITAILS_CREATED,
              responseContents: emrPatientVitalReqData
            });
          }
        }
      } else {
        return res
          .status(400)
          .send({ code: httpStatus[400], message: "No Request Body Found" });
      }
    } catch (ex) {
      if (emr_patient_vitals_response) {
        return res.status(200).send({
          code: httpStatus.OK,
          message: emrConstants.PATIENT_VITAILS_CREATED,
          responseContents: emrPatientVitalReqData
        });
      } // if any block Chain issue will ignore it
      return res
        .status(400)
        .send({ code: httpStatus.BAD_REQUEST, message: ex.message });
    }
  };
  const _getVitalsByTemplateID = async (req, res) => {
    const { template_id } = req.query;
    const { user_uuid } = req.headers;
    try {
      let getPatientVitals = await emr_patientvitals_Tbl.findAll(
        {
          where: {
            is_active: emrConstants.IS_ACTIVE,
            status: emrConstants.IS_ACTIVE
          }
        },
        { returning: true }
      );

      if (getPatientVitals) {
        return res.status(200).send({
          code: httpStatus.OK,
          message: "Fetched EMR Patient Vital Details  Successfully",
          responseContents: getPatientVitals
        });
      } else {
        return res
          .status(400)
          .send({ code: httpStatus[400], message: "Something went wrong" });
      }
    } catch (ex) {
      return res
        .status(400)
        .send({ code: httpStatus[400], message: ex.message });
    }
  };

  const _getPatientVitals = async (req, res) => {
    try {
      let getPatientVitals = await emr_patientvitals_Tbl.findAll(
        {
          where: {
            is_active: emrConstants.IS_ACTIVE,
            status: emrConstants.IS_ACTIVE
          }
        },
        { returning: true }
      );
      return res.status(200).send({
        code: httpStatus.OK,
        message: "Fetched EMR Patient Vital Details  Successfully",
        responseContents: getPatientVitals
      });
    } catch (ex) {
      return res
        .status(400)
        .send({ code: httpStatus[400], message: ex.message });
    }
  };
  const _getHistoryPatientVitals = async (req, res) => {
    const { user_uuid } = req.headers;
    const {
      patient_uuid,
      department_uuid,
      facility_uuid,
      from_date,
      to_date
    } = req.query;

    try {
      if (
        user_uuid &&
        patient_uuid &&
        department_uuid == 0 &&
        facility_uuid &&
        from_date &&
        to_date
      ) {
        let getPatientVitals = await vw_patientVitalsTbl.findAll(
          getPatientQuery(patient_uuid, facility_uuid, from_date, to_date),
          { returning: true }
        );
        return res.status(200).send({
          code: httpStatus.OK,
          message: "Fetched EMR Patient Vital Details  Successfully",
          responseContents: patientVitalsList(getPatientVitals)
        });
      } else if (user_uuid && patient_uuid && department_uuid > 0) {
        let getHistoryPatientVitals = await vw_patientVitalsTbl.findAll(
          getHistoryPatientVitalQuery(user_uuid, patient_uuid, department_uuid),
          { returning: true }
        );
        return res.status(200).send({
          code: httpStatus.OK,
          message: "Fetched EMR History Patient Vital Details  Successfully",
          responseContents: patientVitalsList(getHistoryPatientVitals)
        });
      } else {
        return res
          .status(400)
          .send({ code: httpStatus[400], message: "No Request Params Found" });
      }
    } catch (ex) {
      return res
        .status(400)
        .send({ code: httpStatus[400], message: ex.message });
    }
  };

  const _getPreviousPatientVitals = async (req, res) => {
    const { user_uuid } = req.headers;
    const { patient_uuid } = req.query;

    try {
      if (user_uuid && patient_uuid > 0) {
        let getPPV = await vw_patientVitalsTbl.findAll(
          getPPVQuery(user_uuid, patient_uuid),
          { returning: true }
        );
        return res.status(200).send({
          code: httpStatus.OK,
          message: "Fetched EMR Previous Patient Vital Details  Successfully",
          responseContents: PPVitalsList(getPPV)
        });
      } else {
        return res
          .status(400)
          .send({ code: httpStatus[400], message: "No Request Params Found" });
      }
    } catch (ex) {
      return res
        .status(400)
        .send({ code: httpStatus[400], message: ex.message });
    }
  };

  const _getPreviousPatientVitals1 = async (req, res) => {
    const { user_uuid } = req.headers;
    const { patient_uuid, department_uuid } = req.query;

    try {
      if (user_uuid && patient_uuid && department_uuid > 0) {
        let getPPV = await vw_patientVitalsTbl.findAll(
          getPPVQuery(user_uuid, patient_uuid, department_uuid),
          { returning: true }
        );
        return res.status(200).send({
          code: httpStatus.OK,
          message: "Fetched EMR Previous Patient Vital Details  Successfully",
          responseContents: PPVitalsList(getPPV)
        });
      } else {
        return res
          .status(400)
          .send({ code: httpStatus[400], message: "No Request Params Found" });
      }
    } catch (ex) {
      return res
        .status(400)
        .send({ code: httpStatus[400], message: ex.message });
    }
  };

  const _getPatientVitalsMock = async (req, res) => {
    const { user_uuid } = req.headers;
    const { patientId, cDate } = req.query;

    if (user_uuid) {
      return res.status(200).send({
        code: 200,
        message: "Records Fetched Successfully",
        response_content: emr_mock_json.patientVitalsJson
      });
    } else {
      return res
        .status(422)
        .send({ code: httpStatus[400], message: "No Request Param Found" });
    }
  };

  return {
    createPatientVital: _createPatientVital,
    getVitalsByTemplateID: _getVitalsByTemplateID,
    getPatientVitals: _getPatientVitals,
    getHistoryPatientVitals: _getHistoryPatientVitals,
    getPreviousPatientVitals: _getPreviousPatientVitals,
    getPatientVitalsMock: _getPatientVitalsMock
  };
};

module.exports = EMRPatientVitals();

function getHistoryPatientVitalQuery(user_uuid, patient_uuid, department_uuid) {
  // user_uuid == doctor_uuid
  let query = {
    order: [["pv_uuid", "DESC"]],
    attributes: [
      "pv_uuid",
      "pv_vital_master_uuid",
      "pv_vital_type_uuid",
      "pv_vital_value_type_uuid",
      "pv_vital_value",
      "pv_doctor_uuid",
      "pv_patient_uuid",
      "pv_performed_date",
      "vm_name",
      "um_code",
      "um_name"
    ],
    limit: 10,
    where: {
      vm_active: emrConstants.IS_ACTIVE,
      vm_status: emrConstants.IS_ACTIVE,
      pv_doctor_uuid: user_uuid,
      pv_patient_uuid: patient_uuid,
      pv_department_uuid: department_uuid
    }
  };
  return query;
}

function getPatientQuery(patient_uuid, facility_uuid, from_date, to_date) {
  // user_uuid == doctor_uuid
  let query = {
    order: [["pv_uuid", "DESC"]],
    attributes: [
      "pv_uuid",
      "pv_facility_uuid",
      "pv_vital_master_uuid",
      "pv_vital_type_uuid",
      "pv_vital_value_type_uuid",
      "pv_vital_value",
      "pv_doctor_uuid",
      "pv_patient_uuid",
      "pv_performed_date",
      "vm_name",
      "um_code",
      "um_name"
    ],

    where: {
      vm_active: emrConstants.IS_ACTIVE,
      vm_status: emrConstants.IS_ACTIVE,
      pv_patient_uuid: patient_uuid,
      pv_facility_uuid: facility_uuid,
      pv_performed_date: {
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn("date", Sequelize.col("pv_performed_date")),
            ">=",
            moment(from_date).format("YYYY-MM-DD")
          ),
          Sequelize.where(
            Sequelize.fn("date", Sequelize.col("pv_performed_date")),
            "<=",
            moment(to_date).format("YYYY-MM-DD")
          )
        ]
      }
    }
  };
  return query;
}

/**
 * returns EMR Patient Vitals
 * in readable format
 */
function patientVitalsList(getHistoryPatientVitals) {
  let patient_vitals_list = [];
  if (getHistoryPatientVitals && getHistoryPatientVitals.length > 0) {
    getHistoryPatientVitals.forEach(pV => {
      patient_vitals_list = [
        ...patient_vitals_list,
        {
          // patient vital values
          patient_vital_uuid: pV.pv_uuid,
          patient_facility_uuid: pV.pv_facility_uuid,
          vital_value: pV.pv_vital_value,
          vital_performed_date: pV.pv_performed_date,
          vital_value_type_uuid: pV.pv_vital_value_type_uuid,
          vital_type_uuid: pV.pv_vital_type_uuid,
          vital_master_uuid: pV.pv_vital_master_uuid,

          //vital master values
          vital_name: pV.vm_name,

          // uom master table values
          uom_code: pV.um_code,
          uom_name: pV.um_name,

          patient_uuid: pV.pv_patient_uuid,
          doctor_uuid: pV.pv_doctor_uuid
        }
      ];
    });
  }
  return patient_vitals_list;
}


function getPPVQuery(user_uuid, patient_uuid) {
  // user_uuid == doctor_uuid
  let query = {
    order: [["pv_performed_date", "DESC"]],
    attributes: [
      "pv_uuid",
      "pv_vital_master_uuid",
      "pv_vital_type_uuid",
      "pv_vital_value_type_uuid",
      "pv_vital_value",
      "pv_doctor_uuid",
      "pv_patient_uuid",
      "pv_performed_date",
      "vm_name",
      "um_code",
      "um_name",
      "pv_created_date",
      "d_name",
      "u_first_name",
      "u_middle_name",
      "u_last_name",
      "ut_name",
      "et_code",
      "et_name",
      "pv_vital_uom_uuid"
    ],
    //limit: 10,
    where: {
      vm_active: emrConstants.IS_ACTIVE,
      vm_status: emrConstants.IS_ACTIVE,
      //  pv_doctor_uuid: user_uuid,
      pv_patient_uuid: patient_uuid,
      //  pv_department_uuid: department_uuid
    }
  };
  return query;
}

function getPPVQuery_change(user_uuid, patient_uuid, department_uuid) {
  // user_uuid == doctor_uuid
  let query = {
    order: [["pv_performed_date", "DESC"]],
    attributes: [
      "pv_uuid",
      "pv_vital_master_uuid",
      "pv_vital_type_uuid",
      "pv_vital_value_type_uuid",
      "pv_vital_value",
      "pv_doctor_uuid",
      "pv_patient_uuid",
      "pv_performed_date",
      "vm_name",
      "um_code",
      "um_name",
      "pv_created_date",
      "d_name",
      "u_first_name",
      "u_middle_name",
      "u_last_name",
      "et_code",
      "et_name",
      "pv_vital_uom_uuid"
    ],
    //limit: 10,
    where: {
      vm_active: emrConstants.IS_ACTIVE,
      vm_status: emrConstants.IS_ACTIVE,
      //  pv_doctor_uuid: user_uuid,
      pv_patient_uuid: patient_uuid,
      pv_department_uuid: department_uuid
    }
  };
  return query;
}

function PPVitalsList(getHistoryPatientVitals) {
  let patient_vitals_list = [],
    PV_list = [];
  if (getHistoryPatientVitals && getHistoryPatientVitals.length > 0) {
    patient_vitals_list = getHistoryPatientVitals.map(pV => {
      return {
        patient_uuid: pV.pv_patient_uuid,
        created_date: pV.pv_created_date,
        created_by_firstname: pV.u_first_name,
        created_by_middlename: pV.u_middle_name,
        created_by_lastlename: pV.u_last_name,
        encounter_type_code: pV.et_code,
        encounter_type_name: pV.et_name,
        salutaion_name: pV.ut_name,
        PV_list: [
          ...PV_list,
          ...getPVlist(
            getHistoryPatientVitals,
            pV.pv_patient_uuid,
            pV.pv_created_date
          )
        ]
      };
    });
    let uniq = {};
    let PPV_list = patient_vitals_list.filter(
      obj => !uniq[obj.created_date] && (uniq[obj.created_date] = true)
    );

    return { PPV_list: PPV_list.slice(0, 5) };
  } else {
    return {};
  }
}

function getPVlist(fetchedData, p_id, created_date) {
  let pv_list = [];
  const filteredData = fetchedData.filter(fD => {
    return (
      fD.dataValues.pv_patient_uuid === p_id &&
      fD.dataValues.pv_created_date === created_date
    );
  });

  if (filteredData && filteredData.length > 0) {
    pv_list = filteredData.map(pV => {

      return {
        // patient vital values
        patient_vital_uuid: pV.pv_uuid,
        patient_facility_uuid: pV.pv_facility_uuid,
        vital_value: pV.pv_vital_value,
        vital_performed_date: pV.pv_performed_date,
        vital_value_type_uuid: pV.pv_vital_value_type_uuid,
        vital_type_uuid: pV.pv_vital_type_uuid,
        vital_master_uuid: pV.pv_vital_master_uuid,

        //vital master values
        vital_name: pV.vm_name,

        // uom master table values
        uom_code: pV.um_code,
        uom_name: pV.um_name,
        uom_uuid: pV.pv_vital_uom_uuid,
        salutaion_name: pV.ut_name
      };
    });
  }


  return pv_list;
}

const PVexists = (PID, vital_master_uuid) => {
  if (PID != undefined) {
    return new Promise((resolve, reject) => {
      let value = emr_patientvitals_Tbl.findAll({
        attributes: [
          "patient_uuid",
          "vital_master_uuid",
          "is_active",
          "status"
        ],
        where: { patient_uuid: PID, vital_master_uuid: vital_master_uuid }
      });
      if (value) {
        resolve(value);
        return value;
      } else {
        reject({ message: "PV does not existed" });
      }
    });
  }
};
