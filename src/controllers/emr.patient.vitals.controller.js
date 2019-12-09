// Package Import
const httpStatus = require("http-status");

// Sequelizer Import
var Sequelize = require('sequelize');
var Op = Sequelize.Op;

const sequelizeDb = require('../config/sequelize');

// Initialize EMR Workflow
const emr_patientvitals_Tbl = sequelizeDb.patient_vitals;


const EMRPatientVitals = () => {

    const _createPatientVital = async (req, res) => {

        const emrPatientVitalReqData = req.body;
        const { user_uuid } = req.headers;

        try {
            if (user_uuid && emrPatientVitalReqData && emrPatientVitalReqData.length > 0) {

                emrPatientVitalReqData.forEach((eRD) => {
                    eRD.performed_date = new Date(eRD.performed_date);
                    eRD.doctor_uuid = eRD.modified_by = eRD.created_by = user_uuid;
                    eRD.is_active = eRD.status = true;
                    eRD.created_date = eRD.modified_date = new Date();
                });
                const emr_patient_vitals_response = await emr_patientvitals_Tbl.bulkCreate(emrPatientVitalReqData, { returning: true });

                emrPatientVitalReqData.forEach((ePV, index) => {
                    ePV.uuid = emr_patient_vitals_response[index].uuid;
                });

                if (emr_patient_vitals_response) {
                    return res.status(200).send({ code: httpStatus.OK, message: "Inserted EMR Patient Vital Details  Successfully", responseContents: emrPatientVitalReqData });
                }
            }
        } catch (ex) {
            console.log('-----', ex)
            return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
        }
    };
    const _getVitalsByTemplateID = async (req, res) => {
        const { template_id } = req.query;
        const { user_uuid } = req.headers;
        try {
            let getPatientVitals = await emr_patientvitals_Tbl.findAll({ where: { is_active: 1, status: 1 } }, { returning: true });

            if (getPatientVitals) {
                return res.status(200).send({ code: httpStatus.OK, message: "Fetched EMR Patient Vital Details  Successfully", responseContents: getPatientVitals });
            } else {
                return res.status(400).send({ code: httpStatus[400], message: "Something went wrong" });
            }

        }
        catch (ex) {
            return res.status(400).send({ code: httpStatus[400], message: ex.message });
        }
    }

    const _getPatientVitals = async (req, res) => {
        
        try {
            
            let getPatientVitals = await emr_patientvitals_Tbl.findAll({ where: { is_active: 1, status: 1 } }, { returning: true });
            return res.status(200).send({ code: httpStatus.OK, message: "Fetched EMR Patient Vital Details  Successfully", responseContents: getPatientVitals });
        }
        catch(ex){
            return res.status(400).send({ code: httpStatus[400], message: ex.message });
        }
    }    

    return {
        createPatientVital: _createPatientVital,
        getVitalsByTemplateID: _getVitalsByTemplateID,
        getPatientVitals:_getPatientVitals,

    }
}



module.exports = EMRPatientVitals();

