// Package Import
const httpStatus = require("http-status");
const emr_constants = require('../config/constants');

// Sequelizer Import
const sequelizeDb = require('../config/sequelize');

// Initialize EMR Workflow
const chief_complaint_duration_periods = sequelizeDb.chief_complaint_duration_periods;

const acitve_boolean = 1;
const in_active_boolean = 0;

function getChiefComplaintsDurationQuery() {
    return {
        is_active: acitve_boolean,
        status: acitve_boolean
    };
}

function getChiefComplaintsDurationAttributes() {
    return [
        'uuid',
        'code',
        'name',
        'is_active',
        'status'
    ];
}

const ChiefComplaintsDuration = () => {


    const _getComplaintsDurationPeriodList = async (req, res) => {
        const { user_uuid } = req.headers;

        if (user_uuid) {
            try {

                const durationPeriodData = await chief_complaint_duration_periods.findAll({
                    attributes: getChiefComplaintsDurationAttributes(),
                    where: getChiefComplaintsDurationQuery()
                });

                if (durationPeriodData) {
                    return res.status(200).send({ code: httpStatus.OK, message: "Fetched Chief Complaints Duration List Successfully", responseContents: getComplaintsDurationList(durationPeriodData) });
                }

            } catch (ex) {
                console.log(ex);
                return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
            }
        } else {
            return res.status(400).send({ code: httpStatus[400], message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}` });
        }
    };

    const _createComplaintsDurationPeriod = async (req, res) => {

        const { user_uuid } = req.headers;
        const requesteddata = req.body;


        if (requesteddata && user_uuid) {
            try {

                requesteddata.is_active = requesteddata.status = true;
                requesteddata.revision = 1;
                requesteddata.created_by = requesteddata.modified_by = user_uuid;
                requesteddata.created_date = requesteddata.modified_date = new Date();


                const chief_complaints_createdData = await chief_complaint_duration_periods.create(requesteddata, { returning: true });

                if (chief_complaints_createdData) {
                    requesteddata.id = chief_complaints_createdData.uuid;
                    return res.status(200).send({ code: httpStatus.OK, message: "Chief Complaints Duration Period Inserted Successfully", responseContents: requesteddata });
                }

            } catch (ex) {

                console.log(ex);
                return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });

            }
        } else {
            return res.status(400).send({ code: httpStatus[400], message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}` });
        }
    };

    return {
        createComplaintsDurationPeriod: _createComplaintsDurationPeriod,
        getComplaintsDurationPeriodList: _getComplaintsDurationPeriodList
    };
};

module.exports = ChiefComplaintsDuration();

function getComplaintsDurationList(duraList) {
    let duration_list = [];

    duraList.forEach((dL) => {
        duration_list = [...duration_list, {
            duration_period_code: dL.code,
            duration_period_name: dL.name,
            duration_period_id: dL.uuid
        }];
    });
    return duration_list;
}

