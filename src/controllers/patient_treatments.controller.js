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
const treatmentKitTable = sequelizeDb.treatment_kit;


// Patient Treatment Attributes
const patientTreatmentAttributes = require("../attributes/patient_treatment_attributes");

const getPrevKitOrders = [
  'uuid',
  'patient_uuid',
  'treatment_given_date',
  'treatment_kit_uuid',
  'department_uuid',
  'encounter_type_uuid',
  'treatment_given_by'
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
    const { user_uuid, authorization } = req.headers;

    const { patient_uuid } = req.query;
    try {
      if (user_uuid && patient_uuid && patient_uuid > 0) {
        let prevKitOrderData = await getPatientTreatmentKitData(patient_uuid);
        const returnMessage = prevKitOrderData.length > 0 ? emr_constants.FETCHED_PREVIOUS_KIT_SUCCESSFULLY : emr_constants.NO_RECORD_FOUND;
        let response = getPrevKitOrdersResponse(prevKitOrderData);
        let departmentIds = [];
        let doctorIds = [];
        response.map(d => {
          departmentIds.push(d.department_id);
          doctorIds.push(d.doctor_id)

        });

        const departmentsResponse = await getDepartments(user_uuid, authorization, departmentIds);
        if (departmentsResponse) {
          for (let [i, r] of response.entries()) {
            for (let d of departmentsResponse.responseContent.rows) {
              if (r.department_id == d.uuid) {
                response[i].department_name = d.name
              }
            }
          }
        }
        const doctorResponse = await getDoctorDetails(user_uuid, authorization, doctorIds);
        if (doctorResponse) {
          for (let [i, r] of response.entries()) {
            for (let d of doctorResponse.responseContents) {
              if (r.doctor_id == d.uuid) {
                response[i].doctor_name = d.first_name

              }
            }
          }

        }
        return res.status(200).send({ code: httpStatus.OK, message: returnMessage, responseContents: response });
      }
      else {
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

    if (!user_uuid || !order_id) {
      return res.status(400).send({ code: httpStatus[400], message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND} ` });
    }
    try {
      if (order_id <= 0) {
        return res.status(400).send({ code: httpStatus[400], message: 'Please providr valid order id' });
      }

      const repeatOrderDiagnosisData = await getPrevOrderdDiagnosisData(order_id);
      const responseDiagnosis = await getRepeatOrderDiagnosisResponse(repeatOrderDiagnosisData);
      const repeatOrderPrescData = await getPrevOrderPrescription({ user_uuid, facility_uuid, authorization }, order_id);
      const repeatOrderLabData = await getPreviousLab({ user_uuid, facility_uuid, authorization }, order_id);
      //const repeatOrderRadilogy = await getPreviousRadiology({ user_uuid, facility_uuid, authorization }, order_id);

      return res.status(200).send({
        code: httpStatus.OK,
        message: 'Prevkit Order Details Fetched Successfully',
        responseContents: {
          "diagnosis_details": responseDiagnosis,
          "drug_details": repeatOrderPrescData ? repeatOrderPrescData : [],
          "lab_details": repeatOrderLabData,
          //  "radiology_details": repeatOrderRadilogy
        }
      });
    } catch (ex) {
      console.log('Exception Happened ', ex);
      return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
    }

  };

  const _previousKitRepeatOrder = async (req, res) => {
    const { user_uuid, facility_uuid, authorization } = req.headers;
    const { patient_uuid } = req.query;
    try {
      if (user_uuid && patient_uuid && patient_uuid > 0) {
        let prevKitOrderData = await getPatientTreatmentKitData(patient_uuid);
        const returnMessage = prevKitOrderData.length > 0 ? emr_constants.FETCHED_PREVIOUS_KIT_SUCCESSFULLY : emr_constants.NO_RECORD_FOUND;
        let response = getPrevKitOrdersResponse(prevKitOrderData);
        let departmentIds = [], doctorIds = [], orderIds = [];
        //let doctorIds = [];
        //let orderIds = [];
        response.map(d => {
          departmentIds.push(d.department_id);
          doctorIds.push(d.doctor_id)
          orderIds.push(d.order_id)
        });

        const departmentsResponse = await getDepartments(user_uuid, authorization, departmentIds);
        if (departmentsResponse) {
          // for (let [i, r] of response.entries()) {
          response.map((r, i) => {
            for (let d of departmentsResponse.responseContent.rows) {
              if (r.department_id == d.uuid) {
                response[i].department_name = d.name
              }
            }
          });
          // }
        }
        const doctorResponse = await getDoctorDetails(user_uuid, authorization, doctorIds);
        if (doctorResponse) {
          // for (let [i, r] of response.entries()) {
          response.map((r, i) => {
            for (let d of doctorResponse.responseContents) {
              if (r.doctor_id == d.uuid) {
                response[i].doctor_name = d.first_name
              }
            }
          });
        }
        if (response) {
          const repeatOrderDiagnosisData = await getPrevOrderdDiagnosisData(orderIds);
          const responseDiagnosis = await getRepeatOrderDiagnosisResponse(repeatOrderDiagnosisData);
          if (responseDiagnosis.length > 0) {
            response.forEach((e, index) => {
              e.diagnosis = responseDiagnosis.filter((rD) => {
                return rD.order_id === e.order_id;
              });
            });
          }

          const repeatLabOrder = await getPreviousLab({ user_uuid, facility_uuid, authorization }, orderIds);
          if (repeatLabOrder && repeatLabOrder.length > 0) {
            response.forEach((l) => {
              l.labDetails = repeatLabOrder.filter((rl) => {
                return rl.order_id === l.order_id;
              });
            });

          }
          const repeatOrderPrescData = await getPrevOrderPrescription(user_uuid, authorization, facility_uuid, orderIds, patient_uuid);
          if (repeatOrderPrescData && repeatOrderPrescData.length > 0) {
            response.forEach((p) => {
              p.drugDetails = repeatOrderPrescData.filter((rP) => {
                return rP.order_id === p.order_id;
              });
            });
          }
        }
        return res.status(200).send({ code: httpStatus.OK, message: returnMessage, responseContents: response });
      }
      else {
        return res.status(400).send({ code: httpStatus[400], message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}` });
      }
    } catch (ex) {
      console.log('Exception Happened', ex);
      return res.status(400).send({ code: 400, message: ex.message });
    }

  };

  const _modifyPreviousOrder = async (req, res) => {
    const { user_uuid } = req.headers;
    const { patient_uuid, order_id } = req.query;
    const { patientDiagnosis } = req.body;
    try {
      let orderUpdatePromise = [];
      if (user_uuid && patient_uuid && order_id && patient_uuid > 0 && order_id > 0) {
        if (patientDiagnosis &&
          Array.isArray(patientDiagnosis) &&
          patientDiagnosis.length > 0
        ) {
          let query = {
            where: {
              uuid: 1310,
              patient_uuid: patient_uuid,
            }
          };
          orderUpdatePromise = [...orderUpdatePromise,
          patientDiagnosisTbl.update(patientDiagnosis, query)
          ];
          const updatedOrder = await Promise.all(orderUpdatePromise);
          console.log(updatedOrder, 'updatedOrder=====');
          if (updatedOrder) {
            return res.status(200).send({ code: httpStatus.OK, message: 'Updated Success' });
          }
          //const updatedDiagnosis = await updateDiagnosis(patient_uuid, order_id, patientDiagnosis);
        }
      } else {
        return res.status(400).send({ code: httpStatus[400], message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}` });
      }
    } catch (ex) {
      console.log('Exception Happened', ex);
      return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
    }
  };

  return {
    createPatientTreatment: _createPatientTreatment,
    prevKitOrdersById: _prevKitOrdersById,
    repeatOrderById: _repeatOrderById,
    previousKitRepeatOrder: _previousKitRepeatOrder,
    modifyPreviousOrder: _modifyPreviousOrder
  };
};

module.exports = PatientTreatmentController();

async function getPatientTreatmentKitData(patient_uuid) {
  let query = {
    patient_uuid: patient_uuid,
    is_active: emr_constants.IS_ACTIVE,
    status: emr_constants.IS_ACTIVE

  };
  return patientTreatmenttbl.findAll({
    where: query,
    attributes: getPrevKitOrders,
    limit: 5,
    order: [['created_date', 'DESC']],
    include: [
      {
        model: treatmentKitTable,
        attributes: ['uuid', 'name', 'code'],
        // where: { is_active: 1, status: 1 }
        required: false

      },
      {
        model: encounterTypeTbl,
        attributes: ['uuid', 'code', 'name'],
        required: false

      }
    ],
    required: false

  });

}
function getPrevKitOrdersResponse(orders) {
  return orders.map(o => {
    return {
      order_id: o.uuid,
      patient_id: o.patient_uuid,
      ordered_date: o.treatment_given_date,
      doctor_id: o.treatment_given_by,
      encounter_type_uuid: o.encounter_type.uuid,
      encounter_type: o.encounter_type.name,
      treatment_kit_uuid: o.treatment_kit == null ? null : o.treatment_kit.uuid,
      treatment_kit_name: o.treatment_kit == null ? null : o.treatment_kit.name,
      department_id: o.department_uuid,
    };
  });
}
async function getPrevOrderdDiagnosisData(order_id) {

  let query = {
    patient_treatment_uuid: {
      [Op.in]: order_id
    },
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

async function getPrevOrderPrescription(user_uuid, authorization, facility_uuid, order_id, patient_uuid) {
  //const url = 'https://qahmisgateway.oasyshealth.co/DEVHMIS-INVENTORY/v1/api/prescriptions/getPrescriptionByPatientTreatmentId';
  const url = config.wso2InvestUrl + 'prescriptions/getPrescriptionByPatientTreatmentId';
  const auth = "Bearer e222c12c-e0d1-3b8b-acaa-4ca9431250e2";

  let options = {
    uri: url,
    method: 'POST',
    headers: {
      Authorization: authorization != null ? authorization : auth,
      user_uuid: user_uuid,
      facility_uuid: facility_uuid,
    },
    json: true,
    body: {
      patient_treatment_uuid: order_id,
      patient_uuid: patient_uuid
    }
  };
  try {
    console.log(options, 'prescription');
    const prescriptionData = await rp(options);
    if (prescriptionData.responseContents) {
      const prescriptionResult = getPrescriptionRseponse(prescriptionData.responseContents);
      return prescriptionResult;
    }

  } catch (ex) {
    console.log(ex.message, 'ex');
    return ex;
  }
}

async function getPreviousRadiology({ user_uuid, facility_uuid, authorization }, order_id) {
  //const url = 'https://qahmisgateway.oasyshealth.co/DEVHMIS-RMIS/v1/api/patientorderdetails/getpatientorderdetailsbypatienttreatment';
  const url = config.wso2RmisUrl + 'patientorderdetails/getpatientorderdetailsbypatienttreatment';

  let radialogyData = await _postRequest(url, { user_uuid, facility_uuid, authorization }, order_id);
  if (radialogyData) {
    const radialogyResult = getRadialogyResponse(radialogyData);
    return radialogyResult;
  }
}
async function getPreviousLab({ user_uuid, facility_uuid, authorization }, order_id) {

  //const url = 'https://qahmisgateway.oasyshealth.co/DEVHMIS-LIS/v1/api/patientordertestdetails/getpatientordertestdetailsbypatienttreatment';
  const url = config.wso2LisUrl + 'patientorderdetails/getpatientorderdetailsbypatienttreatment';

  const labData = await _postRequest(url, { user_uuid, facility_uuid, authorization }, order_id);

  if (labData) {
    const labResult = await getLabResponse(labData);
    return labResult;
  }

}
async function getPreviousInvest({ user_uuid, authorization }, order_id) {

}

async function getDepartments(user_uuid, Authorization, departmentIds) {
  //const url = 'https://qahmisgateway.oasyshealth.co/DEVAppmaster/v1/api/department/getSpecificDepartmentsByIds';
  const url = config.wso2AppUrl + 'department/getSpecificDepartmentsByIds';

  let options = {
    uri: url,
    method: 'POST',
    headers: {
      Authorization: Authorization,
      user_uuid: user_uuid
    },
    body: { "uuid": departmentIds },
    json: true
  };
  const departmentData = await rp(options);
  if (departmentData) {
    return departmentData
  }
}

async function getDoctorDetails(user_uuid, Authorization, doctorIds) {
  // const url = 'https://qahmisgateway.oasyshealth.co/DEVAppmaster/v1/api/userProfile/getSpecificUsersByIds';
  const url = config.wso2AppUrl + 'userProfile/getSpecificUsersByIds';
  let options = {
    uri: url,
    method: 'POST',
    headers: {
      Authorization: Authorization,
      user_uuid: user_uuid
    },
    body: { "uuid": doctorIds },
    json: true
  };
  const doctorData = await rp(options);
  if (doctorData) {
    return doctorData;
  }
}

async function getPrescriptionRseponse(prescriptions) {
  //let prescriptions = prescriptionData.responseContents;
  let result = [];
  prescriptions.map((pd, pIdx) => {

    let p = pd.prescription_details;
    p.forEach((e) => {
      result = [
        ...result,
        {
          "order_id": pd.patient_treatment_uuid,

          "uuid": e.uuid,
          "prescription_uuid": e.prescription_uuid,


          //Drug Status
          "prescription_status_uuid": pd.prescription_status != null ? pd.prescription_status.uuid : null,
          "prescription_status_name": pd.prescription_status != null ? pd.prescription_status.name : null,
          "prescription_status_code": pd.prescription_status != null ? pd.prescription_status.code : null,

          //Drug Details
          "drug_name": e.item_master != null ? e.item_master.name : null,
          "drug_code": e.item_master != null ? e.item_master.code : null,
          "item_master_uuid": e.item_master != null ? e.item_master.uuid : null,
          // Drug Route Details
          "drug_route_name": e.drug_route != null ? e.drug_route.name : null,
          "drug_route_code": e.drug_route != null ? e.drug_route.code : null,
          "drug_route_id": e.drug_route != null ? e.drug_route.uuid : null,
          // Drug Frequency Details
          "drug_frequency_name": e.drug_frequency != null ? e.drug_frequency.name : null,
          "drug_frequency_id": e.drug_frequency != null ? e.drug_frequency.uuid : null,
          "drug_frequency_code": e.drug_frequency != null ? e.drug_frequency.code : null,
          // Drug Period Details
          "drug_period_name": e.duration_period != null ? e.duration_period.name : null,
          "drug_period_id": e.duration_period != null ? e.duration_period.uuid : null,
          "drug_period_code": e.duration_period != null ? e.duration_period.code : null,

          //Duration
          "duration": e.duration,

          // Drug Instruction Details
          "drug_instruction_code": e.drug_instruction != null ? e.drug_instruction.code : null,
          "drug_instruction_name": e.drug_instruction != null ? e.drug_instruction.name : null,
          "drug_instruction_id": e.drug_instruction != null ? e.drug_instruction.uuid : null
        }
      ]
    });
  })
  return result;

}

function getRepeatOrderDiagnosisResponse(repeatOrderDiagnosisData) {
  let result = [];
  repeatOrderDiagnosisData.forEach(rd => {
    if (rd.dataValues.diagnosis != null) {
      result.push(
        {
          order_id: rd.dataValues.patient_treatment_uuid,
          uuid: rd.dataValues.uuid,
          diagnosis_id: rd.dataValues.diagnosis.dataValues.uuid,
          diagnosis_name: rd.dataValues.diagnosis.dataValues.name,
          diagnosis_code: rd.dataValues.diagnosis.dataValues.code,
          diagnosis_description: rd.dataValues.diagnosis.dataValues.description
        }
      );
    }

  });
  return result;
}

async function getLabResponse(labData) {
  let labArray = labData.responseContents;
  if (labArray) {
    return labArray.map(l => {
      return {
        uuid: l.patient_order_uuid,
        details_uuid: l.uuid,
        order_id: l.patient_treatment_uuid,

        // order status details
        order_status_uuid: l.order_status != null ? l.order_status.uuid : null,
        order_status_code: l.order_status != null ? l.order_status.name : null,
        order_status_name: l.order_status != null ? l.order_status.code : null,
        // //test details
        test_master_uuid: l.test_master != null ? l.test_master.uuid : null,
        lab_name: l.test_master != null ? l.test_master.name : null,
        lab_code: l.test_master != null ? l.test_master.code : null,

        // //encounter details
        encounter_type_uuid: l.patient_order != null ? l.patient_order.encounter_type_uuid : null,
        encounter_type: l.patient_order != null ? l.patient_order.encounter_type : null,

        // //OrderToLocation Details
        to_location_uuid: l.to_location != null ? l.to_location.uuid : null,
        location_code: l.to_location != null ? l.to_location.location_code : null,
        location_name: l.to_location != null ? l.to_location.location_name : null
      };
    });
  }
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

    };
  });
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
  console.log(options, 'lab');

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
