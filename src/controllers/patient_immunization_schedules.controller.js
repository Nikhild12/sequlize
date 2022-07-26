// Package Import
const httpStatus = require('http-status');

// Sequelizer Import
const sequelizeDb = require('../config/sequelize');

// EMR Constants Import
const emr_constants = require('../config/constants');

// Config Import
const emr_config = require('../config/config');

// BlockChain Import
const immunization_blockchain = require('../blockChain/immunization.blockchain');

const emr_utility = require('../services/utility.service');

const patientImmunizationsTbl = sequelizeDb.patient_immunizations;
const patientImmunizationSchedulesTbl = sequelizeDb.patient_immunization_schedules;
const viewPatientImmunzationSchedulesTbl = sequelizeDb.vw_patient_immunization_schedules;

const patient_immunization_Schedules = () => {



    /**
    * Adding patient Immunization sechedules
    * @param {*} req 
    * @param {*} res 
    */
    const _addPatientImmunizationSchedules = async (req, res) => {

        const { user_uuid } = req.headers;
        let Immunization = req.body;

        if (user_uuid) {

            Immunization.is_active = Immunization.status = true;
            Immunization.created_by = Immunization.modified_by = user_uuid;
            Immunization.created_date = Immunization.modified_date = new Date();
            Immunization.revision = 1;

            try {
                const createdImmunization = await patientImmunizationSchedulesTbl.create(Immunization, { returing: true });
                Immunization.uuid = createdImmunization.uuid;

                if (emr_config.isBlockChain === 'ON') {
                    immunization_blockchain.createImmunizationBlockchain(Immunization);
                }
                return res.status(200).send({ code: httpStatus.OK, message: 'Inserted successfully', responseContents: Immunization });

            }
            catch (ex) {
                console.log('Exception happened', ex);
                return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex });
            }
        } else {
            return res.status(400).send({ code: httpStatus.UNAUTHORIZED, message: emr_constants.NO_USER_ID });
        }

    };

    const _addPatientImmunizations = async (req, res) => {

        const { user_uuid } = req.headers;
        let Immunization = req.body;

        if (user_uuid) {

            Immunization.is_active = Immunization.status = true;
            Immunization.created_by = Immunization.modified_by = user_uuid;
            Immunization.created_date = Immunization.modified_date = new Date();
            Immunization.revision = 1;

            try {
                const createdImmunization = await patientImmunizationsTbl.create(Immunization, { returing: true });
                Immunization.uuid = createdImmunization.uuid;
                return res.status(200).send({ code: httpStatus.OK, message: 'Inserted successfully', responseContents: Immunization });

            }
            catch (ex) {
                console.log('Exception happened', ex);
                return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex });
            }
        } else {
            return res.status(400).send({ code: httpStatus.UNAUTHORIZED, message: emr_constants.NO_USER_ID });
        }

    };


    const _deletePatientImmunizationSchedules = async (req, res) => {
        const { user_uuid } = req.headers;
        const { uuid } = req.query;
        if (user_uuid && uuid) {
            const updatedImmunizationData = { status: 0, is_active: 0, modified_by: user_uuid, modified_date: new Date() };
            try {
                const data = await patientImmunizationSchedulesTbl.update(updatedImmunizationData, { where: { uuid: uuid } }, { returning: true });
                if (data) {

                    if (emr_config.isBlockChain === 'ON') {
                        immunization_blockchain.deleteImmunizationBlockChain(+(uuid));
                    }
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

    const _updatePatientImmunizationSchedules = async (req, res) => {
        try {
            const { user_uuid } = req.headers;
            let { uuid } = req.query;
            let postdata = req.body;
            let selector = {
                where: { uuid: uuid, status: 1, is_active: 1 }
            };
            if (user_uuid && uuid) {
                const data = await patientImmunizationSchedulesTbl.update(postdata, selector, { returning: true });
                if (data) {
                    return res.status(200).send({ code: httpStatus.OK, message: 'Updated Successfully', responseContents: data });

                }

                else {
                    return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" });
                }
            }

        }
        catch (ex) {
            console.log('Exception happened', ex);
            return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });

        }
    };

    const _getPatientImmunizationSchedulesById = async (req, res) => {

        const { uuid } = req.query;
        const { user_uuid } = req.headers;

        try {

            if (user_uuid && uuid) {
                const immunizationData = await patientImmunizationSchedulesTbl.findOne({ where: { uuid: uuid, created_by: user_uuid } }, { returning: true });
                if (emr_config.isBlockChain === 'ON') {
                    immunization_blockchain.getImmunizationBlockChain(+(uuid));
                }
                return res.status(200).send({ code: httpStatus.OK, responseContent: immunizationData });
            } else {
                return res.status(400).send({ code: httpStatus.UNAUTHORIZED, message: emr_constants.NO_USER_ID });
            }
        }
        catch (ex) {
            console.log('Exception happened', ex);
            return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex });
        }
    };


    // Get All  patients Immunizations List
    const _getAllPatientImmunizationSchedules = async (req, res) => {

        const { user_uuid } = req.headers;
        const { patient_uuid } = req.query;
        let order;
        try {

            if (user_uuid) {
                const immunizationData = await viewPatientImmunzationSchedulesTbl.findAll({
                    // attributes: ['pis_uuid', 'pis_immunization_date', 'et_name', 'i_name', 'f_name', 'pis_comments'],
                    attributes: { "exclude": ['id', 'createdAt', 'updatedAt'] },

                    order: [['pis_immunization_date', 'DESC']],
                    where: { pis_patient_uuid: patient_uuid, pis_is_active: 1, pis_status: 1, et_is_active: 1, et_status: 1, i_is_active: 1, i_status: 1, f_is_active: 1, f_status: 1 }

                });
                return res.status(200).send({ code: httpStatus.OK, message: 'Fetched Patient Immunzation Schedules Details successfully', responseContents: immunizationData });
            }
            else {
                return res.status(422).send({ code: httpStatus[400], message: emr_constants.FETCHD_PROFILES_FAIL });
            }
        } catch (ex) {

            console.log(ex.message);
            return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
        }
    };

    return {
        addPatientImmunizations: _addPatientImmunizations,
        addPatientImmunizationSchedules: _addPatientImmunizationSchedules,
        deletePatientImmunizationSchedules: _deletePatientImmunizationSchedules,
        updatePatientImmunizationSchedules: _updatePatientImmunizationSchedules,
        getPatientImmunizationSchedulesById: _getPatientImmunizationSchedulesById,
        getAllPatientImmunizationSchedules: _getAllPatientImmunizationSchedules

    };
};

module.exports = patient_immunization_Schedules();
