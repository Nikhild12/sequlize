// Package Import
const httpStatus = require('http-status');

// Sequelizer Import
const Sequelize = require('sequelize');
const sequelizeDb = require('../config/sequelize');
const Op = Sequelize.Op;

// EMR Constants Import
const emr_constants = require('../config/constants');

const emr_utility = require('../services/utility.service');

const patientAllergiesTbl = sequelizeDb.patient_allergies;
const encounterTbl = sequelizeDb.encounter;
const encounterTypeTbl = sequelizeDb.encounter_type;
const allergySevirityTbl = sequelizeDb.allergy_severity;
const allergySourceTbl = sequelizeDb.allergy_source;
const allergyMasterTbl = sequelizeDb.allergy_masters;
const periodsTbl = sequelizeDb.periods;
const allergyReactions = sequelizeDb.allergy_reactions;

const Patient_Allergies = () => {

  /**
     * Adding New Allergy
     * @param {*} req 
     * @param {*} res 
     */
  const _addNewAllergy = async (req, res) => {

    const { user_uuid } = req.headers;
    let { patient_allergies } = req.body;

    if (user_uuid && patient_allergies) {
      try {
        patient_allergies = emr_utility.createIsActiveAndStatus(patient_allergies, user_uuid);        
        patient_allergies.start_date = patient_allergies.end_date = patient_allergies.performed_date;
        patient_allergies.performed_by = user_uuid;

        if (patient_allergies.hasOwnProperty('no_known_allergy') && typeof patient_allergies.no_known_allergy === 'boolean') {
          if (!patient_allergies.no_known_allergy && !patient_allergies.hasOwnProperty('allergy_master_uuid')) {
            return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: emr_constants.SEND_ALLERGY_MASTER_UUID });
          }
        }

        await patientAllergiesTbl.create(patient_allergies, { returing: true });
        return res.status(200).send({ code: httpStatus.OK, message: emr_constants.INSERTED_PATIENT_ALLERGY_SUCCESS, responseContents: patient_allergies });
      } catch (ex) {
        console.log('Exception happened', ex);
        return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex });
      }
    } else {
      return res.status(400).send({ code: httpStatus.UNAUTHORIZED, message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}` });
    }
  };

  /**
       * Patient Allergy History
       * @param {*} req 
       * @param {*} res 
       */

  const _getPatientAllergies = async (req, res) => {
    const { user_uuid } = req.headers;
    const { patient_uuid } = req.query;

    try {
      if (user_uuid && patient_uuid) {
        const patientAllergyData = await getPatientAllergyData(patient_uuid);
        if (patientAllergyData) {
          return res.status(200).send({ code: httpStatus.OK, responseContent: patientAllergyData });
        }
      } else {
        return res.status(400).send({ code: httpStatus.UNAUTHORIZED, message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.FOUND} ${emr_constants.OR} ${emr_constants.NO} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}` });
      }
    } catch (ex) {
      console.log('Exception happened', ex);
      return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex });
    }
  };


  const _getPatientAllergiesByUserId = async (req, res) => {

    const { uuid } = req.query;
    const { user_uuid } = req.headers;

    try {
      if (user_uuid && uuid) {
        const patientAllergyData = await patientAllergiesTbl.findOne({ where: { uuid: uuid } }, { returning: true });
        return res.status(200).send({ code: httpStatus.OK, responseContent: patientAllergyData });
      } else {
        return res.status(400).send({ code: httpStatus.UNAUTHORIZED, message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.FOUND}` });
      }
    } catch (ex) {
      console.log('Exception happened', ex);
      return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex });

    }
  };


  const _updatePatientAllergy = async (req, res) => {
    const { user_uuid } = req.headers;
    const { uuid } = req.query;
    let { patient_allergies } = req.body;

    if (uuid && user_uuid && patient_allergies) {
      try {
        let allergy_data = allergyData(patient_allergies);
        const [updated] = await patientAllergiesTbl.update(allergy_data, { where: { uuid: uuid } });
        if (updated) {
          return res.status(200).send({ code: httpStatus.OK, message: 'Updated Successfully', responseContent: updated });
        }
        else {
          return res.status(400).send({ code: httpStatus[400], message: 'Update Failed' });
        }
      } catch (ex) {
        console.log('Exception happened', ex);
        return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
      }
    } else {
      return res.status(400).send({ code: httpStatus[400], message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}` });
    }
  };

  const _deletePatientAllergy = async (req, res) => {
    const { user_uuid } = req.headers;
    const { uuid } = req.query;

    if (uuid && user_uuid) {
      const updatedAllergyData = { status: 0, is_active: 0, modified_by: user_uuid, modified_date: new Date() };
      try {
        const data = await patientAllergiesTbl.update(updatedAllergyData, { where: { uuid: uuid } }, { returning: true });
        if (data) {
          return res.status(200).send({ code: httpStatus.OK, message: 'Deleted Successfully' });
        } else {
          return res.status(400).send({ code: httpStatus.OK, message: 'Deleted Fail' });

        }

      } catch (ex) {
        console.log('Exception happened', ex);
        return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });

      }
    } else {
      return res.status(400).send({ code: httpStatus.UNAUTHORIZED, message: `${emr_constants.NO} ${emr_constants.user_uuid} ${emr_constants.FOUND}` });

    }
  };

  return {

    addNewAllergy: _addNewAllergy,
    getPatientAllergies: _getPatientAllergies,
    updatePatientAllergy: _updatePatientAllergy,
    deletePatientAllergy: _deletePatientAllergy,
    getPatientAllergiesByUserId: _getPatientAllergiesByUserId
  };

};

module.exports = Patient_Allergies();

async function getPatientAllergyData(patient_uuid) {
  return patientAllergiesTbl.findAll(
    {
      limit: 10,
      order: [['uuid', 'DESC']],
      where: { patient_uuid: patient_uuid, is_active: 1, status: 1 },
      include: [
        {
          model: encounterTbl,
          as: 'encounter',
          attributes: ['uuid', 'encounter_type_uuid'],

          where: { is_active: 1 },

          include: [{
            model: encounterTypeTbl,

            attributes: ['uuid', 'name'],
            where: { is_active: 1 },

          }],
        },
        {
          model: allergyMasterTbl,
          as: 'allergy_masters',
          attributes: ['uuid', 'allergy_name'],

          where: { is_active: 1 },

        },
        {
          model: allergySourceTbl,
          as: 'allergy_source',
          attributes: ['uuid', 'name'],

          where: { is_active: 1 },

        },
        {
          model: allergySevirityTbl,
          as: 'allergy_severity',
          attributes: ['uuid', 'name'],

          where: { is_active: 1 },

        },
        {
          model: periodsTbl,
          as: 'periods',
          attributes: ['uuid', 'name'],

          where: { is_active: 1 },

        },
        {
          model: allergyReactions,
          as: 'allergy_reactions',
          attributes: ['uuid', 'name', 'code'],
          where: { is_active: 1 },
        },
      ]
    },
    { returning: true }
  );
}

function allergyData(patient_allergies) {
  let data = {
    patient_uuid: patient_allergies.patient_uuid,
    encounter_uuid: patient_allergies.encounter_uuid,
    consultation_uuid: patient_allergies.consultation_uuid,
    allergy_master_uuid: patient_allergies.allergy_master_uuid,
    allergy_type_uuid: patient_allergies.allergy_type_uuid,
    symptom: patient_allergies.symptom,
    performed_date: patient_allergies.performed_date,
    start_date: patient_allergies.performed_date,
    end_date: patient_allergies.performed_date,
    allergy_severity_uuid: patient_allergies.allergy_severity_uuid,
    allergy_source_uuid: patient_allergies.allergy_source_uuid,
    duration: patient_allergies.duration,
    period_uuid: patient_allergies.period_uuid,
    allergy_reaction_uuid: patient_allergies.allergy_reaction_uuid,
    remarks: patient_allergies.remarks,
    no_known_allergy: patient_allergies.no_known_allergy
  };
  return data;
}
