// Package Import
const httpStatus = require("http-status");

// Sequelizer Import
const sequelizeDb = require("../config/sequelize");
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
// Initialize EMR Workflow
const emr_workflow_settings = sequelizeDb.emr_workflow_settings;
const vm_emr_workflow = sequelizeDb.vw_emr_work_flow_setting;

const emr_constants = require("../config/constants");
const _requests = require('../requests/requests');
// Lodash Import
const _ = require("lodash");

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

function getEMRByUserId(uId, cxtId) {
  return {
    where: {
      user_uuid: uId,
      context_uuid: cxtId,
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
        const { context_uuid } = emrWorkflowSettingReqData[0];
        if (!context_uuid) {
          return res.status(400).send({
            code: emr_constants.REQUIRED_VALUE_NOT_FOUND,
            message: `${emr_constants.PLEASE_SEND_CONTEXT_UUID}`
          });
        }
        const existingRecord = await emr_workflow_settings.findAll(
          getEMRByUserId(user_uuid, context_uuid)
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
    let { search } = req.body;
    if (user_uuid) {
      try {
        if (!context_uuid) {
          context_uuid = 2;
        }
       // H30-49781  --getEMRWorkflowByUserId view replace with api call - jevin -- Start 
        let findquery={
          attributes: [['uuid','ews_uuid'],['facility_uuid','ews_facility_uuid'],['department_uuid','ews_department_uuid'],['role_uuid','ews_role_uuid'],['user_uuid','ews_user_uuid'],['context_uuid','ews_context_uuid'],['context_activity_map_uuid','ews_context_activity_map_uuid'],['activity_uuid','ews_activity_uuid'],['work_flow_order','ews_work_flow_order'],['status','ews_status'],['is_active','ews_is_active'],['created_by','ews_created_by'],['created_date','ews_created_date'],['modified_by','ews_modified_by'],['modified_date','ews_modified_date']],
          where: {
            is_active: emr_constants.IS_ACTIVE,
            user_uuid: user_uuid,
            context_uuid: context_uuid,
           // act_is_active: emr_constants.IS_ACTIVE,
            //act_status: emr_constants.IS_ACTIVE
          },
        }
        // if (search && /\S/.test(search)) {
        //   findquery.where[Op.or] = [
        //     Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_emr_work_flow_setting.activity_name')), 'LIKE', '%' + search.toLowerCase() + '%'),
  
        //   ];
        // }
        // const emr_data = await vm_emr_workflow.findAll(findquery);

        let emr_data  =  await emr_workflow_settings.findAll(findquery)
        emr_data = JSON.parse(JSON.stringify(emr_data))
        if(emr_data && emr_data.length){
          let activityIds = [...new Set(emr_data.map(e => e.ews_activity_uuid))];
          let activityData = await _requests.getResults('activity/getActivityByIds', req, {
            uuids: activityIds
          });
          let activityGroupBy  = activityData.responseContents && activityData.responseContents.length ? _.groupBy(activityData.responseContents, 'uuid') : [];
          let finalRes = []
          emr_data.forEach(ele=>{
            let newObj = JSON.parse(JSON.stringify(ele));
            newObj.activity_code = activityGroupBy[ele.ews_activity_uuid] && activityGroupBy[ele.ews_activity_uuid].length ? activityGroupBy[ele.ews_activity_uuid][0].code : ''
            newObj.activity_name = activityGroupBy[ele.ews_activity_uuid] && activityGroupBy[ele.ews_activity_uuid].length ? activityGroupBy[ele.ews_activity_uuid][0].name : ''
            newObj.activity_icon = activityGroupBy[ele.ews_activity_uuid] && activityGroupBy[ele.ews_activity_uuid].length ? activityGroupBy[ele.ews_activity_uuid][0].icon : ''
            newObj.activity_route_url = activityGroupBy[ele.ews_activity_uuid] && activityGroupBy[ele.ews_activity_uuid].length ? activityGroupBy[ele.ews_activity_uuid][0].route_url : ''
            newObj.act_is_active = activityGroupBy[ele.ews_activity_uuid] && activityGroupBy[ele.ews_activity_uuid].length ? activityGroupBy[ele.ews_activity_uuid][0].is_active : ''
            newObj.act_status = activityGroupBy[ele.ews_activity_uuid] && activityGroupBy[ele.ews_activity_uuid].length ? activityGroupBy[ele.ews_activity_uuid][0].status : ''
            finalRes.push(newObj);
          });

          const responseMessage =
          finalRes && finalRes.length > 0
            ? emr_constants.EMR_FETCHED_SUCCESSFULLY
            : `${emr_constants.NO_RECORD_FOUND} for the given user_uuid`;
        return res.status(200).send({
          code: httpStatus.OK,
          message: responseMessage,
          responseContents: getEMRData(finalRes)
        });
        //H30-49781  --getEMRWorkflowByUserId view replace with api call  - jevin -- End
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

  const _getEMRWorkFlowByContextId = async (req, res) => {
    let { context_uuid } = req.query;
    let { search } = req.body;
    if (context_uuid) {
      try {
        //H30-49781  --getEMRWorkflowByUserId view replace with api call  - jevin -- End
        let findquery={
          attributes: [['uuid','ews_uuid'],['facility_uuid','ews_facility_uuid'],['department_uuid','ews_department_uuid'],['role_uuid','ews_role_uuid'],['user_uuid','ews_user_uuid'],['context_uuid','ews_context_uuid'],['context_activity_map_uuid','ews_context_activity_map_uuid'],['activity_uuid','ews_activity_uuid'],['work_flow_order','ews_work_flow_order'],['status','ews_status'],['is_active','ews_is_active'],['created_by','ews_created_by'],['created_date','ews_created_date'],['modified_by','ews_modified_by'],['modified_date','ews_modified_date']],
          where: {
            is_active: emr_constants.IS_ACTIVE,
            context_uuid: context_uuid,
          }
        };
        // if (search && /\S/.test(search)) {
        //   findquery.where[Op.or] = [
        //     Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_emr_work_flow_setting.activity_name')), 'LIKE', '%' + search.toLowerCase() + '%'),
        //   ];
        // }
        //const emr_data = await vm_emr_workflow.findAll(findquery);


        let emr_data  =  await emr_workflow_settings.findAll(findquery)
        emr_data = JSON.parse(JSON.stringify(emr_data))
        if(emr_data && emr_data.length){
          let activityIds = [...new Set(emr_data.map(e => e.ews_activity_uuid))];
          let activityData = await _requests.getResults('activity/getActivityByIds', req, {
            uuids: activityIds
          });
          let activityGroupBy  = activityData.responseContents && activityData.responseContents.length ? _.groupBy(activityData.responseContents, 'uuid') : [];
          let finalRes = []
          emr_data.forEach(ele=>{
            let newObj = JSON.parse(JSON.stringify(ele));
            newObj.activity_code = activityGroupBy[ele.ews_activity_uuid] && activityGroupBy[ele.ews_activity_uuid].length ? activityGroupBy[ele.ews_activity_uuid][0].code : ''
            newObj.activity_name = activityGroupBy[ele.ews_activity_uuid] && activityGroupBy[ele.ews_activity_uuid].length ? activityGroupBy[ele.ews_activity_uuid][0].name : ''
            newObj.activity_icon = activityGroupBy[ele.ews_activity_uuid] && activityGroupBy[ele.ews_activity_uuid].length ? activityGroupBy[ele.ews_activity_uuid][0].icon : ''
            newObj.activity_route_url = activityGroupBy[ele.ews_activity_uuid] && activityGroupBy[ele.ews_activity_uuid].length ? activityGroupBy[ele.ews_activity_uuid][0].route_url : ''
            newObj.act_is_active = activityGroupBy[ele.ews_activity_uuid] && activityGroupBy[ele.ews_activity_uuid].length ? activityGroupBy[ele.ews_activity_uuid][0].is_active : ''
            newObj.act_status = activityGroupBy[ele.ews_activity_uuid] && activityGroupBy[ele.ews_activity_uuid].length ? activityGroupBy[ele.ews_activity_uuid][0].status : ''
            finalRes.push(newObj);
          });

          const responseMessage =
          finalRes && finalRes.length > 0
            ? emr_constants.EMR_FETCHED_SUCCESSFULLY
            : `${emr_constants.NO_RECORD_FOUND} for the given context`;
        return res.status(200).send({
          code: httpStatus.OK,
          message: responseMessage,
          responseContents: getEMRData(finalRes)
        });
        //H30-49781  --getEMRWorkflowByUserId view replace with api call  - jevin -- End
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
        message: `${emr_constants.NO} ${emr_constants.NO_CONTEXT_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}`
      });
    }
  };

  const _updateEMRWorkflow = async (req, res) => {
    const emrWorkflowUpdateData = req.body;
    const { user_uuid } = req.headers;
    let context_uuid = 2;
    if (user_uuid && emrWorkflowUpdateData.length > 0) {
      try {
        if (emrWorkflowUpdateData[0].context_uuid === 3) {
          context_uuid = 3;
        }
        const deleteData = await emr_workflow_settings.destroy({
          where: { user_uuid: user_uuid, context_uuid: context_uuid }
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
    getEMRWorkFlowByContextId: _getEMRWorkFlowByContextId,
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
