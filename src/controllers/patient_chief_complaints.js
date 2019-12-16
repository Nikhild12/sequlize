// Package Import
const httpStatus = require("http-status");

// Sequelizer Import
const sequelizeDb = require('../config/sequelize');

// Initialize EMR Workflow
const patient_chief_complaints_tbl = sequelizeDb.patient_chief_complaints;
const chief_complaints_tbl = sequelizeDb.chief_complaints;
const chief_complaints_duration_tbl = sequelizeDb.chief_complaint_duration_periods;

const emr_constants = require('../config/constants');

function getPatientSearchQuery(searchKey, searchValue) {

    let searchObject;
    searchKey = searchKey.toLowerCase();
    switch (searchKey) {

        case 'encounterId':
            searchObject = 'encounter_uuid';
            break;
        case 'patientId':
        default:
            searchObject = 'patient_uuid';
            break;
    }

    return {
        where: {
            [searchObject]: searchValue,
            is_active: emr_constants.IS_ACTIVE,
            status: emr_constants.IS_ACTIVE
        },
        include: [
            {
                model: chief_complaints_tbl,
                attributes: ['code', 'name']
            },
            {
                model: chief_complaints_duration_tbl,
                attributes: ['code', 'name']
            }
        ]
    }
}

const PatientChiefComplaints = () => {

    /**
     * 
     * @param {*} req 
     * @param {*} res 
     */
    const _createChiefComplaints = async (req, res) => {

        const { user_uuid } = req.headers;
        const chiefComplaintsData = req.body;

        if (chiefComplaintsData && chiefComplaintsData.length > 0 && user_uuid) {

            chiefComplaintsData.forEach((cD) => {
                cD.is_active = cD.status = emr_constants.is_active;
                cD.created_date = cD.modified_date = cD.performed_date = new Date();
                cD.modified_by = cD.created_by = cD.performed_by = user_uuid;
            });

            try {

                const chiefComplaintsCreatedData = await patient_chief_complaints_tbl.bulkCreate(chiefComplaintsData, { returning: true });
                if (chiefComplaintsCreatedData) {
                    return res.status(200).send({ code: httpStatus.OK, message: "Inserted Patient Chief Complaints Successfully", responseContents: attachUUIDTOCreatedData(chiefComplaintsData, chiefComplaintsCreatedData) });
                }

            } catch (ex) {
                return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
            }

        } else {
            return res.status(400).send({ code: httpStatus[400], message:  `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}` });
        }
    }

    /**
     * This is a filter API
     * Key is - Patient Id and Encounter Id
     * Otherwise it return entire list
     */
    const _getPatientChiefComplaints = async (req, res) => {

        const { searchKey, searchValue } = req.query;

        if (searchKey && searchValue) {
            try {

                const patChiefComplaintsData = await patient_chief_complaints_tbl.findAll(getPatientSearchQuery(searchKey, searchValue));
                return res.status(200).send({ code: httpStatus.OK, message: "Fetched Patient Chief Complaints Successfully", responseContents: getPatientsChiefComplaintsInReadable(patChiefComplaintsData) });

            } catch (ex) {

                console.log(ex.message);
                return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });

            }
        } else {
            return res.status(422).send({ code: httpStatus[400], message: "No Request Param Found" });
        }

    }

    return {

        createChiefComplaints: _createChiefComplaints,
        getPatientChiefComplaints: _getPatientChiefComplaints
    }
}

module.exports = PatientChiefComplaints();

function attachUUIDTOCreatedData(reqData, createdData) {
    reqData.forEach((rD, idx) => {
        rD.uuid = createdData[idx].uuid;
    });

    return reqData;
}

function getPatientsChiefComplaintsInReadable(fetchedData) {
    let patientChiefComplaints = [];
    fetchedData.forEach((fD) => {
        patientChiefComplaints = [...patientChiefComplaints,
        {
            patient_chief_complaint_id: fD.uuid,
            encounter_id: fD.encounter_uuid,
            encounter_type_id: fD.encounter_type_uuid,
            consulation_id: fD.consulation_uuid,
            chief_complaint_id: fD.chief_complaint_uuid,
            chief_complaint_name: fD.chief_complaint && fD.chief_complaint.name ? fD.chief_complaint.name : '',
            chief_complaint_code: fD.chief_complaint && fD.chief_complaint.code ? fD.chief_complaint.code : '',
            chief_complaint_duration_id: fD.chief_complaint_duration_period_uuid,
            chief_complaint_duration_name: fD.chief_complaint_duration_period && fD.chief_complaint_duration_period.name ? fD.chief_complaint_duration_period.name : '',
            chief_complaint_duration_code: fD.chief_complaint_duration_period && fD.chief_complaint_duration_period.code ? fD.chief_complaint_duration_period.code : '',
            is_active: fD.is_active[0] === 1 ? true : false,
            status: fD.status[0] === 1 ? true : false,
            created_by: fD.created_by,
            modified_by: fD.modified_by,
            created_date: fD.created_date,
            modified_date: fD.modified_date
        }];
    });
    return patientChiefComplaints;
}