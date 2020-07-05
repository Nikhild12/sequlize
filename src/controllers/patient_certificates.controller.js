// Package Import
const httpStatus = require('http-status');

// Sequelizer Import
const Sequelize = require('sequelize');
const sequelizeDb = require('../config/sequelize');
const Op = Sequelize.Op;

// EMR Constants Import
const emr_constants = require('../config/constants');
const patientCertificatesTbl = sequelizeDb.patient_certificates;
const patientCertificateViewTbl = sequelizeDb.vw_patient_certificate;

const CertificatesController = () => {


    /**
    * Creating  patient certificates
    * @param {*} req 
    * @param {*} res 
    */
    const _createPatientCertificates = async (req, res) => {

        const { user_uuid } = req.headers;
        let certificates = req.body;

        if (user_uuid && certificates) {
            await assignDefault(certificates, user_uuid);
            try {
                await patientCertificatesTbl.create(certificates, { returing: true });
                return res.status(200).send({ code: httpStatus.OK, message: 'inserted successfully', responseContents: certificates });
            } catch (ex) {
                console.log('Exception happened', ex);
                return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex });
            }
        } else {
            return res.status(400).send({ code: httpStatus.UNAUTHORIZED, message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}` });
        }

    };

    /**
      * getAll certificate Details
      * @param {*} req 
      * @param {*} res 
      */
    const _getPatientCertificates = async (req, res) => {
        const { user_uuid } = req.headers;
        const { patient_uuid } = req.query;
        try {
            if (user_uuid) {
                const certificatesData = await patientCertificateViewTbl.findAll({ where: { pc_patient_uuid: patient_uuid } });
                return res.status(200).send({ code: httpStatus.OK, responseContent: certificatesData });
            } else {
                return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.FOUND} ${emr_constants.OR} ${emr_constants.NO} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}` });
            }
        } catch (ex) {
            console.log('Exception happened', ex);
            return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex });
        }

    };

    return {

        createPatientCertificates: _createPatientCertificates,
        getPatientCertificates: _getPatientCertificates
    };


};


module.exports = CertificatesController();


async function assignDefault(certificates, user_uuid) {
    certificates.status = true;
    certificates.created_by = certificates.modified_by = user_uuid;
    certificates.created_date = certificates.modified_date = new Date();
    certificates.revision = 1;
    return certificates;
}

function certificateResponse(certificatesData) {
    return treatmentKitData.map((pc) => {
        return {
            uuid: pc.tk_uuid,
            code: pc.tk_code,
            name: pc.tk_name,
            share: pc.tk_is_public,
            department: pc.d_name,
            createdBy: pc.u_first_name + ' ' + pc.u_middle_name + '' + pc.u_last_name,
            status: pc.u_status
        };
    });
}