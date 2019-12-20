// Package Import
const httpStatus = require("http-status");



const sequelizeDb = require('../config/sequelize');

const emrConstants = require('../config/constants');
// Initialize EMR Workflow
const emr_patientvitals_Tbl = sequelizeDb.patient_vitals;

// Initialize EMR Views
const vw_patientVitalsTbl = sequelizeDb.vw_patient_vitals;


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
            console.log('-----', ex);
            return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
        }
    };
    const _getVitalsByTemplateID = async (req, res) => {
        const { template_id } = req.query;
        const { user_uuid } = req.headers;
        try {
            let getPatientVitals = await emr_patientvitals_Tbl.findAll({ where: { is_active: emrConstants.IS_ACTIVE, status: emrConstants.IS_ACTIVE } }, { returning: true });

            if (getPatientVitals) {
                return res.status(200).send({ code: httpStatus.OK, message: "Fetched EMR Patient Vital Details  Successfully", responseContents: getPatientVitals });
            } else {
                return res.status(400).send({ code: httpStatus[400], message: "Something went wrong" });
            }

        }
        catch (ex) {
            return res.status(400).send({ code: httpStatus[400], message: ex.message });
        }
    };

    const _getPatientVitals = async (req, res) => {

        try {

            let getPatientVitals = await emr_patientvitals_Tbl.findAll({ where: { is_active: emrConstants.IS_ACTIVE, status: emrConstants.IS_ACTIVE } }, { returning: true });
            return res.status(200).send({ code: httpStatus.OK, message: "Fetched EMR Patient Vital Details  Successfully", responseContents: getPatientVitals });
        }
        catch (ex) {
            return res.status(400).send({ code: httpStatus[400], message: ex.message });
        }
    };
    const _getHistoryPatientVitals = async (req, res) => {
        const { user_uuid } = req.headers;
        const { patient_uuid, department_uuid } = req.query;
        if (user_uuid && patient_uuid && department_uuid) {

            try {
                let getHistoryPatientVitals = await vw_patientVitalsTbl.findAll(getHistoryPatientVitalQuery(user_uuid, patient_uuid, department_uuid), { returning: true });
                return res.status(200).send({ code: httpStatus.OK, message: "Fetched EMR History Patient Vital Details  Successfully", responseContents: patientVitalsList(getHistoryPatientVitals) });
            }
            catch (ex) {
                return res.status(400).send({ code: httpStatus[400], message: ex.message });
            }
        }
        else {
            return res.status(400).send({ code: httpStatus[400], message: "No Request Params Found" });
        }
    };
    return {
        createPatientVital: _createPatientVital,
        getVitalsByTemplateID: _getVitalsByTemplateID,
        getPatientVitals: _getPatientVitals,
        getHistoryPatientVitals: _getHistoryPatientVitals,

    };
};



module.exports = EMRPatientVitals();

function getHistoryPatientVitalQuery(user_uuid, patient_uuid, department_uuid) {
    // user_uuid == doctor_uuid
    let query = {
        order: [['pv_uuid', 'DESC']],
        attributes: [
            'pv_uuid',
            'pv_vital_master_uuid',
            'pv_vital_type_uuid',
            'pv_vital_value_type_uuid',
            'pv_vital_value',
            'pv_doctor_uuid',
            'pv_patient_uuid',
            'pv_performed_date',
            'vm_name',
            'um_code',
            'um_name'],
        limit: 10,
        where: { vm_active: emrConstants.IS_ACTIVE, vm_status: emrConstants.IS_ACTIVE, pv_doctor_uuid: user_uuid, pv_patient_uuid: patient_uuid, pv_department_uuid: department_uuid },
    };
    return query;
}
/**
 * returns EMR Patient Vitals
 * in readable format
 */
function patientVitalsList(getHistoryPatientVitals) {
    let patient_vitals_list = [];
    if (getHistoryPatientVitals && getHistoryPatientVitals.length > 0) {

        getHistoryPatientVitals.forEach((pV) => {
            patient_vitals_list = [...patient_vitals_list,
            {
                // patient vital values
                patient_vital_uuid: pV.pv_uuid,
                vital_value: pV.pv_vital_value,
                vital_performed_date: pV.pv_performed_date,
                vital_value_type_uuid: pV.pv_vital_value_type_uuid,
                vital_type_uuid: pV.pv_vital_type_uuid,
                vital_master_uuid: pV.pv_vital_master_uuid,

                //vital master values
                vital_name: pV.vm_name,


                // uom master table values
                uom_code: pV.um_code,
                uom_name: pV.um_name,

                patient_uuid: pV.pv_patient_uuid,
                doctor_uuid: pV.pv_doctor_uuid,

            }
            ];
        });
    }
    return patient_vitals_list;
}