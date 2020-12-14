// Package Import
const httpStatus = require("http-status");
// const tickSheetDebug = require('debug')('app:favourite');

// Sequelizer Import
const sequelizeDb = require('../config/sequelize');

// EMR Constants Import
const emr_constants = require('../config/constants');

// EMR Utility Service
const emr_utility = require('../services/utility.service');

// Initialize Tick Sheet Master
const emrCccSettingsTbl = sequelizeDb.emr_ccc_settings;

function getEMRCccSettingsByUserId(uId) {
    return {
        where: {
            user_uuid: uId,
            is_active: emr_constants.IS_ACTIVE,
            status: emr_constants.IS_ACTIVE
        }
    };
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

const EMR_CCC_SETTINGS = () => {


    /**
     * Create History Settings API
     * @param {*} req 
     * @param {*} res 
     */
    const _createEmrCccSettings = async (req, res) => {

        const { user_uuid } = req.headers;
        const emrCccSettingsData = req.body;

        // checking user id and Settings Data > 0
        if (user_uuid && emrCccSettingsData && emrCccSettingsData.length > 0) {

            try {

                // Checking for Duplicate Record
                const existingRecord = await emrCccSettingsTbl.findAll(getEMRCccSettingsByUserId(user_uuid));
                if (existingRecord && existingRecord.length > 0) {
                    return res.status(400).send({ code: emr_constants.DUPLICATE_ENTRIE, message: `${emr_constants.DUPLICATE_RECORD} ${emr_constants.GIVEN_USER_UUID}` });
                }

                // otherwise create data
                emrCccSettingsData.forEach((ele) => {
                    ele.modified_by = ele.user_uuid = ele.created_by = user_uuid;
                    ele.is_active = ele.status = emr_constants.IS_ACTIVE;
                    ele.created_date = ele.modified_date = new Date();
                    ele.revision = 1;
                });

                const emrCccSetCreatedData = await emrCccSettingsTbl.bulkCreate(emrCccSettingsData, { returning: emr_constants.IS_ACTIVE, validate: true });
                if (emrCccSetCreatedData) {
                    return res.status(200).send({ code: httpStatus.OK, message: "Inserted EMR Workflow Successfully", responseContents: attachUUIDTORequestedData(emrCccSetCreatedData, emrCccSettingsData) });
                }
            } catch (ex) {
                console.log(ex);
                return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex });
            }

        } else {
            return res.status(400).send({ code: httpStatus[400], message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}` });
        }

    };

    /**
     * Delete EMR History By User Id and His Settings Id
     * @param {*} req 
     * @param {*} res 
     */
    const _deleteEMRCccSettings = async (req, res) => {

        const emrCccSetflowIds = req.body;
        const { user_uuid } = req.headers;

        let deleteEMRCccSetPromise = [];
        if (user_uuid && emrCccSetflowIds && emrCccSetflowIds.length > 0) {

            try {

                // Finding NaN element in given body req 
                // if exists returns bad req
                if (emrCccSetflowIds.map(Number).includes(NaN)) {
                    return res.status(400).send({ code: httpStatus[400], message: `${emr_constants.NO} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND} ${emr_constants.OR} ${emr_constants.SEND_PROPER_REQUEST} ${emr_constants.I_E_NUMBER_ARRAY}` });
                }

                emrCccSetflowIds.forEach((id) => {
                    deleteEMRCccSetPromise = [...deleteEMRCccSetPromise,
                    emrCccSettingsTbl.update(
                        { status: emr_constants.IS_IN_ACTIVE, is_active: emr_constants.IS_IN_ACTIVE, modified_by: user_uuid, modified_date: new Date() },
                        { where: { uuid: id, user_uuid: user_uuid } }
                    )];
                });

                const updatedEMRCccSetData = await Promise.all(deleteEMRCccSetPromise);

                if (updatedEMRCccSetData) {
                    return res.status(200).send({ code: httpStatus.OK, message: "Deleted Successfully" });
                }

            } catch (ex) {
                console.log(ex);
                return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
            }
        } else {
            return res.status(400).send({ code: httpStatus[400], message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}` });
        }

    };

    /**
     * Update History Settings for the userid
     * @param {*} req 
     * @param {*} res 
     */
    const _updateEMRCccSettings = async (req, res) => {

        const emrCccSettingsUpdateData = req.body;
        const { user_uuid } = req.headers;

        if (user_uuid && emrCccSettingsUpdateData && emrCccSettingsUpdateData.length > 0) {

            try {
                // Deleting Existing Data and creating new one
                const deleteCccSetData = await emrCccSettingsTbl.destroy({
                    where: { user_uuid: user_uuid }
                });

                emrCccSettingsUpdateData.forEach((emr) => {
                    emr = emr_utility.createIsActiveAndStatus(emr, user_uuid);
                });
                if (deleteCccSetData) {
                    const emrUpdatedData = await emrCccSettingsTbl.bulkCreate(emrCccSettingsUpdateData, { returning: emr_constants.IS_ACTIVE });
                    if (emrUpdatedData) {
                        return res.status(200).send({ code: httpStatus.OK, message: emr_constants.UPDATE_EMR_HIS_SET_SUC });
                    }
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

        createEmrCccSettings: _createEmrCccSettings,
        deleteEMRCccSettings: _deleteEMRCccSettings,
        updateEMRCccSettings: _updateEMRCccSettings

    };
};

module.exports = EMR_CCC_SETTINGS();

// send UUID In Created Dat
function attachUUIDTORequestedData(createdData, requestedData) {
    requestedData.forEach((rD, idx) => {
        rD.uuid = createdData[idx].uuid;
    });
    return requestedData;
}

// GET API Response
function getEMRCccSetData(emr_data) {

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
        };
    });

}