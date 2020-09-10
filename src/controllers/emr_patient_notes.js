//Package Import
const httpStatus = require("http-status");
//Sequelizer Import
const db = require('../config/sequelize');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
//EMR Constants Import
const emr_constants = require('../config/constants');
const config = require("../config/config");
const emr_utility = require('../services/utility.service');

// Patient notes
const patNotesAtt = require('../attributes/patient_previous_notes_attributes');
const rp = require('request-promise');
const sectionCategoryEntriesTbl = db.section_category_entries;
const profilesTbl = db.profiles;

const notesController = () => {

    /**
     * OPNotes main template save
     * @param {*} req 
     * @param {*} res 
     */
    const _addProfiles = async (req, res) => {

        const {
            user_uuid
        } = req.headers;
        let profiles = req.body;

        if (user_uuid) {
            profiles.forEach(e => {
                e.is_active = e.status = true;
                e.created_by = e.modified_by = user_uuid;
                e.created_date = e.modified_date = new Date();
                e.revision = 1;
            });


            try {
                const profileData = await sectionCategoryEntriesTbl.bulkCreate(profiles, {
                    returing: true
                });
                return res.status(200).send({
                    code: httpStatus.OK,
                    message: 'inserted successfully',
                    reqContents: req.body
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
                message: emr_constants.NO_USER_ID
            });
        }

    };

    const _getPreviousPatientOPNotes = async (req, res) => {
        const {
            user_uuid,
            authorization: Authorization
        } = req.headers;
        const {
            patient_uuid
        } = req.query;
        const {
            profile_type_uuid
        } = req.query;

        let filterQuery = {
            patient_uuid: patient_uuid,
            profile_type_uuid: profile_type_uuid,
            status: emr_constants.IS_ACTIVE,
            is_active: emr_constants.IS_ACTIVE
        };
        if (user_uuid && patient_uuid > 0) {
            try {
                const getOPNotesByPId = await getPrevNotes(filterQuery, Sequelize);

                if (getOPNotesByPId != null && getOPNotesByPId.length > 0) {

                    /**Get department name */
                    let departmentIds = [...new Set(getOPNotesByPId.map(e => e.profile.department_uuid))];
                    const departmentsResponse = await getDepartments(user_uuid, Authorization, departmentIds);
                    if (departmentsResponse) {
                        let data = [];
                        const resData = departmentsResponse.responseContent.rows;
                        resData.forEach(e => {
                            data[e.uuid] = e.name;
                            data[e.name] = e.code;
                        });
                        getOPNotesByPId.forEach(e => {
                            const department_uuid = e.dataValues.profile.dataValues.department_uuid;
                            e.dataValues.department_name = (data[department_uuid] ? data[department_uuid] : null);
                        });
                    }
                    /**Get user name */
                    /**Fetching user details from app master API */
                    let doctorIds = [...new Set(getOPNotesByPId.map(e => e.created_by))];
                    const doctorResponse = await getDoctorDetails(user_uuid, Authorization, doctorIds);
                    if (doctorResponse && doctorResponse.responseContents) {
                        let newData = [];
                        const resData = doctorResponse.responseContents;
                        resData.forEach(e => {
                            let last_name = (e.last_name ? e.last_name : '');
                            newData[e.uuid] = e.first_name + '' + last_name;
                        });
                        getOPNotesByPId.forEach(e => {
                            const {
                                created_by,
                            } = e.dataValues;
                            e.dataValues.created_user_name = (newData[created_by] ? newData[created_by] : null);
                        });
                    }
                    // Code and Message for Response
                    const code = emr_utility.getResponseCodeForSuccessRequest(getOPNotesByPId);
                    const message = emr_utility.getResponseMessageForSuccessRequest(code, 'ppnd');
                    // const notesResponse = patNotesAtt.getPreviousPatientOPNotes(getOPNotesByPId);
                    return res.status(200).send({
                        code: code,
                        message,
                        responseContents: getOPNotesByPId
                    });
                } else {
                    return res.status(200).send({
                        code: httpStatus.OK,
                        message: 'No Data Found'
                    });
                }

            } catch (ex) {
                console.log(`Exception Happened ${ex}`);
                return res.status(400).send({
                    code: httpStatus[400],
                    message: ex.message
                });

            }
        } else {
            return res.status(400).send({
                code: httpStatus[400],
                message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`
            });
        }
    };

    const _getOPNotesDetailsById = async (req, res) => {

        const {
            uuid
        } = req.query;
        const {
            user_uuid
        } = req.headers;

        try {
            if (user_uuid && uuid) {
                const notesData = await sectionCategoryEntriesTbl.findOne({
                    where: {
                        uuid: uuid
                    }
                }, {
                    returning: true
                });
                if (!notesData) {
                    return res.status(404).send({
                        code: 404,
                        message: emr_constants.NO_RECORD_FOUND
                    });
                }
                return res.status(200).send({
                    code: httpStatus.OK,
                    responseContent: notesData
                });
            } else {
                return res.status(400).send({
                    code: httpStatus.UNAUTHORIZED,
                    message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.FOUND} ${emr_constants.NO} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`
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

    const _getOPNotesDetailsByPatId = async (req, res) => {

        const {
            patient_uuid
        } = req.query;
        const {
            user_uuid
        } = req.headers;

        try {
            if (user_uuid && patient_uuid) {
                const patNotesData = await sectionCategoryEntriesTbl.findAll({
                    where: {
                        patient_uuid: patient_uuid
                    }
                }, {
                    returning: true
                });
                if (!patNotesData) {
                    return res.status(404).send({
                        code: 404,
                        message: emr_constants.NO_RECORD_FOUND
                    });
                }
                return res.status(200).send({
                    code: httpStatus.OK,
                    responseContent: patNotesData
                });
            } else {
                return res.status(400).send({
                    code: httpStatus.UNAUTHORIZED,
                    message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.FOUND} ${emr_constants.NO} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`
                });
            }
        } catch (ex) {
            return res.status(400).send({
                code: httpStatus.BAD_REQUEST,
                message: ex
            });
        }
    };

    return {
        addProfiles: _addProfiles,
        getPreviousPatientOPNotes: _getPreviousPatientOPNotes,
        getOPNotesDetailsById: _getOPNotesDetailsById,
        getOPNotesDetailsByPatId: _getOPNotesDetailsByPatId
    };
};

module.exports = notesController();


async function getPrevNotes(filterQuery, Sequelize) {
    //console.log(filterQuery);
    let sortField = 'created_date';
    let sortOrder = 'DESC';
    let sortArr = [sortField, sortOrder];
    return sectionCategoryEntriesTbl.findAll({
        where: filterQuery,
        group: ['profile_uuid'],
        attributes: ['uuid', 'patient_uuid', 'encounter_uuid', 'encounter_type_uuid', 'encounter_doctor_uuid', 'consultation_uuid', 'profile_uuid', 'entry_status', 'is_active', 'status', 'created_date', 'modified_by', 'created_by', 'modified_date',
            [Sequelize.fn('COUNT', Sequelize.col('profile_uuid')), 'Count']
        ],
        //order: [[Sequelize.fn('COUNT', Sequelize.col('profile_uuid')), 'DESC']],
        order: [sortArr],
        limit: 10,
        include: [{
            model: profilesTbl,
            attributes: ['uuid', 'profile_code', 'profile_name', 'profile_type_uuid', 'profile_description', 'facility_uuid', 'department_uuid', 'created_date']
        }],
    });

}

async function getDepartments(user_uuid, Authorization, departmentIds) {
    //const url = 'https://qahmisgateway.oasyshealth.co/DEVAppmaster/v1/api/department/getSpecificDepartmentsByIds';
    const url = config.wso2AppUrl + 'department/getSpecificDepartmentsByIds';

    let options = {
        uri: url,
        method: 'POST',
        headers: {
            Authorization: Authorization,
            user_uuid: user_uuid,
            'Content-Type': 'application/json'
        },
        body: {
            "uuid": departmentIds
        },
        json: true
    };
    const departmentData = await rp(options);
    if (departmentData) {
        return departmentData;
    }
}

async function getDoctorDetails(user_uuid, Authorization, doctorIds) {
    //const url = 'https://qahmisgateway.oasyshealth.co/DEVAppmaster/v1/api/userProfile/getSpecificUsersByIds';
    const url = config.wso2AppUrl + 'userProfile/getSpecificUsersByIds';
    let options = {
        uri: url,
        method: 'POST',
        headers: {
            Authorization: Authorization,
            user_uuid: user_uuid,
            'Content-Type': 'application/json'
        },
        body: {
            "uuid": doctorIds
        },
        json: true
    };
    const doctorData = await rp(options);
    if (doctorData) {
        return doctorData;
    }
}

async function getSpecificusers(data, req) {
    try {
        const getUsersUrl = 'userProfile/getSpecificUsersByIds';
        const postData = {
            uuid: data
        };
        const res = await getResultsInObject(getUsersUrl, req, postData);
        // console.log('???????????////', res);
        if (res.status) {
            let newData = [];
            const resData = res.data;
            resData.forEach(e => {

                const salution = (e.salutation_uuid == e.title.uuid ? e.title.name : null);
                // console.log('/////////////////////////////',salution);
                let last_name = (e.last_name ? e.last_name : '');

                newData[e.uuid] = e.first_name + '' + last_name;
                // + ' (' + e.user_type.name +')'
            });
            // console.log('>>>>>>newData>>>>>', newData);
            return {
                status: true,
                data: newData
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
}

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