// Package Import
const httpStatus = require('http-status');

// Sequelizer Import
const Sequelize = require('sequelize');
const sequelizeDb = require('../config/sequelize');

//  Tables Import

const patient_allergyTbl = sequelizeDb.patient_allergies;

//Encounter Tables Import
const encounterTbl = sequelizeDb.encounter;
const encounterTypeTbl = sequelizeDb.encounter_type;
// Allergy Tables Import
const allergyMasterTbl = sequelizeDb.allergy_masters;
const allergySourceTbl = sequelizeDb.allergy_source;
const allergySeverityTbl = sequelizeDb.allergy_severity;
const allergyTypeTbl = sequelizeDb.allergy_type;
const periodsTbl = sequelizeDb.periods;

// Patient Vitals View Import

const vw_patientVitalsTbl = sequelizeDb.vw_patient_vitals;

// EMR Constants Import
const emr_constants = require('../config/constants');


const patient_discharge_summary = () => {

  const _getDischargeDetails = async (req, res) => {
    /**
   * getting Patient entire info
   * @param {*} req 
   * @param {*} res 
   */
    const { user_uuid } = req.headers;
    const { patient_uuid, doctor_uuid, encounter_uuid } = req.query;

    if (patient_uuid  && encounter_uuid && user_uuid) {
      try {
        //check patient admitted or not in IP MANAGEMENT

        //get patient allergy details
        const patient_allergy_res = await getPatientAllergies(patient_uuid, doctor_uuid, encounter_uuid);
        const patient_vitals_res = await getPatientVitals(patient_uuid, doctor_uuid, encounter_uuid);
    
        return res.status(200).send({ code: httpStatus.OK, responseContent: { "allergy": patient_allergy_res, "vitals": patient_vitals_res} });

      }
      catch (ex) {
        return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
      }
    }
    else {
      return res.status(400).send({ code: httpStatus.UNAUTHORIZED, message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}` });
    }
  };
  return {
    getDischargeDetails: _getDischargeDetails
  };
};

module.exports = patient_discharge_summary();
// GET PATIENT ALLERGY DETAILS START
async function getPatientAllergies(patient_uuid, doctor_uuid, encounter_uuid) {

  // try {
  const result = await patient_allergyTbl.findAll({
    attributes: [
      'uuid', 'patient_uuid', 'encounter_uuid',
      'allergy_master_uuid', 'allergy_type_uuid',
      'symptom', 'start_date', 'end_date',
      'allergy_severity_uuid', 'allergy_source_uuid',
      'period_uuid', 'performed_date', 'performed_by',
      'patient_allergy_status_uuid'
    ],
    where: {
      patient_uuid: patient_uuid,
      // doctor_uuid:doctor_uuid, 
      // performed_date:moment(performed_date).format("YYYY-MM-DD"),
      encounter_uuid: encounter_uuid,
      is_active: emr_constants.IS_ACTIVE,
      status: emr_constants.IS_ACTIVE
    },
    include: [
      {
        model: encounterTbl,
        as: 'encounter',
        attributes: ["encounter_type_uuid"],
        required: false,
        where: {
          is_active: emr_constants.IS_ACTIVE,
          status: emr_constants.IS_ACTIVE
        },
        include: [
          {
            model: encounterTypeTbl,
            required: false,
            attributes: ['uuid', 'name', 'code'],
            where: {
              is_active: emr_constants.IS_ACTIVE,
              status: emr_constants.IS_ACTIVE
            },
          }
        ]
      },
      {
        model: allergyMasterTbl,
        as: 'allergy_masters',
        attributes: ['uuid', 'allergey_code', 'allergy_name'],
        required: false,
        where: {
          is_active: emr_constants.IS_ACTIVE,
          status: emr_constants.IS_ACTIVE
        }
      },
      {
        model: allergySeverityTbl,
        as: 'allergy_severity',
        attributes: ['uuid', 'code', 'name'],
        required: false,
        where: {
          is_active: emr_constants.IS_ACTIVE,
          status: emr_constants.IS_ACTIVE
        }
      },
      {
        model: allergySourceTbl,
        attributes: ['uuid', 'code', 'name'],
        required: false,
        where: {
          is_active: emr_constants.IS_ACTIVE,
          status: emr_constants.IS_ACTIVE
        }
      },
      {
        model: allergyTypeTbl,
        as: 'allergy_type',
        attributes: ['uuid', 'code', 'name'],
        required: false,
        where: {
          is_active: emr_constants.IS_ACTIVE,
          status: emr_constants.IS_ACTIVE
        }
      },
      {
        model: periodsTbl,
        as: 'periods',
        attributes: ['uuid', 'code', 'name'],
        required: false,
        where: {
          is_active: emr_constants.IS_ACTIVE,
          status: emr_constants.IS_ACTIVE
        }
      },
    ]
  }, { returning: true });
  if (result) {
    let allergyInfo = getAllergyInfo(result);
    return allergyInfo;
  }
  // }
  // catch (ex) {
  //     console.log('ex----', ex);
  //     return [];
  // }
}

function getAllergyInfo(result) {
  let res = [];
  if (result && result.length > 0) {
    res = result.map((item) => {
      return {
        uuid: item.uuid,
        patient_uuid: item.patient_uuid,
        symptom: item.symptom,
        date: item.performed_date,
        encounter_type_uuid: item.encounter && item.encounter != null ? item.encounter.encounter_type_uuid : "",
        encounter_type_name: item.encounter && item.encounter != null ? item.encounter.encounter_type.name : "",
        encounter_type_code: item.encounter && item.encounter != null ? item.encounter.encounter_type.code : "",


        allergy_uuid: item.allergy_master_uuid,
        allergy_code: item.allergy_masters && item.allergy_masters != null ? item.allergy_masters.allergy_code : "",
        allergy_name: item.allergy_masters && item.allergy_masters != null ? item.allergy_masters.allergy_name : "",

        allergy_severity_uuid: item.allergy_severity_uuid,
        allergy_severity_name: item.allergy_severity && item.allergy_severity != null ? item.allergy_severity.name : "",
        allergy_severity_code: item.allergy_severity && item.allergy_severity != null ? item.allergy_severity.code : "",

        allergy_source_uuid: item.allergy_source_uuid,
        allergy_source_code: item.allergy_source && item.allergy_source != null ? item.allergy_source.code : "",
        allergy_source_name: item.allergy_source && item.allergy_source != null ? item.allergy_source.name : "",

        allergy_type_uuid: item.allergy_type_uuid,
        allergy_type_code: item.allergy_type && item.allergy_type != null ? item.allergy_type.code : "",
        allergy_type_name: item.allergy_type && item.allergy_type != null ? item.allergy_type.name : "",

        periods_code: item.periods && item.periods != null ? item.periods.code : "",
        periods_name: item.periods && item.periods != null ? item.periods.name : "",

      };
    });
  }
  return res;
}

// GET PATIENT ALLERGY DETAILS END


// GET PATIENT VITALS DETAILS START
async function getPatientVitals(patient_uuid, doctor_uuid, encounter_uuid) {
  let getPPV = await vw_patientVitalsTbl.findAll(
    getPatinetVitalQuery(patient_uuid, doctor_uuid, encounter_uuid),
    { returning: true }
  );
  return PPVitalsList(getPPV);
}
function getPatinetVitalQuery(patient_uuid, doctor_uuid, encounter_uuid) {
  // user_uuid == doctor_uuid
  let query = {
    order: [["pv_performed_date", "DESC"]],
    attributes: [
      "pv_uuid",
      "pv_encounter_uuid",
      "pv_vital_master_uuid",
      "pv_vital_type_uuid",
      "pv_vital_value_type_uuid",
      "pv_vital_value",
      "pv_doctor_uuid",
      "pv_patient_uuid",
      "pv_performed_date",
      "d_name",
      "pv_doctor_uuid",
      "vm_name",
      "um_code",
      "um_name",
      "pv_created_date",
      "d_name",
      "u_first_name",
      "u_middle_name",
      "u_last_name",
      "et_code",
      "et_name"
    ],
    where: {
      vm_active: emr_constants.IS_ACTIVE,
      vm_status: emr_constants.IS_ACTIVE,
      pv_encounter_uuid: encounter_uuid,
      //pv_doctor_uuid: doctor_uuid,
      pv_patient_uuid: patient_uuid,
    }
  };
  return query;
}

function PPVitalsList(getPatientVitals) {
  let patient_vitals_list = [],
    PV_list = [];
  if (getPatientVitals && getPatientVitals.length > 0) {
    patient_vitals_list = getPatientVitals.map(pV => {
      return {
        patient_uuid: pV.pv_patient_uuid,
        created_date: pV.pv_created_date,
        doctor_uuid: pV.pv_doctor_uuid,
        doctor_firstname: pV.u_first_name,
        doctor_middlename: pV.u_middle_name,
        doctor_lastlename: pV.u_last_name,
        department_name: pV.d_name,
        encounter_type_code: pV.et_code,
        encounter_type_name: pV.et_name,
        PV_list: [
          ...PV_list,
          ...getPVlist(
            getPatientVitals,
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
    return PPV_list;
  } else {
    return [];
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
        vital_master_uuid: pV.pv_vital_master_uuid,
        vital_value: pV.pv_vital_value,
        vital_performed_date: pV.pv_performed_date,
        vital_value_type_uuid: pV.pv_vital_value_type_uuid,
        vital_type_uuid: pV.pv_vital_type_uuid,

        //vital master values
        vital_name: pV.vm_name,

        // uom master table values
        uom_code: pV.um_code,
        uom_name: pV.um_name
      };
    });
  }
  return pv_list;
}
// GET PATIENT VITALS DETAILS END



