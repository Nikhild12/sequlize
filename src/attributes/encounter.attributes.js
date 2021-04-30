// Http Status Import
const httpStatus = require("http-status");

// Sequelizer Import
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

// EMR Utilities
const emr_utility = require("../services/utility.service");

// Emr Constants
const emr_constants = require("../config/constants");

// Sequelizer Import
const sequelizeDb = require("../config/sequelize");

// Table Import
const encounter_doctors_tbl = sequelizeDb.encounter_doctors;

const _getLatestEncounterAttributes = () => {
  return [
    "ed_patient_uuid",
    "ed_encounter_uuid",
    "ed_encounter_type_uuid", // Encounter Type
    "ed_uuid",
    "ed_doctor_uuid",
    "ed_department_uuid",
    "ed_is_active",
    "ed_status",
    "ed_created_date",
    "t_uuid",
    "t_name",
    "u_uuid",
    "u_first_name",
    "u_middle_name",
    "u_last_name",
    "d_uuid",
    "d_name",
  ];
};

const _getLatestEncounterQuery = (pId, eTypeId) => {
  return {
    ed_patient_uuid: pId,
    ed_encounter_type_uuid: eTypeId,
  };
};

const _getLatestEncounterResponse = (records) => {
  const isRecords = records.length > 0;
  const responseCode = isRecords ? httpStatus.OK : httpStatus.NO_CONTENT;
  const responseMessage = isRecords
    ? emr_constants.LATEST_RECORD_FETECHED_SUCCESSFULLY : emr_constants.NO_RECORD_FOUND;

  return { responseCode, responseMessage };
};

const _modifiedLatestEncounterRecord = (records) => {
  return records.map((r) => {
    return {
      patientId: r.ed_patient_uuid,
      encounterTypeId: r.ed_encounter_type_uuid,
      encounterDoctorId: r.ed_uuid,
      encounterId: r.ed_encounter_uuid,
      createdDate: r.ed_created_date,
      titleName: r.t_name,
      titleId: r.t_uuid,
      doctorFirstName: r.u_first_name,
      doctorLastName: r.u_last_name,
      doctorMiddleName: r.u_middle_name,
      departmentName: r.d_name,
      departmentId: r.ed_department_uuid,
    };
  });
};

/**
 *
 * @param {*} array given array
 * @param {*} field which field to check for required Condition
 */
const _isRequiredFieldIsPresent = (array = [], field) => {
  return array.every(
    (a) => a[field] && typeof a[field] === "number" && a[field] > 0
  );
};

const _checkingAllRequiredFields = (encArray, encDoctArray) => {

  const isEncTypeId = _isRequiredFieldIsPresent(encArray, "encounter_type_uuid");
  const isEncPatId = _isRequiredFieldIsPresent(encArray, "patient_uuid");
  const isEncDeptId = _isRequiredFieldIsPresent(encArray, "department_uuid");
  const isEncDocttId = _isRequiredFieldIsPresent(encDoctArray, "doctor_uuid");
  const isEncDocDeptId = _isRequiredFieldIsPresent(encDoctArray, "department_uuid");

  return {
    isEncTypeId, isEncPatId, isEncDeptId, isEncDocttId, isEncDocDeptId,
  };
};

const _createEncounterBulk400Message = (isEncs, isEncType, isEncPat, isEncDeptId, isEncDocttId, isEncDocDeptId) => {

  let message;
  if (!isEncs) {
    message = "Please Provide Encounter List";
  }
  else if (!isEncType) {
    message = "Please Provide Encounter Type Id in Encounters List";
  } else if (!isEncPat) {
    message = "Please Provide Patient Id in Encounters List";
  } else if (!isEncDeptId) {
    message = "Please Provide Department Id in Encounters List";
  } else if (!isEncDocttId) {
    message = "Please Provide Doctor Id in Encounter Doctors List";
  } else if (!isEncDocDeptId) {
    message = "Please Provide Department Id in Encounter Doctors List";
  }
  return message;
};

const _getEncounterByAdmissionQuery = (admissionId) => {
  return {
    where: {
      admission_uuid: admissionId,
      is_active_encounter: emr_constants.IS_ACTIVE,
      is_active: emr_constants.IS_ACTIVE,
      status: emr_constants.IS_ACTIVE,
    },
    include: [
      {
        model: encounter_doctors_tbl,
        attributes: ["uuid", "doctor_uuid"],
        where: {
          is_active: emr_constants.IS_ACTIVE,
          status: emr_constants.IS_ACTIVE,
        },
      },
    ],
  };
};

const _getEncounterUpdateQuery = (pId, fId, eTId) => {

  let where = {
    patient_uuid: pId
  };

  if (eTId === 2) {
    where["encounter_type_uuid"] = {
      [Op.in]: [1, 2]
    };
  }

  if (eTId === 1) {
    where["encounter_type_uuid"] = eTId;
  }
  return { where };
};

const _getEncounterUpdateAttributes = (uId) => {
  return {
    is_active_encounter: emr_constants.IS_IN_ACTIVE,
    modified_by: uId,
    modified_date: new Date()
  };
};

const _checkRequiredFieldsInEncounter = encounter => {
  return encounter && encounter.encounter_type_uuid && encounter.patient_uuid && encounter.department_uuid;
};

const _checkRequiredFieldsInEncounterDoc = encounterDoctor => {
  return encounterDoctor && encounterDoctor.doctor_uuid && encounterDoctor.department_uuid;
};

const _assignDefaultValuesToEncounter = (encounter, uId) => {
  encounter = emr_utility.createIsActiveAndStatus(encounter, uId);
  encounter.is_active_encounter = emr_constants.IS_ACTIVE;
  encounter.encounter_date = new Date();
  return encounter;
};

const _assignDefaultValuesToEncounterDoctor = (encounterDoctor, { patient_uuid }, uId) => {
  encounterDoctor = emr_utility.createIsActiveAndStatus(encounterDoctor, uId);
  encounterDoctor.patient_uuid = patient_uuid;
  encounterDoctor.consultation_start_date = new Date();
  return encounterDoctor;
};

module.exports = {
  getLatestEncounterAttributes: _getLatestEncounterAttributes,
  getLatestEncounterQuery: _getLatestEncounterQuery,
  getLatestEncounterResponse: _getLatestEncounterResponse,
  modifiedLatestEncounterRecord: _modifiedLatestEncounterRecord,
  isRequiredFieldIsPresent: _isRequiredFieldIsPresent,
  checkingAllRequiredFields: _checkingAllRequiredFields,
  createEncounterBulk400Message: _createEncounterBulk400Message,
  getEncounterByAdmissionQuery: _getEncounterByAdmissionQuery,
  getEncounterUpdateQuery: _getEncounterUpdateQuery,
  getEncounterUpdateAttributes: _getEncounterUpdateAttributes,
  checkRequiredFieldsInEncounter: _checkRequiredFieldsInEncounter,
  checkRequiredFieldsInEncounterDoc: _checkRequiredFieldsInEncounterDoc,
  assignDefaultValuesToEncounter: _assignDefaultValuesToEncounter,
  assignDefaultValuesToEncounterDoctor: _assignDefaultValuesToEncounterDoctor
};
