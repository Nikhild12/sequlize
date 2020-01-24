// Package Import
const httpStatus = require('http-status');

// Sequelizer Import
const Sequelize = require('sequelize');
const sequelizeDb = require('../config/sequelize');
const Op = Sequelize.Op;

// EMR Constants Import
const emr_constants = require('../config/constants');


const surgicalDetailsTbl = sequelizeDb.patient_surgeries;
const vw_surgical_details = sequelizeDb.vw_surgical_details;


const Surgery_History = () => {

  /**
     * Adding Surgery History
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

  const _getSurgeryHistory = async (req, res) => {
    const { user_uuid } = req.headers;
    let { patient_uuid } = req.query;

    try {
      if (user_uuid && patient_uuid) {
        const surgeryHistory = await vw_surgical_details.findAll({
          order: [['ps_uuid', 'DESC']],
          limit: 10,
          attributes: ['ps_uuid', 'institution_uuid', 'institution_name', 'procedure_name', 'ps_performed_date', 'ps_comments', 'ps_patient_uuid'],
          where: { ps_patient_uuid: patient_uuid, ps_created_by: user_uuid, ps_is_active: 1, ps_status: 1, ps_is_active: 1, ps_status: 1, institution_is_active: 1, institution_status: 1 }

        },
          { returning: true }
        );
        return res.status(200).send({ code: httpStatus.OK, responseContent: surgeryHistory });

      } else {
        return res.status(400).send({ code: httpStatus.UNAUTHORIZED, message: emr_constants.NO_USER_ID });
      }
    }
    catch (err) {
      console.log('Exception happened', err);
      return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: err });
    }
  };

  const _getSurgeryHistoryById = async (req, res) => {
    const { user_uuid } = req.headers;
    const { uuid } = req.query;
    try {
      if (user_uuid && uuid) {
        const surgeryData = await surgicalDetailsTbl.findOne({ where: { uuid: uuid, created_by: user_uuid } }, { returning: true });
        return res.status(200).send({ code: httpStatus.OK, responseContent: surgeryData });
      } else {
        return res.status(400).send({ code: httpStatus.UNAUTHORIZED, message: emr_constants.NO_USER_ID });
      }

    }
    catch (err) {
      console.log('Exception Happened', err);
      return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
    }

  };

  const _updateSurgeryHistory = async (req, res) => {
    const { user_uuid } = req.headers;
    const { uuid } = req.query;
    let postData = req.body;
    let selector = {
      where: { uuid: uuid }
    };
    try {
      if (user_uuid && uuid) {
        const data = await surgicalDetailsTbl.update(postData, selector, { returing: true });
        if (data) {
          return res.status(200).send({ code: httpStatus.OK, message: 'Updated Successfully', requestContent: data });
        }
      } else {
        return res.status(400).send({ code: httpStatus.UNAUTHORIZED, message: emr_constants.NO_USER_ID });

      }
    }
    catch (ex) {
      console.log('Exception happened', ex);
      return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });

    }
  };



  return {

    addSurgery: _addSurgery,
    getSurgeryHistory: _getSurgeryHistory,
    getSurgeryHistoryById: _getSurgeryHistoryById,
    updateSurgeryHistory: _updateSurgeryHistory

  };

};

module.exports = Surgery_History();

