// Package Import
const httpStatus = require('http-status');

// Sequelizer Import
const Sequelize = require('sequelize');
const sequelizeDb = require('../config/sequelize');
const Op = Sequelize.Op;

// EMR Constants Import
const emr_constants = require('../config/constants');

const emr_utility = require('../services/utility.service');

const familyHistoryTbl = sequelizeDb.family_history;
const periodsTbl = sequelizeDb.periods;
const familyRealationTbl = sequelizeDb.family_relation_type;


const Family_History = () => {

  /**
     * Adding Family History
     * @param {*} req 
     * @param {*} res 
     */
  const _addFamilyHistory = async (req, res) => {

    const { user_uuid } = req.headers;
    let familyHistory = req.body;

    if (user_uuid) {

      familyHistory.is_active = familyHistory.status = true;
      familyHistory.created_by = familyHistory.modified_by = user_uuid;
      familyHistory.created_date = familyHistory.modified_date = new Date();
      familyHistory.revision = 1;

      try {
        await familyHistoryTbl.create(familyHistory, { returing: true });
        return res.status(200).send({ code: httpStatus.OK, message: 'inserted successfully', responseContents: familyHistory });

      }
      catch (ex) {
        console.log('Exception happened', ex);
        return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex });
      }
    } else {
      return res.status(400).send({ code: httpStatus.UNAUTHORIZED, message: emr_constants.NO_USER_ID });
    }

  };


  const _getFamilyHistory = async (req, res) => {
    const { user_uuid } = req.headers;
    let { patient_uuid } = req.query;

    if (user_uuid && patient_uuid) {
      try {
        const familyHistoryData = await familyHistoryTbl.findAll({
          limit: 10,
          order: [['uuid', 'DESC']],
          where: { patient_uuid: patient_uuid, is_active: 1, status: 1 },
          include: [
            {
              model: periodsTbl,
              as: 'periods',
              attributes: ['uuid', 'name'],
              where: { is_active: 1, status: 1 }
            },
            {
              model: familyRealationTbl,
              as: 'family_relation_type',
              attributes: ['uuid', 'name']
            }
          ]

        },
          { returning: true }
        );
        return res.status(200).send({ code: httpStatus.OK, responseContent: familyHistoryData });
      }
      catch (ex) {
        console.log('Exception happened', ex);
        return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex });
      }
    } else {
      return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: emr_constants.UNAUTHORIZED });

    }

  };


  const _getFamilyHistoryById = async (req, res) => {

    const { uuid } = req.query;
    const { user_uuid } = req.headers;

    try {

      if (user_uuid && uuid) {
        const familyData = await familyHistoryTbl.findOne({ where: { uuid: uuid, created_by: user_uuid } }, { returning: true });
        return res.status(200).send({ code: httpStatus.OK, responseContent: familyData });
      } else {
        return res.status(400).send({ code: httpStatus.UNAUTHORIZED, message: emr_constants.NO_USER_ID });
      }
    }
    catch (ex) {
      console.log('Exception happened', ex);
      return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex });
    }
  };


  const _deleteFamilyHistory = async (req, res) => {
    const { user_uuid } = req.headers;
    const { uuid } = req.query;
    if (user_uuid && uuid) {
      const updatedFamilyData = { status: 0, is_active: 0, modified_by: user_uuid, modified_date: new Date() };
      try {
        const data = await familyHistoryTbl.update(updatedFamilyData, { where: { uuid: uuid } }, { returning: true });
        if (data) {
          return res.status(200).send({ code: httpStatus.OK, message: 'Deleted Successfully' });
        } else {
          return res.status(400).send({ code: httpStatus.OK, message: 'Deleted Fail' });

        }

      }
      catch (ex) {
        console.log('Exception happened', ex);
        return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });

      }

    } else {
      return res.status(400).send({ code: httpStatus.UNAUTHORIZED, message: emr_constants.NO_USER_ID });

    }
  };

  const _updateFamilyHistory = async (req, res) => {
    try {
      const { user_uuid } = req.headers;
      let { uuid } = req.query;
      let postdata = req.body;
      let selector = {
        where: { uuid: uuid }
      };
      if (user_uuid && uuid) {
        const data = await familyHistoryTbl.update(postdata, selector, { returning: true });
        if (data) {
          return res.status(200).send({ code: httpStatus.OK, message: 'Updated Successfully' });

        }

        else {
          return res.status(400).send({ code: httpStatus[400], message: 'No Request Body Found' });
        }
      }

    }
    catch (ex) {
      console.log('Exception happened', ex);
      return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });

    }
  };




  return {

    addFamilyHistory: _addFamilyHistory,
    getFamilyHistory: _getFamilyHistory,
    deleteFamilyHistory: _deleteFamilyHistory,
    getFamilyHistoryById: _getFamilyHistoryById,
    updateFamilyHistory: _updateFamilyHistory
  };

};

module.exports = Family_History();

