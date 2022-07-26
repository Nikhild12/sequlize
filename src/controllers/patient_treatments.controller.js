// Package Import
const httpStatus = require("http-status");

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

// Tables
const patientTreatmenttbl = sequelizeDb.patient_treatments;
const patientDiagnosisTbl = sequelizeDb.patient_diagnosis;
const patientChiefComplaintsTbl = sequelizeDb.patient_chief_complaints; /* Sreeni - Patient Chief Complaints Added - H30-34349 */
const diagnosisTbl = sequelizeDb.diagnosis;
const chiefcomplaintsTbl = sequelizeDb.chief_complaints;
const encounterTypeTbl = sequelizeDb.encounter_type;
const treatmentKitTable = sequelizeDb.treatment_kit;
const chief_complaint_duration_periods_tbl = sequelizeDb.chief_complaint_duration_periods;


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
    const {
      user_uuid,
      facility_uuid
    } = req.headers;
    const {
      patientTreatment
    } = req.body;
    const {
      patientDiagnosis,
      patientChiefComplaints,
      patientPrescription
    } = req.body;
    const {
      patientLab,
      patientRadiology,
      patientInvestigation
    } = req.body;

    // let patientTransaction;
    // let patientTransactionStatus = false;
    if (user_uuid && patientTreatment) {
      if (!patientTreatmentAttributes.checkPatientTreatmentBody(req)) {
        return res.status(400).send({
          code: httpStatus.BAD_REQUEST,
          message: emr_constants.TREATMENT_REQUIRED
        });
      }

      let patientDgnsCreatedData, patientCCData;
      let prescriptionCreated, labCreated, investigationCreated, radialogyCreated;

      try {
        // transaction Initialization
        // patientTransaction = await sequelizeDb.sequelize.transaction();
        patientTreatment.treatment_given_by = patientTreatment.created_by = patientTreatment.modified_by = user_uuid;
        patientTreatment.treatment_given_date = new Date();
        patientTreatment.tat_start_time = new Date();
        const patientTKCreatedData = await patientTreatmenttbl.create(
          patientTreatment, {
          returning: true
        }
        );
        if (Array.isArray(patientDiagnosis) && patientDiagnosis.length > 0) {
          patientDiagnosis.forEach(p => {
            p.is_snomed = p.is_snomed;
            p.is_patient_condition = p.is_patient_condition || emr_constants.IS_ACTIVE;
            p.is_chronic = p.is_chronic || emr_constants.IS_ACTIVE;
            p.performed_by = user_uuid;
            p.performed_date = new Date();
            p = utilityService.assignDefaultValuesAndUUIdToObject(p, patientTKCreatedData, user_uuid, "patient_treatment_uuid");
          });
          patientDgnsCreatedData = await patientDiagnosisTbl.bulkCreate(patientDiagnosis, {
            returning: true,
            validate: true
          });
        }
        /* Sreeni - Patient Chief Complaints Added - H30-34349 */
        if (Array.isArray(patientChiefComplaints) && patientChiefComplaints.length > 0) {
          patientChiefComplaints.forEach(cc => {
            cc.performed_by = user_uuid;
            cc.performed_date = new Date();
            cc = utilityService.assignDefaultValuesAndUUIdToObject(cc, patientTKCreatedData, user_uuid, "patient_treatment_uuid");
          });
          patientCCData = await patientChiefComplaintsTbl.bulkCreate(patientChiefComplaints, {
            returning: true,
            validate: true
          });
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
        //patientTransactionStatus = true;
        return res.status(200).send({
          code: httpStatus.OK,
          message: emr_constants.INSERTED_PATIENT_TREATMENT,
          responseContents: {
            patientTKCreatedData,
            patientDgnsCreatedData,
            patientCCData,
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
          .send({
            code: httpStatus.BAD_REQUEST,
            message: error
          });
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
    const {
      user_uuid,
      facility_uuid
    } = req.headers;
    let Authorization, authorization;
    Authorization = authorization = req.headers.Authorization ? req.headers.Authorization : req.headers.authorization
    const {
      patient_uuid
    } = req.query;
    try {
      if (user_uuid && patient_uuid && patient_uuid > 0) {
        let prevKitOrderData = await getPatientTreatmentKitData(patient_uuid);
        const returnMessage = prevKitOrderData.length > 0 ? emr_constants.FETCHED_PREVIOUS_KIT_SUCCESSFULLY : emr_constants.NO_RECORD_FOUND;
        let response = getPrevKitOrdersResponse(prevKitOrderData);
        let departmentIds = [],
          doctorIds = [],
          orderIds = [];
        if (response != null && response.length > 0) {
          response.map(d => {
            departmentIds.push(d.department_id);
            doctorIds.push(d.doctor_id);
            orderIds.push(d.order_id);
          });

          const departmentsResponse = await getDepartments(user_uuid, Authorization, departmentIds);
          if (departmentsResponse) {
            response.map((r, i) => {
              for (let d of departmentsResponse.responseContent.rows) {
                if (r.department_id == d.uuid) {
                  response[i].department_name = d.name;
                }
              }
            });
          }
          const doctorResponse = await getDoctorDetails(user_uuid, Authorization, doctorIds);
          if (doctorResponse) {
            response.map((r, i) => {
              for (let d of doctorResponse.responseContents) {
                if (r.doctor_id == d.uuid) {
                  response[i].doctor_name = d.first_name;
                }
              }
            });
          }

          const repeatOrderDiagnosisData = await getPrevOrderdDiagnosisData(orderIds);
          const responseDiagnosis = await getRepeatOrderDiagnosisResponse(repeatOrderDiagnosisData);
          if (responseDiagnosis.length > 0) {
            response.forEach((e, index) => {
              e.diagnosis = responseDiagnosis.filter((rD) => {
                return rD.order_id === e.order_id;
              });
            });
          }

          const repeatOrderChiefComplaintsData = await getPrevOrderdChiefComplaintsData(orderIds);
          const responseChiefComplaints = await getRepeatOrderChiefComplaintsResponse(repeatOrderChiefComplaintsData);
          if (responseChiefComplaints.length > 0) {
            response.forEach((e, index) => {
              e.chiefcomplaints = responseChiefComplaints.filter((rcc) => {
                return rcc.order_id === e.order_id;
              });
            });
          }

          const repeatLabOrder = await getPreviousLab(user_uuid, facility_uuid, Authorization, orderIds);
          if (repeatLabOrder && repeatLabOrder.length > 0) {
            response.forEach((l) => {
              l.labDetails = repeatLabOrder.filter((rl) => {
                return rl.order_id === l.order_id;
              });
            });
          }
          const repeatOrderPrescData = await getPrevOrderPrescription(user_uuid, Authorization, facility_uuid, orderIds, patient_uuid);
          if (repeatOrderPrescData && repeatOrderPrescData.length > 0) {
            response.forEach((p) => {
              p.drugDetails = repeatOrderPrescData.filter((rP) => {
                return rP.order_id === p.order_id;
              });
            });
          }

          const repeatRadilogyOrder = await getPreviousRadiology(user_uuid, facility_uuid, Authorization, orderIds);
          if (repeatRadilogyOrder && repeatRadilogyOrder.length > 0) {
            response.forEach((r) => {
              r.radilogyDetails = repeatRadilogyOrder.filter((rm) => {
                return rm.order_id === r.order_id;
              });
            });
          }

          const repeatInvestOrder = await getPreviousInvest(user_uuid, facility_uuid, Authorization, orderIds);
          if (repeatInvestOrder && repeatInvestOrder.length > 0) {
            response.forEach((r) => {
              r.InvestigationDetails = repeatInvestOrder.filter((rI) => {
                return rI.order_id === r.order_id;
              });
            });

          }
          return res.status(200).send({
            code: httpStatus.OK,
            message: returnMessage,
            responseContents: response
          });
        } else {
          return res.status(200).send({
            code: httpStatus.OK,
            message: 'No Data Found'
          });
        }

      } else {
        return res.status(400).send({
          code: httpStatus[400],
          message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`
        });
      }
    } catch (ex) {
      console.log('Exception Happened', ex);
      return res.status(400).send({
        code: 400,
        message: ex
      });
    }

  };

  const _modifyPreviousOrder = async (req, res) => {
    const {
      user_uuid,
      authorization,
      facility_uuid
    } = req.headers;
    const {
      patient_uuid,
      order_id
    } = req.query;
    const {
      patientTreatment,
      patientDiagnosis,
      patientChiefComplaints,
      patientPrescription,
      patientLab,
      patientRadiology,
      patientInvestigation
    } = req.body;
    let diagnosisUpdated, chiefcomplaintsUpdated, prescriptionUpdated, labUpdated, radilogyUpadated, investigationUpdated;
    try {
      if (user_uuid && patient_uuid && patient_uuid > 0) {
        if (patientTreatment) {
          let updateTreatmentKitdetails = {
            patientTreatmentId: patientTreatment.uuid,
            treatment_kit_uuid: patientTreatment.treatment_kit_uuid
          };
          let updateData = await patientTreatmenttbl.update({
            treatment_kit_uuid: patientTreatment.treatment_kit_uuid,
            modified_by: user_uuid,
            modified_date: new Date()
          }, {
            where: {
              uuid: patientTreatment.uuid
            }
          })
          if (updateData && updateData[0] > 0) {
            await patientDiagnosisTbl.update({
              treatment_kit_uuid: patientTreatment.treatment_kit_uuid,
              modified_by: user_uuid,
              modified_date: new Date()
            }, {
              where: {
                patient_treatment_uuid: patientTreatment.uuid
              }
            });
            await patientChiefComplaintsTbl.update({
              treatment_kit_uuid: patientTreatment.treatment_kit_uuid,
              modified_by: user_uuid,
              modified_date: new Date()
            }, {
              where: {
                patient_treatment_uuid: patientTreatment.uuid
              }
            });
            await updateTreatmentKit(updateTreatmentKitdetails, user_uuid, authorization, 1);
            await updateTreatmentKit(updateTreatmentKitdetails, user_uuid, authorization, 2);
            await updateTreatmentKit(updateTreatmentKitdetails, user_uuid, authorization, 3);
          }
        }
        if (patientDiagnosis && Array.isArray(patientDiagnosis)) {
          let updateDiagnosisDetails = req.body.patientDiagnosis;
          diagnosisUpdated = updateDiagnosisDetails && updateDiagnosisDetails.length > 0 ? await updateDiagnosis(updateDiagnosisDetails, user_uuid, order_id) : "";
        }
        if (patientChiefComplaints && Array.isArray(patientChiefComplaints)) {
          let updateChiefComplaintsDetails = req.body.patientChiefComplaints;
          chiefcomplaintsUpdated = updateChiefComplaintsDetails && updateChiefComplaintsDetails.length > 0 ? await updateChiefComplaints(updateChiefComplaintsDetails, user_uuid, order_id) : "";
        }
        if (patientPrescription) {
          let updatePrescriptionDetails = req.body.patientPrescription;
          if (updatePrescriptionDetails.header && updatePrescriptionDetails.details.length > 0) {
            if (!updatePrescriptionDetails.header.uuid) {
              patientPrescription.details.forEach(i => {
                if (i.uuid == 0 || i.uuid == '' || i.uuid) {
                  delete i.uuid
                }
              });
              prescriptionUpdated = await patientTreatmentAttributes.createPrescriptionHelper(
                req.headers,
                patientPrescription
              );
            } else {
              patientPrescription.details.forEach(i => {
                if (i.uuid == 0 || i.uuid == '') {
                  delete i.uuid
                }
              });
              prescriptionUpdated = updatePrescriptionDetails ? await updatePrescription(updatePrescriptionDetails, user_uuid, order_id, authorization) : "";
            }
          }
        }
        if (patientLab) {
          let updateLabDetails = req.body.patientLab;
          if (updateLabDetails && updateLabDetails.new_details && updateLabDetails.new_details.length > 0) {
            updateLabDetails.new_details.map((l) => {
              l.patient_treatment_uuid = order_id;
            });
          }
          labUpdated = updateLabDetails ? await updateLab(updateLabDetails, user_uuid, facility_uuid, authorization) : '';
        }
        if (patientRadiology) {
          let updateRadilogyDetails = req.body.patientRadiology;
          if (updateRadilogyDetails && updateRadilogyDetails.new_details && updateRadilogyDetails.new_details.length > 0) {
            updateRadilogyDetails.new_details.map((r) => {
              r.patient_treatment_uuid = order_id;
            });
          }
          radilogyUpadated = updateRadilogyDetails ? await updateRadilogy(updateRadilogyDetails, user_uuid, facility_uuid, authorization) : '';
        }
        if (patientInvestigation) {
          let updateInvestigationDetails = req.body.patientInvestigation;
          if (updateInvestigationDetails && updateInvestigationDetails.new_details && updateInvestigationDetails.new_details.length > 0) {
            updateInvestigationDetails.new_details.map((i) => {
              i.patient_treatment_uuid = order_id;
            });
          }
          investigationUpdated = updateInvestigationDetails ? await updateInvestigation(updateInvestigationDetails, user_uuid, facility_uuid, authorization) : '';
        }
        if (diagnosisUpdated || chiefcomplaintsUpdated || prescriptionUpdated || labUpdated || radilogyUpadated || investigationUpdated) {
          return res.status(200)
            .send({
              code: httpStatus.OK,
              message: emr_constants.PATIENT_TREATMENT_UPDATE
            });
        } else {
          return res.status(400).send({
            code: 400,
            message: emr_constants.FAILED_TO_UPDATE
          });
        }
      } else {
        return res.status(400).send({
          code: httpStatus[400],
          message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`
        });
      }
    } catch (ex) {
      console.log('Exception Happened', ex);
      return res.status(400).send({
        code: httpStatus.BAD_REQUEST,
        message: ex.message
      });
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
    order: [
      ['created_date', 'DESC']
    ],
    include: [{
      model: treatmentKitTable,
      attributes: ['uuid', 'name', 'code', 'is_public', 'description', 'share_uuid'],
      required: false
    },
    {
      model: encounterTypeTbl,
      attributes: ['uuid', 'code', 'name'],
      required: false
    }
    ]
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
      treatment_kit_code: o.treatment_kit == null ? null : o.treatment_kit.code,
      treatment_kit_name: o.treatment_kit == null ? null : o.treatment_kit.name,
      treatment_kit_is_public: o.treatment_kit == null ? null : o.treatment_kit.is_public,
      treatment_kit_description: o.treatment_kit == null ? null : o.treatment_kit.description,
      treatment_kit_share_uuid: o.treatment_kit == null ? null : o.treatment_kit.share_uuid,
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

async function getPrevOrderdChiefComplaintsData(order_id) {
  let query = {
    patient_treatment_uuid: {
      [Op.in]: order_id
    },
    is_active: emr_constants.IS_ACTIVE,
    status: emr_constants.IS_ACTIVE
  };
  return patientChiefComplaintsTbl.findAll({
    where: query,
    attributes: ['uuid', 'patient_uuid', 'chief_complaint_uuid', 'patient_treatment_uuid','chief_complaint_duration'],
    include: [
      {
        model: chiefcomplaintsTbl,
        attributes: ['uuid', 'code', 'name', 'description']
      },
      {
        model: chief_complaint_duration_periods_tbl,
        attributes: ['uuid', 'code', 'name']
      }
    ]
  });

}

async function getPrevOrderPrescription(user_uuid, authorization, facility_uuid, order_id, patient_uuid) {
  //const url = 'https://qahmisgateway.oasyshealth.co/DEVHMIS-INVENTORY/v1/api/prescriptions/getPrescriptionByPatientTreatmentId';
  const prescriptionData = await utilityService.postRequest(
    config.wso2InvUrl + 'prescriptions/getPrescriptionByPatientTreatmentId',
    //url,
    {
      'Content-Type': 'application/json',
      facility_uuid: facility_uuid || 1,
      user_uuid: user_uuid,
      Authorization: authorization
    }, {
    patient_treatment_uuid: order_id,
    patient_uuid: patient_uuid
  }
  );

  if (prescriptionData) {
    const prescriptionResult = getPrescriptionRseponse(prescriptionData);
    return prescriptionResult;
  }
}

async function getPreviousRadiology(user_uuid, facility_uuid, Authorization, order_id) {
  //const url = 'https://qahmisgateway.oasyshealth.co/DEVHMIS-RMIS/v1/api/patientordertestdetails/getpatientordertestdetailsbypatienttreatment';

  let radialogyData = await utilityService.postRequest(
    //config.wso2RmisUrl + 'patientordertestdetails/getpatientordertestdetailsbypatienttreatment',
    config.wso2RmisUrl + 'patientorderdetails/getpatientorderdetailsbypatienttreatment', {
    'Content-Type': 'application/json',
    facility_uuid: facility_uuid || 1,
    user_uuid: user_uuid,
    Authorization: Authorization
  }, {
    patient_treatment_uuid: order_id
  }
  );

  if (radialogyData) {
    const radialogyResult = getRadialogyResponse(radialogyData);
    return radialogyResult;
  }
}

async function getPreviousLab(user_uuid, facility_uuid, Authorization, order_id) {

  //const url = 'https://qahmisgateway.oasyshealth.co/DEVHMIS-LIS/v1/api/patientorderdetails/getpatientorderdetailsbypatienttreatment';
  const labData = await utilityService.postRequest(
    config.wso2LisUrl + 'patientorderdetails/getpatientorderdetailsbypatienttreatment',
    //url,
    {
      'Content-Type': 'application/json',
      facility_uuid: facility_uuid || 1,
      user_uuid: user_uuid,
      Authorization: Authorization
    }, {
    patient_treatment_uuid: order_id
  }
  );
  if (labData) {
    const labResult = await getLabResponse(labData);
    return labResult;
  }

}

async function getPreviousInvest(user_uuid, facility_uuid, Authorization, order_id) {

  //const url = 'https://qahmisgateway.oasyshealth.co/DEVHMIS-INV/v1/api/patientordertestdetails/getpatientordertestdetailsbypatienttreatment';
  const investigationData = await utilityService.postRequest(
    //config.wso2InvestUrl + 'patientordertestdetails/getpatientordertestdetailsbypatienttreatment',
    config.wso2InvestUrl + 'patientorderdetails/getpatientorderdetailsbypatienttreatment',
    //url,
    {
      'Content-Type': 'application/json',
      facility_uuid: facility_uuid || 1,
      user_uuid: user_uuid,
      Authorization: Authorization
    }, {
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
      user_uuid: user_uuid,
      'Content-Type': 'application/json'
    },
    body: {
      "uuid": departmentIds
    },
    json: true
  };
  const departmentData = await rp(options);
  if (departmentData) {
    return departmentData;
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
      user_uuid: user_uuid,
      'Content-Type': 'application/json'
    },
    body: {
      "uuid": doctorIds
    },
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
    let injection_room_name = '';
    let injection_room_code = '';
    prescriptions.forEach(i => {
      if (i.injection_room) {
        injection_room_name = i.injection_room.store_name;
        injection_room_code = i.injection_room.store_code;
      }
    });
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
            "prescribed_quantity": e.prescribed_quantity,
            //Drug Status
            "prescription_status_uuid": pd.prescription_status != null ? pd.prescription_status.uuid : null,
            "prescription_status_name": pd.prescription_status != null ? pd.prescription_status.name : null,
            "prescription_status_code": pd.prescription_status != null ? pd.prescription_status.code : null,

            //Drug Details
            "drug_name": e.item_master != null ? e.item_master.name : null,
            "drug_code": e.item_master != null ? e.item_master.code : null,
            "strength": e.item_master != null ? e.item_master.strength : null,
            "item_master_uuid": e.item_master != null ? e.item_master.uuid : null,
            // Drug Route Details
            "drug_route_name": e.drug_route != null ? e.drug_route.name : null,
            "drug_route_code": e.drug_route != null ? e.drug_route.code : null,
            "drug_route_id": e.drug_route != null ? e.drug_route.uuid : null,
            // Drug Frequency Details
            "drug_frequency_name": e.drug_frequency != null ? e.drug_frequency.name : null,
            "drug_frequency_id": e.drug_frequency != null ? e.drug_frequency.uuid : null,
            "drug_frequency_code": e.drug_frequency != null ? e.drug_frequency.code : null,
            "drug_frequency_in_take": e.frequency_in_take,
            // Drug Period Details
            "drug_period_name": e.duration_period != null ? e.duration_period.name : null,
            "drug_period_id": e.duration_period != null ? e.duration_period.uuid : null,
            "drug_period_code": e.duration_period != null ? e.duration_period.code : null,

            //Duration
            "duration": e.duration,

            "injection_room_uuid": pd.injection_room != null ? pd.injection_room.uuid : null,
            "injection_room_name": injection_room_name,
            "injection_room_code": injection_room_code,
            "is_emar": e.is_emar != null ? e.is_emar : null,
            "im_can_calculate_frequency_qty": e.item_master != null ? e.item_master.can_calculate_frequency_qty : null,

            // Drug Instruction Details
            "drug_instruction_code": e.drug_instruction != null ? e.drug_instruction.code : null,
            "drug_instruction_name": e.drug_instruction != null ? e.drug_instruction.name : null,
            "drug_instruction_id": e.drug_instruction != null ? e.drug_instruction.uuid : null
          }
        ];
      });
    });
  }
  return result;

}

function getRepeatOrderDiagnosisResponse(repeatOrderDiagnosisData) {
  let result = [];
  repeatOrderDiagnosisData.forEach(rd => {
    if (rd.dataValues.diagnosis != null) {
      result.push({
        order_id: rd.dataValues.patient_treatment_uuid,
        uuid: rd.dataValues.uuid,
        diagnosis_id: rd.dataValues.diagnosis.dataValues.uuid,
        diagnosis_name: rd.dataValues.diagnosis.dataValues.name,
        diagnosis_code: rd.dataValues.diagnosis.dataValues.code,
        diagnosis_description: rd.dataValues.diagnosis.dataValues.description
      });
    }

  });
  return result;
}

function getRepeatOrderChiefComplaintsResponse(repeatOrderChiefComplaintsData) {
  let result = [];
  repeatOrderChiefComplaintsData.forEach(rcc => {
    if (rcc != null) {
      result.push({
        order_id: rcc.dataValues.patient_treatment_uuid,
        uuid: rcc.dataValues.uuid,
        chief_complaint_duration: rcc.dataValues.chief_complaint_duration,
        chief_complaint_id: rcc.dataValues.chief_complaint.dataValues.uuid,
        chief_complaint_code: rcc.dataValues.chief_complaint.dataValues.code,
        chief_complaint_name: rcc.dataValues.chief_complaint.dataValues.name,
        chief_complaint_description: rcc.dataValues.chief_complaint.dataValues.description,
        chief_complaint_duration: rcc.dataValues.chief_complaint_duration,
        chief_complaint_duration_period_uuid: rcc.dataValues.chief_complaint_duration_period.dataValues.uuid,
        chief_complaint_duration_period_code: rcc.dataValues.chief_complaint_duration_period.dataValues.code,
        chief_complaint_duration_period_name: rcc.dataValues.chief_complaint_duration_period.dataValues.name
      });
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
        // //profile details
        profile_master_uuid: l.profile_master != null ? l.profile_master.uuid : null,
        profile_master_name: l.profile_master != null ? l.profile_master.name : null,
        profile_master_code: l.profile_master != null ? l.profile_master.profile_code : null,
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
        location_name: l.to_location != null ? l.to_location.location_name : null,

        // is_profile
        is_profile: l.is_profile
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
        // //profile details
        profile_master_uuid: r.profile_master != null ? r.profile_master.uuid : null,
        profile_master_name: r.profile_master != null ? r.profile_master.name : null,
        profile_master_code: r.profile_master != null ? r.profile_master.profile_code : null,
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
        // is_profile
        is_profile: r.is_profile
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
        // //profile details
        profile_master_uuid: i.profile_master != null ? i.profile_master.uuid : null,
        profile_master_name: i.profile_master != null ? i.profile_master.name : null,
        profile_master_code: i.profile_master != null ? i.profile_master.profile_code : null,
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
        location_name: i.to_location != null ? i.to_location.location_name : null,
        // is_profile
        is_profile: i.is_profile
      };
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
        patientDiagnosisTbl.update(rD, {
          where: {
            uuid: rD.uuid
          }
        }, {
          returning: true
        })
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
        pD.patient_treatment_uuid = order_id;
      });
      diagnosisPromise = [...diagnosisPromise, patientDiagnosisTbl.bulkCreate(r.new_diagnosis, {
        returning: true
      })];
    }
  });

  return Promise.all(diagnosisPromise);
}

async function updateChiefComplaints(updateChiefComplaintsDetails, user_uuid, order_id) {
  let chiefcomplaintsPromise = [];
  updateChiefComplaintsDetails.forEach((r) => {
    if (r.remove_details && r.remove_details.length > 0) {
      r.remove_details.forEach((rcc) => {
        rcc.modified_by = user_uuid;
        rcc.modified_date = new Date();
        rcc.status = 0;
        rcc.is_active = 0;
        chiefcomplaintsPromise = [...chiefcomplaintsPromise,
        patientChiefComplaintsTbl.update(rcc, {
          where: {
            uuid: rcc.uuid
          }
        }, {
          returning: true
        })
        ];
      });
    }
    if (r.new_chief_complaint && r.new_chief_complaint.length > 0 && order_id) {
      r.new_chief_complaint.forEach((pcc) => {
        pcc = utilityService.createIsActiveAndStatus(pcc, user_uuid);
        pcc.performed_by = user_uuid;
        pcc.performed_date = new Date();
        pcc.patient_treatment_uuid = order_id;
      });
      chiefcomplaintsPromise = [...chiefcomplaintsPromise, patientChiefComplaintsTbl.bulkCreate(r.new_chief_complaint, {
        returning: true
      })];
    }
  });

  return Promise.all(chiefcomplaintsPromise);
}

async function updatePrescription(updatePrescriptionDetails, user_uuid, order_id, authorization) {
  //const url = 'https://qahmisgateway.oasyshealth.co/DEVHMIS-INVENTORY/v1/api/prescriptions/updatePrescription'
  const data = await utilityService.postRequest(
    config.wso2InvUrl + 'prescriptions/updatePrescription',
    //url,
    {
      "content-type": "application/json",
      user_uuid: user_uuid,
      Authorization: authorization
    },

    updatePrescriptionDetails

  );
  return data


}

async function updateLab(updateLabDetails, facility_uuid, user_uuid, authorization) {
  //const url = 'https://qahmisgateway.oasyshealth.co/DEVHMIS-LIS/v1/api/patientorders/updatePatientOrder'
  const url = config.wso2LisUrl + 'patientorders/updatePatientOrder';

  return _putRequest(url, updateLabDetails, {
    user_uuid,
    facility_uuid,
    authorization
  });
}

async function updateRadilogy(updateRadilogyDetails, facility_uuid, user_uuid, authorization) {
  //const url = 'https://qahmisgateway.oasyshealth.co/DEVHMIS-RMIS/v1/api/patientorders/updatePatientOrder'
  const url = config.wso2RmisUrl + 'patientorders/updatePatientOrder';
  return _putRequest(url, updateRadilogyDetails, {
    user_uuid,
    facility_uuid,
    authorization
  });
}

async function updateInvestigation(updateInvestigationDetails, facility_uuid, user_uuid, authorization) {
  const url = config.wso2InvestUrl + 'patientorders/updatePatientOrder';

  return _putRequest(url, updateInvestigationDetails, {
    user_uuid,
    facility_uuid,
    authorization
  });
}

async function updateTreatmentKit(updateTreatmentKitdetails, user_uuid, authorization, id) {
  let options = {
    uri: geturl(id) + 'patientorders/updatepatientordertreatmentkit',
    method: 'POST',
    headers: {
      Authorization: authorization,
      user_uuid: user_uuid,
      'Content-Type': 'application/json'
    },
    body: updateTreatmentKitdetails,
    json: true
  };
  const updatetreatmentoutput = await rp(options);
  if (updatetreatmentoutput) {
    return updatetreatmentoutput;
  }
}

function geturl(id) {
  switch (id) {
    case 1:
      return config.wso2LisUrl;
    case 2:
      return config.wso2RmisUrl;
    case 3:
      return config.wso2InvestUrl;
  }
}

async function _putRequest(url, updateDetails, {
  user_uuid,
  facility_uuid,
  authorization
}) {
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
    if (result && result.statusCode === 200) {
      return result;
    }

  } catch (ex) {
    console.log('Exception Happened', ex);
    return ex;
  }

}