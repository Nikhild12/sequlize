// Package Import
const httpStatus = require("http-status");

// Sequelizer Import
const sequelizeDb = require('../config/sequelize');

// Initialize EMR Workflow
const emr_patientvitals_Tbl = sequelizeDb.patient_vitals;

const EMRPatientVitals = () => {

    const _createPatientVital = async (req, res) => {

        // const emrPatientVitalReqData = req.body;
        // const { user_uuid } = req.headers;

        // try {
        //     if (user_uuid && emrPatientVitalReqData && emrPatientVitalReqData.length > 0) {

        //         emrPatientVitalReqData.forEach((eRD) => {
        //             eRD.performed_date = new Date(eRD.performed_date).toISOString();
        //             eRD.doctor_uuid = eRD.modified_by = eRD.created_by = user_uuid;
        //             eRD.is_active = true;
        //             eRD.created_date = eRD.modified_date = new Date().toISOString();
        //         });
        //         const emr_patient_vitals_checking = checkingDuplicates(emrPatientVitalReqData); // avoiding the duplicate entries 
        //         if (emr_patient_vitals_checking && emr_patient_vitals_checking.length > 0) {
        //             const emr_patient_vitals_response = await emr_patientvitals_Tbl.bulkCreate(emr_patient_vitals_checking, { returning: true });
        //             if (emr_patient_vitals_response) {
        //                 return res.status(200).send({ code: httpStatus.OK, message: "Inserted EMR Patient Vital Details  Successfully", responseContents: emr_patient_vitals_response });
        //             }
        //         }
        //         else {
        //             return res.status(200).send({ code: httpStatus.OK, message: "Duplicate Patient Vitals" });
        //         }
        //     }
        // } catch (ex) {
        //     return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
        // }

    }


    return {
        createPatientVital: _createPatientVital,
    }
}

module.exports = EMRPatientVitals();

function checkingDuplicates(PatientVitalsData) {

    let findduplic = {};
    let isValid = true;
    let patid = 0;
    let encid = 0;
    let consid = 0;
    let vaitalmasterid = [];
    for (let i = 0; i < PatientVitalsData.length; i++) {
        if (findduplic[PatientVitalsData[i]]) {
            // throw {code: '001', msg: 'duplication occured....'};
            // isValid =false;
        } else {
            patid = PatientVitalsData.patient_uuid;
            encid = PatientVitalsData.encounter_uuid;
            consid = PatientVitalsData.consultation_uuid;
            vaitalmasterid.push(PatientVitalsData.vital_master_uuid);
        }
    }

    if (isValid) {

         emr_patientvitals_Tbl.findOne({
            where: {
                patient_uuid: patid,
                encounter_uuid: encid,
                consultation_uuid: consid,
                vital_master_uuid: { [sequelize.Op.in]: vaitalmasterid }
            }
        }).then(data => {
            //         throw {code: '001', msg: 'already in Data....'};
            // isValid =false;

            if (data) {

            }
        });

        if (isValid) {

        }

    }


    // if (PatientVitalsData) {




    //     let data = PatientVitalsData
    //     const filteredPatientVitalsData = [];
    //     data.forEach(async (element, index) => {
    //         await emr_patientvitals_Tbl.findOne({
    //             where: {
    //                 patient_uuid: element.patient_uuid,
    //                 encounter_uuid: element.encounter_uuid,
    //                 consultation_uuid: element.consultation_uuid,
    //                 vital_master_uuid: element.vital_master_uuid
    //             }
    //         }).then(data => {
    //             if (data === undefined || data === null) {
    //                 filteredPatientVitalsData.push(element);
    //             }
    //         });
    //     });
    //     return filteredPatientVitalsData;
    // }
}