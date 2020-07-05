// Config Import
const config = require("../config/config");
const request = require('request');
const rp = require('request-promise');

// Utility Service
const utilityService = require("../services/utility.service");



const _isDiagnosisAvailable = diagnosis => {
  return Array.isArray(diagnosis) && diagnosis.length > 0;
};
const _isLabAvailable = ({ header, details } = {}) => {
  if (header == undefined || details == undefined) {
    return false;
  }

  return header && Array.isArray(details) && details.length > 0;
};
const _isPrescriptionAvailable = ({ header, details } = {}) => {
  if (header == undefined || details == undefined) {
    return false;
  }

  return header && Array.isArray(details) && details.length > 0;
};

const _isInvistigationAvailable = ({ header, details } = {}) => {
  if (header == undefined || details == undefined) {
    return false;
  }

  return header && Array.isArray(details) && details.length > 0;
};

const _isRadiologyAvailable = ({ header, details } = {}) => {
  if (header == undefined || details == undefined) {
    return false;
  }

  return header && Array.isArray(details) && details.length > 0;
};

const _checkPatientTreatmentBody = req => {
  const { patientDiagnosis, patientPrescription } = req.body;
  const { patientLab, patientRadiology, patientInvestigation } = req.body;
  // console.log("Diagnosis Available", _isDiagnosisAvailable(patientDiagnosis));
  // console.log("RadialogyAvailable", _isRadiologyAvailable(patientRadiology));
  // console.log("Lab Available", _isLabAvailable(patientLab));
  // console.log("Pres Available", _isPrescriptionAvailable(patientPrescription));
  // console.log("InvestigationAvailable", _isInvistigationAvailable(patientInvestigation));
  return (

    _isDiagnosisAvailable(patientDiagnosis) ||
    _isRadiologyAvailable(patientRadiology) ||
    _isLabAvailable(patientLab) ||
    _isPrescriptionAvailable(patientPrescription)
  );

};

const _createPrescriptionHelper = async (
  { facility_uuid, user_uuid, authorization },
  { header, details }
) => {

  return await utilityService.postRequest(
    config.wso2InvUrl + 'prescriptions/addAllPrescriptionDetails',
    // config.addAllPrescriptionDetails,
    {
      "content-type": "application/json",
      facility_uuid: facility_uuid || 1,
      user_uuid: user_uuid,
      Authorization: authorization
    },
    {
      header: header,
      details: details
    }
  );
};


const _createLabHelper = async (
  { facility_uuid, user_uuid, authorization },
  { header, details }
) => {
  return await utilityService.postRequest(
    config.wso2LisUrl + 'patientorders/postpatientorder',
    //config.addAllLabDetails,
    {
      "content-type": "application/json",
      facility_uuid: facility_uuid || 1,
      user_uuid: user_uuid,
      Authorization: authorization
    },
    {
      header: header,
      details: details
    }
  );
};

const _deleteLabHelper = async ({ facility_uuid, user_uuid, authorization }, id) => {
  return await utilityService.postRequest(
    config.wso2LisUrl + 'patientorders/deletepatientorderemr',
    // config.deleteLabDetails,
    {
      "content-type": "application/json",
      facility_uuid: facility_uuid || 1,
      user_uuid: user_uuid,
      Authorization: authorization
    },
    {
      id
    }
  );
};

const _deletePrescription = async ({ user_uuid, authorization }, id) => {
  let options = {
    uri: config.wso2InvUrl + 'prescriptions/deletePrescription',
    // uri: config.deletePrescriptionDetails,
    headers: {
      user_uuid: user_uuid,
      Authorization: authorization
    },
    method: 'PUT',
    json: true,
    body: {
      Id: id
    }
  };

  try {
    const result = await rp(options);
    console.log('precreption delete result', result);
    if (result) {
      return result;

    }
  } catch (err) {
    console.log(err, 'exception happened');
    return err;
  }

};


const _createInvestgationHelper = async ({ facility_uuid, user_uuid, authorization }, { header, details }) => {
  return await utilityService.postRequest(
    config.wso2InvestUrl + 'patientorders/postpatientorder',
    // config.addALLInvestDetails,
    {
      "content-type": "application/json",
      facility_uuid: facility_uuid ? facility_uuid : 1,
      user_uuid: user_uuid,
      Authorization: authorization
    },
    {
      header: header,
      details: details
    }
  );
};

const _deleteInvestigationHelper = async ({ facility_uuid, user_uuid, authorization }, id) => {
  return await utilityService.postRequest(
    config.wso2InvestUrl + 'patientorders/deletepatientorderemr',
    //config.deleteInvestDetails,
    {
      "content-type": "application/json",
      facility_uuid: facility_uuid ? facility_uuid : 1,
      user_uuid: user_uuid,
      Authorization: authorization
    },
    {
      id
    }
  );
};

const _createRadialogyHelper = async ({ facility_uuid, user_uuid, authorization }, { header, details }) => {

  return await utilityService.postRequest(
    config.wso2RmisUrl + 'patientorders/postpatientorder',
    //  config.addAllRadialogyDetails,
    {
      "content-type": "application/json",
      facility_uuid: facility_uuid ? facility_uuid : 1,
      user_uuid: user_uuid,
      Authorization: authorization
    },
    {
      header: header,
      details: details
    }
  );
};

const _deleteRadialogyHelper = async ({ facility_uuid, user_uuid, authorization }, id) => {
  return await utilityService.postRequest(
    config.wso2RmisUrl + 'patientorders/deletepatientorderemr',
    // config.deleteRadialogyDetails,
    {
      "content-type": "application/json",
      facility_uuid: facility_uuid || 1,
      user_uuid: user_uuid,
      Authorization: authorization
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
