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
    const { depertment_Id, from_date, to_date, gender} = req.query;

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
      const allpatients = await getallpatientdetials(user_uuid, req.headers.authorization);

      const topComplaints = await getTopComplaints(filterQuery, Sequelize);
      //const topDiagnosis = await getTopDiagnosis(filterQuery, Sequelize);
      const topDiagnosis = await getDiagnosis(filterQuery, Sequelize);
      

      if (gender)
      {
        const diag_gender = gettopdiagnosis_gender(allpatients, topDiagnosis, gender);
      }
      // if (topDiagnosis )
      // {
      //   const diagcount = gettopdiag(topDiagnosis);
      // }
      return res.status(200).send({ code: httpStatus.OK, message: 'Fetched Successfully', responseContents: { "TopComplaints": topComplaints, "TopDiagnosis": diag_gender, "All_Patients": allpatients.responseContents } });
      //return res.status(200).send({ code: httpStatus.OK, message: 'Fetched Successfully', responseContents: { "TopComplaints": topComplaints, "TopDiagnosis": gettopdiag(topDiagnosis), "All_Patients": allpatients.responseContents } });
    } catch (ex) {
      return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex });
    }
  };
  return {
    getDashBoard: _getDashBoard
  };
};

module.exports = EmrDashBoard();

async function getTopComplaints(filterQuery, Sequelize) {
  return patient_chief_complaints_tbl.findAll({
    include: [{
      model: chief_complaints_tbl,
      attributes: ['uuid', 'name'],
    }],
    where: filterQuery,
    group: ['chief_complaint_uuid'],
    attributes: ['uuid', 'encounter_doctor_uuid', 'chief_complaint_uuid',
      [Sequelize.fn('COUNT', Sequelize.col('chief_complaint_uuid')), 'Count']
    ],
    order: [[Sequelize.fn('COUNT', Sequelize.col('chief_complaint_uuid')), 'DESC']],
    limit: 10
  });

}

async function getTopDiagnosis(filterQuery, Sequelize) {
  return patient_diagnosis_tbl.findAll({
    include: [{
      model: diagnosis_tbl,
      attributes: ['code', 'name'],
    }],
    where: filterQuery,
    require: false,
    group: ['diagnosis_uuid'],
    attributes: ['diagnosis_uuid', 'encounter_doctor_uuid', 'patient_uuid'
    [Sequelize.fn('COUNT', Sequelize.col('diagnosis_uuid')), 'Count']
    ],
    order: [[Sequelize.fn('COUNT', Sequelize.col('diagnosis_uuid')), 'DESC']],
    limit: 10

  });
}

async function getdepDetails(user_uuid, depid, authorization) {
  //console.log(depid);
  let options = {
    //uri: config.wso2AppUrl + 'department/getDepartmentOnlyById',
    uri: 'https://qahmisgateway.oasyshealth.co/DEVAppmaster/v1/api/department/getDepartmentOnlyById',
    //uri: 'https://qahmisgateway.oasyshealth.co/DEVAppmaster/v1/api/department/getAllDepartments',
    method: 'POST',
    headers: {
      "Authorization": authorization,
      "user_uuid": user_uuid
    },
    body: { "uuid": depid },
    json: true
  };
  const dep_details = await rp(options);
  return dep_details;
}


async function getallpatientdetials(user_uuid, authorization) {
  console.log(authorization);
  let options = {
    //uri: config.wso2AppUrl + 'department/getDepartmentOnlyById',
    uri: 'https://qahmisgateway.oasyshealth.co/DEVregistration/v1/api/patient/search',
    method: 'POST',
    headers: {
      "Authorization": authorization,
      "user_uuid": user_uuid,
      "accept-language": "en"
    },
    body: {
      "pageNo": 1,
      "paginationSize": 100
    },
    json: true
  };
  const dep_details = await rp(options);
  return dep_details;
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
    attributes: ['uuid','diagnosis_uuid', 'encounter_doctor_uuid', 'patient_uuid', 'other_diagnosis',
    [Sequelize.fn('COUNT', Sequelize.col('diagnosis_uuid')), 'Count']
    ],
    order: [[Sequelize.fn('COUNT', Sequelize.col('diagnosis_uuid')), 'DESC']],
    limit: 10

  });
  
}

function gettopdiag(responseData){

  return responseData.map(rD => {
    return {
      patient_diagnosis_id: rD.uuid || 0,
      Count: rD.dataValues.Count,
      diagnosis_name: rD.diagnosis && rD.diagnosis.name ? rD.diagnosis.name : rD.other_diagnosis,
      diagnosis_code: rD.diagnosis && rD.diagnosis.code ? rD.diagnosis.code : rD.diagnosis_uuid,
      

    };
  });
}

function gettopdiagnosis_gender(allpatients, topDiagnosis, gender)
{

  console.log ("gender diagnosis");
  let genderdata = [];
for (let td of topDiagnosis){
  for (let ap of allpatients){
    
    if (td.patient_uuid === ap.uuid && ap.gender_details.uuid === gender){
      genderdata = [...genderdata,
        {
        patient_diagnosis_id: td.uuid || 0,
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


//patient search url
//https://qahmisgateway.oasyshealth.co/DEVregistration/v1/api/patient/search