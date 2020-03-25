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
    "d_name"
  ];
};

const _getLatestEncounterQuery = (pId, eTypeId) => {
  return {
    ed_patient_uuid: pId,
    ed_encounter_type_uuid: eTypeId
  };
};

const _getLatestEncounterResponse = records => {
  const isRecords = records.length > 0;
  const responseCode = isRecords ? httpStatus.OK : httpStatus.NO_CONTENT;
  const responseMessage = isRecords
    ? emr_constants.LATEST_RECORD_FETECHED_SUCCESSFULLY
    : emr_constants.NO_RECORD_FOUND;

  return { responseCode, responseMessage };
};

const _modifiedLatestEncounterRecord = records => {
  return records.map(r => {
    return {
        patientId:r.ed_patient_uuid,
        encounterTypeId:r.ed_encounter_type_uuid,
        encounterDoctorId: r.ed_uuid,
        encounterId: r.ed_encounter_uuid,
        createdDate: r.ed_created_date,
        titleName:r.t_name,
        titleId: r.t_uuid,
        doctorFirstName: r.u_first_name.trim(),
        doctorLastName: r.u_last_name.trim(),
        doctorMiddleName: r.u_middle_name.trim(),
        departmentName: r.d_name,
        departmentId: r.ed_department_uuid
    };
  });
};

module.exports = {
  getLatestEncounterAttributes: _getLatestEncounterAttributes,
  getLatestEncounterQuery: _getLatestEncounterQuery,
  getLatestEncounterResponse: _getLatestEncounterResponse,
  modifiedLatestEncounterRecord: _modifiedLatestEncounterRecord
};
