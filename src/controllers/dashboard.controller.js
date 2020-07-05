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
    const { depertment_Id, from_date, to_date, gender, session } = req.query;
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

      } else if (session) {
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
        const diag_gender = gettopdiagnosis_session(allpatients.responseContents, alldiag, session);
        const comp_gender = gettopcomp_session(allpatientsC.responseContents, allcomp, session);
        return res.status(200).send({ code: httpStatus.OK, message: 'Fetched Successfully', responseContents: { "Top_Complaints": comp_gender, "Top_Diagnosis": diag_gender } });

      } else if (from_date && to_date) {

        //console.log("date filter here-----------------");
        const allcomp = await getComplaintsbydate(user_uuid, depertment_Id, from_date, to_date, Sequelize);
        const alldiag = await getDiagnosisbydate(user_uuid, depertment_Id, from_date, to_date, Sequelize);

        return res.status(200).send({ code: httpStatus.OK, message: 'Fetched Successfully', responseContents: { "Top_Complaints": gettopcomp(allcomp), "Top_Diagnosis": gettopdiag(alldiag) } });
      }
      else if (session && from_date && to_date && gender) {

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
        const allcompdate = await getComplaintsbydate(user_uuid, depertment_Id, from_date, to_date, Sequelize);
        const alldiagdate = await getDiagnosisbydate(user_uuid, depertment_Id, from_date, to_date, Sequelize);
        const diag_gender = gettopdiagnosis_gender(allpatients.responseContents, alldiagdate, gender);
        const comp_gender = gettopcomp_gender(allpatientsC.responseContents, allcompdate, gender);
        const diag_session = gettopdiagnosis_session(allpatients.responseContents, diag_gender, session);
        const comp_session = gettopcomp_session(allpatientsC.responseContents, comp_gender, session);

        return res.status(200).send({ code: httpStatus.OK, message: 'Fetched Successfully', responseContents: { "Top_Complaints": comp_session, "Top_Diagnosis": diag_session } });

      }
      else {
        //console.log("----------------");
        const topComplaints = await getComplaints(filterQuery, Sequelize);
        const topDiagnosis = await getDiagnosis(filterQuery, Sequelize);
        return res.status(200).send({ code: httpStatus.OK, message: 'Fetched Successfully', responseContents: { "Top_Complaints": gettopcomp(topComplaints), "Top_Diagnosis": gettopdiag(topDiagnosis) } });
      }

    } catch (ex) {
      console.log(ex);
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
  //console.log(filterQuery);
  return patient_chief_complaints_tbl.findAll({
    where: filterQuery,
    group: ['chief_complaint_uuid'],
    attributes: ['uuid', 'patient_uuid', 'encounter_doctor_uuid', 'chief_complaint_uuid', 'created_date',
      [Sequelize.fn('COUNT', Sequelize.col('chief_complaint_uuid')), 'Count']
    ],
    order: [[Sequelize.fn('COUNT', Sequelize.col('chief_complaint_uuid')), 'DESC']],
    limit: 10,
    include: [{
      model: chief_complaints_tbl,
      attributes: ['uuid', 'code', 'name'],
    }],
  });

}

async function getDiagnosis(filterQuery, Sequelize) {
  return patient_diagnosis_tbl.findAll({
    where: filterQuery,
    require: false,
    group: ['diagnosis_uuid'],
    attributes: ['uuid', 'diagnosis_uuid', 'encounter_doctor_uuid', 'patient_uuid', 'other_diagnosis',
      [Sequelize.fn('COUNT', Sequelize.col('diagnosis_uuid')), 'Count']
    ],
    order: [[Sequelize.fn('COUNT', Sequelize.col('diagnosis_uuid')), 'DESC']],
    limit: 10,
    include: [{
      model: diagnosis_tbl,
      attributes: ['code', 'name'],
    }],

  });

}

async function getComplaintsbydate(user_uuid, depertment_Id, from_date, to_date, Sequelize) {
  console.log("complaints function --------------");
  return patient_chief_complaints_tbl.findAll({
    group: ['chief_complaint_uuid'],
    attributes: ['uuid', 'patient_uuid', 'encounter_doctor_uuid', 'chief_complaint_uuid', 'created_date',
      [Sequelize.fn('COUNT', Sequelize.col('chief_complaint_uuid')), 'Count']
    ],
    order: [[Sequelize.fn('COUNT', Sequelize.col('chief_complaint_uuid')), 'DESC']],
    limit: 10,
    where: {
      encounter_doctor_uuid: user_uuid,
      status: emr_constants.IS_ACTIVE,
      is_active: emr_constants.IS_ACTIVE,
      department_uuid: depertment_Id,
      created_date: {
        [Op.and]: [
          Sequelize.where(Sequelize.fn('date', Sequelize.col('`patient_chief_complaints`.`created_date`')), '>=', moment(from_date).format('YYYY-MM-DD')),
          Sequelize.where(Sequelize.fn('date', Sequelize.col('`patient_chief_complaints`.`created_date`')), '<=', moment(to_date).format('YYYY-MM-DD'))
        ]
      }
    },

    include: [{
      model: chief_complaints_tbl,
      attributes: ['uuid', 'code', 'name'],
    }],
  });

}

async function getDiagnosisbydate(user_uuid, depertment_Id, from_date, to_date, Sequelize) {
  console.log("diagnosis function --------------");
  return patient_diagnosis_tbl.findAll({

    group: ['diagnosis_uuid'],
    attributes: ['uuid', 'diagnosis_uuid', 'encounter_doctor_uuid', 'patient_uuid', 'other_diagnosis',
      [Sequelize.fn('COUNT', Sequelize.col('diagnosis_uuid')), 'Count']
    ],
    order: [[Sequelize.fn('COUNT', Sequelize.col('diagnosis_uuid')), 'DESC']],
    limit: 10,
    where: {
      encounter_doctor_uuid: user_uuid,
      status: emr_constants.IS_ACTIVE,
      is_active: emr_constants.IS_ACTIVE,
      department_uuid: depertment_Id,
      created_date: {
        [Op.and]: [
          Sequelize.where(Sequelize.fn('date', Sequelize.col('`patient_diagnosis.created_date`')), '>=', moment(from_date).format('YYYY-MM-DD')),
          Sequelize.where(Sequelize.fn('date', Sequelize.col('`patient_diagnosis.created_date`')), '<=', moment(to_date).format('YYYY-MM-DD'))
        ]
      }
    },
    include: [{
      model: diagnosis_tbl,
      attributes: ['code', 'name'],
    }],

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

function gettopdiagnosis_session(allpatients, topDiagnosis, session) {

  //console.log ("patient vists --------",allpatients[0].patient_visits.length);

  let genderdata = [];
  for (let td of topDiagnosis) {
    for (let ap of allpatients) {
      //for (let i=0; i< ap.patient_visits.length;i++){
      if (td.patient_uuid == ap.uuid && ap.patient_visits[0].session_uuid == session) {
        console.log(td.patient_uuid, ap.uuid, ap.patient_visits[0].session_uuid, session);
        genderdata = [...genderdata,
        {
          session_uuid: ap.patient_visits[0].session_uuid,
          //patient_diagnosis_id: td.uuid || 0,
          Count: td.dataValues.Count,
          diagnosis_name: td.diagnosis && td.diagnosis.name ? td.diagnosis.name : td.other_diagnosis,
          diagnosis_code: td.diagnosis && td.diagnosis.code ? td.diagnosis.code : td.diagnosis_uuid,

        }
        ];
      }
      //}
    }
  }
  return genderdata;

}

function gettopcomp_session(allpatients, topcomp, session) {

  //console.log ("gender --------",gender);

  let genderdata = [];
  for (let td of topcomp) {
    for (let ap of allpatients) {
      //for (let i=0; i< ap.patient_visits.length;i++){
      //console.log(td.patient_uuid, ap.uuid, ap.gender_details.uuid, gender);
      if (td.patient_uuid == ap.uuid && ap.patient_visits[0].session_uuid == session) {
        console.log(td.patient_uuid, ap.uuid, ap.patient_visits[0].session_uuid, session);
        genderdata = [...genderdata,
        {
          session_uuid: ap.patient_visits[0].session_uuid,
          //patient_diagnosis_id: td.uuid || 0,
          Count: td.dataValues.Count,
          chiefcomplaint_name: td.chief_complaint.name,
          chiefcomplaint_code: td.chief_complaint.code
        }
        ];
      }
      //}
    }
  }
  return genderdata;
}

//patient search url
//https://qahmisgateway.oasyshealth.co/DEVregistration/v1/api/patient/search