//Package import 
const httpStatus = require('http-status');
const moment = require('moment');
var Sequelize = require('sequelize');
//Sequlize Import 
const sequelizeDb = require('../config/sequelize');
var Op = Sequelize.Op;
const emr_utility = require('../services/utility.service');

const rp = require('request-promise');

//Intialize Tables
const patient_chief_complaints_tbl = sequelizeDb.patient_chief_complaints;
const chief_complaints_tbl = sequelizeDb.chief_complaints;
const patient_diagnosis_tbl = sequelizeDb.patient_diagnosis;
const diagnosis_tbl = sequelizeDb.diagnosis;


const emr_constants = require("../config/constants");

const EmrDashBoard = () => {
  /**
   * @param {*} req
   * @param {*} res
   */


  const _getDashBoard = async (req, res) => {
    const { user_uuid } = req.headers;
    const { depertment_Id, from_date, to_date, gender } = req.query;
    let patient_uuids = [];

    let filterQuery = {
      encounter_doctor_uuid: user_uuid,
      status: emr_constants.IS_ACTIVE,
      is_active: emr_constants.IS_ACTIVE,
      department_uuid: depertment_Id,
    };

    if (!user_uuid) {
      return res.status(400).send({ code: httpStatus.UNAUTHORIZED, message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}` });
    }
    try {

      if (gender) {
        const alldiag = await getDiagnosis(filterQuery, Sequelize);
        const allcomp = await getComplaints(filterQuery, Sequelize);

        var PData = Object.keys(alldiag).map(key => {
          let matchdata = alldiag[key];
          matchdata = matchdata.patient_uuid;

          return matchdata;
        });

        var CData = Object.keys(allcomp).map(key => {
          let matchdata = allcomp[key];
          matchdata = matchdata.patient_uuid;

          return matchdata;
        });

        const allpatients = await getallpatientdetials(user_uuid, req.headers.authorization, PData);
        const allpatientsC = await getallpatientdetials(user_uuid, req.headers.authorization, CData);
        const diag_gender = gettopdiagnosis_gender(allpatients.responseContents, alldiag, gender);
        const comp_gender = gettopcomp_gender(allpatientsC.responseContents, allcomp, gender);
        return res.status(200).send({ code: httpStatus.OK, message: 'Fetched Successfully', responseContents: { "Top_Complaints": comp_gender, "Top_Diagnosis": diag_gender } });

      } else {
        //console.log("----------------");
        const topComplaints = await getComplaints(filterQuery, Sequelize);
        const topDiagnosis = await getDiagnosis(filterQuery, Sequelize);
        return res.status(200).send({ code: httpStatus.OK, message: 'Fetched Successfully', responseContents: { "Top_Complaints": gettopcomp(topComplaints), "Top_Diagnosis": gettopdiag(topDiagnosis) } });
      }

    } catch (ex) {
      //console.log(ex);
      return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex });
    }
  };
  return {
    getDashBoard: _getDashBoard
  };
};

module.exports = EmrDashBoard();

async function getallpatientdetials(user_uuid, authorization, PData) {
  //console.log(authorization);
  let options = {
    //uri: config.wso2AppUrl + 'department/getDepartmentOnlyById',
    uri: 'https://qahmisgateway.oasyshealth.co/DEVregistration/v1/api/patient/getById',
    method: 'POST',
    headers: {
      "Authorization": authorization,
      "user_uuid": user_uuid,
      "accept-language": "en"
    },
    body: {
      "patientId": PData
    },
    json: true
  };
  const dep_details = await rp(options);
  return dep_details;
}

async function getComplaints(filterQuery, Sequelize) {
  return patient_chief_complaints_tbl.findAll({
    include: [{
      model: chief_complaints_tbl,
      attributes: ['uuid', 'code', 'name'],
    }],
    where: filterQuery,
    group: ['chief_complaint_uuid'],
    attributes: ['uuid', 'patient_uuid', 'encounter_doctor_uuid', 'chief_complaint_uuid',
      [Sequelize.fn('COUNT', Sequelize.col('chief_complaint_uuid')), 'Count']
    ],
    order: [[Sequelize.fn('COUNT', Sequelize.col('chief_complaint_uuid')), 'DESC']],
    limit: 10
  });

}

async function getDiagnosis(filterQuery, Sequelize) {
  return patient_diagnosis_tbl.findAll({
    include: [{
      model: diagnosis_tbl,
      attributes: ['code', 'name'],
    }],
    where: filterQuery,
    require: false,
    group: ['diagnosis_uuid'],
    attributes: ['uuid', 'diagnosis_uuid', 'encounter_doctor_uuid', 'patient_uuid', 'other_diagnosis',
      [Sequelize.fn('COUNT', Sequelize.col('diagnosis_uuid')), 'Count']
    ],
    order: [[Sequelize.fn('COUNT', Sequelize.col('diagnosis_uuid')), 'DESC']],
    limit: 10

  });

}

function gettopdiag(responseData) {

  return responseData.map(rD => {
    return {
      Count: rD.dataValues.Count,
      diagnosis_name: rD.diagnosis && rD.diagnosis.name ? rD.diagnosis.name : rD.other_diagnosis,
      diagnosis_code: rD.diagnosis && rD.diagnosis.code ? rD.diagnosis.code : rD.diagnosis_uuid,
    };
  });
}

function gettopcomp(responseData) {
  return responseData.map(rD => {
    return {
      Count: rD.dataValues.Count,
      chiefcomplaint_name: rD.chief_complaint.name,
      chiefcomplaint_code: rD.chief_complaint.code
    };
  });
}

function gettopdiagnosis_gender(allpatients, topDiagnosis, gender) {

  //console.log ("gender --------",gender);

  let genderdata = [];
  for (let td of topDiagnosis) {
    for (let ap of allpatients) {
      //console.log(td.patient_uuid, ap.uuid, ap.gender_details.uuid, gender);
      if (td.patient_uuid == ap.uuid && ap.gender_details.uuid == gender) {
        //console.log(td.patient_uuid, ap.uuid, ap.gender_details.uuid, gender);
        genderdata = [...genderdata,
        {
          patient_gender: ap.gender_details.name,
          //patient_diagnosis_id: td.uuid || 0,
          Count: td.dataValues.Count,
          diagnosis_name: td.diagnosis && td.diagnosis.name ? td.diagnosis.name : td.other_diagnosis,
          diagnosis_code: td.diagnosis && td.diagnosis.code ? td.diagnosis.code : td.diagnosis_uuid,

        }
        ];
      }
    }
  }
  return genderdata;

}

function gettopcomp_gender(allpatients, topcomp, gender) {

  //console.log ("gender --------",gender);

  let genderdata = [];
  for (let td of topcomp) {
    for (let ap of allpatients) {
      //console.log(td.patient_uuid, ap.uuid, ap.gender_details.uuid, gender);
      if (td.patient_uuid == ap.uuid && ap.gender_details.uuid == gender) {
        //console.log(td.patient_uuid, ap.uuid, ap.gender_details.uuid, gender);
        genderdata = [...genderdata,
        {
          patient_gender: ap.gender_details.name,
          //patient_diagnosis_id: td.uuid || 0,
          Count: td.dataValues.Count,
          chiefcomplaint_name: td.chief_complaint.name,
          chiefcomplaint_code: td.chief_complaint.code
        }
        ];
      }
    }
  }
  return genderdata;

}


//patient search url
//https://qahmisgateway.oasyshealth.co/DEVregistration/v1/api/patient/search