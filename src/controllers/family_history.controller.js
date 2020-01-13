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
console.log(familyHistoryTbl, "asasas")
const Family_History = () => {

  /**
     * Adding Family History
     * @param {*} req 
     * @param {*} res 
     */
  const _addFamilyHistory = async (req, res) => {
    const { user_uuid } = req.headers;
    let { familyHistory } = req.body;
    if (user_uuid) {
      familyHistory.is_active = familyHistory.status = true;

      familyHistory.created_by = familyHistory.modified_by = user_uuid;
      familyHistory.created_date = familyHistory.modified_date = new Date();
      familyHistory.revision = 1;
      try {
        await familyHistoryTbl.create(familyHistory, { returing: true });
        return res.status(200).send({ code: httpStatus.OK, message: 'inserted successfully' });

      }
      catch (ex) {
        console.log('Exception happened', ex);
        return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex });
      }
    } else {
      return res.status(400).send({ code: httpStatus.UNAUTHORIZED, message: emr_constants.NO_USER_ID });
    }

  }



  const _getPatientAllergies = async (req, res) => {

  }



  const _getPatientAllergiesByUserId = async (req, res) => {


  }


  const _updatePatientAllergy = async (req, res) => {

  }

  const _deletePatientAllergy = async (req, res) => {
  }

  return {

    addFamilyHistory: _addFamilyHistory

  };

}

module.exports = Family_History();

