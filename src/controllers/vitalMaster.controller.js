const httpStatus = require("http-status");
const sequelize = require('sequelize');
const Op = sequelize.Op;

const db = require("../config/sequelize");

const clinical_const = require('../config/constants');
//import tables
const vitalmstrTbl = db.vital_masters;
const vitalTypeTbl = db.vital_type;
const vitalValueTypeTbl = db.vital_value_type;


const vitalmstrController = () => {
	/**
	 * Returns jwt token if valid username and password is provided
	 * @param req
	 * @param res
	 * @param next
	 * @returns {*}
	 */

  const _createVital = async (req, res) => {

    // plucking data req body
    const vitalsMasterData = req.body;
    const { user_uuid } = req.headers;

    if (vitalsMasterData && user_uuid) {
      vitalsMasterData.created_by = vitalsMasterData.modified_by = user_uuid;
      vitalsMasterData.created_date = vitalsMasterData.modified_date = new Date()

      try {
        const result = await vitalmstrTbl.create(vitalsMasterData, { returning: true });
        if (result) {
          return res.status(200).send({ statusCode: httpStatus.OK, message: "Inserted Vital Master Successfully", responseContent: result });
        }
      }
      catch (ex) {
        return res.status(400).send({ statusCode: httpStatus.BAD_REQUEST, message: ex.message });
      }
    } else {
      return res.status(400).send({ statusCode: httpStatus[400], message: "No Request Body Found" });
    }
  };
  //function for getting default vitals
  const _getVitals = async (req, res) => {
    try {
      const result = await vitalmstrTbl.findAll(getdefaultVitalsQuery(), { returning: true });
      if (result) {
        return res.status(200).send({ statusCode: httpStatus.OK, message: "Fetched Vital Master details Successfully", responseContents: { getVitals: result } });
      }
    }
    catch (ex) {
      return res.status(400).send({ statusCode: httpStatus.BAD_REQUEST, message: ex.message });
    }
  }
  //function for getting all vitals
  const _getALLVitals = async (req, res) => {
    let query = {
      where: { is_active: 1, status: 1 },
      // include:[{
      //   model:vitalTypeTbl, 
      //   as:'vital_type',    
      //   where:{
      //     is_active:1,
      //     status:1
      //   }
      // }] 
    }
    try {
      const result = await vitalmstrTbl.findAll(query, { returning: true });
      if (result) {
        return res.status(200).send({ statusCode: httpStatus.OK, message: "Fetched Vital Master details Successfully", responseContents: { getVitals: result } });
      }
    }
    catch (ex) {
      return res.status(400).send({ statusCode: httpStatus.BAD_REQUEST, message: ex.message });
    }
  }
  const _getVitalByID = async (req, res) => {

    let { vital_uuid } = req.query;

    if (vital_uuid && vital_uuid !== '') {

      try {

        const getVital = await vitalmstrTbl.findOne(getdefaultVitalsQuery(vital_uuid), { returning: true });

        return res.status(200).send({ statusCode: httpStatus.OK, message: "Fetched Detailed Vital Master", responseContent: getVital });

      }
      catch (ex) {

        return res.status(400).send({ statusCode: httpStatus.BAD_REQUEST, message: ex.message });

      }

    } else {

      return res.status(400).send({ code: httpStatus[400], message: "No Request body Found" });
    }
  }

  return {
    createVital: _createVital,
    getVitals: _getVitals,
    getAllVitals: _getALLVitals,
    getVitalByID: _getVitalByID
  };
};

module.exports = vitalmstrController();

function getdefaultVitalsQuery(vital_uuid) {
  let q = {
    where: { is_default: clinical_const.IS_ACTIVE, is_active: clinical_const.IS_ACTIVE, status: clinical_const.IS_ACTIVE },
    include: [
      {
        model: vitalValueTypeTbl,
        as: 'vital_value_type',
        where: {
          is_active: clinical_const.IS_ACTIVE,
          status: clinical_const.IS_ACTIVE
        }
      },
      {
        model: vitalTypeTbl,
        as: 'vital_type',
        where: {
          is_active: clinical_const.IS_ACTIVE,
          status: clinical_const.IS_ACTIVE
        }
      }
    ]
  }

  if (vital_uuid) {
    q.where.uuid = vital_uuid;
  }
  return q;
}


