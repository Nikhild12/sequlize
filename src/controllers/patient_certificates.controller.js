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

    const _print_previous_certificates = async (req, res) => {
        try {
            const { certificate_uuid } = req.query;
            const { user_uuid, facility_uuid, authorization } = req.headers;

            let certificate_result = {};
            if (certificate_uuid && user_uuid && facility_uuid) {
                const result = await patientCertificatesTbl.findOne({
                    where: {
                        uuid: certificate_uuid,
                        is_active: ND_constats.IS_ACTIVE,
                    },
                    attributes: ['encounter_uuid', 'patient_uuid', 'facility_uuid', 'department_uuid', 'ward_master_uuid',
                        'admitted_date', 'admission_status_uuid', 'discharged_date', 'surgery_date', 'discharge_type_uuid', 'doctor_uuid', 'note_type_uuid',
                        'note_template_uuid', 'certificate_status_uuid', 'released_to_patient', 'released_on', 'released_by'
                        , 'approved_on', 'certified_date', 'certified_by', 'aproved_by', 'data_template'],

                });
                if (result && result != null) {
                    let patient_uuid = result.patient_uuid;
                    let encounterID = result.encounter_uuid;
                    let facilityID = result.facility_uuid;
                    let previousCertificateDetails = await getPreviousCertificateDetails(user_uuid, facility_uuid, authorization, encounterID, patient_uuid);
                    let facility_detials = await getFacilityDetails(facilityID);
                    certificate_result = { ...certificate_result, ...facility_detials };
                    certificate_result['notes'] = { note_template_uuid: result.note_template_uuid, data_template: result.data_template };
                    if (certificate_result) {
                        const pdfBuffer = await printService.createPdf(printService.renderTemplate((__dirname + "/../../assets/templates/prev_dis_summary.html"), {
                            results: certificate_result,
                            language: req.__('dischargeSummary')
                        }), {
                            "format": "A4",        // allowed units: A3, A4, A5, Legal, Letter, Tabloid
                            // "orientation": "landscape",
                            "width": "18in",
                            "height": "15in",
                            "header": {
                                "height": "5mm"
                            },
                            "footer": {
                                "height": "5mm"
                            }
                        });
                        if (pdfBuffer) {
                            res.writeHead(200, {
                                'Content-Type': 'application/pdf',
                                'Content-disposition': 'attachment;filename=previous_discharge_summary.pdf',
                                'Content-Length': pdfBuffer.length
                            });
                            res.end(Buffer.from(pdfBuffer, 'binary'));
                            return;
                        } else {
                            return res.status(400).send({ status: "failed", statusCode: httpStatus[500], message: ND_constats.WENT_WRONG });
                        }
                    }
                    else {
                        return res.status(400).send({ status: "failed", statusCode: httpStatus[400], message: ND_constats.WENT_WRONG });
                    }
                } else {
                    return res.status(400).send({ status: "failed", statusCode: httpStatus.OK, message: "No Records Found" });
                }
            }
            else {
                return res.status(422).send({ status: "failed", statusCode: httpStatus[422], message: "you are missing certificate_uuid / user_uuid / facility_uuid" });
            }

        }
        catch (ex) {
            return res.status(500).send({ status: "failed", statusCode: httpStatus.BAD_REQUEST, message: ex.message });
        }
    }



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