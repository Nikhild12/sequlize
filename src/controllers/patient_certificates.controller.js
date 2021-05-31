// Package Import
const httpStatus = require('http-status');

// Sequelizer Import
const Sequelize = require('sequelize');
const sequelizeDb = require('../config/sequelize');
const Op = Sequelize.Op;
const config = require("../config/config");
const request = require('request');
const rp = require('request-promise');
const printService = require('../services/print.service');
const moment = require("moment");

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

        const {
            user_uuid
        } = req.headers;
        let certificates = req.body;

        if (user_uuid && certificates) {
            await assignDefault(certificates, user_uuid);
            try {
                await patientCertificatesTbl.create(certificates, {
                    returing: true
                });
                return res.status(200).send({
                    code: httpStatus.OK,
                    message: 'inserted successfully',
                    responseContents: certificates
                });
            } catch (ex) {
                console.log('Exception happened', ex);
                return res.status(400).send({
                    code: httpStatus.BAD_REQUEST,
                    message: ex
                });
            }
        } else {
            return res.status(400).send({
                code: httpStatus.UNAUTHORIZED,
                message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}`
            });
        }

    };

    /**
     * getAll certificate Details
     * @param {*} req 
     * @param {*} res 
     */
    const _getPatientCertificates = async (req, res) => {
        const {
            user_uuid
        } = req.headers;
        const {
            patient_uuid
        } = req.query;
        try {
            if (user_uuid) {
                const certificatesData = await patientCertificateViewTbl.findAll({
                    where: {
                        pc_patient_uuid: patient_uuid
                    }
                });
                return res.status(200).send({
                    code: httpStatus.OK,
                    responseContent: certificatesData
                });
            } else {
                return res.status(400).send({
                    code: httpStatus.BAD_REQUEST,
                    message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.FOUND} ${emr_constants.OR} ${emr_constants.NO} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`
                });
            }
        } catch (ex) {
            console.log('Exception happened', ex);
            return res.status(400).send({
                code: httpStatus.BAD_REQUEST,
                message: ex
            });
        }

    };

    const _print_previous_certificates = async (req, res) => {
        try {
            const {
                certificate_uuid
            } = req.query;
            const {
                user_uuid,
                facility_uuid
            } = req.headers;

            let certificate_result = {};
            if (certificate_uuid && user_uuid) {
                const result = await patientCertificatesTbl.findOne({
                    where: {
                        uuid: certificate_uuid,
                        status: 1,
                    },
                    attributes: ['uuid', 'patient_uuid', 'facility_uuid', 'department_uuid', 'data_template'],

                });
                if (result) {
                    certificate_result = {
                        ...result
                    };
                    if (certificate_result) {
                        const allpatientsC = await getallpatientdetials(user_uuid, req.headers.authorization, result.dataValues.patient_uuid);

                        const data = allpatientsC.responseContent;

                        const patdetails = {
                            patient_name: data ? data.first_name : '',
                            age: data ? data.age : '',
                            period: data ? (data.period_detail.name == 'Year' ? "Year(s)" : data.period_detail.name) : '',
                            gender: data ? data.gender_details.name : '',
                            pa_title: data ? data.salutation_details.name : '',
                            mobile: data ? data.mobile : '',
                            pin: data ? data.pin : '',
                            doctor_name: data ? data.first_name : '',
                            dept_name: data ? data.patient_visits[0].department_details.name : '',
                            title: data ? data.salutation_details.name : '',
                            date: data ? moment(data.created_date).format('DD-MMM-YYYY hh:mm A') : '',
                        }

                        certificate_result.dataValues.data_template = patdetails;
                        const facility_result = await getFacilityDetails(req);
                        if (facility_result.status) {
                            let {
                                status: data_facility_status,
                                facility_uuid: data_facility_uuid,
                                facility
                            } = facility_result.data;
                            let {
                                facility_printer_setting: facPrSet
                            } = facility;
                            let isFaciltySame = (facility_uuid == data_facility_uuid);
                            certificate_result.dataValues.data_template.header1 = (isFaciltySame ? (facPrSet ? facPrSet.printer_header1 : facPrSet.pharmacy_print_header1) : '');
                            certificate_result.dataValues.data_template.header2 = (isFaciltySame ? (facPrSet ? facPrSet.printer_header2 : facPrSet.pharmacy_print_header2) : '');
                            certificate_result.dataValues.data_template.footer1 = (isFaciltySame ? (facPrSet ? facPrSet.printer_footer1 : facPrSet.pharmacy_print_footer1) : '');
                            certificate_result.dataValues.data_template.footer2 = (isFaciltySame ? (facPrSet ? facPrSet.printer_footer2 : facPrSet.pharmacy_print_footer2) : '');
                        }
                        // return res.send(certificate_result.dataValues.data_template)
                        const pdfBuffer = await printService.createPdf(printService.renderTemplate((__dirname + "/../assets/templates/patient_certificate.html"), {
                            headerObj: certificate_result.dataValues.data_template,
                            // language: req.__('dischargeSummary')
                        }), {
                            format: 'A4',
                            header: {
                                height: '45mm'
                            },
                            footer: {
                                height: '20mm',
                                contents: {
                                    default: '<div style="color: #444;text-align: right;font-size: 10px;padding-right:0.5in;">Page Number: <span>{{page}}</span>/<span>{{pages}}</span></div>'
                                }
                            },
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
                            return res.status(400).send({
                                status: "failed",
                                statusCode: httpStatus[500],
                                message: ND_constats.WENT_WRONG
                            });
                        }
                    } else {
                        return res.status(400).send({
                            status: "failed",
                            statusCode: httpStatus[400],
                            message: ND_constats.WENT_WRONG
                        });
                    }
                } else {
                    return res.status(400).send({
                        status: "failed",
                        statusCode: httpStatus.OK,
                        message: "No Records Found"
                    });
                }
            } else {
                return res.status(422).send({
                    status: "failed",
                    statusCode: httpStatus[422],
                    message: "you are missing certificate_uuid / user_uuid "
                });
            }

        } catch (ex) {
            return res.status(500).send({
                status: "failed",
                statusCode: httpStatus.BAD_REQUEST,
                message: ex.message
            });
        }
    };

    // #H30-37944 Added for View Certificate By Elumalai Govindan
    const _previous_certificatebyid = async (req, res) => {
        try {
            const {
                certificate_uuid
            } = req.query;
            const {
                user_uuid
            } = req.headers;

            let certificate_result = {};
            if (certificate_uuid && user_uuid) {
                const result = await patientCertificatesTbl.findOne({
                    where: {
                        uuid: certificate_uuid,
                        status: 1,
                    },
                    attributes: ['uuid', 'patient_uuid', 'facility_uuid', 'department_uuid', 'data_template', 'note_template_uuid']
                });
                if (result) {

                    const allpatientsC = await getallpatientdetials(user_uuid, req.headers.authorization, result.dataValues.patient_uuid);

                    if (allpatientsC && Object.keys(allpatientsC).length && allpatientsC.statusCode == 200 && allpatientsC.responseContent) {

                        const data = allpatientsC.responseContent;

                        const patdetails = {
                            patient_name: data.salutation_details ? data.salutation_details.name.concat(' ', data.first_name) : data.first_name,
                            age: data.age,
                            period: data.period_detail ? (data.period_detail.name == 'Year' ? "Year(s)" : data.period_detail.name) : '',
                            gender: data.gender_details ? data.gender_details.name : '',
                            pa_title: data.salutation_details ? data.salutation_details.name : '',
                            mobile: data.mobile,
                            pin: data.pin,
                            doctor_name: data.first_name,
                            dept_name: data.patient_visits && data.patient_visits[0].department_details ? data.patient_visits[0].department_details.name : '',
                            title: data.salutation_details ? data.salutation_details.name : '',
                            date: moment(data.created_date).format('DD-MMM-YYYY hh:mm A'),
                        };

                        result.dataValues['patient_details'] = patdetails;
                    } else {
                        result.dataValues['patient_details'] = {};
                    }
                    return res.status(httpStatus.OK).send({
                        status: "success",
                        statusCode: httpStatus.OK,
                        message: "Success",
                        responseContent: result
                    });

                } else {
                    return res.status(httpStatus.OK).send({
                        status: "failed",
                        statusCode: httpStatus.OK,
                        message: "No data found"
                    });
                }
            } else {
                return res.status(422).send({
                    status: "failed",
                    statusCode: httpStatus.UNPROCESSABLE_ENTITY,
                    message: "you are missing certificate_uuid / user_uuid "
                });
            }
        } catch (ex) {
            return res.status(500).send({
                status: "failed",
                statusCode: httpStatus.BAD_REQUEST,
                message: ex.message
            });
        }
    };

    return {

        createPatientCertificates: _createPatientCertificates,
        getPatientCertificates: _getPatientCertificates,
        previous_certificatebyid: _previous_certificatebyid,
        print_previous_certificates: _print_previous_certificates
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
async function getallpatientdetials(user_uuid, authorization, PData) {
    try {
        let options = {
            uri: config.wso2RegisrationUrl.concat('patient/getById'), //Changed Hardcoded URL By Elumalai
            method: 'POST',
            headers: {
                "content-type": 'application/json',
                "Authorization": authorization,
                "user_uuid": user_uuid,
                "accept-language": "en"
            },
            body: {
                "patientId": PData
            },
            json: true
        };
        const dep_details = await rp(options);
        return dep_details;
    } catch (error) {
        // console.log(error);
        return {};
    }
}
const getFacilityDetails = async (req) => {
    try {
        const getFacilityUrl = 'facility/getFacilityById';
        const postData = {
            Id: req.headers.facility_uuid
        };

        const res = await getResultsInObject(getFacilityUrl, req, postData);
        console.log('>>>>>>>>>>>>>>>facility_res', res);
        if (res.status && res.data.length > 0) {
            const resData = res.data;
            return {
                status: true,
                data: resData
            };
        } else {
            return res;
        }
    } catch (err) {
        const errorMsg = err.errors ? err.errors[0].message : err.message;
        return {
            status: false,
            message: errorMsg
        };
    }
};

const getResultsInObject = async (url, req, data) => {
    try {
        const _url = config.wso2AppUrl + url;
        console.log("_url::", _url);
        let options = {
            uri: _url,
            headers: {
                user_uuid: req.headers.user_uuid,
                facility_uuid: req.headers.facility_uuid,
                Authorization: req.headers.authorization
            },
            method: "POST",
            json: true, // Automatically parses the JSON string in the response
            // body : {
            //     uuid : data
            // }

        };

        if (data) {
            options.body = data;
        }

        console.log("options:", options);
        const results = await rp(options);
        console.log("getResultsInObject_ResultData:", results);

        if (results.responseContents) {
            if (results.responseContents.length <= 0) {
                return {
                    status: false,
                    message: "No content"
                };
            } else {
                return {
                    status: true,
                    data: results.responseContents
                };
            }
        } else if (results.responseContent) {
            if (results.responseContent.length <= 0) {
                return {
                    status: false,
                    message: "No content"
                };
            } else {
                return {
                    status: true,
                    data: results.responseContent
                };
            }
        }

    } catch (err) {
        const errorMsg = err.errors ? err.errors[0].message : err.message;
        return {
            status: false,
            message: errorMsg
        };
    }
};