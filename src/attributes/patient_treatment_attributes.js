// Config Import
const config = require("../config/config");

// Utility Service
const utilityService = require("../services/utility.service");

const _isPrescriptionAvailable = ({ header, details }) => {
  return header && Array.isArray(details) && details.length > 0;
};

const _isDiagnosisAvailable = diagnosis => {
  return Array.isArray(diagnosis) && diagnosis.length > 0;
};

const _checkPatientTreatmentBody = req => {
  const { patientDiagnosis, patientPrescription } = req.body;
  //   const { patientLab, patientRadiology, patientInvestigation } = req.body;
  console.log("Diagnosis Available", _isDiagnosisAvailable(patientDiagnosis));
  console.log("Pres Available", _isPrescriptionAvailable(patientPrescription));
  return (
    _isDiagnosisAvailable(patientDiagnosis) ||
    _isPrescriptionAvailable(patientPrescription)
  );
};

const _createPrescriptionHelper = async (
  { facility_uuid, user_uuid },
  { header, details }
) => {
  return await utilityService.postRequest(
    config.addAllPrescriptionDetails,
    {
      "content-type": "application/json",
      facility_uuid: facility_uuid | 1,
      user_uuid: user_uuid,
      authorization: `Bearer 36f22181-4a14-37b5-a0b9-d2c7c9721a5c`
    },
    {
      header: header,
      details: details
    }
  );
};

const _isLabAvailable = ({ header, details }) => {
  return header && Array.isArray(details) && details.length > 0;
};

const _createLabHelper = async (
  { facility_uuid, user_uuid },
  { header, details }
) => {
  return await utilityService.postRequest(
    config.addAllLabDetails,
    {
      "content-type": "application/json",
      facility_uuid: facility_uuid | 1,
      user_uuid: user_uuid,
      authorization: `Bearer 36f22181-4a14-37b5-a0b9-d2c7c9721a5c`
    },
    {
      header: header,
      details: details
    }
  );
};

const _deleteLabHelper = async id => {
  return await utilityService.postRequest(
    config.deleteLabDetails,
    {
      "content-type": "application/json",
      facility_uuid: facility_uuid | 1,
      user_uuid: user_uuid,
      authorization: `Bearer 36f22181-4a14-37b5-a0b9-d2c7c9721a5c`
    },
    {
      id
    }
  );
};

module.exports = {
  isPrescriptionAvailable: _isPrescriptionAvailable,
  isLabAvailable: _isLabAvailable,
  // isRadiologyAvailable: _isRadiologyAvailable,
  // isInvestigationAvailable: _isInvestigationAvailable,
  isDiagnosisAvailable: _isDiagnosisAvailable,
  checkPatientTreatmentBody: _checkPatientTreatmentBody,
  createPrescriptionHelper: _createPrescriptionHelper,
  createLabHelper: _createLabHelper,
  deleteLabHelper: _deleteLabHelper
};
