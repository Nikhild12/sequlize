// Package Import
const httpStatus = require('http-status');

// Sequelizer Import
const Sequelize = require('sequelize');
const sequelizeDb = require('../config/sequelize');
const Op = Sequelize.Op;

// EMR Constants Import
const emr_constants = require('../config/constants');


const surgicalDetailsTbl = sequelizeDb.patient_surgeries;


const Surgery_History = () => {

  /**
     * Adding Family History
     * @param {*} req 
     * @param {*} res 
     */
  const _addSurgery = async (req, res) => {

    const { user_uuid } = req.headers;
    let surgicalDetails = req.body;

    if (user_uuid) {

      surgicalDetails.is_active = surgicalDetails.status = true;
      surgicalDetails.created_by = surgicalDetails.modified_by = surgicalDetails.performed_by = user_uuid;
      surgicalDetails.created_date = surgicalDetails.modified_date = new Date();
      surgicalDetails.revision = 1;

      try {
        await surgicalDetailsTbl.create(surgicalDetails, { returing: true });
        return res.status(200).send({ code: httpStatus.OK, message: 'inserted successfully', responseContents: surgicalDetails });

      }
      catch (ex) {
        console.log('Exception happened', ex);
        return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex });
      }
    } else {
      return res.status(400).send({ code: httpStatus.UNAUTHORIZED, message: emr_constants.NO_USER_ID });
    }

  };





  return {

    addSurgery: _addSurgery

  };

};

module.exports = Surgery_History();

