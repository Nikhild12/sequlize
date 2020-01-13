// Package Import
const httpStatus = require('http-status');
const moment = require('moment');

// Sequelizer Import
var Sequelize = require('sequelize');
var Op = Sequelize.Op;

// Sequelizer Import
const sequelizeDb = require('../config/sequelize');

const emr_utility = require('../services/utility.service');

const encounter_tbl = sequelizeDb.encounter;
const encounter_doctors_tbl = sequelizeDb.encounter_doctors;
const encounter_type_tbl = sequelizeDb.encounter_type;

const emr_constants = require('../config/constants');

// Query
function getActiveEncounterQuery(pId, dId, deptId, etypeId) {

  let encounterQuery = {
    where: {
      patient_uuid: pId,
      is_active_encounter: emr_constants.IS_ACTIVE,
      is_active: emr_constants.IS_ACTIVE,
      status: emr_constants.IS_ACTIVE,
      encounter_type_uuid: etypeId
    },
    include: [
      {
        model: encounter_doctors_tbl,
        attributes: ['uuid', 'doctor_uuid'],
        where: {
          doctor_uuid: dId,
          department_uuid: deptId,
          is_active: emr_constants.IS_ACTIVE,
          status: emr_constants.IS_ACTIVE
        }
      },
    ]
  };

  if (etypeId === 1) {
    encounterQuery.where[Op.and] = [
      Sequelize.where(Sequelize.fn('date', Sequelize.col('encounter_date')), '<=', moment().format('YYYY-MM-DD'))
    ];
  }
  return encounterQuery;

}





const Encounter = () => {

  /**
   *
   * @param {*} req
   * @param {*} res
   */

  const _getEncounterByDocAndPatientId = async (req, res) => {

    const { user_uuid } = req.headers;
    const { patientId, doctorId, from_date, to_date, departmentId, encounterType } = req.query;

    try {
      const is_mobile_request = (doctorId === 0 || doctorId == 0) && (departmentId == 0 || departmentId === 0) && (encounterType == 0 || encounterType === 0);
      if (user_uuid && patientId && is_mobile_request && from_date && to_date) {
        const encounterData = await encounter_tbl.findAll(getEncounterQuery(patientId, from_date, to_date));
        return res.status(200).send({
          code: httpStatus.OK, message: 'Fetched Encounter Successfully', responseContents: encounterData
        });
      } else if (user_uuid && patientId && patientId > 0 && doctorId && doctorId > 0 && departmentId && encounterType) {
        const encounterData = await encounter_tbl.findAll(
          getActiveEncounterQuery(patientId, doctorId, departmentId, encounterType)
        );
        return res.status(200).send({ code: httpStatus.OK, message: 'Fetched Encounter Successfully', responseContents: encounterData });
      } else {
        return res.status(400).send({ code: httpStatus[400], message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}` });
      }
    } catch (ex) {
      console.log(ex);
      return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
    }
  };

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  const _createPatientEncounter = async (req, res) => {
    const { user_uuid } = req.headers;
    let { encounter, encounterDoctor } = req.body;
    let encounterPromise = [];
    let encounterTransStatus = false;
    let encounterTransaction;
    const is_all_req_fields_in_enc_is_pres = encounter && encounter.encounter_type_uuid && encounter.patient_uuid && encounter.department_uuid;
    const is_all_req_fields_in_encDoc_is_pres = encounterDoctor && encounterDoctor.doctor_uuid && encounterDoctor.department_uuid;

    console.log('Request start');

    if (user_uuid && is_all_req_fields_in_enc_is_pres && is_all_req_fields_in_encDoc_is_pres && encounterDoctor) {
      const { encounter_type_uuid, patient_uuid } = encounter;
      const { doctor_uuid, department_uuid } = encounterDoctor;

      console.log('Request Fetched From Encounter and ENcounter Doctor');
      // Assigning     
      encounter = emr_utility.createIsActiveAndStatus(encounter, user_uuid);
      encounter.is_active_encounter = emr_constants.IS_ACTIVE;
      encounter.encounter_date = new Date();
      // Assigning
      encounterDoctor = emr_utility.createIsActiveAndStatus(encounterDoctor, user_uuid);
      encounterDoctor.patient_uuid = encounter.patient_uuid;
      encounterDoctor.consultation_start_date = new Date();

      console.log('Request Assigned to Encounter and ENcounter Doctor');
      try {

        // if Encounter Type is 2 then check
        // for active encounter for type 1 if exists
        // closing it
        encounterTransaction = await sequelizeDb.sequelize.transaction();
        console.log('Request Transaction Started');
        let encounterDoctorData, encounterData;
        let is_enc_avail, is_enc_doc_avail;

        encounterData = await getEncounterQueryByPatientId(patient_uuid, encounter_type_uuid);

        console.log('Request Got Prev Encounter for Patient');
        is_enc_avail = encounterData && encounterData.length > 0;
        if (is_enc_avail) {
          encounterDoctorData = await getEncounterDoctorsQueryByPatientId(encounterData[0].uuid, doctor_uuid, department_uuid);

          console.log('Request Got Prev Encounter Doctor for Patient');
        }


        is_enc_doc_avail = encounterDoctorData && encounterDoctorData.length > 0;
        console.log('Request Avail for Encounter Doc');
        if (encounter_type_uuid === 2) {
          
          if (encounterData && encounterData.length > 0) {
            console.log('Request Entered for Encounter type 2');
            encounterPromise = [
              ...encounterPromise,
              encounter_tbl.update(
                {
                  is_active_encounter: emr_constants.IS_IN_ACTIVE,
                  is_active: emr_constants.IS_IN_ACTIVE,
                  status: emr_constants.IS_IN_ACTIVE
                },
                { where: { uuid: encounterData[0].uuid }, transaction: encounterTransaction }
              ),
              encounter_doctors_tbl.update(
                {
                  encounter_doctor_status: emr_constants.IS_IN_ACTIVE,
                  is_active: emr_constants.IS_IN_ACTIVE,
                  status: emr_constants.IS_IN_ACTIVE
                },
                { where: { encounter_uuid: encounterData[0].uuid }, transaction: encounterTransaction }
              )
            ];
          }
        } else if (encounter_type_uuid === 1 && is_enc_avail && is_enc_doc_avail) {
          console.log('Request returned for already existing');
          return res.status(400)
            .send({
              code: httpStatus.BAD_REQUEST, message: emr_constants.DUPLICATE_ENCOUNTER
            });
        }

        if (!is_enc_avail) {
          console.log('Request creating for insert encounter');
          encounterPromise = [
            ...encounterPromise,
            encounter_tbl.create(encounter, { returning: true, transaction: encounterTransaction })
          ];
        }
        console.log('Request all promise');
        const createdEncounterData = await Promise.all(encounterPromise);
        console.log('Request success for all promise');

        if (createdEncounterData) {
          console.log('Request started for enc doc');
          if (is_enc_avail && !is_enc_doc_avail) {
            encounter.uuid = encounterDoctor.encounter_uuid = encounterData[0].uuid;
          } else {
            encounter.uuid = encounterDoctor.encounter_uuid = getCreatedEncounterId(createdEncounterData);
          }

          console.log('Request started for insert enc doc');
          const createdEncounterDoctorData = await encounter_doctors_tbl.create(
            encounterDoctor,
            { returning: true, transaction: encounterTransaction }
          );
          encounterDoctor.uuid = createdEncounterDoctorData.uuid;
          console.log('Request inserted succ for enc doc');
          await encounterTransaction.commit();
          console.log('Request success for transaction commit');
          encounterTransStatus = true;
          return res.status(200)
            .send({
              code: httpStatus.OK, message: 'Inserted Encounter Successfully', responseContents: { encounter, encounterDoctor }
            });
        }
      } catch (ex) {
        console.log(ex);
        console.log('Request start for transaction rollback');
        if (encounterTransaction) {
          await encounterTransaction.rollback();
          encounterTransStatus = true;
        }
        console.log('Request success for transaction rollback');

        return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
      } finally {
        console.log('Request start for transaction finall rollback');
        if (encounterTransaction && !encounterTransStatus) {
          encounterTransaction.rollback();
        }
        console.log('Request success for transaction finall rollback');
      }
    } else {
      console.log('Request sent for bad req');
      return res.status(400).send({
        code: httpStatus[400],
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}`
      });
    }
  };

  return {
    getEncounterByDocAndPatientId: _getEncounterByDocAndPatientId,
    createPatientEncounter: _createPatientEncounter
  };
};

module.exports = Encounter();

function getCreatedEncounterId(createdEncounterData) {
  return createdEncounterData.length > 1
    ? createdEncounterData[2].uuid
    : createdEncounterData[0].uuid;
}

function getEncounterQuery(pId, from_date, to_date) {
  return {
    where: {
      patient_uuid: pId,
      encounter_date: {
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn('date', Sequelize.col('encounter_date')), '>=', moment(from_date).format('YYYY-MM-DD')),
          Sequelize.where(
            Sequelize.fn('date', Sequelize.col('encounter_date')),
            '<=',
            moment(to_date).format('YYYY-MM-DD')
          )
        ]
      },
      is_active_encounter: emr_constants.IS_ACTIVE,
      is_active: emr_constants.IS_ACTIVE,
      status: emr_constants.IS_ACTIVE
    },
    include: [
      {
        model: encounter_type_tbl,
        attributes: ['uuid', 'code', 'name'],
        where: {
          is_active: emr_constants.IS_ACTIVE,
          status: emr_constants.IS_ACTIVE
        }
      }
    ]
  };
}

async function getEncounterQueryByPatientId(pId, etypeId) {
  let query = {
    where: {
      patient_uuid: pId,
      is_active_encounter: emr_constants.IS_ACTIVE,
      is_active: emr_constants.IS_ACTIVE,
      status: emr_constants.IS_ACTIVE,
      encounter_type_uuid: etypeId
    }
  };
  if (etypeId === 1) {
    query.where[Op.and] = [
      Sequelize.where(Sequelize.fn('date', Sequelize.col('encounter_date')), '<=', moment().format('YYYY-MM-DD'))
    ];
  }
  return encounter_tbl.findAll(query);
}

async function getEncounterDoctorsQueryByPatientId(enId, dId, deptId) {
  return encounter_doctors_tbl.findAll({
    attributes: ['uuid', 'doctor_uuid'],
    where: {
      doctor_uuid: dId,
      department_uuid: deptId,
      is_active: emr_constants.IS_ACTIVE,
      status: emr_constants.IS_ACTIVE,
      encounter_uuid: enId
    }
  });
}
