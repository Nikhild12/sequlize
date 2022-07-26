// Package Import
const httpStatus = require('http-status');

// Sequelizer Import
const sequelizeDb = require('../config/sequelize');

// Config Import
const emr_config = require('../config/config');

// EMR Constants Import
const emr_constants = require('../config/constants');

// BlockChain Import
const allergy_blockchain = require('../blockChain/patient.allergy.blockchain');

const emr_utility = require('../services/utility.service');

const patientAllergiesTbl = sequelizeDb.patient_allergies;
const encounterTbl = sequelizeDb.encounter;
const encounterTypeTbl = sequelizeDb.encounter_type;
const allergySevirityTbl = sequelizeDb.allergy_severity;
const allergySourceTbl = sequelizeDb.allergy_source;
const allergyMasterTbl = sequelizeDb.allergy_masters;
const periodsTbl = sequelizeDb.periods;
const patientAllergyStatus = sequelizeDb.patient_allergy_status;
const allergyTypeTbl = sequelizeDb.allergy_type;
const { INVENTORY_REFERENCY_GETREFERENCTBYARRAYOFIDS } = emr_constants.DEPENDENCY_URLS;

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
        const createdAllergy = await patientAllergiesTbl.create(patient_allergies, { returing: true });
        patient_allergies.uuid = createdAllergy.uuid;
        // if (emr_config.isBlockChain === 'ON') {
        //   allergy_blockchain.createPatientAllergyBlockchain(patient_allergies);
        // }
        return res.status(200).send({ code: httpStatus.OK, message: emr_constants.INSERTED_PATIENT_ALLERGY_SUCCESS, responseContents: patient_allergies });
      } catch (ex) {
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
        let item_master_url = emr_config.wso2InvUrl + INVENTORY_REFERENCY_GETREFERENCTBYARRAYOFIDS;
        const patientAllergyData = await getPatientAllergyData(patient_uuid);
        if (patientAllergyData) {
          let item_master_ids = [... new Set(patientAllergyData.map(e => { return e.item_master_uuid }))];
          let options = {
            uri: item_master_url,
            headers: {
              Authorization: req.headers.authorization || req.headers.Authorization,
              user_uuid: user_uuid
            },
            body: {
              table_name: "item_master",
              Ids: item_master_ids
            }
          };
          let item_master_data = await emr_utility.postRequest(options.uri, options.headers, options.body);
          for (let e of patientAllergyData) {
            if (item_master_data && item_master_data.length) {
              for (let io of item_master_data) {
                if (e.item_master_uuid == io.uuid) {
                  e.dataValues.item_master = io;
                }
              }
            }
          }
          return res.status(200).send({ code: httpStatus.OK, responseContent: patientAllergyData });
        }
      } else {
        return res.status(400).send({ code: httpStatus.UNAUTHORIZED, message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.FOUND} ${emr_constants.OR} ${emr_constants.NO} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}` });
      }
    } catch (ex) {
      return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex });
    }
  };

  const _getPatientAllergiesByUserId = async (req, res) => {

    const { uuid } = req.query;
    const { user_uuid } = req.headers;

    try {
      if (user_uuid && uuid) {
        const patientAllergyData = await patientAllergiesTbl.findOne({ where: { uuid: uuid } });
        // if (patientAllergyData && Object.values(patientAllergyData.item_master_uuid).length > 0) {
        //   let options = {
        //     uri: item_master_url,
        //     headers: {
        //       Authorization: req.headers.authorization || req.headers.Authorization,
        //       user_uuid: user_uuid
        //     },
        //     body: {
        //       table_name: "item_master",
        //       Ids: [patientAllergyData.item_master_uuid]
        //     }
        //   };
        //   let item_master_data = await emr_utility.postRequest(options.uri, options.headers, options.body);
        // }

        // if (emr_config.isBlockChain === 'ON') {
        //   allergy_blockchain.getPatientAllergyBlockChain(+(uuid));
        // }
        return res.status(200).send({ code: httpStatus.OK, responseContent: patientAllergyData });
      } else {
        return res.status(400).send({ code: httpStatus.UNAUTHORIZED, message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.FOUND}` });
      }
    } catch (ex) {
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
          if (emr_config.isBlockChain === 'ON') {
            allergy_blockchain.deletePatientAllergyBlockChain(+(uuid));
          }
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

  /**
   * 
   * @param {*} _req req from API
   * @param {*} res res to API
   */
  const _getPatientAllergyStatus = async (_req, res) => {

    try {
      const patientAllergyStatusData = await patientAllergyStatus
        .findAll({ is_active: emr_constants.IS_ACTIVE, status: emr_constants.IS_ACTIVE });

      const code = emr_utility.getResponseCodeForSuccessRequest(patientAllergyStatusData);
      const message = emr_utility.getResponseMessageForSuccessRequest(code, 'pas');
      return res.status(200).send({ code, message, responseContents: patientAllergyStatusData });

    } catch (error) {
      console.log("Exception happened", error);
      return res.status(500).send({ code: httpStatus.INTERNAL_SERVER_ERROR, message: error.message });
    }


  };



  return {

    addNewAllergy: _addNewAllergy,
    getPatientAllergies: _getPatientAllergies,
    updatePatientAllergy: _updatePatientAllergy,
    deletePatientAllergy: _deletePatientAllergy,
    getPatientAllergiesByUserId: _getPatientAllergiesByUserId,
    getPatientAllergyStatus: _getPatientAllergyStatus
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
          required: false,
          include: [{
            model: encounterTypeTbl,
            attributes: ['uuid', 'name'],
            where: { is_active: 1 },
            required: false
          }],
        },
        {
          model: allergyMasterTbl,
          as: 'allergy_masters',
          attributes: ['uuid', 'allergy_name'],
          where: { is_active: 1 },
          required: false
        },
        {
          model: allergyTypeTbl,
          attributes: ['uuid', 'name'],
          where: { is_active: 1, status: 1 },
          required: false,
          as: "allergy_type"
        },
        {
          model: allergySourceTbl,
          as: 'allergy_source',
          attributes: ['uuid', 'name'],
          where: { is_active: 1 },
          required: false
        },
        {
          model: allergySevirityTbl,
          as: 'allergy_severity',
          attributes: ['uuid', 'name'],
          where: { is_active: 1 },
          required: false
        },
        {
          model: periodsTbl,
          as: 'periods',
          attributes: ['uuid', 'name'],
          where: { is_active: 1 },
          required: false
        },
        {
          model: patientAllergyStatus,
          as: 'patient_allergy_status',
          attributes: ['uuid', 'name', 'code'],
          where: { is_active: 1, status: 1 },
          required: false
        }
      ]
    });
}

function allergyData(patient_allergies) {
  let data = {
    patient_uuid: patient_allergies.patient_uuid,
    encounter_uuid: patient_allergies.encounter_uuid,
    consultation_uuid: patient_allergies.consultation_uuid,
    allergy_master_uuid: patient_allergies.allergy_master_uuid,
    item_master_uuid: patient_allergies.item_master_uuid,
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
    no_known_allergy: patient_allergies.no_known_allergy,
    patient_allergy_status_uuid: patient_allergies.patient_allergy_status_uuid
  };
  return data;
}
