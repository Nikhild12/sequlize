// Package Import
const httpStatus = require("http-status");

// Sequelizer Import
const sequelizeDb = require("../config/sequelize");

// Initialize EMR Workflow
const emr_workflow_settings = sequelizeDb.emr_workflow_settings;
const vm_emr_workflow = sequelizeDb.vw_emr_work_flow_setting;

const emr_constants = require("../config/constants");

const getEMRWorkFlowSettings = [
  "ews_uuid",
  "ews_facility_uuid",
  "ews_department_uuid",
  "ews_role_uuid",
  "ews_user_uuid",
  "ews_context_uuid",
  "ews_context_activity_map_uuid",
  "ews_activity_uuid",
  "ews_work_flow_order",
  "ews_is_active",
  "activity_code",
  "activity_name",
  "activity_icon",
  "activity_route_url"
];

function getEMRByUserId(uId) {
  return {
    where: {
      user_uuid: uId,
      is_active: emr_constants.IS_ACTIVE,
      status: emr_constants.IS_ACTIVE
    }
  };
}

const EMRWorkflowSettings = () => {
  const _createEMRWorkflow = async (req, res) => {
    const emrWorkflowSettingReqData = req.body;
    const { user_uuid } = req.headers;
    if (
      user_uuid &&
      emrWorkflowSettingReqData &&
      emrWorkflowSettingReqData.length > 0
    ) {
      try {
        const existingRecord = await emr_workflow_settings.findAll(
          getEMRByUserId(user_uuid)
        );

        if (existingRecord && existingRecord.length > 0) {
          return res.status(400).send({
            code: emr_constants.DUPLICATE_ENTRIE,
            message: `${emr_constants.DUPLICATE_RECORD} ${emr_constants.GIVEN_USER_UUID}`
          });
        }
        emrWorkflowSettingReqData.forEach(eRD => {
          eRD.modified_by = eRD.user_uuid = eRD.created_by = user_uuid;
          eRD.is_active = eRD.status = emr_constants.IS_ACTIVE;
          eRD.created_date = eRD.modified_date = new Date();
          eRD.revision = 1;
        });

        const emrCreatedData = await emr_workflow_settings.bulkCreate(
          emrWorkflowSettingReqData,
          { returning: emr_constants.IS_ACTIVE }
        );
        if (emrCreatedData) {
          return res.status(200).send({
            code: httpStatus.OK,
            message: "Inserted EMR Workflow Successfully",
            responseContents: attachUUIDTORequestedData
          });
        }
      } catch (ex) {
        console.log(ex);
        return res
          .status(400)
          .send({ code: httpStatus.BAD_REQUEST, message: ex.message });
      }
    } else {
      return res.status(400).send({
        code: httpStatus[400],
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}`
      });
    }
  };

  const _getEMRWorkFlowByUserId = async (req, res) => {
    const { user_uuid } = req.headers;
    let { context_uuid } = req.query;
    if (user_uuid) {
      try {

        if (!context_uuid) {
          context_uuid = 2;
        }
        const emr_data = await vm_emr_workflow.findAll({
          attributes: getEMRWorkFlowSettings,
          where: {
            ews_is_active: emr_constants.IS_ACTIVE,
            ews_user_uuid: user_uuid,
            ews_context_uuid : context_uuid
          }
        });

        if (emr_data) {
          const responseMessage =
            emr_data && emr_data.length > 0
              ? emr_constants.EMR_FETCHED_SUCCESSFULLY
              : `${emr_constants.NO_RECORD_FOUND} for the given user_uuid`;
          return res.status(200).send({
            code: httpStatus.OK,
            message: responseMessage,
            responseContents: getEMRData(emr_data)
          });
        }
      } catch (ex) {
        console.log(ex);
        return res
          .status(400)
          .send({ code: httpStatus.BAD_REQUEST, message: ex.message });
      }
    } else {
      return res.status(400).send({
        code: httpStatus[400],
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}`
      });
    }
  };

  const _updateEMRWorkflow = async (req, res) => {
    const emrWorkflowUpdateData = req.body;
    const { user_uuid } = req.headers;

    if (user_uuid && emrWorkflowUpdateData.length > 0) {
      try {
        const deleteData = await emr_workflow_settings.destroy({
          where: { user_uuid: user_uuid }
        });
        if (deleteData) {
          const emrUpdatedData = await emr_workflow_settings.bulkCreate(
            emrWorkflowUpdateData,
            { returning: emr_constants.IS_ACTIVE }
          );
          if (emrUpdatedData) {
            return res.status(200).send({
              code: httpStatus.OK,
              message: "Updated EMR Workflow Successfully"
            });
          }
        }
      } catch (ex) {
        console.log(ex);
        return res
          .status(400)
          .send({ code: httpStatus.BAD_REQUEST, message: ex.message });
      }
    } else {
      return res.status(400).send({
        code: httpStatus[400],
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}`
      });
    }
  };

  const _deleteEMRWorkflow = async (req, res) => {
    const emrWorkflowIds = req.body;
    const { user_uuid } = req.headers;

    let deleteEMRWorkflowPromise = [];
    if (user_uuid && emrWorkflowIds && emrWorkflowIds.length > 0) {
      try {
        if (emrWorkflowIds.map(Number).includes(NaN)) {
          return res.status(400).send({
            code: httpStatus[400],
            message: `${emr_constants.NO} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND} ${emr_constants.OR} ${emr_constants.SEND_PROPER_REQUEST} ${emr_constants.I_E_NUMBER_ARRAY}`
          });
        }

        emrWorkflowIds.map(Number).forEach(id => {
          deleteEMRWorkflowPromise = [
            ...deleteEMRWorkflowPromise,
            emr_workflow_settings.update(
              {
                status: emr_constants.IS_IN_ACTIVE,
                modified_by: user_uuid,
                modified_date: new Date()
              },
              { where: { uuid: id, user_uuid: user_uuid } }
            )
          ];
        });

        const updatedEMRData = await Promise.all(deleteEMRWorkflowPromise);

        if (updatedEMRData) {
          return res
            .status(200)
            .send({ code: httpStatus.OK, message: "Deleted Successfully" });
        }
      } catch (ex) {
        console.log(ex);
        return res
          .status(400)
          .send({ code: httpStatus.BAD_REQUEST, message: ex.message });
      }
    } else {
      return res.status(400).send({
        code: httpStatus[400],
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}`
      });
    }
  };

  return {
    createEMRWorkFlow: _createEMRWorkflow,
    getEMRWorkFlowByUserId: _getEMRWorkFlowByUserId,
    updateEMRWorkFlow: _updateEMRWorkflow,
    deleteEMRWorkflow: _deleteEMRWorkflow
  };
};

module.exports = EMRWorkflowSettings();

function attachUUIDTORequestedData(createdData, requestedData) {
  requestedData.forEach((rD, idx) => {
    rD.uuid = createdData[idx].uuid;
  });
  return requestedData;
}

/**
 * returns EMR data
 * in readable format
 */
function getEMRData(emr_data) {
  let emr_array = [];

  emr_data.forEach(e => {
    emr_array = [
      ...emr_array,
      {
        work_flow_order: e.ews_work_flow_order,
        emr_worflow_settings_id: e.ews_uuid,
        facility_uuid: e.ews_facility_uuid,
        role_uuid: e.ews_role_uuid,
        user_uuid: e.ews_user_uuid,
        ews_is_active: e.ews_is_active[0] === 1 ? true : false,
        activity_code: e.activity_code,
        activity_icon: e.activity_icon,
        activity_name: e.activity_name,
        activity_route_url: e.activity_route_url,
        activity_id: e.ews_activity_uuid,
        context_id: e.ews_context_uuid,
        context_activity_map_uuid: e.ews_context_activity_map_uuid
      }
    ];
  });
  return emr_array;
}
