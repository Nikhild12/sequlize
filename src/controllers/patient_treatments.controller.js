// Package Import
const httpStatus = require("http-status");

const moment = require("moment");

// Sequelizer Import
const sequelizeDb = require("../config/sequelize");

// Config Import
const config = require("../config/config");

var Sequelize = require("sequelize");
var Op = Sequelize.Op;
const rp = require('request-promise');


// Constants Import
const emr_constants = require("../config/constants");

// Utility Service
const utilityService = require("../services/utility.service");

// tbl
const patientTreatmenttbl = sequelizeDb.patient_treatments;
const patientDiagnosisTbl = sequelizeDb.patient_diagnosis;
const diagnosisTbl = sequelizeDb.diagnosis;
const prevKitOrdersViewTbl = sequelizeDb.vw_patient_pervious_orders;
const encounterTypeTbl = sequelizeDb.encounter_type;


// Patient Treatment Attributes
const patientTreatmentAttributes = require("../attributes/patient_treatment_attributes");
const getPrevKitOrders = [
  'pt_uuid',
  'pt_patient_uuid',
  'pt_treatment_given_date',
  'd_name',
  'tk_name',
  'u1_first_name',
  'u1_middle_name',
  'u1_last_name',
  'et_name'
];

const PatientTreatmentController = () => {
  const _createPatientTreatment = async (req, res) => {
    const { user_uuid, facility_uuid } = req.headers;
    const { patientTreatment } = req.body;
    const { patientDiagnosis, patientPrescription } = req.body;
    const { patientLab, patientRadiology, patientInvestigation } = req.body;

    // let patientTransaction;
    // let patientTransactionStatus = false;
    if (user_uuid && patientTreatment) {
      if (!patientTreatmentAttributes.checkPatientTreatmentBody(req)) {
        return res.status(400).send({
          code: httpStatus.BAD_REQUEST,
          message: emr_constants.TREATMENT_REQUIRED
        });
      }

      let patientDgnsCreatedData;
      let prescriptionCreated, labCreated, investigationCreated, radialogyCreated;

      try {
        // transaction Initialization
        // patientTransaction = await sequelizeDb.sequelize.transaction();
        patientTreatment.treatment_given_by = user_uuid;
        patientTreatment.treatment_given_date = new Date();
        patientTreatment.tat_start_time = new Date();
        const patientTKCreatedData = await patientTreatmenttbl.create(
          patientTreatment,
          {
            returning: true
            //transaction: patientTransaction

          }
        );
        if (Array.isArray(patientDiagnosis) && patientDiagnosis.length > 0) {
          patientDiagnosis.forEach(p => {
            p.is_snomed = p.is_snomed || emr_constants.IS_ACTIVE;
            p.is_patient_condition =
              p.is_patient_condition || emr_constants.IS_ACTIVE;
            p.is_chronic = p.is_chronic || emr_constants.IS_ACTIVE;
            p = utilityService.assignDefaultValuesAndUUIdToObject(
              p,
              patientTKCreatedData,
              user_uuid,
              "patient_treatment_uuid"
            );
          });
          patientDgnsCreatedData = await patientDiagnosisTbl.bulkCreate(
            patientDiagnosis,
            {
              returning: true,
              //transaction: patientTransaction,
              validate: true
            }
          );
        }
        if (patientTreatmentAttributes.isPrescriptionAvailable(patientPrescription)) {

          patientPrescription.header.patient_treatment_uuid = patientTKCreatedData.uuid;

          prescriptionCreated = await patientTreatmentAttributes.createPrescriptionHelper(
            req.headers,
            patientPrescription
          );
        }
        if (patientTreatmentAttributes.isLabAvailable(patientLab)) {
          patientLab.header.patient_treatment_uuid = patientTKCreatedData.uuid;
          patientLab.details.forEach((l) => {
            l.patient_treatment_uuid = patientTKCreatedData.uuid;
          });
          labCreated = await patientTreatmentAttributes.createLabHelper(
            req.headers,
            patientLab
          );
        }
        if (patientTreatmentAttributes.isInvistigationAvailable(patientInvestigation)) {
          patientInvestigation.header.patient_treatment_uuid = patientTKCreatedData.uuid;
          patientInvestigation.details.forEach((i) => {
            i.patient_treatment_uuid = patientTKCreatedData.uuid;
          });
          investigationCreated = await patientTreatmentAttributes.createInvestgationHelper(req.headers, patientInvestigation);
        }
        if (patientTreatmentAttributes.isRadiologyAvailable(patientRadiology)) {
          patientRadiology.header.patient_treatment_uuid = patientTKCreatedData.uuid;
          patientRadiology.details.forEach((r) => {
            r.patient_treatment_uuid = patientTKCreatedData.uuid;
          });
          radialogyCreated = await patientTreatmentAttributes.createRadialogyHelper(req.headers, patientRadiology);


        }



        //await patientTransaction.commit();
        // patientTransactionStatus = true;
        return res.status(200).send({
          code: httpStatus.OK,
          message: emr_constants.INSERTED_PATIENT_TREATMENT,
          responseContents: {
            patientTKCreatedData,
            patientDgnsCreatedData,
            prescriptionCreated,
            labCreated,
            investigationCreated,
            radialogyCreated
          }
        });
      } catch (error) {
        console.log(error, "Exception Happened");

        // if (patientTransaction) {
        //   await patientTransaction.rollback();
        //   patientTransactionStatus = true;
        // }

        if (labCreated) {
          const id = labCreated[0].uuid;
          await patientTreatmentAttributes.deleteLabHelper(req.headers, id);
        }
        if (radialogyCreated) {
          const id = radialogyCreated[0].uuid;
          await patientTreatmentAttributes.deleteRadialogyHelper(req.headers, id);

        }
        if (prescriptionCreated) {
          const id = prescriptionCreated.prescription_result.uuid;
          await patientTreatmentAttributes.deletePrescription(req.headers, id);
        }

        if (investigationCreated) {
          const id = investigationCreated[0].uuid;
          await patientTreatmentAttributes.deleteInvestigationHelper(req.headers, id);
        }
        return res
          .status(400)
          .send({ code: httpStatus.BAD_REQUEST, message: error });
      } finally {
        // if (patientTransaction && !patientTransactionStatus) {
        //   patientTransaction.rollback();
        // }
      }
    } else {
      return res.status(400).send({
        code: httpStatus[400],
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}`
      });
    }
  };
  const _prevKitOrdersById = async (req, res) => {
    const { user_uuid } = req.headers;
    const { patient_uuid } = req.query;
    try {
      let query = {
        pt_patient_uuid: patient_uuid,
        pt_is_active: emr_constants.IS_ACTIVE,
        pt_status: emr_constants.IS_ACTIVE

      };
      if (user_uuid && patient_uuid) {
        const prevKitOrderData = await prevKitOrdersViewTbl.findAll({
          where: query,
          attributes: getPrevKitOrders,
          limit: 5,
          order: [['pt_treatment_given_date', 'DESC']]
        });
        const returnMessage = prevKitOrderData.length > 0 ? emr_constants.FETCHED_PREVIOUS_KIT_SUCCESSFULLY : emr_constants.NO_RECORD_FOUND;
        let response = getPrevKitOrdersResponse(prevKitOrderData);
        return res.status(200).send({ code: httpStatus.OK, message: returnMessage, responseContents: response });
      } else {
        return res.status(400).send({ code: httpStatus[400], message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}` });

      }

    } catch (ex) {
      console.log('Exception Happened', ex);
      return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex });
    }

  };

  const _repeatOrderById = async (req, res) => {
    const { user_uuid, facility_uuid, authorization } = req.headers;
    const { order_id } = req.body;

    if (!user_uuid && !order_id) {
      return res.status(400).send({ code: httpStatus[400], message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}` });
    }
    try {

      const repeatOrderDiagnosisData = await getPrevOrderdDiagnosisData(order_id);
      const responseDiagnosis = await getRepeatOrderDiagnosisResponse(repeatOrderDiagnosisData);
      // const repeatOrderPrescData = await getPrevOrderPrescription({ user_uuid, authorization }, order_id);
      const repeatOrderLabData = await getPreviousLab({ user_uuid, facility_uuid, authorization }, order_id);
      const repeatOrderRadilogy = await getPreviousRadiology({ user_uuid, facility_uuid, authorization }, order_id);
      return res.status(200).send({
        code: httpStatus.OK, message: 'Prevkit Order Details Fetched Successfully',
        responseContents: {
          "diagnosis_details": responseDiagnosis,
          //  "drug_details": repeatOrderPrescData,
          "lab_details": repeatOrderLabData,
          "radiology_details": repeatOrderRadilogy
        }
      });
    } catch (ex) {
      console.log('Exception Happened ', ex);
      return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex });
    }

  };

  return {
    createPatientTreatment: _createPatientTreatment,
    prevKitOrdersById: _prevKitOrdersById,
    repeatOrderById: _repeatOrderById
  };
};

module.exports = PatientTreatmentController();

function getPrevKitOrdersResponse(orders) {
  return orders.map((o) => {
    return {
      order_id: o.pt_uuid,
      patient_id: o.pt_patient_uuid,
      ordered_date: o.pt_treatment_given_date,
      department_name: o.d_name,
      encounter_type: o.et_name,
      treatment_name: o.tk_name,
      docter_name: `${o.u1_first_name} ${o.u1_middle_name} ${o.u1_last_name}`

    };
  });
}
async function getPrevOrderdDiagnosisData(order_id) {
  let query = {
    patient_treatment_uuid: order_id,
    is_active: emr_constants.IS_ACTIVE,
    status: emr_constants.IS_ACTIVE

  };
  return patientDiagnosisTbl.findAll({
    where: query,
    attributes: ['uuid', 'patient_uuid', 'diagnosis_uuid', 'patient_treatment_uuid'],
    include: [{
      model: diagnosisTbl,
      attributes: ['uuid', 'code', 'name', 'description']
    }]
  });

}

async function getPrevOrderPrescription({ user_uuid, authorization }, order_id) {
  const url = 'https://qahmisgateway.oasyshealth.co/DEVHMIS-INVENTORY/v1/api/prescriptions/getPrescriptionByPatientTreatmentId';
  const prescriptionData = await _postRequest(url, { user_uuid, authorization }, order_id);
  if (prescriptionData) {
    const prescriptionResult = getPrescriptionRseponse(prescriptionData);
    return prescriptionResult;
  }
  //return prescriptionData;
}

async function getPreviousRadiology({ user_uuid, facility_uuid, authorization }, order_id) {
  const url = 'https://qahmisgateway.oasyshealth.co/DEVHMIS-RMIS/v1/api/patientordertestdetails/getpatientordertestdetailsbypatienttreatment';
  let radialogyData = await _postRequest(url, { user_uuid, facility_uuid, authorization }, order_id);
  if (radialogyData) {
    const radialogyResult = getRadialogyResponse(radialogyData);
    return radialogyResult;
  }
}
async function getPreviousLab({ user_uuid, facility_uuid, authorization }, order_id) {

  const url = 'https://qahmisgateway.oasyshealth.co/DEVHMIS-LIS/v1/api/patientordertestdetails/getpatientordertestdetailsbypatienttreatment';

  const labData = await _postRequest(url, { user_uuid, facility_uuid, authorization }, order_id);

  if (labData) {
    const labResult = getLabResponse(labData);
    return labResult;
  }

}
async function getPreviousInvest({ user_uuid, authorization }, order_id) {
  return await _getRequest({ user_uuid, authorization }, order_id);

}

async function getPrescriptionRseponse(prescriptionData) {
  let prescriptions = prescriptionData.responseContents;
  // p = p.prescription_details;

  prescriptions.forEach((pd, pIdx) => {
    let p = pd.prescription_details[pIdx];
    console.log(p.item_master, "00000");

    return {
      //Drug Details
      drug_name: p.item_master.name,
      drug_code: p.item_master.code,
      drug_id: p.item_maste.uuid,
      //drug_quantity: p.tkd_quantity,
      //drug_duration: p.tkd_duration,

      // Drug Route Details
      drug_route_name: p.drug_route.uuid,
      drug_route_code: p.drug_route.code,
      drug_route_id: p.drug_route.name,

      // Drug Frequency Details
      drug_frequency_name: p.drug_frequency.name,
      drug_frequency_id: p.drug_frequency.uuid,
      drug_frequency_code: p.drug_frequency.code,

      // Drug Period Details
      drug_period_name: p.duration_period.name,
      drug_period_id: p.duration_period.uuid,
      drug_period_code: p.duration_period.code,

      //Duration
      duration: p.duration,

      // Drug Instruction Details
      drug_instruction_code: p.drug_instruction.code,
      drug_instruction_name: p.drug_instruction.name,
      drug_instruction_id: p.drug_instruction.uuid
    }
  });

  // prescriptions.forEach((p, pIdx) => {
  //   prescriptionList = [...prescriptionList, {
  //     order_id: p.patient_treatment_uuid,
  //     uuid: p.uuid,
  //     prescription_no: p.prescription_no,
  //     treatment_kit_uuid: p.treatment_kit_uuid,
  //     prescriptionDetails: {
  //       prescription_uuid: p.prescription_details[pIdx].prescription_uuid,
  //       drug_name: p.prescription_details[pIdx].item_master.name,
  //       drug_route: p.prescription_details[pIdx].drug_route,
  //       drug_frequency: p.prescription_details[pIdx].drug_frequency,
  //       duration: p.prescription_details[pIdx].duration,
  //       duration_period: p.prescription_details[pIdx].duration_period,
  //       instruction: p.prescription_details[pIdx].drug_instruction
  //     }
  //   }];
  //   return prescriptionList;
  // });


}

function getRepeatOrderDiagnosisResponse(repeatOrderDiagnosisData) {

  return repeatOrderDiagnosisData.map(d => {
    d = d.diagnosis.dataValues;
    return {
      diagnosis_id: d.uuid,
      diagnosis_name: d.name,
      diagnosis_code: d.code,
      diagnosis_description: d.description
    }
  })

}

async function getLabResponse(labData) {
  let labArray = labData.responseContents;
  return labArray.map(l => {
    return {
      //test details
      test_master_uuid: l.test_master.uuid,
      lab_name: l.test_master.name,
      lab_code: l.test_master.code,

      //encounter details
      encounter_type_uuid: l.patient_order.encounter_type_uuid,
      encounter_type: l.patient_order.encounter_type,

      //OrderToLocation Details
      to_location_uuid: l.to_location.uuid,
      location_code: l.to_location.location_code,
      location_name: l.to_location.location_name


    }
  })
}

async function getRadialogyResponse(radialogyData) {
  let radialogyArray = radialogyData.responseContents;

  return radialogyArray.map(r => {
    return {
      //test details
      test_master_uuid: r.test_master.uuid,
      lab_name: r.test_master.name,
      lab_code: r.test_master.code,

      //encounter details
      encounter_type_uuid: r.patient_order.encounter_type_uuid,
      encounter_type: r.patient_order.encounter_type,

      //OrderToLocation Details
      to_location_uuid: r.to_location.uuid,
      location_code: r.to_location.location_code,
      location_name: r.to_location.location_name

    }
  })
}

const _postRequest = async (url, { user_uuid, facility_uuid, authorization }, order_id) => {
  let options = {
    uri: url,
    headers: {
      user_uuid: user_uuid,
      facility_uuid: facility_uuid,
      Authorization: authorization
    },
    method: 'POST',
    json: true,
    body: {
      patient_treatment_uuid: order_id
    }
  };
  try {
    const result = await rp(options);
    if (result) {
      return result;
    }
  } catch (ex) {
    console.log('Exception Happened', ex);
    return ex;
  }

};

const _getRequest = async (url, { user_uuid, authorization }, order_id) => {
  let options = {
    uri: url,
    headers: {
      Authorization: authorization
    },
    method: 'GET',
    json: true,
    body: {
      patient_treatment_uuid: order_id
    }
  };
  try {
    const result = await rp(options);
    if (result) {
      return result;
    }
  } catch (ex) {
    console.log('Exception Happened', ex);
    return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex });
  }

};