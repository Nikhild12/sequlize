// Package Import
const httpStatus = require("http-status");
const moment = require("moment");

const rp = require("request-promise");

// Sequelizer Import
const Sequelize = require("sequelize");

// Config Import
const emr_config = require('../config/config');

const Op = Sequelize.Op;

const requestApi = require('../requests/requests');

// Sequelizer Import
const sequelizeDb = require("../config/sequelize");

// EMR Utilities
const emr_utility = require("../services/utility.service");

// Encounter Attributes
const enc_att = require("../attributes/encounter.attributes");

const encounter_tbl = sequelizeDb.encounter;
const encounter_doctors_tbl = sequelizeDb.encounter_doctors;
const encounter_type_tbl = sequelizeDb.encounter_type;
const vw_patientdoc = sequelizeDb.vw_patient_doctor_details;
const vw_encounterDetailsTbl = sequelizeDb.vw_emr_encounter_details;
const vw_latest_encounter = sequelizeDb.vw_latest_encounter;

const emr_constants = require("../config/constants");

const emr_mock_json = require("../config/emr_mock_json");
const utilityService = require("../services/utility.service");

const encounterBlockChain = require('../blockChain/encounter.blockchain');

const patient_age_details_tbl = sequelizeDb.patient_age_details;
const config = require('../config/config');
const utils = require('../helpers/utils');

const appMasterData = require("../controllers/appMasterData");

// Query
function getActiveEncounterQuery(pId, dId, deptId, etypeId, fId) {
  let encounterQuery = {
    order: [["uuid", "desc"]],
    where: {
      patient_uuid: pId,
      is_active_encounter: emr_constants.IS_ACTIVE,
      is_active: emr_constants.IS_ACTIVE,
      status: emr_constants.IS_ACTIVE,
      encounter_type_uuid: etypeId,
      facility_uuid: fId
    },
    include: [
      {
        model: encounter_doctors_tbl,
        attributes: ["uuid", "doctor_uuid"],
        where: {
          doctor_uuid: dId,
          department_uuid: deptId,
          is_active: emr_constants.IS_ACTIVE,
          status: emr_constants.IS_ACTIVE,
        },
      },
    ],
  };

  if (etypeId === 1) {
    encounterQuery.where[Op.and] = [
      Sequelize.where(
        Sequelize.fn("date", Sequelize.col("encounter_date")),
        "=",
        utilityService.indiaTz().format("YYYY-MM-DD")
      ),
    ];
  } else if (etypeId === 2 || etypeId === "2") {
    delete encounterQuery.include[0].where.doctor_uuid;
    delete encounterQuery.include[0].where.department_uuid;
  }
  return encounterQuery;
}

const Encounter = () => {


  const _getOldVisitInformation = async (req, res, next) => {
    try{

      if(!(req.body.patient_uuid) || (req.body.patient_uuid) <= 0) {
        return res.status(500).send({
          statusCode: 500,
          code: 500,
          message: "Patient Id is required..."
        });
      }

      let dataJson = {
        patient_uuid: req.body.patient_uuid 
      };
      let encsql = "";
      encsql += "SELECT e.uuid as encounter_uuid,  e.encounter_date, ed.doctor_uuid ";
      encsql += "FROM encounter e, encounter_doctors ed ";
      encsql += "WHERE e.patient_uuid = :patient_uuid ";
      encsql += "AND ed.encounter_uuid=e.uuid  ";
      encsql += "AND e.encounter_type_uuid =1;  "; 
      let encounterData = await sequelizeDb.sequelize.query(
        encsql , { raw: true, replacements: dataJson, 
          type: Sequelize.QueryTypes.SELECT });
       
      try {
        let doctorIds = [...new Set(encounterData.map(e => e.doctor_uuid))];
        const Authorization = req.headers.Authorization ? req.headers.Authorization : (req.headers.authorization ? req.headers.authorization : 0);
        const usersResponse = await appMasterData.getDoctorDetails(req.headers.user_uuid, Authorization, doctorIds);
        let userinfo = {};
        usersResponse.responseContents.forEach(euser => {
          //let titlename = (euser.title && euser.title.name) ? euser.title.name : '';
          userinfo[euser.uuid] = euser.first_name;
        });
        encounterData.forEach(e => {
          e.doctor_name = userinfo[e.doctor_uuid] ?
            userinfo[e.doctor_uuid] : null;
          delete e.encounter_doctors;
        });
      } catch (ex) { }
      return res.status(200).send({
        code: httpStatus.OK,
        message: "Fetched Encounter Successfully",
        responseContents: encounterData,
        totalRecords: encounterData.length
      });
    } catch (ex) {
      return res.status(500).send({
        statusCode: 500,
        code: 500,
        message: ex
      });
    }
  }

  // Past History Info // 

  const _getOldHistoryInfo = async (req, res, next) => {
    try{
      if(!(req.body.encounter_uuid) || (req.body.encounter_uuid) <= 0) {
        return res.status(500).send({
          statusCode: 500,
          code: 500,
          message: "Encounter Id is required..."
        });
      }
      let PreviousChiefComplaints = await _getPastChiefComplaintsInfo(req, res, next);
      let PreviousDiagnosis = await _getPastDiagnosisInfo(req, res, next);
      let PreviousPrescription = await _getPreviousPrescriptionData(req, res, next); 
      if (PreviousPrescription &&
        PreviousPrescription.responseContents) {
        PreviousPrescription = [...PreviousPrescription.responseContents];
      }
      let PreviousLabDetails = await _getPreviousLabData(req, res, next); 
      if(PreviousLabDetails && 
        PreviousLabDetails.responseContents) {
      PreviousLabDetails = [...PreviousLabDetails.responseContents]; 
      }
      let PreviousRMISDetails = await _getPreviousRMISData(req, res, next); 
      if(PreviousRMISDetails && 
        PreviousRMISDetails.responseContents) {
      PreviousRMISDetails = [...PreviousRMISDetails.responseContents];
      }

      let OldHistory = {
        PreviousChiefComplaints,
        PreviousDiagnosis,
        PreviousPrescription,
        PreviousLabDetails,
        PreviousRMISDetails
      };

      return res.status(200).send({
        code: httpStatus.OK,
        message: "Fetched Encounter Successfully",
        responseContents: OldHistory,
        totalRecords: 1
      });
    } catch (ex) {
      return res.status(500).send({
        statusCode: 500,
        code: 500,
        message: ex
      });
    }
  }

  const _getPastChiefComplaintsInfo = async (req, res, next) => {
    try{
      if(!(req.body.encounter_uuid) || (req.body.encounter_uuid) <= 0) {
        return res.status(500).send({
          statusCode: 500,
          code: 500,
          message: "Encounter Id is required..."
        });
      }
      let dataJson = {
        encounter_uuid: req.body.encounter_uuid 
      };
      let encsql = "";
      encsql += " SELECT pc.uuid, pc.encounter_uuid , pc.performed_date, cc.name as description ";
      encsql += " FROM patient_chief_complaints pc, chief_complaints cc ";
      encsql += " WHERE pc.chief_complaint_uuid=cc.uuid ";
      encsql += " AND pc.encounter_type_uuid=1 ";
      encsql += " AND pc.encounter_uuid = :encounter_uuid "; 
      let patientChiefComplaintsData = await sequelizeDb.sequelize.query(
        encsql, {
          raw: true, replacements: dataJson,
        type: Sequelize.QueryTypes.SELECT
      });  
      return patientChiefComplaintsData;

    } catch (ex) {
      return  ex;
    }
  }
  
  const _getPastDiagnosisInfo = async (req, res, next) => {
    try{
      if(!(req.body.encounter_uuid) || (req.body.encounter_uuid) <= 0) {
        return res.status(500).send({
          statusCode: 500,
          code: 500,
          message: "Encounter Id is required..."
        });
      }
      let dataJson = {
        encounter_uuid: req.body.encounter_uuid 
      };
      let encsql = "";
      encsql += " SELECT pd.uuid, pd.encounter_uuid, pd.performed_date,  d.name as description  ";
      encsql += " FROM patient_diagnosis pd, diagnosis d ";
      encsql += " WHERE pd.diagnosis_uuid=d.uuid ";
      encsql += " AND pd.encounter_type_uuid=1 ";
      encsql += " AND pd.encounter_uuid = :encounter_uuid "; 
      let patientDiagnosisData = await sequelizeDb.sequelize.query(
        encsql, {
          raw: true, replacements: dataJson,
        type: Sequelize.QueryTypes.SELECT
      });
      return patientDiagnosisData;
    } catch (ex) {
      return ex;
    }
  }

  // Past History Info // 

  const _getPreviousPrescriptionData = async (req, res, next) => {
    try {
      let result = {};
      if (!(req.body.encounter_uuid) || (req.body.encounter_uuid) <= 0) {
        return res.status(500).send({
          statusCode: 500,
          code: 500,
          message: "Encounter Id is required..."
        });
      }
      let options = {
        uri: config.wso2InvUrl + 'prescriptions/getPastPrescription',
        method: "POST",
        headers: {
          Authorization: req.headers.authorization,
          user_uuid: req.headers.user_uuid,
          facility_uuid: req.headers.facility_uuid
        },
        body: {
          "encounter_uuid": req.body.encounter_uuid, 
        },
        json: true
      };
      const prescription_details = await rp(options); 
      if (prescription_details && prescription_details.responseContents) {
        result = prescription_details.responseContents;
      } else {
        result = {};
      }
      return result;

    } catch (ex) {
      return ex;
    }

  };

  const _getPreviousLabData = async (req, res, next) => {
    try {
      let result = {};
      if (!(req.body.encounter_uuid) || (req.body.encounter_uuid) <= 0) {
        return res.status(500).send({
          statusCode: 500,
          code: 500,
          message: "Encounter Id is required..."
        });
      }
      let options = {
        uri: config.wso2LisUrl + 'patientworkorder/getPreviousLabDetails',
        method: "POST",
        headers: {
          Authorization: req.headers.authorization,
          user_uuid: req.headers.user_uuid,
          facility_uuid: req.headers.facility_uuid
        },
        body: {
          "encounter_uuid": req.body.encounter_uuid, 
        },
        json: true
      };
      const lis_details = await rp(options);
      if (lis_details && lis_details.responseContents) {
        result = lis_details.responseContents;
      } else {
        result = {};
      }
      return result;

    } catch (ex) {
      return ex;
    }
  }; 

  const _getPreviousRMISData = async (req, res, next) => {
    try {
      let result = {};
      if (!(req.body.encounter_uuid) || (req.body.encounter_uuid) <= 0) {
        return res.status(500).send({
          statusCode: 500,
          code: 500,
          message: "Encounter Id is required..."
        });
      }
      let options = {
        uri: config.wso2RmisUrl + 'patientworkorder/getPreviousRMISDetails',
        method: "POST",
        headers: {
          Authorization: req.headers.authorization,
          user_uuid: req.headers.user_uuid,
          facility_uuid: req.headers.facility_uuid
        },
        body: {
          "encounter_uuid": req.body.encounter_uuid, 
        },
        json: true
      };
      const rims_details = await rp(options); 
      if (rims_details && rims_details.responseContents) {
        result = rims_details.responseContents;
      } else {
        result = {};
      }
      return result;

    } catch (ex) {
      return ex;
    }
  }; 
  

  const _getEncounterDashboardPatientInfo = async (req, res, next) => {
    try {
      let PostData = req.body;
      let dataJson = {
        encounter_type_id: -1,
        facility_category_id: -1,
        gender_id: -1,
        from_datetime: null,
        to_datetime: null
      };


      if (isNaN(PostData.encounter_type_id) ||
        isNaN(PostData.facility_category_id) ||
        isNaN(PostData.gender_id)) {
        return res.status(400).send({
          code: 400,
          message: " BAD Request..."
        });
      }


      if (!PostData.encounter_type_id || PostData.encounter_type_id < 1) {
        return res.status(400).send({
          code: 400,
          message: " Encounter Type Id is Required..."
        });
      }
      if (!PostData.facility_category_id || PostData.facility_category_id < 1) {
        return res.status(400).send({
          code: 400,
          message: " Facility Category Id is Required..."
        });
      }
      if (!PostData.gender_id || PostData.gender_id < 1) {
        return res.status(400).send({
          code: 400,
          message: " Gender Id is Required..."
        });
      }

      if (PostData.encounter_type_id) dataJson.encounter_type_id = PostData.encounter_type_id;
      if (PostData.facility_category_id) dataJson.facility_category_id = PostData.facility_category_id;
      if (PostData.gender_id) dataJson.gender_id = PostData.gender_id;
      if (PostData.from_datetime) dataJson.from_datetime = PostData.from_datetime;
      if (PostData.to_datetime) dataJson.to_datetime = PostData.to_datetime;

      let dashboard_data = await sequelizeDb.sequelize.query(
        'call sp_total_patient_info(:encounter_type_id,\
         :facility_category_id, :gender_id, :from_datetime ,:to_datetime)', { raw: true, replacements: dataJson, type: Sequelize.QueryTypes.SELECT });
      dashboard_data = Object.values(dashboard_data[0]);
      return res.status(200).send({
        code: httpStatus.OK,
        message: "Fetched Encounter Successfully",
        responseContents: dashboard_data,
      });
    } catch (ex) {
      return res.status(500).send({
        statusCode: 500,
        code: 500,
        message: ex
      });
    }
  }

  const _getEncounterDashboardPatientCount = async (req, res, next) => {
    try {
      let PostData = req.body;
      let dataJson = {
        encounter_type_id: -1,
        from_datetime: null,
        to_datetime: null
      };

      if (isNaN(PostData.encounter_type_id)) {
        return res.status(400).send({
          code: 400,
          message: " BAD Request..."
        });
      }

      if (!PostData.encounter_type_id || PostData.encounter_type_id < 1) {
        return res.status(400).send({
          code: 400,
          message: " Encounter Type Id is Required..."
        });
      }

      if (PostData.encounter_type_id) dataJson.encounter_type_id = PostData.encounter_type_id;
      if (PostData.from_datetime) dataJson.from_datetime = PostData.from_datetime;
      if (PostData.to_datetime) dataJson.to_datetime = PostData.to_datetime;

      let dashboard_data = await sequelizeDb.sequelize.query('call sp_total_patient_count(:encounter_type_id, :from_datetime ,:to_datetime)', { raw: true, replacements: dataJson, type: Sequelize.QueryTypes.SELECT });
      dashboard_data = Object.values(dashboard_data[0]);
      return res.status(200).send({
        code: httpStatus.OK,
        message: "Fetched Encounter Successfully",
        responseContents: dashboard_data,
      });
    } catch (ex) {
      return res.status(500).send({
        statusCode: 500,
        code: 500,
        message: ex
      });
    }
  }

  const _getEncounterByDocAndPatientId = async (req, res) => {
    const { user_uuid, facility_uuid } = req.headers;
    let { patientId, doctorId, from_date, to_date, departmentId, encounterType, } = req.query;

    try {
      const is_mobile_request =
        (doctorId === 0 || doctorId == 0) && (departmentId == 0 || departmentId === 0) &&
        (encounterType == 0 || encounterType === 0);
      if (user_uuid && patientId && is_mobile_request && from_date && to_date) {
        const encounterData = await encounter_tbl.findAll(
          getEncounterQuery(patientId, from_date, to_date)
        );
        return res.status(200).send({
          code: httpStatus.OK,
          message: "Fetched Encounter Successfully",
          responseContents: encounterData,
        });
      } else if (
        user_uuid && patientId && patientId > 0 &&
        doctorId && doctorId > 0 && departmentId && encounterType
      ) {
        encounterType = +(encounterType);
        let encounterData = await encounter_tbl.findAll(
          getActiveEncounterQuery(
            patientId, doctorId, departmentId, encounterType, facility_uuid
          )
        );

        if (encounterData && encounterData.length > 0) {
          encounterData = [encounterData[0]];
        }
        return res.status(200).send({
          code: httpStatus.OK,
          message: "Fetched Encounter Successfully",
          responseContents: encounterData,
        });
      } else {
        return res.status(400).send({
          code: httpStatus[400],
          message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`,
        });
      }
    } catch (ex) {
      console.log(ex);
      return res
        .status(400)
        .send({ code: httpStatus.BAD_REQUEST, message: ex.message });
    }
  };

  const _getEncountersByPatientId = async (req, res) => {
    const { facility_uuid } = req.headers;

    const searchData = req.body;

    /* Validations */
    if (Object.keys(searchData).length == 0) {
      return utils.sendResponse(req, res, "BAD_REQUEST", "BAD_PARAMS");
    }

    let { patient_uuid } = searchData;
    let findQuery = utils.getFindQuery(searchData);

    if (!facility_uuid || !patient_uuid) {
      return res.status(400).send({
        code: httpStatus[400],
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}`,
      });
    }

    Object.assign(findQuery, {
      attributes: ['uuid', 'department_uuid', 'encounter_type_uuid', 'encounter_date', 'created_by'],
      where: {
        patient_uuid,
        facility_uuid,
        is_active: emr_constants.IS_ACTIVE,
        status: emr_constants.IS_ACTIVE,
      },
      include: [
        {
          model: encounter_type_tbl,
          attributes: ["uuid", "code", "name"],
          where: {
            is_active: emr_constants.IS_ACTIVE,
            status: emr_constants.IS_ACTIVE,
          },
        },
      ],
    });
    // console.log('findQuery::', findQuery);

    try {

      const { rows: encounterDatas, count: encounterCount } = await encounter_tbl.findAndCountAll(findQuery);

      if (encounterDatas && encounterDatas.length > 0) {
        const uniqueDoctor = [...new Set(encounterDatas.map(item => item.created_by))];
        const uniqueDepartment = [...new Set(encounterDatas.map(item => item.department_uuid))];
        const { responseContents: userResp } = await requestApi.getResults('userProfile/getSpecificUsersByIds', req, { uuid: uniqueDoctor });
        const { responseContent: deptResp } = await requestApi.getResults('department/getSpecificDepartmentsByIds', req, { uuid: uniqueDepartment });

        var dataresult = encounterDatas.reduce((acc, curr) => {
          const { dataValues: enconterObj } = curr;
          const index = userResp.findIndex(item => item.uuid == enconterObj.created_by);
          const deptindex = deptResp.rows.findIndex(item => item.uuid == enconterObj.department_uuid);

          if (index > -1) {
            enconterObj.doctor_name = userResp[index].first_name;
            enconterObj.department_name = deptindex > -1 ? deptResp.rows[deptindex].name : '';

            acc.push(curr);
          }
          return acc;
        }, []);

      }

      return res.status(200).send({
        code: httpStatus.OK,
        message: "Fetched Encounter(s) Successfully",
        responseContents: dataresult,
        totalRecords: encounterCount
      });

    } catch (ex) {
      console.log(ex);
      return res
        .status(400)
        .send({ code: httpStatus.BAD_REQUEST, message: ex.message });
    }
  };

  const _getEncounterByPatientIdAndVisitdate = async (req, res) => {
    const { user_uuid } = req.headers;
    const { e_patient_uuid, e_encounter_date, is_active_encounter } = req.query;

    try {
      if (
        (user_uuid && e_patient_uuid) ||
        (e_patient_uuid && e_encounter_date)
      ) {
        const encounterData = await vw_encounterDetailsTbl.findAll(
          { attributes: { exclude: ["id", "createdAt", "updatedAt"] } },
          { where: is_active_encounter == 2 }
        );
        return res.status(200).send({
          code: httpStatus.OK,
          message: "Fetched Encounter Successfully",
          responseContents: encounterData,
        });
      } else {
        return res.status(400).send({
          code: httpStatus[400],
          message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`,
        });
      }
    } catch (ex) {
      console.log(ex);
      return res
        .status(400)
        .send({ code: httpStatus.BAD_REQUEST, message: ex.message });
    }
  };

  // Start -- H30-35488 - Need to track is_adult flag encounter wise Service to Service Call  -- Ashok //  
  async function getPatientAgeDetails(user_uuid, authorization, patientId) {
    let options = {
      uri: config.wso2RegisrationUrl + 'patient/getPatientAgeDetailsById',
      method: "POST",
      headers: {
        'Content-type': "application/json",
        Authorization: authorization,
        'accept-language': 'en',
        user_uuid: user_uuid
      },
      body: {
        "patientId": patientId
      },
      json: true
    };
    const patient_age_details = await rp(options);
    return patient_age_details;
  }
  // End -- H30-35488 - Need to track is_adult flag encounter wise Service to Service Call  -- Ashok //  

  const _commonVisitInformation = async (req, res, next) => {
    try {
      let { patient_ids, visit_date, offset, itemsPerPage } = req.body;

      if (!itemsPerPage) itemsPerPage = 10;
      if (!offset) offset = 0;

      let wherecondition = {};
      if (!patient_ids && !visit_date) {
        return res.status(400).send({
          code: 400,
          message: "Request Body Not Found "
        });
      }
      if (visit_date) {
        let visit_date_frm = emr_utility.indiaTz(visit_date).format('YYYY-MM-DD') + ' 00:00:00';
        let visit_date_to = emr_utility.indiaTz(visit_date).format('YYYY-MM-DD') + ' 23:59:59';
        wherecondition = Object.assign(wherecondition, {
          encounter_date: {
            [Op.gte]: visit_date_frm,
            [Op.lte]: visit_date_to
          }
        });
      }
      if (patient_ids) {
        wherecondition = Object.assign(wherecondition, {
          patient_uuid: {
            [Op.in]: patient_ids
          }
        });
      }
      let visit_info = await encounter_tbl.findAndCountAll({
        where: wherecondition,
        offset: offset,
        limit: itemsPerPage,
        group: ['patient_uuid'],
        attributes: ['patient_uuid',
          [Sequelize.fn('MAX', Sequelize.col('encounter_date')), 'visit_date']]
      });
      return res.status(200)
        .send({
          code: 200,
          message: "Fetched Visit info. Successfully",
          totalRecords: visit_info.count.length,
          responseContents: (visit_info.rows) ? visit_info.rows : null,
          statusCode: 200
        });

    } catch (ex) {
      console.log("Exception happened", ex);
      return res
        .status(500)
        .send({ code: httpStatus.INTERNAL_SERVER_ERROR, message: ex });
    }
  }

  // Backup taken by Elumalai
  const _createPatientEncounter_old = async (req, res) => {

    const { user_uuid } = req.headers;
    let { encounter, encounterDoctor } = req.body;

    const isAllReqFieldsInEncIsPres = enc_att.checkRequiredFieldsInEncounter(encounter);
    const isAllReqFieldsInEncDocIsPres = enc_att.checkRequiredFieldsInEncounterDoc(encounterDoctor);

    if (user_uuid && isAllReqFieldsInEncIsPres && isAllReqFieldsInEncDocIsPres && encounterDoctor) {

      let { encounter_type_uuid, patient_uuid, facility_uuid } = encounter;
      const { doctor_uuid, department_uuid } = encounterDoctor;
      const { tat_start_time, tat_end_time } = encounterDoctor;

      encounter_type_uuid = +(encounter_type_uuid);
      if (tat_start_time && tat_end_time) {
        if (!moment(tat_start_time).isValid() || !moment(tat_end_time).isValid()) {
          return res.status(400)
            .send(getSendResponseObject(httpStatus[400], `${emr_constants.PLEASE_PROVIDE} ${emr_constants.VALID_START_DATE} ${emr_constants.OR} ${emr_constants.VALID_END_DATE}`));
        }
      } else {
        return res.status(400)
          .send(getSendResponseObject(httpStatus[400], `${emr_constants.PLEASE_PROVIDE} ${emr_constants.START_DATE} ${emr_constants.OR} ${emr_constants.END_DATE}`));
      }
      try {

        // Assigning
        encounter = enc_att.assignDefaultValuesToEncounter(encounter, user_uuid);
        encounterDoctor = enc_att.assignDefaultValuesToEncounterDoctor(encounterDoctor, encounter, user_uuid);

        let encounterDoctorData, encounterData, is_enc_avail, is_enc_doc_avail;
        encounterData = await getEncounterQueryByPatientId(patient_uuid, encounter_type_uuid, facility_uuid);
        is_enc_avail = encounterData && encounterData.length > 0;
        if (is_enc_avail) {
          encounterDoctorData = await getEncounterDoctorsQueryByPatientId(encounterData[0].uuid, doctor_uuid, department_uuid);
        }

        is_enc_doc_avail = encounterDoctorData && encounterDoctorData.length > 0;
        if (([1, 2, 3].includes(encounter_type_uuid)) && is_enc_avail && is_enc_doc_avail) {
          return res.status(400).send({
            code: httpStatus.BAD_REQUEST, message: emr_constants.DUPLICATE_ENCOUNTER,
            existingDetails: getExisitingEncounterDetails(encounterData, encounterDoctorData),
          });
        }

        let createdEncounter;
        if (!is_enc_avail) {

          // closing all previous active encounters patient
          const encounterUpdate = await encounter_tbl.update(
            enc_att.getEncounterUpdateAttributes(user_uuid),
            enc_att.getEncounterUpdateQuery(patient_uuid, facility_uuid, encounter_type_uuid)
          );
          createdEncounter = await encounter_tbl.create(encounter, { returning: true, });

          // Start -- H30-35488 - Need to track is_adult flag encounter wise  -- Ashok //          
          const patient_age_details_already_exist = await patient_age_details_tbl.count({
            where: {
              encounter_uuid: createdEncounter.uuid
            }
          });
          if (!patient_age_details_already_exist) {
            let patient_age_details = await getPatientAgeDetails(req.headers.user_uuid, req.headers.authorization, createdEncounter.patient_uuid);
            if (patient_age_details
              && patient_age_details.responseContent
              && patient_age_details.responseContent.uuid) {
              patient_age_details = patient_age_details.responseContent;

              try {
                let diffindays = moment(emr_utility.indiaTz()).diff(moment(patient_age_details.dob).toDate(), 'days');
                let age = (diffindays / 365.25);
                patient_age_details.age = Math.round(age);
                patient_age_details.period_uuid = 4;
                if ((diffindays / 365.25) >= 1) {
                  patient_age_details.period_uuid = 4;
                } else if ((diffindays / 365.25) >= 0.1 && (diffindays / 365.25) < 1) {
                  patient_age_details.period_uuid = 3;
                } else if ((diffindays / 365.25) >= 0.001 && (diffindays / 365.25) < 0.1) {
                  patient_age_details.period_uuid = 2;
                }
              } catch (ex) { console.log('age period calculation error :: ', ex); }
              let patient_age_details_data = {
                patient_uuid: createdEncounter.patient_uuid,
                encounter_uuid: createdEncounter.uuid,
                dob: patient_age_details.dob,
                encounter_created_date: createdEncounter.created_date,
                age: patient_age_details.age,
                period_uuid: patient_age_details.period_uuid,
                is_adult: (patient_age_details.age > 12 && patient_age_details.period_uuid == 4) ? 1 : 0,
                status: 1,
                is_active: 1,
                revision: 1,
                created_by: createdEncounter.created_by,
                modified_by: createdEncounter.created_by,
                modified_date: createdEncounter.created_date,
              };
              await patient_age_details_tbl.create(patient_age_details_data, { returning: true, });
            }
          }
          // End -- H30-35488 -- Ashok //

        }
        const encounterId = is_enc_avail && !is_enc_doc_avail ? encounterData[0].uuid : createdEncounter.uuid;
        encounter.uuid = encounterDoctor.encounter_uuid = encounterId;
        // checking for Primary Doctor
        encounterDoctor.is_primary_doctor = !is_enc_avail ? emr_constants.IS_ACTIVE : emr_constants.IS_IN_ACTIVE;

        const createdEncounterDoctorData = await encounter_doctors_tbl.create(encounterDoctor, { returning: true });
        encounterDoctor.uuid = createdEncounterDoctorData.uuid;
        if (emr_config.isBlockChain === 'ON' && emr_config.blockChainURL) {
          encounterBlockChain.createEncounterBlockChain(encounter, encounterDoctor);
        }
        return res.status(200)
          .send({ ...getSendResponseObject(httpStatus.OK, emr_constants.ENCOUNTER_SUCCESS), responseContents: { encounter, encounterDoctor } });

      } catch (ex) {
        console.log(ex);
        return res
          .status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
      }
    } else {
      return res.status(400)
        .send(getSendResponseObject(httpStatus[400], `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}`));
    }
  };


  const _createPatientEncounter = async (req, res) => {

    const { user_uuid } = req.headers;
    let { encounter, encounterDoctor } = req.body;

    const isAllReqFieldsInEncIsPres = enc_att.checkRequiredFieldsInEncounter(encounter);
    const isAllReqFieldsInEncDocIsPres = enc_att.checkRequiredFieldsInEncounterDoc(encounterDoctor);

    if (user_uuid && isAllReqFieldsInEncIsPres && isAllReqFieldsInEncDocIsPres && encounterDoctor) {

      let { encounter_type_uuid, patient_uuid, facility_uuid } = encounter;
      const { doctor_uuid, department_uuid } = encounterDoctor;
      const { tat_start_time, tat_end_time } = encounterDoctor;

      encounter_type_uuid = +(encounter_type_uuid);
      if (tat_start_time && tat_end_time) {
        if (!moment(tat_start_time).isValid() || !moment(tat_end_time).isValid()) {
          return res.status(400)
            .send(getSendResponseObject(httpStatus[400], `${emr_constants.PLEASE_PROVIDE} ${emr_constants.VALID_START_DATE} ${emr_constants.OR} ${emr_constants.VALID_END_DATE}`));
        }
      } else {
        return res.status(400)
          .send(getSendResponseObject(httpStatus[400], `${emr_constants.PLEASE_PROVIDE} ${emr_constants.START_DATE} ${emr_constants.OR} ${emr_constants.END_DATE}`));
      }
      try {

        // Assigning
        encounter = enc_att.assignDefaultValuesToEncounter(encounter, user_uuid);
        encounterDoctor = enc_att.assignDefaultValuesToEncounterDoctor(encounterDoctor, encounter, user_uuid);

        let encounterDoctorData, encounterData, is_enc_avail, is_enc_doc_avail;
        encounterData = await getEncounterQueryByPatientId(patient_uuid, encounter_type_uuid, facility_uuid);
        is_enc_avail = encounterData && encounterData.length > 0;
        if (is_enc_avail) {
          encounterDoctorData = await getEncounterDoctorsQueryByPatientId(encounterData[0].uuid, doctor_uuid, department_uuid);
        }

        is_enc_doc_avail = encounterDoctorData && encounterDoctorData.length > 0;
        if (([1, 2, 3].includes(encounter_type_uuid)) && is_enc_avail && is_enc_doc_avail) {
          return res.status(400).send({
            code: httpStatus.BAD_REQUEST, message: emr_constants.DUPLICATE_ENCOUNTER,
            existingDetails: getExisitingEncounterDetails(encounterData, encounterDoctorData),
          });
        }

        let createdEncounter;
        //#H30-45561 - EMR - Encounter - Session Type Generation Based on the Facility Configuration By Elumalai - Start
        // req.headers.authorization = "Bearer 40a0d4ff-402d-335b-b4c5-323d474b5e6b";
        // req.headers.facility_uuid = "12612";
        const fdata = await requestApi.getResults('facilitySettings/getFacilitySettingByFId', req, { facilityId: facility_uuid });
        var sessionTypeId = 0;
        if (fdata && fdata.statusCode == 200 && fdata.responseContents && Object.keys(fdata.responseContents).length > 0) {
          if (fdata.responseContents.mon_op_start_time && fdata.responseContents.mon_op_end_time
            && fdata.responseContents.Evn_op_start_time && fdata.responseContents.Evn_op_end_time) {
            const date_ob = new Date();

            // current hours
            const hours = date_ob.getHours();

            // current minutes
            const minutes = date_ob.getMinutes();

            // current seconds
            // const seconds = date_ob.getSeconds();

            const currenttime = hours + ':' + minutes + ':00';

            // // OP Morning Start and End Time
            // const op__morning_start1 = fdata.responseContents.mon_op_start_time.split(':');
            // const op_morning_end1 = fdata.responseContents.mon_op_end_time.split(':');
            // const date_opm_start = new Date();
            // date_opm_start.setHours(op__morning_start1[0], op__morning_start1[1], 00);
            // const date_opm_end = new Date();
            // date_opm_end.setHours(op_morning_end1[0], op_morning_end1[1], 00);

            // // OP Evening Start and End Time
            // const op__evening_start1 = fdata.responseContents.mon_op_start_time.split(':');
            // const op_evening_end1 = fdata.responseContents.mon_op_end_time.split(':');
            // const date_op_evening_start = new Date();
            // date_op_evening_start.setHours(op__evening_start1[0], op__evening_start1[1], 00);
            // const date_op_evening_end = new Date();
            // date_op_evening_end.setHours(op_evening_end1[0], op_evening_end1[1], 00);

            if (currenttime >= fdata.responseContents.mon_op_start_time && currenttime <= fdata.responseContents.mon_op_end_time) {
              sessionTypeId = 1; //Morning
            } else if (currenttime >= fdata.responseContents.Evn_op_start_time && currenttime <= fdata.responseContents.Evn_op_end_time) {
              sessionTypeId = 2; //Evening
            } else {
              sessionTypeId = 3; //Casualty
            }
          }
        }
        //#H30-45561 - EMR - Encounter - Session Type Generation Based on the Facility Configuration By Elumalai - End
        
        if (!is_enc_avail) {

          // closing all previous active encounters patient
          const encounterUpdate = await encounter_tbl.update(
            enc_att.getEncounterUpdateAttributes(user_uuid),
            enc_att.getEncounterUpdateQuery(patient_uuid, facility_uuid, encounter_type_uuid)
          );

          //#40403 - Changes for Department Visit Type By Elumalai - Start
          var deptVisit = await encounter_tbl.findAll({
            where: {
              facility_uuid: facility_uuid,
              department_uuid: department_uuid,
              patient_uuid: patient_uuid,
              is_active: 1,
              status: 1
            },
            required: false
          });
          //#40403 - Changes for Department Visit Type By Elumalai - End     

          createdEncounter = await encounter_tbl.create(encounter, { returning: true, });

          // Start -- H30-35488 - Need to track is_adult flag encounter wise  -- Ashok //          
          const patient_age_details_already_exist = await patient_age_details_tbl.count({
            where: {
              encounter_uuid: createdEncounter.uuid
            }
          });
          if (!patient_age_details_already_exist) {
            let patient_age_details = await getPatientAgeDetails(req.headers.user_uuid, req.headers.authorization, createdEncounter.patient_uuid);
            if (patient_age_details
              && patient_age_details.responseContent
              && patient_age_details.responseContent.uuid) {
              patient_age_details = patient_age_details.responseContent;

              try {
                let diffindays = moment(emr_utility.indiaTz()).diff(moment(patient_age_details.dob).toDate(), 'days');
                let age = (diffindays / 365.25);
                patient_age_details.age = Math.round(age);
                patient_age_details.period_uuid = 4;
                if ((diffindays / 365.25) >= 1) {
                  patient_age_details.period_uuid = 4;
                } else if ((diffindays / 365.25) >= 0.1 && (diffindays / 365.25) < 1) {
                  patient_age_details.period_uuid = 3;
                } else if ((diffindays / 365.25) >= 0.001 && (diffindays / 365.25) < 0.1) {
                  patient_age_details.period_uuid = 2;
                }
              } catch (ex) { console.log('age period calculation error :: ', ex); }
              let patient_age_details_data = {
                patient_uuid: createdEncounter.patient_uuid,
                encounter_uuid: createdEncounter.uuid,
                dob: patient_age_details.dob,
                encounter_created_date: createdEncounter.created_date,
                age: patient_age_details.age,
                period_uuid: patient_age_details.period_uuid,
                is_adult: (patient_age_details.age > 12 && patient_age_details.period_uuid == 4) ? 1 : 0,
                status: 1,
                is_active: 1,
                revision: 1,
                created_by: createdEncounter.created_by,
                modified_by: createdEncounter.created_by,
                modified_date: createdEncounter.created_date,
              };
              await patient_age_details_tbl.create(patient_age_details_data, { returning: true, });
            }
          }
          // End -- H30-35488 -- Ashok //

        }
        const encounterId = is_enc_avail && !is_enc_doc_avail ? encounterData[0].uuid : createdEncounter.uuid;
        encounter.uuid = encounterDoctor.encounter_uuid = encounterId;
        // checking for Primary Doctor
        encounterDoctor.is_primary_doctor = !is_enc_avail ? emr_constants.IS_ACTIVE : emr_constants.IS_IN_ACTIVE;

        //#40403 - Changes for Department Visit Type By Elumalai - Start
        if (deptVisit && deptVisit.length > 0) {
          encounterDoctor.dept_visit_type_uuid = 2;
        }
        //#40403 - Changes for Department Visit Type By Elumalai - End

        //#H30-45561 - EMR - Encounter - Session Type Generation Based on the Facility Configuration By Elumalai - Start
        encounterDoctor.session_type_uuid = sessionTypeId;
        //#40403 - EMR - Encounter - Session Type Generation Based on the Facility Configuration By Elumalai - End

        const createdEncounterDoctorData = await encounter_doctors_tbl.create(encounterDoctor, { returning: true });
        encounterDoctor.uuid = createdEncounterDoctorData.uuid;
        if (emr_config.isBlockChain === 'ON' && emr_config.blockChainURL) {
          encounterBlockChain.createEncounterBlockChain(encounter, encounterDoctor);
        }
        return res.status(200)
          .send({ ...getSendResponseObject(httpStatus.OK, emr_constants.ENCOUNTER_SUCCESS), responseContents: { encounter, encounterDoctor } });

      } catch (ex) {
        console.log(ex);
        return res
          .status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
      }
    } else {
      return res.status(400)
        .send(getSendResponseObject(httpStatus[400], `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}`));
    }
  };

  const _getVisitHistoryByPatientId = async (req, res) => {
    let { page_no, page_size } = req.query;
    const { patientId } = req.query;

    if (patientId && !isNaN(+patientId) && page_no && !isNaN(+page_no)) {
      try {
        const mockJson = emr_mock_json.patientVisitHistoryJson.sort((a, b) => {
          return new Date(b.encounter_date) - new Date(a.encounter_date);
        });
        let visit_history = [];
        if (+page_no === 0 && +page_size === 10) {
          visit_history = mockJson.slice(0, 10);
        } else if (+page_no === 1 && +page_size === 10) {
          visit_history = mockJson.slice(10, 20);
        }
        return res.status(200).send({
          code: 200,
          message: "Records Fetched Successfully",
          response_content: {
            total_records: mockJson.length,
            total_pages: 2,
            current_page: +page_no + 1,
            visit_history,
            responseContentLength: visit_history.length,
          },
        });
      } catch (ex) {
        console.log(ex);
        return res
          .status(400)
          .send({ code: httpStatus.BAD_REQUEST, message: ex.message });
      }
    } else {
      return res.status(400).send({
        code: httpStatus[400],
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`,
      });
    }
  };

  const _deleteEncounterById = async (req, res) => {
    const { user_uuid } = req.headers;
    const { encounterId } = req.query;

    if (user_uuid && encounterId && !isNaN(+encounterId)) {

      let encounterPromise = [];
      try {
        // enDelTransaction = await sequelizeDb.sequelize.transaction();
        encounterPromise = [
          ...encounterPromise,
          encounter_tbl.update(
            { is_active_encounter: emr_constants.IS_IN_ACTIVE, is_active: emr_constants.IS_IN_ACTIVE, status: emr_constants.IS_IN_ACTIVE },
            { where: { uuid: encounterId } }
          ),
          encounter_doctors_tbl.update(
            { encounter_doctor_status: emr_constants.IS_IN_ACTIVE, is_active: emr_constants.IS_IN_ACTIVE, status: emr_constants.IS_IN_ACTIVE },
            { where: { encounter_uuid: encounterId } }
          ),
        ];

        let deleteEnPromise = await Promise.all(encounterPromise);
        deleteEnPromise = [].concat.apply([], deleteEnPromise);
        const isAllDeleted = deleteEnPromise.every(d => d === 1);

        const responseMessage = isAllDeleted ? emr_constants.UPDATED_ENC_SUCCESS : emr_constants.NO_RECORD_FOUND;
        if (emr_config.isBlockChain === 'ON' && emr_config.blockChainURL) {
          encounterBlockChain.deleteEncounterBlockChain(+(encounterId));
        }

        return res.status(200)
          .send({ code: httpStatus.OK, message: responseMessage });
      } catch (ex) {
        console.log(ex);
        return res.status(400)
          .send({ code: httpStatus.BAD_REQUEST, message: ex.message });
      }
    } else {
      return res.status(400).send({
        code: httpStatus[400],
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`,
      });
    }
  };

  const _updateECdischarge = async (req, res) => {
    const { user_uuid } = req.headers;
    const { discharge_type_uuid, discharge_date, is_active_encounter = 0 } = req.body;
    const { facility_uuid, patient_uuid, encounter_type_uuid, encounter_uuid } = req.body;
    const ec_updateData = {
      discharge_type_uuid: discharge_type_uuid,
      discharge_date: discharge_date,
      modified_by: user_uuid,
      modified_date: new Date(),
      is_active_encounter: is_active_encounter
    };
    try {
      if (user_uuid && req.body) {
        const ec_updated = await encounter_tbl.update(ec_updateData, {
          where: {
            facility_uuid: facility_uuid,
            uuid: encounter_uuid,
            patient_uuid: patient_uuid,
            encounter_type_uuid: encounter_type_uuid,
          },
        });
        if (ec_updated) {
          return res
            .status(200)
            .send({ code: httpStatus[200], message: "updated sucessfully" });
        }
      } else {
        return res
          .status(400)
          .send({ code: httpStatus[400], message: "No Request Body Found" });
      }
    } catch (ex) {
      console.log(ex);
      return res
        .status(400)
        .send({ code: httpStatus.BAD_REQUEST, message: ex.message });
    }
  };

  const _updateTATTimeInEncounterDoctor = async (req, res) => {
    const { user_uuid } = req.headers;

    const { encounterDoctorId, tat_end_time } = req.body;

    const isValidEndTime = moment(tat_end_time).isValid();
    if (user_uuid && encounterDoctorId && isValidEndTime) {
      try {
        const updatedEncounter = await encounter_doctors_tbl.update(
          {
            tat_end_time: tat_end_time,
            modified_by: user_uuid,
            modified_date: new Date(),
          },
          {
            where: { uuid: encounterDoctorId },
          }
        );

        const returnMessage =
          updatedEncounter[0] === 1
            ? emr_constants.UPDATED_ENC_DOC_TAT_TIME
            : emr_constants.NO_CONTENT_MESSAGE;
        return res.status(200).send({
          code: httpStatus.OK,
          message: returnMessage,
        });
      } catch (ex) {
        console.log(ex);
        return res
          .status(400)
          .send({ code: httpStatus.BAD_REQUEST, message: ex.message });
      }
    } else {
      return res.status(400).send({
        code: httpStatus[400],
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.PLEASE_PROVIDE} ${emr_constants.END_DATE}`,
      });
    }
  };

  const _getPatientDoc = async (req, res) => {
    const { user_uuid } = req.headers;
    const { patient_uuid, enc_uuid } = req.query;

    try {
      if (user_uuid && patient_uuid) {
        let wher_con = { ed_patient_uuid: patient_uuid };
        if (enc_uuid) {
          wher_con.ed_encounter_uuid = enc_uuid;
        }
        const docList = await vw_patientdoc.findAll({
          // attributes: { exclude: ["id", "createdAt", "updatedAt"] },
          attributes: ['ed_patient_uuid', 'ed_encounter_uuid', 'ed_doctor_uuid', 'ed_department_uuid', 'ed_is_active', 'ed_status', 'ed_created_date', 't_uuid', 't_name', 'u_uuid', 'u_first_name', 'u_middle_name', 'u_last_name', 'd_uuid', 'd_name'],
          where: wher_con
          //group: ['ed_created_date']
        });
        if (docList) {
          //const getdepdetails = await getdepDetails(user_uuid, docList[0].department_uuid, req.headers.authorization);
          //const getuDetails = await getuserDetails(user_uuid,docList[0].doctor_uuid, req.headers.authorization);
          return res
            .status(httpStatus.OK)
            .json({ statusCode: 200, req: "", responseContents: docList });
        } else {
          return res.status(400).send({
            code: httpStatus[400],
            message: "patient information not found",
          });
        }
      } else {
        return res.status(400).send({
          code: httpStatus[400],
          message: "No Request Body or Search key Found ",
        });
      }
    } catch (ex) {
      const errorMsg = ex.errors ? ex.errors[0].message : ex.message;
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ status: "error", msg: errorMsg });
    }
  };

  const _closeEncounter = async (req, res) => {
    const { user_uuid } = req.headers;
    const { encounterId } = req.query;

    if (user_uuid && emr_utility.isNumberValid(encounterId)) {
      try {
        const updateVal = {
          is_active: emr_constants.IS_IN_ACTIVE,
          modified_by: user_uuid,
          is_active_encounter: emr_constants.IS_IN_ACTIVE,
        };
        const updateEncQuery = {
          where: { uuid: encounterId },
        };
        const updateEncDocQuery = {
          where: { encounter_uuid: encounterId },
        };
        let encPromise = [];
        encPromise = [
          ...encPromise,
          encounter_tbl.update(updateVal, updateEncQuery),
          encounter_doctors_tbl.update(updateVal, updateEncDocQuery),
        ];
        const encounterPromise = await Promise.all(encPromise);
        const responseCode =
          encounterPromise[0][0] === 1 ? httpStatus.OK : httpStatus.NO_CONTENT;
        const responseMessage =
          encounterPromise[0][0] === 1
            ? emr_constants.ENCOUNTER_CLOSED_SUCCESS
            : emr_constants.NO_RECORD_FOUND;
        return res.status(200).send({
          code: responseCode,
          message: responseMessage,
        });
      } catch (ex) {
        console.log("Exception happened", ex);
        return res
          .status(500)
          .send({ code: httpStatus.INTERNAL_SERVER_ERROR, message: ex });
      }
    } else {
      return res.status(400).send({
        code: httpStatus[400],
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}`,
      });
    }
  };

  const _getLatestEncounterByPatientId = async (req, res) => {
    const { user_uuid } = req.headers;
    const { patientId, encounterTypeId } = req.query;

    if (
      emr_utility.isNumberValid(patientId) &&
      emr_utility.isNumberValid(encounterTypeId) &&
      user_uuid
    ) {
      try {
        const latestEncounterRecord = await vw_latest_encounter.findAll({
          attributes: enc_att.getLatestEncounterAttributes(),
          where: enc_att.getLatestEncounterQuery(patientId, encounterTypeId),
          order: [["ed_uuid", "desc"]],
        });

        const {
          responseCode,
          responseMessage,
        } = enc_att.getLatestEncounterResponse(latestEncounterRecord);
        return res.status(200).send({
          code: responseCode,
          message: responseMessage,
          responseContents: enc_att.modifiedLatestEncounterRecord(
            latestEncounterRecord
          )[0],
        });
      } catch (error) {
        console.log(error);

        return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
          code: httpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        });
      }
    } else {
      return res.status(400).send({
        code: httpStatus[400],
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`,
      });
    }
  };

  const _createEncounterBulk = async (req, res) => {
    const { user_uuid } = req.headers;
    const encounters = req.body;

    let encs = [], encDocs = [];
    const isEncs = encounters && Array.isArray(encounters) && encounters.length > 0;
    if (isEncs) {
      encs = encounters.map((e) => e.encounter);
      encDocs = encounters.map((e) => e.encounterDoctor);

      if (encDocs.length !== encs.length) {
        return res.status(400).send({
          code: httpStatus[400], message: 'Please Provide Proper Encounter List'
        });
      }
    }

    const {
      isEncTypeId,
      isEncPatId,
      isEncDeptId,
      isEncDocttId,
      isEncDocDeptId,
    } = enc_att.checkingAllRequiredFields(encs, encDocs);

    if (
      user_uuid &&
      isEncs &&
      isEncTypeId &&
      isEncPatId &&
      isEncDeptId &&
      isEncDocttId &&
      isEncDocDeptId
    ) {
      try {

        encs.forEach((e) => {
          e = emr_utility.createIsActiveAndStatus(e, user_uuid);
          e.is_active_encounter = emr_constants.IS_ACTIVE;
          e.encounter_date = new Date();
        });

        const createdEncounter = await encounter_tbl.bulkCreate(encs, { returning: true });

        encDocs.forEach((e, idx) => {
          e = emr_utility.createIsActiveAndStatus(e, user_uuid);
          e.encounter_uuid = createdEncounter[idx] && createdEncounter[idx].uuid || 0;
          e.patient_uuid = createdEncounter[idx] && createdEncounter[idx].patient_uuid || 0;
        });
        const createdEncounterDoctor = await encounter_doctors_tbl.bulkCreate(encDocs, { returning: true });



        return res.status(200).send({
          code: httpStatus.OK,
          message: "Inserted Encounters Successfully",
          requestedContents: encounters,
          responseContents: createdEncounter.map((cE, idx) => {
            return { encounters: cE, encounterDoctor: createdEncounterDoctor[idx] };
          }),
        });

      } catch (ex) {
        console.log(ex);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
          code: httpStatus.INTERNAL_SERVER_ERROR,
          message: ex.message,
        });
      }
    } else {
      const message = enc_att.createEncounterBulk400Message(isEncs, isEncTypeId, isEncPatId, isEncDeptId,
        isEncDocttId,
        isEncDocDeptId);

      return res.status(400).send({
        code: httpStatus[400],
        message
      });
    }
  };

  const _getEncounterByAdmissionId = async (req, res) => {
    const { user_uuid } = req.headers;

    const { admission_id } = req.query;

    if (user_uuid && emr_utility.isNumberValid(admission_id)) {
      try {
        const encounterData = await encounter_tbl.findAll(enc_att.getEncounterByAdmissionQuery(admission_id));
        return res.status(200).send(
          {
            code: httpStatus.OK,
            message: "Fetched Encounter Successfully",
            responseContents: encounterData,
          });
      } catch (ex) {
        console.log(ex);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
          code: httpStatus.INTERNAL_SERVER_ERROR,
          message: ex.message,
        });
      }
    } else {
      return res.status(400).send({
        code: httpStatus[400],
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`,
      });
    }
  };

  const _updateEcounterById = async (req, res) => {
    try {
      const postData = req.body;
      let dataJson = {};

      if (postData.admission_uuid && /\S/.test(postData.admission_uuid)) {
        dataJson.admission_uuid = postData.admission_uuid;
      } else {
        return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
          status: 'error',
          statusCode: httpStatus.UNPROCESSABLE_ENTITY,
          msg: 'Failed to update admission/ admission request'
        })
      }

      dataJson.admission_request_uuid = postData.admission_request_uuid ? postData.admission_request_uuid : 0

      let data = await encounter_tbl.update(dataJson, {
        where: {
          uuid: postData.encounter_uuid
        }
      });

      return res.status(httpStatus.OK).json({
        status: 'success',
        statusCode: httpStatus.OK,
        msg: 'Encounter admission/ admission request updated successfully',
        responseContents: data
      })
    } catch (err) {
      let errorMsg = err.errors ? err.errors[0].message : err.message;
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        msg: 'Failed to update admission/ admission request',
        actual: errorMsg
      })
    }
  };

  const getEncountersByPatientIdsAndDate = async (req, res) => {
    const { facility_uuid } = req.headers;

    const searchData = req.body;

    /* Validations */
    if (Object.keys(searchData).length == 0) {
      return utils.sendResponse(req, res, "BAD_REQUEST", "BAD_PARAMS");
    }

    let { patient_uuids, department_uuid, encounterDate } = searchData;

    if (!facility_uuid || !patient_uuids) {
      return res.status(400).send({
        code: httpStatus[400],
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}`,
      });
    }

    const encounterDateQuery = Sequelize.where(
      Sequelize.fn('date', Sequelize.col('encounter_date')),
      '=',
      encounterDate
    );

    let findQuery = {
      attributes: ['uuid', 'patient_uuid', 'encounter_date'],
      where: {
        patient_uuid: {
          [Op.in]: patient_uuids
        },
        encounterDateQuery,
        facility_uuid,
        department_uuid,
        // is_active_encounter: emr_constants.IS_ACTIVE,
      }
    };

    try {

      const { rows: encounterDatas, count: encounterCount } = await encounter_tbl.findAndCountAll(findQuery);

      return res.status(200).send({
        code: httpStatus.OK,
        message: "Fetched Encounter(s) Successfully",
        responseContents: encounterDatas,
        totalRecords: encounterCount
      });

    } catch (ex) {
      console.log(ex);
      return res
        .status(400)
        .send({ code: httpStatus.BAD_REQUEST, message: ex.message });
    }
  };

  return {
    getEncountersByPatientId: _getEncountersByPatientId,
    getEncounterByDocAndPatientId: _getEncounterByDocAndPatientId,
    commonVisitInformation: _commonVisitInformation,
    createPatientEncounter: _createPatientEncounter,
    getVisitHistoryByPatientId: _getVisitHistoryByPatientId,
    deleteEncounterById: _deleteEncounterById,
    updateECdischarge: _updateECdischarge,
    updateTATTimeInEncounterDoctor: _updateTATTimeInEncounterDoctor,
    getPatientDoc: _getPatientDoc,
    closeEncounter: _closeEncounter,
    getEncounterByPatientIdAndVisitdate: _getEncounterByPatientIdAndVisitdate,
    getLatestEncounterByPatientId: _getLatestEncounterByPatientId,
    createEncounterBulk: _createEncounterBulk,
    getEncounterByAdmissionId: _getEncounterByAdmissionId,
    updateEcounterById: _updateEcounterById,
    getEncounterDashboardPatientCount: _getEncounterDashboardPatientCount,
    getEncounterDashboardPatientInfo: _getEncounterDashboardPatientInfo,
    getEncountersByPatientIdsAndDate,
    getOldVisitInformation: _getOldVisitInformation,
    getOldHistoryInfo: _getOldHistoryInfo,

  };
};

module.exports = Encounter();

function getEncountersInfo(patient_uuid) {
  return {
    where: {
      patient_uuid,
      is_active: emr_constants.IS_ACTIVE,
      status: emr_constants.IS_ACTIVE,
    },
    include: [
      {
        model: encounter_type_tbl,
        attributes: ["uuid", "code", "name"],
        where: {
          is_active: emr_constants.IS_ACTIVE,
          status: emr_constants.IS_ACTIVE,
        },
      },
    ],
  };
}

function getEncounterQuery(pId, from_date, to_date) {
  return {
    where: {
      patient_uuid: pId,
      encounter_date: {
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn("date", Sequelize.col("encounter_date")),
            ">=",
            moment(from_date).format("YYYY-MM-DD")
          ),
          Sequelize.where(
            Sequelize.fn("date", Sequelize.col("encounter_date")),
            "<=",
            moment(to_date).format("YYYY-MM-DD")
          ),
        ],
      },
      is_active_encounter: emr_constants.IS_ACTIVE,
      is_active: emr_constants.IS_ACTIVE,
      status: emr_constants.IS_ACTIVE,
    },
    include: [
      {
        model: encounter_type_tbl,
        attributes: ["uuid", "code", "name"],
        where: {
          is_active: emr_constants.IS_ACTIVE,
          status: emr_constants.IS_ACTIVE,
        },
      },
    ],
  };
}

async function getEncounterQueryByPatientId(pId, etypeId, fId) {
  let query = {
    order: [["uuid", "desc"]],
    where: {
      patient_uuid: pId,
      is_active_encounter: emr_constants.IS_ACTIVE,
      is_active: emr_constants.IS_ACTIVE,
      status: emr_constants.IS_ACTIVE,
      encounter_type_uuid: etypeId,
      facility_uuid: fId,
    },
  };
  if (etypeId === 1) {
    query.where[Op.and] = [
      Sequelize.where(
        Sequelize.fn("date", Sequelize.col("encounter_date")),
        ">=",
        moment().format("YYYY-MM-DD")
      ),
      Sequelize.where(
        Sequelize.fn("date", Sequelize.col("encounter_date")),
        "<=",
        moment().format("YYYY-MM-DD")
      ),
    ];
  }
  return encounter_tbl.findAll(query);
}

async function getEncounterDoctorsQueryByPatientId(enId, dId, deptId) {
  return encounter_doctors_tbl.findAll({
    attributes: ["uuid", "doctor_uuid"],
    where: {
      doctor_uuid: dId,
      department_uuid: deptId,
      is_active: emr_constants.IS_ACTIVE,
      status: emr_constants.IS_ACTIVE,
      encounter_uuid: enId,
    },
  });
}

const getExisitingEncounterDetails = (encounter, encounterDoctor) => {
  return {
    encounter_id: (encounter && encounter[0].uuid) || 0,
    encounter_doctor_id:
      (encounterDoctor && encounterDoctor[0].uuid) || 0,
  };
};

const getSendResponseObject = (code, message) => {
  return {
    code,
    message
  };
};


