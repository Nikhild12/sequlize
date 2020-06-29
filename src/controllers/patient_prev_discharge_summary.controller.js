// Package Import
const httpStatus = require('http-status');

// Sequelizer Import
const Sequelize = require('sequelize');
const sequelizeDb = require('../config/sequelize');
const Op = Sequelize.Op;
//  Tables Import
//patient diagnosis
const patient_diagnosisTbl = sequelizeDb.patient_diagnosis;
const diagnosisTbl = sequelizeDb.diagnosis;
const dtypesTbl = sequelizeDb.discharge_type;
const dttypesTbl = sequelizeDb.death_type;

const vw_patient_cheif_complaintsTbl = sequelizeDb.vw_patient_cheif_complaints;

// patient allergy
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


const patient_previous_discharge_summary = () => {

  const _getPreviousDischargeDetails = async (req, res) => {
    /**
   * getting Patient entire info
   * @param {*} req 
   * @param {*} res 
   */
    const { user_uuid } = req.headers;
    const postData = req.body;

    if (postData && user_uuid) {
      try {
        //check patient admitted or not in IP MANAGEMENT
        const { patient_uuid, encounter_uuid, allergy_uuids, chief_complaint_uuids, vital_uuids, diagnosis_uuids } = postData;
        //get patient allergy details
        let patient_allergy_res = [], patient_vitals_res = [], patient_diagnosis_res = [], patient_cheif_complaint_res = [];
        if (allergy_uuids && allergy_uuids.length > 0) {
          patient_allergy_res = await getPatientAllergies(allergy_uuids, patient_uuid, encounter_uuid);
        } else {
          patient_allergy_res = [];
        }
        if ((vital_uuids && vital_uuids.length > 0)) {
          patient_vitals_res = await getPatientVitals(vital_uuids, patient_uuid, encounter_uuid);
        } else {
          patient_vitals_res = [];
        }
        if (chief_complaint_uuids && chief_complaint_uuids.length > 0) {
          patient_cheif_complaint_res = await getPatientChiefComplaints(chief_complaint_uuids, patient_uuid, encounter_uuid);
        } else {
          patient_cheif_complaint_res = [];
        }
        if (diagnosis_uuids && diagnosis_uuids.length > 0) {
          patient_diagnosis_res = await getPatientDiagnosis(diagnosis_uuids, patient_uuid, encounter_uuid);
        } else {
          patient_diagnosis_res = [];
        }

        // const patinet_treatmentKit_res =  await getPatienyTreatmentKit(patient_uuid, doctor_uuid, encounter_uuid);
        // return res.status(200).send({ code: httpStatus.OK, responseContent: { "cheif_complaints": patient_cheif_complaint_res} });

        return res.status(200).send({ code: httpStatus.OK, responseContent: { "allergy": patient_allergy_res, "vitals": patient_vitals_res, "cheif_complaints": patient_cheif_complaint_res, "diagnosis": patient_diagnosis_res } });

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
    getPreviousDischargeDetails: _getPreviousDischargeDetails
  };

};

module.exports = patient_previous_discharge_summary();
// GET PATIENT ALLERGY DETAILS START
async function getPatientAllergies(allergy_uuids, patient_uuid, encounter_uuid) {

  const result = await patient_allergyTbl.findAll({
    attributes: [
      'uuid', 'patient_uuid', 'encounter_uuid',
      'allergy_master_uuid', 'allergy_type_uuid',
      'symptom', 'start_date', 'end_date', 'duration',
      'allergy_severity_uuid', 'allergy_source_uuid',
      'period_uuid', 'performed_date', 'performed_by',
      'patient_allergy_status_uuid'
    ],
    order: [['performed_date', 'DESC']],
    where: {
      uuid: {
        [Op.in]: allergy_uuids
      },
      patient_uuid: patient_uuid,
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
        // where: {
        //   is_active: emr_constants.IS_ACTIVE,
        //   status: emr_constants.IS_ACTIVE
        // },
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
  } else {
    return [];
  }
}

function getAllergyInfo(result) {
  let res = [];
  if (result && result.length > 0) {
    res = result.map((item) => {
      return {
        patient_allergy_uuid: item.uuid,
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
        allergy_duration: item.duration,
        periods_code: item.periods && item.periods != null ? item.periods.code : "",
        periods_name: item.periods && item.periods != null ? item.periods.name : "",

      };
    });
  }
  return res;
}

// GET PATIENT ALLERGY DETAILS END


// GET PATIENT VITALS DETAILS START
async function getPatientVitals(vital_uuids, patient_uuid, encounter_uuid) {
  let getPPV = await vw_patientVitalsTbl.findAll(
    getPatinetVitalQuery(vital_uuids, patient_uuid, encounter_uuid),
    { returning: true }
  );
  if (getPPV) {
    return PPVitalsList(getPPV);
  } else {
    return [];
  }
}
function getPatinetVitalQuery(vital_uuids, patient_uuid, encounter_uuid) {
  // user_uuid == doctor_uuid
  let query = {
    order: [["pv_uuid", "DESC"]],
    attributes: [
      "pv_uuid",
      "pv_encounter_uuid",
      "pv_encounter_type_uuid",
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
      "ut_name",
      "u_first_name",
      "u_middle_name",
      "u_last_name",
      "et_code",
      "et_name",
      "f_uuid",
      "f_name"
    ],
    where: {
      pv_uuid: {
        [Op.in]: vital_uuids
      },
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
        doctor_title: pV.ut_name,
        doctor_firstname: pV.u_first_name,
        doctor_middlename: pV.u_middle_name,
        doctor_lastlename: pV.u_last_name,
        department_name: pV.d_name,
        institution_uuid: pV.f_uuid,
        institution_name: pV.f_name,
        encounter_uuid: pV.pv_encounter_uuid,
        encounter_type_uuid: pV.pv_encounter_type_uuid,
        encounter_type_code: pV.et_code,
        encounter_type_name: pV.et_name,
        patient_facility_uuid: pV.pv_facility_uuid,
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
    // return patient_vitals_list;
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


function getPDCQuery(user_uuid, patient_uuid, department_uuid) {
  // user_uuid == doctor_uuid
  let query = {
    order: [["discharge_date", "DESC"]],
    attributes: [
      'patient_uuid',
      'facility_uuid',
      'department_uuid',
      'encounter_type_uuid',
      'admission_uuid',
      'discharge_type_uuid',
      'discharge_date',


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
function PDCList(getHistoryPatientVitals) {
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
        PV_list: [
          ...PV_list,
          ...getDClist(
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
    return { PPV_list: PPV_list };
  } else {
    return {};
  }
}

function getDClist(fetchedData, p_id, created_date) {
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
        uom_name: pV.um_name
      };
    });
  }
  return pv_list;
}

async function getPatientChiefComplaints(chief_complaint_uuids, patient_uuid, encounter_uuid) {

  let patient_cc_res = await vw_patient_cheif_complaintsTbl.findAll({
    where: {
      pcc_uuid: {
        [Op.in]: chief_complaint_uuids
      },
      pcc_encounter_uuid: encounter_uuid,
      pcc_patient_uuid: patient_uuid,
      pcc_is_active: emr_constants.IS_ACTIVE,
      pcc_status: emr_constants.IS_ACTIVE
    },
    order: [["pcc_uuid", "DESC"]],

  }, { returning: true });
  if (patient_cc_res) {
    let data = await getPatientChiefComplaintsOrganizeData(patient_cc_res);
    return data;
  } else {
    return [];
  }

}

function getPatientChiefComplaintsOrganizeData(patient_cc_res) {
  let cc_result = [], PCC_list = [];

  if (patient_cc_res && patient_cc_res.length > 0) {
    cc_result = patient_cc_res.map((item) => {
      return {
        // patient_cheif_complaint_uuid: item.pcc_uuid,
        created_date: item.pcc_created_date,
        patient_uuid: item.pcc_patient_uuid,
        institution_uuid: item.f_uuid,
        institution: item.f_name,
        department_uuid: item.d_uuid,
        department: item.d_name,
        encounter_uuid: item.pcc_encounter_uuid,
        encounter_type_uuid: item.pcc_encounter_type_uuid,
        encounter_type_code: item.et_code,
        encounter_type_name: item.et_name,
        consultation_uuid: item.pcc_consultation_uuid,
        performed_by_title: item.ut_name,
        performed_by_first_name: item.u_first_name,
        performed_by_middle_name: item.u_middle_name,
        performed_by_last_name: item.u_last_name,
        chief_complaint_details: [...getCheifComplaintList(patient_cc_res, item.pcc_patient_uuid, item.pcc_created_date)]
      };
    });
    let uniq = {};
    PCC_list = cc_result.filter(
      obj => !uniq[obj.created_date] && (uniq[obj.created_date] = true)
    );
  }

  return PCC_list;

}
function getCheifComplaintList(arr, patient_uuid, created_date) {
  let filtered_data = arr.filter((item) => {
    return (
      item.pcc_patient_uuid === patient_uuid &&
      item.pcc_created_date === created_date
    );
  });
  let data = filtered_data.map((item) => {
    return {
      patient_cheif_complaint_uuid: item.pcc_uuid,
      cheif_complaint_uuid: item.pcc_chief_complaint_uuid,
      cheif_complaint_code: item.cc_code,
      cheif_complaint_name: item.cc_name,
      cheif_complaint_desc: item.cc_description,
      cheif_complaint_performed_date: item.pcc_performed_date,

      chief_complaint_duration: item.pcc_chief_complaint_duration,
      chief_complaint_duration_period_uuid: item.pcc_chief_complaint_duration_period_uuid,
      chief_complaint_duration_period_code: item.ccdp_code,
      chief_complaint_duration_period_name: item.ccdp_name,
    };
  });
  return data;
}

async function getPatientDiagnosis(diagnosis_uuids, patient_uuid, encounter_uuid) {
  const diagnosis_res = await patient_diagnosisTbl.findAll({
    where: {
      uuid: {
        [Op.in]: diagnosis_uuids
      },
      patient_uuid: patient_uuid,
      encounter_uuid: encounter_uuid,
      is_active: emr_constants.IS_ACTIVE,
      status: emr_constants.IS_ACTIVE
    },
    order: [['uuid', 'DESC']],
    include: [
      {
        model: diagnosisTbl,
        attributes: ['uuid', 'code', 'name', 'description'],
        where: {
          is_active: emr_constants.IS_ACTIVE,
          status: emr_constants.IS_ACTIVE
        }
      },
      {
        model: encounterTypeTbl,
        as: 'encounter_type',
        required: false,
        attributes: ['uuid', 'code', 'name'],
        where: {
          is_active: emr_constants.IS_ACTIVE,
          status: emr_constants.IS_ACTIVE
        }
      }
    ]
  }, { returning: true });
  if (diagnosis_res) {
    const data = await getGetDiagnosis(diagnosis_res);
    return data;
  } else {
    return [];
  }
}
function getGetDiagnosis(diagnosis_res) {
  let diagnosis_result = [];
  if (diagnosis_res && diagnosis_res.length > 0) {
    diagnosis_result = diagnosis_res.map((item) => {
      return {
        // patient_diagnosis_uuid: item.uuid,
        patient_diagnosis_uuid: item.uuid,
        facility_uuid: item.facility_uuid,
        department_uuid: item.department_uuid,
        patient_uuid: item.patient_uuid,
        encounter_uuid: item.encounter_uuid,
        encounter_type_uuid: (item.encounter_type && item.encounter_type != null) ? item.encounter_type.uuid : "",
        encounter_type_code: (item.encounter_type && item.encounter_type != null) ? item.encounter_type.code : "",
        encounter_type_name: (item.encounter_type && item.encounter_type != null) ? item.encounter_type.name : "",
        diagnosis_uuid: item.diagnosis_uuid,
        performed_by: item.performed_by,
        performed_date: item.performed_date,
        //  diagnosis_uuid: item.diagnosis_uuid,
        //   diagnosis_type: "ICD 10",
        diagnosis_type: item.is_snomed ? "SNOMED" : "ICD 10",
        diagnosis_code: (item.diagnosis && item.diagnosis != null) ? item.diagnosis.code : "",
        diagnosis_name: (item.diagnosis && item.diagnosis != null) ? item.diagnosis.name : "",
        diagnosis_desc: (item.diagnosis && item.diagnosis != null) ? item.diagnosis.description : "",
      };
    });
  }
  return diagnosis_result;
}
