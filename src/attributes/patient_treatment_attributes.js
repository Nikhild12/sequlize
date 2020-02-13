// Config Import
const config = require("../config/config");
const request = require('request');
// Utility Service
const utilityService = require("../services/utility.service");



const _isDiagnosisAvailable = diagnosis => {
  return Array.isArray(diagnosis) && diagnosis.length > 0;
};
const _isLabAvailable = ({ header, details } = {}) => {
  if (header == undefined || details == undefined) {
    return false
  }

  return header && Array.isArray(details) && details.length > 0;
};
const _isPrescriptionAvailable = ({ header, details } = {}) => {
  if (header == undefined || details == undefined) {
    return false
  }

  return header && Array.isArray(details) && details.length > 0;
};

const _isInvistigationAvailable = ({ header, details } = {}) => {
  if (header == undefined || details == undefined) {
    return false
  }

  return header && Array.isArray(details) && details.length > 0;
};

const _isRadiologyAvailable = ({ header, details } = {}) => {
  if (header == undefined || details == undefined) {
    return false
  }

  return header && Array.isArray(details) && details.length > 0;
};

const _checkPatientTreatmentBody = req => {
  const { patientDiagnosis, patientPrescription } = req.body;
  const { patientLab, patientRadiology, patientInvestigation } = req.body;
  console.log("Diagnosis Available", _isDiagnosisAvailable(patientDiagnosis));
  console.log("RadialogyAvailable", _isRadiologyAvailable(patientRadiology));
  console.log("Lab Available", _isLabAvailable(patientLab));
  console.log("Pres Available", _isPrescriptionAvailable(patientPrescription));
  console.log("InvestigationAvailable", _isInvistigationAvailable(patientInvestigation));
  return (

    _isDiagnosisAvailable(patientDiagnosis) ||
    _isRadiologyAvailable(patientRadiology) ||
    _isLabAvailable(patientLab) ||
    _isPrescriptionAvailable(patientPrescription) ||
    _isInvistigationAvailable(patientInvestigation)
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
      facility_uuid: facility_uuid || 1,
      user_uuid: user_uuid,
      authorization: `Bearer 36f22181-4a14-37b5-a0b9-d2c7c9721a5c`
    },
    {
      header: header,
      details: details
    }
  );
};


const _createLabHelper = async (
  { facility_uuid, user_uuid },
  { header, details }
) => {
  return await utilityService.postRequest(
    config.addAllLabDetails,
    {
      "content-type": "application/json",
      facility_uuid: facility_uuid || 1,
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
      facility_uuid: facility_uuid || 1,
      user_uuid: user_uuid,
      authorization: `Bearer 36f22181-4a14-37b5-a0b9-d2c7c9721a5c`
    },
    {
      id
    }
  );
};
const _deletePrescription = async ({ user_uuid, facility_uuid }, id) => {
  return await utilityService.putRequest(
    config.deletePrescriptionDetails,
    {
      "content-type": "application/json",
      facility_uuid: facility_uuid || 1,

      user_uuid: user_uuid,
      authorization: `Bearer 36f22181-4a14-37b5-a0b9-d2c7c9721a5c`
    },
    {
      id
    }
  );
};

const _createInvestgationHelper = async ({ facility_uuid, user_uuid }, { header, details }) => {
  return await utilityService.postRequest(
    config.addALLInvestDetails,
    {
      "content-type": "application/json",
      facility_uuid: facility_uuid ? facility_uuid : 1,
      user_uuid: user_uuid,
      authorization: `Bearer 36f22181-4a14-37b5-a0b9-d2c7c9721a5c`
    },
    {
      header: header,
      details: details
    }
  );
};

const _deleteInvestigationHelper = async ({ facility_uuid, user_uuid }, id) => {
  return await utilityService.postRequest(
    config.deleteInvestDetails,
    {
      "content-type": "application/json",
      facility_uuid: facility_uuid ? facility_uuid : 1,
      user_uuid: user_uuid,
      authorization: `Bearer 36f22181-4a14-37b5-a0b9-d2c7c9721a5c`
    },
    {
      id
    }
  );
};

const _createRadialogyHelper = async ({ facility_uuid, user_uuid }, { header, details }) => {

  return await utilityService.postRequest(
    config.addAllRadialogyDetails,
    {
      "content-type": "application/json",
      facility_uuid: facility_uuid ? facility_uuid : 1,
      user_uuid: user_uuid,
      authorization: `Bearer 36f22181-4a14-37b5-a0b9-d2c7c9721a5c`
    },
    {
      header: header,
      details: details
    }
  );
};

const _deleteRadialogyHelper = async ({ facility_uuid, user_uuid }, id) => {
  return await utilityService.postRequest(
    config.deleteRadialogyDetails,
    {
      "content-type": "application/json",
      facility_uuid: facility_uuid || 1,
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
  isRadiologyAvailable: _isRadiologyAvailable,
  isInvistigationAvailable: _isInvistigationAvailable,
  isDiagnosisAvailable: _isDiagnosisAvailable,
  checkPatientTreatmentBody: _checkPatientTreatmentBody,
  createPrescriptionHelper: _createPrescriptionHelper,
  createLabHelper: _createLabHelper,
  deleteLabHelper: _deleteLabHelper,
  deletePrescription: _deletePrescription,
  createInvestgationHelper: _createInvestgationHelper,
  deleteInvestigationHelper: _deleteInvestigationHelper,
  createRadialogyHelper: _createRadialogyHelper,
  deleteRadialogyHelper: _deleteRadialogyHelper

};
