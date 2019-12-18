// Package Import
const httpStatus = require("http-status");
// const tickSheetDebug = require('debug')('app:favourite');

// Sequelizer Import
const sequelizeDb = require('../config/sequelize');

// EMR Constants Import
const emr_constants = require('../config/constants');

// Initialize Tick Sheet Master
const emrHistorySettingsTbl = sequelizeDb.emr_history_settings;
const vw_emr_history_settings = sequelizeDb.vw_emr_history_settings;


function getEMRHistorySettingsByUserId(uId) {
    return {
        where: {
            user_uuid: uId,
            is_active: emr_constants.IS_ACTIVE,
            status: emr_constants.IS_ACTIVE
        }
    }
}

const getEMRWorkFlowSettings = [
    'ehs_uuid',
    'ehs_facility_uuid',
    'ehs_department_uuid',
    'ehs_role_uuid',
    'ehs_user_uuid',
    'ehs_context_uuid',
    'ehs_context_activity_map_uuid',
    'ehs_activity_uuid',
    'ehs_history_view_order',
    'ehs_is_active',
    'activity_code',
    'activity_name',
    'activity_icon',
    'activity_route_url'
];

const EMR_HISTORY_SETTINGS = () => {


    /**
     * Create History Settings API
     * @param {*} req 
     * @param {*} res 
     */
    const _createEmrHistorySettings = async (req, res) => {

        const { user_uuid } = req.headers;
        const emrHistorySettingsData = req.body;

        // checking user id and Settings Data > 0
        if (user_uuid && emrHistorySettingsData && emrHistorySettingsData.length > 0) {

            try {

                // Checking for Duplicate Record
                const existingRecord = await emrHistorySettingsTbl.findAll(getEMRHistorySettingsByUserId(user_uuid));
                if (existingRecord && existingRecord.length > 0) {
                    return res.status(400).send({ code: emr_constants.DUPLICATE_ENTRIE, message: `${emr_constants.DUPLICATE_RECORD} ${emr_constants.GIVEN_USER_UUID}` });
                }

                // otherwise create data
                emrHistorySettingsData.forEach((ele) => {
                    ele.modified_by = ele.user_uuid = ele.created_by = user_uuid;
                    ele.is_active = ele.status = emr_constants.IS_ACTIVE;
                    ele.created_date = ele.modified_date = new Date();
                    ele.revision = 1;
                });

                const emrHisSetCreatedData = await emrHistorySettingsTbl.bulkCreate(emrHistorySettingsData, { returning: emr_constants.IS_ACTIVE, validate: true });
                if (emrHisSetCreatedData) {
                    return res.status(200).send({ code: httpStatus.OK, message: "Inserted EMR Workflow Successfully", responseContents: attachUUIDTORequestedData(emrHisSetCreatedData, emrHistorySettingsData) });
                }
            } catch (ex) {
                console.log(ex);
                return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex });
            }

        } else {
            return res.status(400).send({ code: httpStatus[400], message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}` });
        }

    }

    /**
     * Get History Settings API By User Id
     * @param {*} req 
     * @param {*} res 
     */
    const _getEMRHistorySettingsByUserId = async (req, res) => {

        const { user_uuid } = req.headers;

        if (user_uuid) {
            try {
                const emr_history_settings_data = await vw_emr_history_settings.findAll({
                    attributes: getEMRWorkFlowSettings,
                    where: {
                        ehs_is_active: emr_constants.IS_ACTIVE,
                        ehs_status: emr_constants.IS_ACTIVE,
                        ehs_user_uuid: user_uuid
                    }
                });

                if (emr_history_settings_data) {
                    const responseMessage = emr_history_settings_data && emr_history_settings_data.length > 0 ? emr_constants.EMR_FETCHED_SUCCESSFULLY : `${emr_constants.NO_RECORD_FOUND} for the given user_uuid`;
                    return res.status(200).send({ code: httpStatus.OK, message: responseMessage, responseContents: getEMRHisSetData(emr_history_settings_data) });
                }
            } catch (ex) {
                console.log(ex);
                return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
            }
        } else {
            return res.status(400).send({ code: httpStatus[400], message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}` });
        }
    }

    return {
        createEmrHistorySettings: _createEmrHistorySettings,
        getEMRHistorySettingsByUserId: _getEMRHistorySettingsByUserId
    }
}

module.exports = EMR_HISTORY_SETTINGS();

// send UUID In Created Dat
function attachUUIDTORequestedData(createdData, requestedData) {
    requestedData.forEach((rD, idx) => {
        rD.uuid = createdData[idx].uuid;
    });
    return requestedData;
}

// GET API Response
function getEMRHisSetData(emr_data) {

    return emr_data.map((e) => {
        return {
            work_flow_order: e.ehs_history_view_order,
            emr_history_settings_id: e.ehs_uuid,
            facility_uuid: e.ehs_facility_uuid,
            role_uuid: e.ehs_role_uuid,
            user_uuid: e.ehs_user_uuid,
            ehs_is_active: e.ehs_is_active[0] === 1 ? true : false,
            activity_code: e.activity_code,
            activity_icon: e.activity_icon,
            activity_name: e.activity_name,
            activity_route_url: e.activity_route_url,
            activity_id: e.ehs_activity_uuid
        }
    });

}