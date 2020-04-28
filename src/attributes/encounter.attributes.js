// Http Status Import
const httpStatus = require("http-status");

// Emr Constants
const emr_constants = require("../config/constants");

const _getLatestEncounterAttributes = () => {
  return [
    "ed_patient_uuid",
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
    ? emr_constants.LATEST_RECORD_FETECHED_SUCCESSFULLY
    : emr_constants.NO_RECORD_FOUND;

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
  const isEncTypeId = _isRequiredFieldIsPresent(
    encArray,
    "encounter_type_uuid"
  );

  const isEncPatId = _isRequiredFieldIsPresent(encArray, "patient_uuid");
  const isEncDeptId = _isRequiredFieldIsPresent(encArray, "department_uuid");

  const isEncDocttId = _isRequiredFieldIsPresent(
    encDoctArray,
    "doctor_uuid"
  );

  const isEncDocDeptId = _isRequiredFieldIsPresent(
    encDoctArray,
    "department_uuid"
  );

  return {
    isEncTypeId,
    isEncPatId,
    isEncDeptId,
    isEncDocttId,
    isEncDocDeptId,
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

module.exports = {
  getLatestEncounterAttributes: _getLatestEncounterAttributes,
  getLatestEncounterQuery: _getLatestEncounterQuery,
  getLatestEncounterResponse: _getLatestEncounterResponse,
  modifiedLatestEncounterRecord: _modifiedLatestEncounterRecord,
  isRequiredFieldIsPresent: _isRequiredFieldIsPresent,
  checkingAllRequiredFields: _checkingAllRequiredFields,
  createEncounterBulk400Message: _createEncounterBulk400Message
};
