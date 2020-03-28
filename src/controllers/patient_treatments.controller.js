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
          response.map((r, i) => {
            for (let d of departmentsResponse.responseContent.rows) {
              if (r.department_id == d.uuid) {
                response[i].department_name = d.name
              }
            }
          });
        }
        const doctorResponse = await getDoctorDetails(user_uuid, authorization, doctorIds);
        if (doctorResponse) {
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
          const repeatRadilogyOrder = await getPreviousRadiology({ user_uuid, facility_uuid, authorization }, orderIds);
          if (repeatRadilogyOrder && repeatRadilogyOrder.length > 0) {
            response.forEach((r) => {
              r.radilogyDetails = repeatRadilogyOrder.filter((rm) => {
                return rm.order_id === r.order_id;
              });
            });

          }
          const repeatInvestOrder = await getPreviousInvest({ user_uuid, facility_uuid, authorization }, orderIds);
          if (repeatInvestOrder && repeatInvestOrder.length > 0) {
            response.forEach((r) => {
              r.InvestigationDetails = repeatInvestOrder.filter((rI) => {
                return rI.order_id === r.order_id;
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
      return res.status(400).send({ code: 400, message: ex });
    }

  };

  const _modifyPreviousOrder = async (req, res) => {
    const { user_uuid, authorization, facility_uuid } = req.headers;
    const { patient_uuid, order_id } = req.query;
    const { patientDiagnosis, patientPrescription, patientLab, patientRadiology, patientInvestigation } = req.body;
    let diagnosisUpdated, prescriptionUpdated, labUpdated, radilogyUpadated, investigationUpdated;
    try {
      if (user_uuid && patient_uuid && patient_uuid > 0) {
        if (patientDiagnosis && Array.isArray(patientDiagnosis)) {
          let updateDiagnosisDetails = req.body.patientDiagnosis;
          diagnosisUpdated = updateDiagnosisDetails && updateDiagnosisDetails.length > 0 ? await updateDiagnosis(updateDiagnosisDetails, user_uuid, order_id) : "";

        }
        if (patientPrescription && Array.isArray(patientPrescription)) {
          let updatePrescriptionDetails = req.body.patientPrescription[0].drug_details;
          prescriptionUpdated = updatePrescriptionDetails && updatePrescriptionDetails.length > 0 ? await updatePrescription(updatePrescriptionDetails, user_uuid, order_id, authorization) : "";
        }
        if (patientLab) {
          let updateLabDetails = req.body.patientLab;
          if (updateLabDetails && updateLabDetails.new_details && updateLabDetails.new_details.length > 0) {
            updateLabDetails.new_details.map((l) => {
              l.patient_treatment_uuid = order_id;
            })
          }
          labUpdated = updateLabDetails ? await updateLab(updateLabDetails, user_uuid, facility_uuid, authorization) : '';

        }
        if (patientRadiology) {
          let updateRadilogyDetails = req.body.patientRadiology;
          if (updateRadilogyDetails && updateRadilogyDetails.new_details && updateRadilogyDetails.new_details.length > 0) {
            updateRadilogyDetails.new_details.map((r) => {
              r.patient_treatment_uuid = order_id;
            })
          }
          radilogyUpadated = updateRadilogyDetails ? await updateRadilogy(updateRadilogyDetails, user_uuid, facility_uuid, authorization) : '';
        }
        if (patientInvestigation) {
          let updateInvestigationDetails = req.body.patientInvestigation;
          if (updateInvestigationDetails && updateInvestigationDetails.new_details && updateInvestigationDetails.new_details.length > 0) {
            updateInvestigationDetails.new_details.map((i) => {
              i.patient_treatment_uuid = order_id;
            })
          }
          investigationUpdated = updateInvestigationDetails ? await updateInvestigation(updateInvestigationDetails, user_uuid, facility_uuid, authorization) : '';
        }
        if (diagnosisUpdated || prescriptionUpdated || labUpdated || radilogyUpadated || investigationUpdated) {
          return res.status(200).send({
            code: httpStatus.OK, message: 'Updated success',

          });
        } else {
          return res.status(400).send({ code: 400, message: 'Failed to update' });
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
  const prescriptionData = await utilityService.postRequest(
    config.wso2InvUrl + 'prescriptions/getPrescriptionByPatientTreatmentId',
    //url,
    {
      "content-type": "application/json",
      facility_uuid: facility_uuid || 1,
      user_uuid: user_uuid,
      Authorization: authorization
    },
    {
      patient_treatment_uuid: order_id,
      patient_uuid: patient_uuid
    }
  );

  if (prescriptionData) {
    const prescriptionResult = getPrescriptionRseponse(prescriptionData);
    return prescriptionResult;
  }
}
async function getPreviousRadiology({ user_uuid, facility_uuid, authorization }, order_id) {
  //const url = 'https://qahmisgateway.oasyshealth.co/DEVHMIS-RMIS/v1/api/patientordertestdetails/getpatientordertestdetailsbypatienttreatment';

  let radialogyData = await utilityService.postRequest(
    config.wso2RmisUrl + 'patientordertestdetails/getpatientordertestdetailsbypatienttreatment',
    //url,
    {
      "content-type": "application/json",
      facility_uuid: facility_uuid || 1,
      user_uuid: user_uuid,
      Authorization: authorization
    },
    {
      patient_treatment_uuid: order_id
    }
  );

  if (radialogyData) {
    const radialogyResult = getRadialogyResponse(radialogyData);
    return radialogyResult;
  }
}
async function getPreviousLab({ user_uuid, facility_uuid, authorization }, order_id) {

  //const url = 'https://qahmisgateway.oasyshealth.co/DEVHMIS-LIS/v1/api/patientorderdetails/getpatientorderdetailsbypatienttreatment';
  const labData = await utilityService.postRequest(
    config.wso2LisUrl + 'patientorderdetails/getpatientorderdetailsbypatienttreatment',
    //url,
    {
      "content-type": "application/json",
      facility_uuid: facility_uuid || 1,
      user_uuid: user_uuid,
      Authorization: authorization
    },
    {
      patient_treatment_uuid: order_id
    }
  );
  if (labData) {
    const labResult = await getLabResponse(labData);
    return labResult;
  }

}
async function getPreviousInvest({ user_uuid, facility_uuid, authorization }, order_id) {
  //const url = 'https://qahmisgateway.oasyshealth.co/DEVHMIS-INV/v1/api/patientordertestdetails/getpatientordertestdetailsbypatienttreatment';
  const investigationData = await utilityService.postRequest(
    config.wso2InvestUrl + 'patientordertestdetails/getpatientordertestdetailsbypatienttreatment',
    //url,
    {
      "content-type": "application/json",
      facility_uuid: facility_uuid || 1,
      user_uuid: user_uuid,
      Authorization: authorization
    },
    {
      patient_treatment_uuid: order_id
    }
  );
  if (investigationData) {
    const investigationResult = await getInvestigationResponse(investigationData);
    return investigationResult;
  }
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
  //const url = 'https://qahmisgateway.oasyshealth.co/DEVAppmaster/v1/api/userProfile/getSpecificUsersByIds';
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
  if (prescriptions && Array.isArray(prescriptions)) {
    prescriptions.map((pd, pIdx) => {

      let p = pd.prescription_details;
      p.forEach((e) => {
        result = [
          ...result,
          {
            "order_id": pd.patient_treatment_uuid,

            "uuid": e.uuid,
            "prescription_uuid": e.prescription_uuid,
            "comments": e.comments,

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
  }
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

  //let labArray = labData.responseContents;
  if (labData) {
    return labData.map(l => {
      return {
        uuid: l.patient_order_uuid,
        details_uuid: l.uuid,
        order_id: l.patient_treatment_uuid,
        //comments
        comments: l.details_comments != null ? l.details_comments : null,
        // order status details
        order_status_uuid: l.order_status != null ? l.order_status.uuid : null,
        order_status_code: l.order_status != null ? l.order_status.name : null,
        order_status_name: l.order_status != null ? l.order_status.code : null,
        // //test details
        test_master_uuid: l.test_master != null ? l.test_master.uuid : null,
        lab_name: l.test_master != null ? l.test_master.name : null,
        lab_code: l.test_master != null ? l.test_master.code : null,
        //ordepriority
        priority_uuid: l.order_priority != null ? l.order_priority.uuid : null,
        priority_code: l.order_priority != null ? l.order_priority.code : null,
        prority_name: l.order_priority != null ? l.order_priority.name : null,
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
  //let radialogyArray = radialogyData.responseContents;
  if (radialogyData) {
    return radialogyData.map(r => {
      return {
        uuid: r.patient_order_uuid,
        details_uuid: r.uuid,
        order_id: r.patient_treatment_uuid,
        //comments
        comments: r.details_comments != null ? r.details_comments : null,
        // order status details
        order_status_uuid: r.order_status != null ? r.order_status.uuid : null,
        order_status_code: r.order_status != null ? r.order_status.name : null,
        order_status_name: r.order_status != null ? r.order_status.code : null,
        // //test details
        test_master_uuid: r.test_master != null ? r.test_master.uuid : null,
        lab_name: r.test_master != null ? r.test_master.name : null,
        lab_code: r.test_master != null ? r.test_master.code : null,

        //ordepriority
        priority_uuid: r.order_priority != null ? r.order_priority.uuid : null,
        priority_code: r.order_priority != null ? r.order_priority.code : null,
        prority_name: r.order_priority != null ? r.order_priority.name : null,
        // //encounter details
        encounter_type_uuid: r.patient_order != null ? r.patient_order.encounter_type_uuid : null,
        encounter_type: r.patient_order != null ? r.patient_order.encounter_type : null,

        // //OrderToLocation Details
        to_location_uuid: r.to_location != null ? r.to_location.uuid : null,
        location_code: r.to_location != null ? r.to_location.location_code : null,
        location_name: r.to_location != null ? r.to_location.location_name : null,



      };
    });
  }
}

async function getInvestigationResponse(investigationData) {
  if (investigationData) {
    return investigationData.map(i => {
      return {
        uuid: i.patient_order_uuid,
        details_uuid: i.uuid,
        order_id: i.patient_treatment_uuid,
        //comments
        comments: i.details_comments != null ? i.details_comments : null,
        // order status details
        order_status_uuid: i.order_status != null ? i.order_status.uuid : null,
        order_status_code: i.order_status != null ? i.order_status.name : null,
        order_status_name: i.order_status != null ? i.order_status.code : null,
        // //test details
        test_master_uuid: i.test_master != null ? i.test_master.uuid : null,
        lab_name: i.test_master != null ? i.test_master.name : null,
        lab_code: i.test_master != null ? i.test_master.code : null,

        //ordepriority
        priority_uuid: i.order_priority != null ? i.order_priority.uuid : null,
        priority_code: i.order_priority != null ? i.order_priority.code : null,
        prority_name: i.order_priority != null ? i.order_priority.name : null,
        // //encounter details
        encounter_type_uuid: i.patient_order != null ? i.patient_order.encounter_type_uuid : null,
        encounter_type: i.patient_order != null ? i.patient_order.encounter_type : null,

        // //OrderToLocation Details
        to_location_uuid: i.to_location != null ? i.to_location.uuid : null,
        location_code: i.to_location != null ? i.to_location.location_code : null,
        location_name: i.to_location != null ? i.to_location.location_name : null
      }
    });
  }

}

async function updateDiagnosis(updateDiagnosisDetails, user_uuid, order_id) {
  let diagnosisPromise = [];
  updateDiagnosisDetails.forEach((r) => {
    if (r.remove_details && r.remove_details.length > 0) {
      r.remove_details.forEach((rD) => {
        rD.modified_by = user_uuid;
        rD.modified_date = new Date();
        rD.status = 0;
        rD.is_active = 0;
        diagnosisPromise = [...diagnosisPromise,
        patientDiagnosisTbl.update(rD,
          {
            where: {
              uuid: rD.uuid
            }
          },
          { returning: true }
        )
        ];
      });
    }
    if (r.new_diagnosis && r.new_diagnosis.length > 0 && order_id) {
      r.new_diagnosis.forEach((pD) => {
        pD.is_snomed = pD.is_snomed;
        pD.is_patient_condition =
          pD.is_patient_condition || emr_constants.IS_ACTIVE;
        pD.is_chronic = pD.is_chronic || emr_constants.IS_ACTIVE;
        pD = utilityService.createIsActiveAndStatus(pD, user_uuid);
        pD.performed_by = user_uuid;
        pD.performed_date = new Date();
        pD.patient_treatment_uuid = order_id
      });
      diagnosisPromise = [...diagnosisPromise, patientDiagnosisTbl.bulkCreate(r.new_diagnosis, {
        returning: true
      })]
    }
  });

  return diagnosisPromise
}

async function updatePrescription(updatePrescriptionDetails, user_uuid, order_id, authorization) {
  //const url = 'https://qahmisgateway.oasyshealth.co/DEVHMIS-INVENTORY/v1/api/prescriptions/updatePrescription'
  return utilityService.postRequest(
    config.wso2InvUrl + 'prescriptions/updatePrescription',
    //url,
    {
      "content-type": "application/json",
      user_uuid: user_uuid,
      Authorization: authorization
    },
    {
      details: updatePrescriptionDetails
    }
  );


}

async function updateLab(updateLabDetails, facility_uuid, user_uuid, authorization) {
  //const url = 'https://qahmisgateway.oasyshealth.co/DEVHMIS-LIS/v1/api/patientorders/updatePatientOrder'
  const url = config.wso2LisUrl + 'patientorders/updatePatientOrder';

  return await _putRequest(url, updateLabDetails, { user_uuid, facility_uuid, authorization });
}
async function updateRadilogy(updateRadilogyDetails, facility_uuid, user_uuid, authorization) {
  //const url = 'https://qahmisgateway.oasyshealth.co/DEVHMIS-RMIS/v1/api/patientorders/updatePatientOrder'
  const url = config.wso2RmisUrl + 'patientorders/updatePatientOrder';
  return await _putRequest(url, updateRadilogyDetails, { user_uuid, facility_uuid, authorization });
}
async function updateInvestigation(updateInvestigationDetails, facility_uuid, user_uuid, authorization) {
  //const url = 'https://qahmisgateway.oasyshealth.co/DEVHMIS-INV/v1/api/patientorders/updatePatientOrder'
  const url = config.wso2InvestUrl + 'patientorders/updatePatientOrder';

  return await _putRequest(url, updateInvestigationDetails, { user_uuid, facility_uuid, authorization });
}
async function _putRequest(url, updateDetails, { user_uuid, facility_uuid, authorization }) {
  let options = {
    uri: url,
    headers: {
      user_uuid: user_uuid,
      facility_uuid: facility_uuid,
      Authorization: authorization
    },
    method: 'PUT',
    json: true,
    body: updateDetails
  };

  try {
    const result = await rp(options);
    console.log(result, 'result')
    if (result && result.statusCode === 200) {
      return result;
    }

  } catch (ex) {
    console.log('Exception Happened', ex);
    return ex;
  }

};
