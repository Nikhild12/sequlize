// Package Import
const httpStatus = require("http-status");

// Sequelizer Import
const sequelizeDb = require('../config/sequelize');

// Initialize EMR Workflow
const emr_workflow_settings = sequelizeDb.emr_workflow_settings;

const EMRWorkflowSettings = () => {

    const _createEMRWorkflow = async (req, res) => {
        const emrWorkflowSettingReqData = req.body;
        const { user_uuid } = req.headers;
        let createEMRWorkflowPromiseArray = [];
        try {
            if (user_uuid && emrWorkflowSettingReqData) {
                emrWorkflowSettingReqData.forEach((eRD) => {
                    eRD.modified_by = eRD.created_by = user_uuid;
                    eRD.is_active = true;
                    eRD.created_date = eRD.modified_date = new Date().toISOString();
                    createEMRWorkflowPromiseArray = [
                        ...createEMRWorkflowPromiseArray,
                        emr_workflow_settings.create(eRD, { returning: true })];
                });

                const emrCreatedData = await Promise.all(createEMRWorkflowPromiseArray);
                if (emrCreatedData) {
                    return res.status(200).send({ code: httpStatus.OK, message: "Inserted EMR Workflow Successfully", responseContents: attachUUIDTORequestedData });
                }
            }
        } catch (ex) {
            console.log(ex);
            return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
        }

    }
    return {
        createEMRWorkFlow: _createEMRWorkflow
    }
}

module.exports = EMRWorkflowSettings();

function attachUUIDTORequestedData(createdData, requestedData) {
    requestedData.forEach((rD, idx) => {
        rD.uuid = createdData[idx].uuid;
    });
    return requestedData;
}