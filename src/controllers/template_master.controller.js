const httpStatus = require("http-status");
const sequelize = require("sequelize");
const Op = sequelize.Op;

const db = require("../config/sequelize");
const emr_utility = require("../services/utility.service");
const note_templates_controller = require("../controllers/note_templates.controller");
// Import EMR Constants
const emr_constants = require("../config/constants");

//import tables
const tempmstrTbl = db.template_master;
const tempmstrdetailsTbl = db.template_master_details;
const vitalMasterTbl = db.vital_masters;
const vw_template = db.vw_template_master_details;
const vw_lab = db.vw_lab_template;
const vw_diet = db.vw_template_master_diet;
const vw_ris = db.vw_ris_template;
const vw_all_temp = db.vw_all_templates;
const vw_profile_ris = db.vw_profile_ris_template;
const vw_profile_lab = db.vw_profile_lab_template;
const vw_profile_invest = db.vw_profile_invest_template;

const tmpmstrController = () => {
  /**
   * Returns jwt token if valid username and password is provided
   * @param req
   * @param res
   * @param next
   * @returns {*}
   */

  const _gettemplateByID = async (req, res) => {
    const {
      user_uuid,
      facility_uuid
    } = req.headers;
    let {
      temp_type_id,
      dept_id,
      lab_id,
      store_master_uuid
    } = req.query;
    try {
      if (user_uuid > 0 && temp_type_id > 0 && (dept_id > 0 || lab_id > 0)) {
        if ([5, 6, 8].includes(+(temp_type_id))) {
          return res.status(400).send({
            code: httpStatus[400],
            message: emr_constants.TEMPLATE_REQUIRED_TYPES
          });
        }
        if (+(temp_type_id) === 1 && !store_master_uuid) {
          return res.status(400).send({
            code: httpStatus[400],
            message: emr_constants.PRESCRIPTION_STORE_MASTER,
          });
        }
        const {
          table_name,
          query
        } = getTemplateTypeUUID(
          temp_type_id,
          dept_id,
          user_uuid,
          facility_uuid,
          lab_id,
          store_master_uuid
        );
        console.log(table_name);
        const templateList = await table_name.findAll(query);
        if (templateList != null && templateList.length > 0) {
          return res.status(httpStatus.OK).json({
            statusCode: 200,
            responseContents: getTempData(temp_type_id, templateList),
            message: templateList && templateList.length > 0 ?
              emr_constants.TEMPLATE_FETCH_SUCCESS :
              emr_constants.NO_RECORD_FOUND
          });
        } else {
          temp_type_id = +(temp_type_id);
          const responseContent = {
            1: {
              templates_list: []
            },
            2: {
              templates_lab_list: []
            },
            3: {
              templates_radiology_list: []
            },
            4: {
              templateDetails: []
            },
            7: {
              templates_invest_list: []
            }
          };
          return res.status(200).send({
            code: httpStatus.OK,
            message: emr_constants.NO_RECORD_FOUND,
            responseContents: responseContent && responseContent[temp_type_id] ? responseContent[temp_type_id] : responseContent[1]
          });
        }
      } else {
        return res.status(400).send({
          code: httpStatus[400],
          message: emr_constants.NO_REQUEST_FOUND
        });
      }
    } catch (ex) {
      const errorMsg = ex.errors ? ex.errors[0].message : ex.message;
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({
          status: "error",
          msg: errorMsg
        });
    }
  };

  const _deleteTemplateDetails = async (req, res) => {
    // plucking data req body
    const tempuuid = req.body.template_uuid;
    const userUUID = parseInt(req.headers.user_uuid);

    try {
      if (tempuuid <= 0) {
        return res.status(400).send({
          code: httpStatus[400],
          message: emr_constants.PROPER_TEMPLATE_ID
        });
      }
      if (tempuuid) {
        const updatedtempData = {
          status: emr_constants.IS_IN_ACTIVE,
          is_active: emr_constants.IS_IN_ACTIVE,
          modified_by: userUUID,
          modified_date: new Date()
        };
        const updatetempAsync = await Promise.all([
          tempmstrTbl.update(updatedtempData, {
            where: {
              uuid: tempuuid
            }
          }),
          tempmstrdetailsTbl.update(updatedtempData, {
            where: {
              template_master_uuid: tempuuid
            }
          })
        ]);
        if (updatetempAsync) {
          const isDeleted = updatetempAsync[0][0] === 1;
          const responseCode = isDeleted ?
            httpStatus.OK :
            httpStatus.NO_CONTENT;
          const responseMessage = isDeleted ?
            emr_constants.TEMPLATE_DELETED :
            emr_constants.NO_RECORD_FOUND;
          return res
            .status(200)
            .send({
              code: responseCode,
              message: responseMessage
            });
        }
      } else {
        return res
          .status(400)
          .send({
            code: httpStatus[400],
            message: emr_constants.NO_RECORD_FOUND
          });
      }
    } catch (ex) {
      return res
        .status(400)
        .send({
          code: httpStatus.BAD_REQUEST,
          message: ex.message
        });
    }
  };

  const _gettempdetails = async (req, res) => {
    let {
      user_uuid
    } = req.headers;
    const {
      temp_id,
      temp_type_id,
      dept_id,
      lab_id,
      isMaster,
      createdUserId
    } = req.query;
    const {
      store_master_uuid
    } = req.query;
    try {
      user_uuid = isMaster && ((isMaster === 'true') || (isMaster === true)) ? createdUserId : user_uuid;
      if (user_uuid > 0 && temp_id > 0 && temp_type_id > 0 && (dept_id > 0 || lab_id > 0)) {
        if ([5, 6, 8].includes(+(temp_type_id))) {
          return res.status(400).send({
            code: httpStatus[400],
            message: emr_constants.TEMPLATE_REQUIRED_TYPES
          });
        }

        if (+(temp_type_id) === 1 && !store_master_uuid) {
          return res.status(400).send({
            code: httpStatus[400],
            message: emr_constants.PRESCRIPTION_STORE_MASTER,
          });
        }
        const {
          table_name,
          query
        } = getTemplatedetailsUUID(
          temp_type_id,
          temp_id,
          dept_id,
          user_uuid,
          lab_id,
          store_master_uuid
        );
        const templateList = await table_name.findAll(query);

        if (templateList.length > 0) {
          if (temp_type_id == 4) {
            const getdep = await note_templates_controller.getdepDetails(req.headers.user_uuid, templateList[0].department_uuid, req.headers.authorization);

            const getfacility = await note_templates_controller.getfacilityDetails(req.headers.user_uuid, templateList[0].facility_uuid, req.headers.authorization);

            if (getdep && getfacility) {
              templateList[0].dataValues.department_name = getdep.responseContent.name;
              templateList[0].dataValues.facility_name = getfacility.responseContents.name;
              return res
                .status(httpStatus.OK)
                .json({
                  statusCode: 200,
                  req: "",
                  responseContent: templateList
                });
            }
          } else {
            const templateData = getTemplateDetailsData(
              temp_type_id,
              templateList
            );

            return res
              .status(httpStatus.OK)
              .json({
                statusCode: 200,
                req: "",
                responseContent: templateData
              });
          }
        } else {
          return res
            .status(200)
            .send({
              statusCode: 200,
              message: emr_constants.NO_RECORD_FOUND
            });
        }

      } else {
        return res.status(400).send({
          code: httpStatus[400],
          message: emr_constants.NO_REQUEST_FOUND
        });
      }
    } catch (err) {
      const errorMsg = err.errors ? err.errors[0].message : err.message;
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({
          status: "error",
          msg: errorMsg
        });
    }
  };

  const _createTemplate = async (req, res) => {
    if (Object.keys(req.body).length != 0) {
      try {
        // plucking data req body
        let displayOrderexists = [];
        const templateMasterReqData = req.body.headers;
        const templateMasterDetailsReqData = req.body.details;
        let userUUID = req.headers.user_uuid;
        let temp_name = templateMasterReqData.name;
        let displayOrder = templateMasterReqData.display_order;
        templateMasterReqData.display_order = templateMasterReqData.display_order ? templateMasterReqData.display_order : 0;
        let userUuid = templateMasterReqData.user_uuid || userUUID;
        templateMasterReqData.user_uuid = userUuid;
        let facilityUuid = templateMasterReqData.facility_uuid;
        let departmentUuid = templateMasterReqData.department_uuid;
        let templateTypeId = templateMasterReqData.template_type_uuid;
        let temp_id = 0;
        const temp_master_active = templateMasterReqData.is_active;
        //checking template already exits or not
        const exists = await nameExists(temp_name, userUUID, facilityUuid, departmentUuid, templateTypeId);
        if (displayOrder) {
          displayOrderexists = await displayOrderExists(displayOrder, userUuid, facilityUuid, departmentUuid, templateTypeId, temp_id);
        }
        if (displayOrderexists.length > 0) {
          return res
            .status(400)
            .send({
              code: httpStatus[400],
              statusCode: httpStatus.BAD_REQUEST,
              message: emr_constants.NAME_DISPLAY_EXISTS
            });
        }

        if (exists && exists.length > 0) {
          //template already exits
          return res
            .status(400)
            .send({
              code: httpStatus[400],
              statusCode: httpStatus.BAD_REQUEST,
              message: emr_constants.TEMPLATE_NAME_EXISTS
            });
        }
        else if (
          (exists.length == 0 || exists[0].dataValues.status == 0) &&
          userUUID && templateMasterReqData && templateMasterDetailsReqData.length > 0
        ) {
          let createData = await createtemp(userUUID, templateMasterReqData, templateMasterDetailsReqData, temp_master_active);
          if (createData) {
            return res.status(200).send({
              code: httpStatus.OK,
              responseContent: {
                headers: templateMasterReqData,
                details: templateMasterDetailsReqData
              },
              message: emr_constants.TEMPLATE_INSERTED
            });
          }
        } else {
          return res
            .status(400)
            .send({
              code: httpStatus[400],
              message: emr_constants.NO_REQUEST_FOUND
            });
        }
      } catch (err) {
        return res
          .status(400)
          .send({
            code: httpStatus.BAD_REQUEST,
            message: err.message
          });
      }
    } else {
      return res
        .status(400)
        .send({
          code: httpStatus[400],
          message: emr_constants.NO_REQUEST_FOUND
        });
    }
  };

  const _updateTemplateById = async (req, res) => {
    if (Object.keys(req.body).length != 0) {
      const {
        user_uuid
      } = req.headers;
      const templateMasterReqData = req.body.headers;
      const temp_name = templateMasterReqData.name;
      const temp_id = templateMasterReqData.template_id;
      const department_uuid = templateMasterReqData.department_uuid;
      const user_id = templateMasterReqData.user_uuid;
      const display_order = templateMasterReqData.display_order;
      const facility_id = templateMasterReqData.facility_uuid;
      const templateMasterDetailsReqData = req.body.existing_details;
      let templateTypeId = templateMasterReqData.template_type_uuid;
      const templateMasterNewDrugsDetailsReqData = getNewTemplateDetails(
        user_uuid,
        req.body.new_details
      );
      const templateMasterUpdateData = getTemplateMasterUpdateData(
        user_uuid,
        templateMasterReqData
      );
      const tmpDtlsRmvdDrugs = req.body.removed_details;

      try {
        if (display_order) {
          const displayOrderexists = await displayOrderExists(display_order, user_id, facility_id, department_uuid, templateTypeId, temp_id);
          if (displayOrderexists.length > 0) {
            return res
              .status(400)
              .send({
                code: httpStatus[400],
                statusCode: httpStatus.BAD_REQUEST,
                message: emr_constants.NAME_DISPLAY_EXISTS
              });
          }
        }
        const exists = await nameExistsupdate(temp_name, user_uuid, facility_id, department_uuid, templateTypeId, temp_id);
        if (exists && exists.length > 0 && (exists[0].dataValues.is_active == 1 || 0) && exists[0].dataValues.status == 1) {
          //template already exits
          return res
            .status(400)
            .send({
              code: httpStatus[400],
              message: emr_constants.TEMPLATE_NAME_EXISTS
            });
        } else if (
          (exists.length == 0 || exists[0].dataValues.status == 0) &&
          user_uuid &&
          templateMasterReqData &&
          templateMasterDetailsReqData
        ) {
          //templateTransaction = await db.sequelize.transaction();
          if (templateMasterReqData.template_id <= 0) {
            return res.status(400).send({
              code: httpStatus[400],
              message: emr_constants.GetpleaseProvideMsg('template_uuid')
            });
          }
          const del_temp_drugs =
            tmpDtlsRmvdDrugs && tmpDtlsRmvdDrugs.length > 0 ?
              await removedTmpDetails(
                tempmstrdetailsTbl,
                tmpDtlsRmvdDrugs,
                user_uuid
              ) :
              "";
          const new_temp_drugs = await tempmstrdetailsTbl.bulkCreate(
            templateMasterNewDrugsDetailsReqData, {
            returning: true
          }
          );
          const temp_mas = await tempmstrTbl.update(
            templateMasterUpdateData, {
            where: {
              uuid: templateMasterReqData.template_id
            }
          }, {
            returning: true,
            plain: true
          }
          );
          const temp_mas_dtls = await Promise.all(
            getTemplateMasterDetailsWithUUID(
              tempmstrdetailsTbl,
              templateMasterDetailsReqData,
              templateMasterReqData,
              user_uuid
            )
          );
          // await templateTransaction.commit();
          // templateTransStatus = true;

          if (temp_mas && temp_mas_dtls) {
            //await templateTransaction.commit();
            //templateTransStatus = true;
            return res.status(200).send({
              code: httpStatus.OK,
              message: emr_constants.TEMPLATE_UPDATE_SUCCESS,
              responseContent: {
                tm: temp_mas,
                tmd: temp_mas_dtls
              }
            });
          }
        } else {
          // await templateTransaction.rollback();
          // templateTransStatus = true;
          return res.status(400).send({
            code: httpStatus[400],
            message: emr_constants.NO_REQUEST_HEADERS_FOUND
          });
        }
      } catch (ex) {
        // await templateTransaction.rollback();npm
        // templateTransStatus = true;
        return res
          .status(400)
          .send({
            code: httpStatus[400],
            message: ex.message
          });
      }
    } else {
      return res
        .status(400)
        .send({
          code: httpStatus[400],
          message: emr_constants.NO_REQUEST_FOUND
        });
    }
  };

  const _updateTemplateDetailsByID = async (req, res) => {
    const {
      user_uuid
    } = req.headers;
    const tempReqBody = req.body;
    const templateMasterReqData = req.body.headers;
    const templateMasterDetailsReqData = req.body.existing_temp_details ?
      req.body.existing_temp_details :
      "";
    const new_temp_details = req.body.new_temp_details ?
      req.body.new_temp_details :
      "";
    const templateMasterNewTempDetailsReqData = getNewTemplateDetails(
      user_uuid,
      new_temp_details
    );
    const templateMasterUpdateData = templateMasterReqData ?
      getTemplateMasterUpdateData(user_uuid, templateMasterReqData) :
      "";
    const tmpDtlsRmvd = req.body.removed_temp_dtls;

    try {
      if (user_uuid && tempReqBody) {
        if (templateMasterReqData.template_type_uuid == 1) {
          const del_temp_dtls =
            tmpDtlsRmvd && tmpDtlsRmvd.length > 0 ?
              await removedTmpDetails(
                tempmstrdetailsTbl,
                tmpDtlsRmvd,
                user_uuid
              ) :
              "";
          const new_temp_dtls = await tempmstrdetailsTbl.bulkCreate(
            templateMasterNewTempDetailsReqData, {
            returning: true
          }
          );
          const temp_mas = await tempmstrTbl.update(
            templateMasterUpdateData, {
            where: {
              uuid: templateMasterReqData.template_id
            }
          }, {
            returning: true,
            plain: true
          }
          );
          const temp_mas_dtls = await Promise.all(
            getTemplateMasterDetailsWithUUID(
              tempmstrdetailsTbl,
              templateMasterDetailsReqData,
              templateMasterReqData,
              user_uuid
            )
          );
          return res.status(200).send({
            code: httpStatus.OK,
            message: emr_constants.TEMPLATE_UPDATE_SUCCESS,
            responseContent: {
              tm: temp_mas,
              tmd: temp_mas_dtls
            }
          });
        }
        if (templateMasterReqData.template_type_uuid == 4) {
          del_temp_dtls =
            tmpDtlsRmvd && tmpDtlsRmvd.length > 0 ?
              await removedTmpDetails(
                tempmstrdetailsTbl,
                tmpDtlsRmvd,
                user_uuid
              ) :
              "";
          new_temp_dtls = await tempmstrdetailsTbl.bulkCreate(
            templateMasterNewTempDetailsReqData, {
            returning: true
          }
          );
          return res.status(200).send({
            code: httpStatus.OK,
            message: emr_constants.TEMPLATE_UPDATE_SUCCESS,
            responseContent: {
              new_temp_dtls
            }
          });
        }
      } else {
        return res.status(400).send({
          code: httpStatus[400],
          message: emr_constants.NO_REQUEST_HEADERS_FOUND
        });
      }
    } catch (ex) {
      return res
        .status(400)
        .send({
          code: httpStatus[400],
          message: ex.message
        });
    }
  };

  const _getalltemplates = async (req, res) => {
    const {
      user_uuid, facility_uuid
    } = req.headers;
    let getsearch = req.body;

    if (getsearch.sortField === "modified_date") {
      getsearch.sortField = "tm_modified_date";
    }

    pageNo = 0;

    const itemsPerPage = getsearch.paginationSize ?
      getsearch.paginationSize :
      10;
    let sortField = "tm_modified_date";
    let sortOrder = "DESC";

    if (getsearch.pageNo) {
      let temp = parseInt(getsearch.pageNo);
      if (temp && temp != NaN) {
        pageNo = temp;
      }
    }

    if (getsearch.sortField) {
      sortField = getsearch.sortField;
    }
    if (
      getsearch.sortOrder &&
      (getsearch.sortOrder == "ASC" || getsearch.sortOrder == "DESC")
    ) {
      sortOrder = getsearch.sortOrder;
    }

    const offset = pageNo * itemsPerPage;

    let findQuery = {
      offset: offset,
      limit: itemsPerPage,
      order: [
        [sortField, sortOrder]
      ],
      attributes: [
        "tm_uuid", "tm_name", "tm_template_type_uuid", "tm_is_public", "tm_facility_uuid",
        "tm_department_uuid", "tm_user_uuid", "is_active", "tm_status", "tm_created_by",
        "tm_created_date", "tm_modified_by", "tm_modified_date", "tt_name", "tt_is_active",
        "tt_status", "f_uuid", "f_name", "f_is_active", "f_status", "d_uuid", "d_name", "uct_name",
        "u_first_name", "u_middle_name", "u_last_name", "umt_name", "um_first_name", "um_middle_name",
        "um_last_name"
      ],
      where: {
        is_active: 1,
        tm_status: 1,
        tm_facility_uuid: facility_uuid
      }
    };

    if (getsearch.search && /\S/.test(getsearch.search)) {
      findQuery.where = {
        tm_name: {
          [Op.like]: "%" + getsearch.search + "%"
        }
      };
    }
    if (getsearch.name && /\S/.test(getsearch.name)) {
      findQuery.where['tm_name'] = {
        [Op.like]: "%" + getsearch.name + "%"
      };
    }
    if (getsearch.template_type_uuid && /\S/.test(getsearch.template_type_uuid)) {
      findQuery.where['tm_template_type_uuid'] = getsearch.template_type_uuid;
    }

    if (getsearch.facility_uuid && /\S/.test(getsearch.facility_uuid)) {
      findQuery.where['tm_facility_uuid'] = getsearch.facility_uuid;
    }

    if (getsearch.department_uuid && /\S/.test(getsearch.department_uuid)) {
      findQuery.where['tm_department_uuid'] = getsearch.department_uuid;
    }
    if (getsearch.user_uuid && /\S/.test(getsearch.user_uuid)) {
      findQuery.where['tm_user_uuid'] = getsearch.user_uuid;
    }
    if (getsearch.hasOwnProperty('status') && /\S/.test(getsearch.status)) {
      findQuery.where['is_active'] = getsearch.status;
    }
    try {
      if (user_uuid) {
        const templateList = await vw_all_temp.findAndCountAll(findQuery);
        return res.status(httpStatus.OK).json({
          statusCode: 200,
          req: getsearch,
          responseContents: templateList.rows ? templateList.rows : [],
          totalRecords: templateList.count ? templateList.count : 0
        });
      } else {
        return res.status(400).send({
          code: httpStatus[400],
          message: emr_constants.NO_REQUEST_FOUND
        });
      }
    } catch (ex) {
      const errorMsg = ex.errors ? ex.errors[0].message : ex.message;
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({
          status: "error",
          msg: errorMsg
        });
    }
  };

  return {
    gettemplateByID: _gettemplateByID,
    createTemplate: _createTemplate,
    deleteTemplateDetails: _deleteTemplateDetails,
    gettempdetails: _gettempdetails,
    updateTemplateById: _updateTemplateById,
    getalltemplates: _getalltemplates,

    updateTemplateDetailsByID: _updateTemplateDetailsByID
  };
};

module.exports = tmpmstrController();

function getTemplateMasterUpdateData(user_uuid, templateMasterReqData) {
  return {
    uuid: templateMasterReqData.template_id,
    name: templateMasterReqData.name,
    is_public: templateMasterReqData.is_public,
    description: templateMasterReqData.description,
    department_uuid: templateMasterReqData.department_uuid,
    facility_uuid: templateMasterReqData.facility_uuid,
    diagnosis_uuid: templateMasterReqData.diagnosis_uuid,
    display_order: templateMasterReqData.display_order,
    modified_by: user_uuid,
    modified_date: new Date(),
    is_active: templateMasterReqData.is_active,
    revision: templateMasterReqData.revision
  };
}

function getTemplateData(fetchedData) {
  let templateList = [];
  const createdby = fetchedData[0].dataValues.uct_name + " " + fetchedData[0].dataValues.uc_first_name;
  const modifiedby = fetchedData[0].dataValues.uct_name + " " + fetchedData[0].dataValues.uc_first_name;

  if (fetchedData && fetchedData.length > 0) {
    temp_details = {
      template_id: fetchedData[0].dataValues.tm_uuid,
      template_name: fetchedData[0].dataValues.tm_name,
      template_type_uuid: fetchedData[0].dataValues.tm_template_type_uuid,
      template_department_name: fetchedData[0].dataValues.d_name,
      template_department: fetchedData[0].dataValues.tm_dept,
      user_uuid: fetchedData[0].dataValues.tm_userid,
      user_first_name: fetchedData[0].dataValues.tm_title_name + "" + fetchedData[0].dataValues.tm_first_name,
      display_order: fetchedData[0].dataValues.tm_display_order,
      template_desc: fetchedData[0].dataValues.tm_description,
      is_public: fetchedData[0].dataValues.tm_public[0] === 1 ? true : false,
      created_by: createdby,
      created_date: fetchedData[0].dataValues.tm_created_date,
      modified_by: modifiedby,
      modified_date: fetchedData[0].dataValues.tm_modified_date,
      facility_uuid: fetchedData[0].dataValues.f_uuid,
      facility_name: fetchedData[0].dataValues.f_name,
      department_name: fetchedData[0].dataValues.d_name,
      satus: fetchedData[0].dataValues.tm_status[0] === 1 ? true : false,
      is_active: fetchedData[0].dataValues.tm_active[0] === 1 ? true : false
    };

    fetchedData.forEach(tD => {
      templateList = [
        ...templateList,
        {
          template_details_id: tD.tmd_uuid,
          template_details_displayorder: tD.tmd_display_order,
          strength: tD.tmd_strength,

          drug_name: tD.im_name,
          drug_code: tD.im_code,
          drug_id: tD.im_uuid,
          drug_product_type_uuid: tD.im_product_type_uuid,
          drug_is_emar: tD.im_is_emar,
          drug_can_calculate_frequency_qty: dD.im_can_calculate_frequency_qty,

          drug_route_name: tD.dr_code,
          drug_route_id: tD.dr_uuid,

          drug_frequency_id: tD.df_uuid,
          drug_frequency_code: tD.df_code,
          drug_frequency_name: tD.df_name,
          drug_frequency_nooftimes: tD.df_nooftimes,
          drug_frequency_perdayquantity: tD.df_perdayquantity,
          drug_frequency_comments: tD.df_comments,

          drug_period_id: tD.dp_uuid,
          drug_period_name: tD.dp_name,
          drug_period_code: tD.dp_code,

          drug_instruction_id: tD.di_uuid,
          drug_instruction_name: tD.di_name,
          drug_instruction_code: tD.di_code,

          drug_duration: tD.tmd_duration,
          drug_dosage: tD.tmd_dosage,
          store_id: tD.sm_uuid,
          store_code: tD.sm_store_code,
          store_name: tD.sm_store_name,

          is_active: tD.im_acive
        }
      ];
    });
    return {
      template_details: temp_details,
      drug_details: templateList
    };
  } else {
    return {};
  }
}

function getTemplateListData(fetchedData) {
  let templateList = [],
    drug_details = [];

  if (fetchedData && fetchedData.length > 0) {
    fetchedData.forEach(tD => {
      templateList = [
        ...templateList,
        {
          temp_details: {
            template_id: tD.dataValues.tm_uuid,
            template_name: tD.dataValues.tm_name,
            created_by: tD.tm_created_by,
            modified_by: tD.tm_modified_by,
            template_department: tD.dataValues.tm_dept,
            user_uuid: tD.dataValues.tm_userid,
            display_order: tD.dataValues.tm_display_order,
            template_desc: tD.dataValues.tm_description,
            is_public: tD.dataValues.tm_public[0] === 1 ? true : false
          },
          drug_details: [
            ...drug_details,
            ...getDrugsListForTemplate(fetchedData, tD.dataValues.tm_uuid)
          ]
        }
      ];
    });
    let uniq = {};
    let temp_list = templateList.filter(
      obj =>
        !uniq[obj.temp_details.template_id] &&
        (uniq[obj.temp_details.template_id] = true)
    );
    return {
      templates_list: temp_list
    };
  } else {
    return {};
  }
}

function getTemplateListData1(fetchedData) {
  let templateList = [],
    diet_details = [];
  const createdby = fetchedData[0].dataValues.uct_name + " " + fetchedData[0].dataValues.uc_first_name;
  const modifiedby = fetchedData[0].dataValues.uct_name + " " + fetchedData[0].dataValues.uc_first_name;

  if (fetchedData && fetchedData.length > 0) {
    fetchedData.forEach(tD => {
      templateList = [
        ...templateList,
        {
          temp_details: {
            template_id: tD.dataValues.tm_uuid,
            template_name: tD.dataValues.tm_name,
            template_department: tD.dataValues.tm_dept,
            template_template_type_uuid: tD.dataValues.tm_template_type_uuid,
            template_template_type_name: tD.dataValues.tm_template_type_name,
            user_uuid: tD.dataValues.tm_userid,
            user_first_name: tD.dataValues.tm_title_name + "" + tD.dataValues.tm_first_name,
            display_order: tD.dataValues.tm_display_order,
            template_desc: tD.dataValues.tm_description,
            is_public: tD.dataValues.tm_public[0] === 1 ? true : false,
            created_by: tD.dataValues.tm_created_by,
            created_by_name: createdby,
            created_date: tD.dataValues.tm_created_date,
            modified_by: tD.dataValues.tm_modified_by,
            modified_by_name: modifiedby,
            modified_date: tD.dataValues.tm_modified_date,
            facility_name: tD.dataValues.f_name,
            facility_uuid: tD.dataValues.f_uuid,
            department_name: tD.dataValues.d_name,
            is_active: tD.tm_active && tD.tm_active[0] ? true : false
          },
          diet_details: [
            ...diet_details,
            ...getDietListForTemplate(fetchedData, tD.dataValues.tm_uuid)
          ]
        }
      ];
    });

    let uniq = {};
    let temp_list = templateList.filter(
      obj =>
        !uniq[obj.temp_details.template_id] &&
        (uniq[obj.temp_details.template_id] = true)
    );

    return {
      templates_list: temp_list
    };
  } else {
    return {};
  }
}

function getTemplateMasterDetailsWithUUID(
  detailsTbl,
  detailsData,
  masterData,
  user_uuid,
  templateTransaction
) {
  let masterDetailsPromise = [];
  // assigning data to the template master details
  // updating template master details
  detailsData.forEach(mD => {
    (mD.template_details_uuid = mD.template_details_uuid),
      (mD.chief_complaint_uuid = mD.chief_complaint_uuid),
      (mD.vital_master_uuid = mD.vital_master_uuid),
      (mD.item_master_uuid = mD.drug_id),
      (mD.product_type_uuid = mD.drug_product_type_uuid),
      (mD.drug_route_uuid = mD.drug_route_uuid),
      (mD.drug_frequency_uuid = mD.drug_frequency_uuid),
      (mD.diet_master_uuid = mD.diet_master_uuid),
      (mD.diet_category_uuid = mD.diet_category_uuid),
      (mD.diet_frequency_uuid = mD.diet_frequency_uuid),
      (mD.display_order = mD.display_order),
      (mD.duration = mD.drug_duration),
      (mD.dosage = mD.drug_dosage),
      (mD.duration_period_uuid = mD.drug_period_uuid),
      (mD.drug_instruction_uuid = mD.drug_instruction_uuid),
      (mD.modified_by = user_uuid),
      (mD.modified_date = new Date()),
      (mD.quantity = mD.quantity),
      (mD.status = mD.status),
      (mD.revision = mD.revision),
      (mD.is_active = mD.is_active);
    masterDetailsPromise = [
      ...masterDetailsPromise,
      detailsTbl.update(
        mD, {
        where: {
          uuid: mD.template_details_uuid,
          template_master_uuid: masterData.template_id
        },
        transaction: templateTransaction
      }, {
        returning: true
      }
      )
    ];
  });
  return masterDetailsPromise;
}

function getNewTemplateDetails(user_uuid, temp_master_details) {
  let newTempDtls = [];
  if (temp_master_details && temp_master_details.length > 0) {
    temp_master_details.forEach(tD => {
      newTempDtls = [
        ...newTempDtls,
        {
          template_master_uuid: tD.template_master_uuid,
          test_master_uuid: tD.test_master_uuid,
          chief_complaint_uuid: tD.chief_complaint_uuid,
          vital_master_uuid: tD.vital_master_uuid,
          item_master_uuid: tD.drug_id,
          product_type_uuid: tD.drug_product_type_uuid,
          drug_route_uuid: tD.drug_route_uuid,
          drug_frequency_uuid: tD.drug_frequency_uuid,
          duration: tD.drug_duration,
          dosage: tD.drug_dosage,
          diet_master_uuid: tD.diet_master_uuid,
          diet_category_uuid: tD.diet_category_uuid,
          diet_frequency_uuid: tD.diet_frequency_uuid,
          duration_period_uuid: tD.drug_period_uuid,
          drug_instruction_uuid: tD.drug_instruction_uuid,
          display_order: tD.display_order,
          quantity: tD.quantity,
          revision: tD.revision,
          is_active: tD.is_active,
          created_by: user_uuid,
          modified_by: user_uuid,
          created_date: new Date(),
          modified_date: new Date()
        }
      ];
    });
  }
  return newTempDtls;
}

function removedTmpDetails(dtlsTbl, dtls, user_id) {
  let masterDetailsPromise = [];

  // modifying data to the template master details
  // updating template master details
  dtls.forEach(mD => {
    mD.modified_by = user_id;
    mD.modified_date = new Date();
    mD.status = 0;
    mD.is_active = 0;
    masterDetailsPromise = [
      ...masterDetailsPromise,
      dtlsTbl.update(
        mD, {
        where: {
          uuid: mD.template_details_uuid,
          template_master_uuid: mD.template_uuid
        }
      }, {
        returning: true
      }
      )
    ];
  });
  return masterDetailsPromise;
}

function getDrugsListForTemplate(fetchedData, template_id) {
  let drug_list = [];
  const filteredData = fetchedData.filter(fD => {
    return fD.dataValues.tm_uuid === template_id;
  });

  if (filteredData && filteredData.length > 0) {
    filteredData.forEach(dD => {
      drug_list = [
        ...drug_list,
        {
          template_details_uuid: dD.tmd_uuid,
          template_details_displayorder: dD.tmd_display_order,
          strength: dD.tmd_strength,

          drug_name: dD.im_name,
          drug_code: dD.im_code,
          drug_id: dD.im_uuid,
          drug_product_type_uuid: dD.im_product_type_uuid,

          drug_route_name: dD.dr_code,
          drug_route_id: dD.dr_uuid,
          drug_is_emar: dD.im_is_emar,
          drug_can_calculate_frequency_qty: dD.im_can_calculate_frequency_qty,

          drug_frequency_id: dD.df_uuid,
          drug_frequency_code: dD.df_code,
          drug_frequency_name: dD.df_name,
          drug_frequency_nooftimes: dD.df_nooftimes,
          drug_frequency_perdayquantity: dD.df_perdayquantity,
          drug_frequency_comments: dD.df_comments,

          drug_period_id: dD.dp_uuid,
          drug_period_name: dD.dp_name,
          drug_period_code: dD.dp_code,

          drug_instruction_id: dD.di_uuid,
          drug_instruction_name: dD.di_name,
          drug_instruction_code: dD.di_code,

          drug_duration: dD.tmd_duration,
          drug_dosage: dD.tmd_dosage,
          store_id: dD.sm_uuid,
          store_code: dD.sm_store_code,
          store_name: dD.sm_store_name,
          store_master_uuid: dD.si_store_master_uuid || 0,


          is_active: dD.im_acive
        }
      ];
    });
  }
  return drug_list;
}

function getDietListForTemplate(fetchedData, template_id) {
  let diet_list = [];
  const filteredData = fetchedData.filter(fD => {
    return fD.dataValues.tm_uuid == template_id;
  });

  if (filteredData && filteredData.length > 0) {
    filteredData.forEach(dD => {
      diet_list = [
        ...diet_list,
        {
          template_details_uuid: dD.tmd_uuid,
          template_details_displayorder: dD.tmd_display_order,

          diet_id: dD.tmd_diet_master_uuid,
          diet_name: dD.dm_name,
          diet_code: dD.dm_code,

          diet_category_id: dD.tmd_diet_category_uuid,
          diet_category_name: dD.dc_name,
          diet_category_code: dD.dc_code,

          diet_frequency_id: dD.tmd_diet_frequency_uuid,
          diet_frequency_name: dD.df_name,
          diet_frequency_code: dD.df_code,

          diet_display_order: dD.tmd_display_order,

          quantity: dD.tmd_quantity
        }
      ];
    });
  }

  return diet_list;
}

function getLabListData(fetchedData) {
  let templateList = [],
    lab_details = [];
  const createdby = fetchedData[0].dataValues.uct_name + " " + fetchedData[0].dataValues.uc_first_name;
  const modifiedby = fetchedData[0].dataValues.uct_name + " " + fetchedData[0].dataValues.uc_first_name;

  if (fetchedData && fetchedData.length > 0) {
    fetchedData.forEach(tD => {
      templateList = [
        ...templateList,
        {
          temp_details: {
            template_id: tD.dataValues.tm_uuid,
            template_name: tD.dataValues.tm_name,
            template_department: tD.dataValues.tm_department_uuid,
            user_uuid: tD.dataValues.tm_user_uuid,
            user_first_name: tD.dataValues.tm_title_name + "" + tD.dataValues.tm_first_name,
            template_description: tD.dataValues.tm_description,
            template_displayorder: tD.dataValues.tm_display_order,
            template_type_uuid: tD.dataValues.tm_template_type_uuid,
            template_type_name: tD.dataValues.tm_template_type_name,
            template_is_active: tD.dataValues.tm_is_active,
            template_status: tD.dataValues.tm_status,
            is_public: tD.dataValues.tm_is_public,
            created_by: tD.dataValues.tm_created_by,
            created_by_name: createdby,
            created_date: tD.dataValues.tm_created_date,
            modified_by: tD.dataValues.tm_modified_by,
            modified_by_name: modifiedby,
            modified_date: tD.dataValues.tm_modified_date,
            facility_name: tD.dataValues.f_name,
            facility_uuid: tD.dataValues.f_uuid,
            department_name: tD.dataValues.d_name,
          },

          lab_details: [
            ...lab_details,
            ...getLabListForTemplate(fetchedData, tD.dataValues.tm_uuid)
          ]
        }
      ];
    });
    let uniq = {};
    let temp_list = templateList.filter(
      obj =>
        !uniq[obj.temp_details.template_id] &&
        (uniq[obj.temp_details.template_id] = true)
    );
    return {
      templates_lab_list: temp_list
    };
  } else {
    return {};
  }
}

function getRisListData(fetchedData) {
  let templateList = [],
    radiology_details = [];
  const createdby = fetchedData[0].dataValues.uct_name + " " + fetchedData[0].dataValues.uc_first_name;
  const modifiedby = fetchedData[0].dataValues.uct_name + " " + fetchedData[0].dataValues.uc_first_name;

  if (fetchedData && fetchedData.length > 0) {
    fetchedData.forEach(tD => {
      templateList = [
        ...templateList,
        {
          temp_details: {
            template_id: tD.dataValues.tm_uuid,
            template_name: tD.dataValues.tm_name,
            template_department: tD.dataValues.tm_department_uuid,
            user_uuid: tD.dataValues.tm_user_uuid,
            user_first_name: tD.dataValues.tm_title_name + "" + tD.dataValues.tm_first_name,
            template_description: tD.dataValues.tm_description,
            template_displayorder: tD.dataValues.tm_display_order,
            template_type_uuid: tD.dataValues.tm_template_type_uuid,
            template_type_name: tD.dataValues.tm_template_type_name,
            template_is_active: tD.dataValues.tm_is_active,
            template_status: tD.dataValues.tm_status,
            is_public: tD.dataValues.tm_is_public,
            created_by: tD.dataValues.tm_created_by,
            created_by_name: createdby,
            created_date: fetchedData[0].dataValues.tm_created_date,
            modified_by: tD.dataValues.tm_modified_by,
            modified_by_name: modifiedby,
            modified_date: fetchedData[0].dataValues.tm_modified_date,
            facility_name: fetchedData[0].dataValues.f_name,
            facility_uuid: fetchedData[0].dataValues.f_uuid,
            department_name: fetchedData[0].dataValues.d_name,
          },

          radiology_details: [
            ...radiology_details,
            ...getRisListForTemplate(fetchedData, tD.dataValues.tm_uuid)
          ]
        }
      ];
    });
    let uniq = {};
    let temp_list = templateList.filter(
      obj =>
        !uniq[obj.temp_details.template_id] &&
        (uniq[obj.temp_details.template_id] = true)
    );
    return {
      templates_radiology_list: temp_list
    };
  } else {
    return {
      templates_radiology_list: []
    };
  }
}

function getInvestData(fetchedData) {
  let templateList = [],
    Invest_details = [];
  const createdby = fetchedData[0].dataValues.uct_name + " " + fetchedData[0].dataValues.uc_first_name;
  const modifiedby = fetchedData[0].dataValues.uct_name + " " + fetchedData[0].dataValues.uc_first_name;

  if (fetchedData && fetchedData.length > 0) {
    templateList = fetchedData.map(tD => {
      return {
        temp_details: {
          template_id: tD.dataValues.tm_uuid,
          template_name: tD.dataValues.tm_name,
          template_department: tD.dataValues.tm_department_uuid,
          user_uuid: tD.dataValues.tm_user_uuid,
          user_first_name: tD.dataValues.tm_title_name + "" + tD.dataValues.tm_first_name,
          template_description: tD.dataValues.tm_description,
          template_displayorder: tD.dataValues.tm_display_order,
          template_type_uuid: tD.dataValues.tm_template_type_uuid,
          template_type_name: tD.dataValues.tm_template_type_name,
          template_is_active: tD.dataValues.tm_is_active,
          template_status: tD.dataValues.tm_status,
          is_public: tD.dataValues.tm_is_public,
          created_by: tD.dataValues.tm_created_by,
          created_by_name: createdby,
          created_date: fetchedData[0].dataValues.tm_created_date,
          modified_by: tD.dataValues.tm_modified_by,
          modified_by_name: modifiedby,
          modified_date: fetchedData[0].dataValues.tm_modified_date,
          facility_name: fetchedData[0].dataValues.f_name,
          facility_uuid: fetchedData[0].dataValues.f_uuid,
          department_name: fetchedData[0].dataValues.d_name,

        },
        Invest_details: [
          ...Invest_details,
          ...getInvestForTemplate(fetchedData, tD.dataValues.tm_uuid)
        ]
      };
    });
    let uniq = {};
    let temp_list = templateList.filter(
      obj =>
        !uniq[obj.temp_details.template_id] &&
        (uniq[obj.temp_details.template_id] = true)
    );
    return {
      templates_invest_list: temp_list
    };
  } else {
    return {
      templates_invest_list: []
    };
  }
}

function getLabListForTemplate(fetchedData, template_id) {
  let lab_list = [];
  const filteredData = fetchedData.filter(fD => {
    return fD.dataValues.tm_uuid === template_id;
  });

  if (filteredData && filteredData.length > 0) {
    filteredData.forEach(lD => {
      lab_list = [
        ...lab_list,
        {
          template_details_uuid: lD.tmd_uuid,
          template_details_displayorder: lD.tmd_display_order,
          lab_test_uuid: lD.ltm_uuid,
          lab_code: lD.ltm_code,
          lab_name: lD.ltm_name,
          type_of_method_uuid: lD.tom_uuid,
          type_of_method_code: lD.tom_code,
          type_of_method_name: lD.tom_name,
          lab_test_description: lD.ltm_description,
          lab_test_status: lD.ltm_status,
          lab_test_is_active: lD.ltm_is_active,
          lab_type_uuid: lD.ltm_lab_master_type_uuid,
          profile_test_uuid: lD.lpm_uuid,
          profile_test_code: lD.lpm_profile_code,
          profile_test_name: lD.lpm_name,
          profile_test_description: lD.lpm_description,
          profile_test_status: lD.lpm_status,
          profile_test_active: lD.lpm_is_active,
          //lab_type_uuid: lD.lpm_lab_master_type_uuid
        }
      ];
    });
  }
  return lab_list;
}

function getRisListForTemplate(fetchedData, template_id) {
  let radiology_list = [];
  const filteredData = fetchedData.filter(fD => {
    return fD.dataValues.tm_uuid === template_id;
  });

  if (filteredData && filteredData.length > 0) {
    filteredData.forEach(lD => {
      radiology_list = [
        ...radiology_list,
        {
          template_details_uuid: lD.tmd_uuid,
          template_details_displayorder: lD.tmd_display_order,
          lab_test_uuid: lD.rtm_uuid,
          lab_code: lD.rtm_code,
          lab_name: lD.rtm_name,
          lab_test_description: lD.rtm_description,
          lab_test_status: lD.rtm_status,
          lab_test_is_active: lD.rtm_is_active,
          lab_type_uuid: lD.rtm_lab_master_type_uuid,
          profile_test_uuid: lD.rpm_uuid,
          profile_test_code: lD.rpm_profile_code,
          profile_test_name: lD.rpm_name,
          profile_test_description: lD.rpm_description,
          profile_test_status: lD.rpm_status,
          profile_test_active: lD.rpm_is_active,
          //lab_type_uuid: lD.lpm_lab_master_type_uuid
        }
      ];
    });
  }
  return radiology_list;
}

function getInvestForTemplate(fetchedData, template_id) {
  let Invest_list = [];
  const filteredData = fetchedData.filter(fD => {
    return fD.dataValues.tm_uuid === template_id;
  });

  if (filteredData && filteredData.length > 0) {
    Invest_list = filteredData.map(lD => {
      return {
        template_details_uuid: lD.tmd_uuid,
        template_details_displayorder: lD.tmd_display_order,
        lab_test_uuid: lD.itm_uuid,
        lab_code: lD.itm_code,
        lab_name: lD.itm_name,
        lab_test_description: lD.itm_description,
        lab_test_status: lD.itm_status,
        lab_test_is_active: lD.itm_is_active,
        lab_type_uuid: lD.itm_lab_master_type_uuid,
        profile_test_uuid: lD.ipm_uuid,
        profile_test_code: lD.ipm_profile_code,
        profile_test_name: lD.ipm_name,
        profile_test_description: lD.ipm_description,
        profile_test_status: lD.ipm_status,
        profile_test_active: lD.ipm_is_active
      };
    });
  }
  return Invest_list;
}

function getTemplatesQuery(user_uuid, dept_id, temp_type_id, fId, sMId) {
  return {
    tm_status: 1,
    tm_active: 1,
    tmd_is_active: 1,
    tmd_status: 1,
    tm_template_type_uuid: temp_type_id,
    f_uuid: fId,
    si_store_master_uuid: sMId,
    si_is_active: emr_constants.IS_ACTIVE,
    si_status: emr_constants.IS_ACTIVE,
    [Op.or]: [{
      tm_dept: {
        [Op.eq]: dept_id
      },
      tm_public: {
        [Op.eq]: 1
      }
    },
    {
      tm_userid: {
        [Op.eq]: user_uuid
      },
      tm_dept: {
        [Op.eq]: dept_id
      },
      tm_public: {
        [Op.eq]: 0
      }
    }
    ]
  };
}

function getTemplatesDietQuery(user_uuid, dept_id, temp_type_id, fId) {
  return {
    tm_status: 1,
    tm_active: 1,
    tmd_is_active: 1,
    tmd_status: 1,
    tm_template_type_uuid: temp_type_id,
    dm_status: 1,
    dm_is_active: 1,
    f_uuid: fId,
    [Op.or]: [{
      tm_dept: {
        [Op.eq]: dept_id
      },
      tm_public: {
        [Op.eq]: 1
      }
    },
    {
      tm_userid: {
        [Op.eq]: user_uuid
      },
      tm_dept: {
        [Op.eq]: dept_id
      },
      tm_public: {
        [Op.eq]: 0
      }
    }
    ]
  };
}

function getTemplatesdetailsQuery(uId, dId, ttId, tId, sMId) {

  let presTempQuery = {
    tm_uuid: tId,
    tm_status: 1,
    tm_active: 1,
    tmd_is_active: 1,
    tmd_status: 1,
    tm_template_type_uuid: ttId,
    [Op.or]: [{
      tm_dept: {
        [Op.eq]: dId
      },
      tm_public: {
        [Op.eq]: 1
      }
    },
    {
      tm_userid: {
        [Op.eq]: uId
      }
    }
    ]
  };

  if (+(ttId) === 1) {
    presTempQuery = {
      ...presTempQuery,
      ...{
        si_store_master_uuid: sMId,
        si_is_active: emr_constants.IS_ACTIVE,
        si_status: emr_constants.IS_ACTIVE,
      }
    };
  }
  return presTempQuery;
}

function getVitalsDetailedQuery(temp_type_id, dept_id, user_uuid, temp_id) {
  return {
    attributes: {
      exclude: ["id", "createdAt", "updatedAt"]
    },
    where: {
      uuid: temp_id,
      user_uuid: user_uuid,
      department_uuid: dept_id,
      template_type_uuid: temp_type_id,
      status: 1,
      is_active: 1
    },
    include: [{
      model: tempmstrdetailsTbl,
      where: {
        status: 1,
        is_active: 1
      },
      include: [{
        model: vitalMasterTbl,
        where: {
          status: 1,
          is_active: 1
        },
        required: false,
      }],
      required: false,
    },]
  };
}

function getVitalsQuery(temp_type_id, dept_id, user_uuid, fId) {
  return {
    attributes: {
      exclude: ["id", "createdAt", "updatedAt"]
    },
    order: [
      ["display_order", "ASC"]
    ],
    distinct: true,
    where: {
      [Op.or]: [{
        department_uuid: {
          [Op.eq]: dept_id
        },
        is_public: {
          [Op.eq]: 1
        }
      },
      {
        user_uuid: {
          [Op.eq]: user_uuid
        },
        department_uuid: {
          [Op.eq]: dept_id
        },
        is_public: {
          [Op.eq]: 0
        }
      }
      ],
      template_type_uuid: temp_type_id,
      status: 1,
      is_active: 1,
      facility_uuid: fId
    },
    required: false,
    include: [{
      model: vw_template,
      where: {
        tmd_status: 1,
        tmd_is_active: 1
      }
      // include: [
      //   {
      //     model: vitalMasterTbl,
      //     require: false,
      //     where: {
      //       status: 1,
      //       is_active: 1
      //     }
      //   }
      // ]
    }]
  };
}

function getTempData(temp_type_id, result) {
  switch (temp_type_id) {
    case "1":
      return getTemplateListData(result);
    case "2":
      return getLabListData(result);
    case "3":
      return getRisListData(result);
    case "7":
      return getInvestData(result);
    case "9":
      return getTemplateListData1(result);
    default:
      let templateDetails = result;
      return {
        templateDetails
      };
  }
}

async function createtemp(userUUID, templateMasterReqData, templateMasterDetailsReqData, tIsActive) {
  templateMasterReqData = emr_utility.createIsActiveAndStatus(
    templateMasterReqData,
    userUUID
  );
  templateMasterReqData.is_active = tIsActive ? 1 : 0;

  templateMasterReqData.active_from = templateMasterReqData.active_to = new Date();
  const templateMasterCreatedData = await tempmstrTbl.create(templateMasterReqData);
  templateMasterDetailsReqData.forEach((item, index) => {
    item.template_master_uuid = templateMasterCreatedData.dataValues.uuid;
    item.created_by = userUUID;
    item.modified_by = 0;
    item.created_date = item.modified_date = new Date();
  });
  const dtls_result = await tempmstrdetailsTbl.bulkCreate(
    templateMasterDetailsReqData, {
    returning: true
  }
  );
  return {
    templateMasterReqData: templateMasterCreatedData,
    templateMasterDetailsReqData: dtls_result
  };
}

const nameExists = (temp_name, userUUID, facilityUuid, departmentUuid, templateTypeId) => {
  if (temp_name !== undefined) {
    return new Promise((resolve, reject) => {
      let value = tempmstrTbl.findAll({
        order: [
          ['created_date', 'DESC']
        ],
        attributes: ["name", "is_active", "status"],
        where: {
          name: temp_name,
          user_uuid: userUUID,
          facility_uuid: facilityUuid,
          department_uuid: departmentUuid,
          template_type_uuid: templateTypeId,
          is_active: 1,
          status: 1
        }
      });
      if (value) {
        resolve(value);
        return value;
      } else {
        reject({
          message: emr_constants.NAME_DISPLAY_NOTEXISTS
        });
      }
    });
  }
};

const displayOrderExists = (displayOrder, userUuid, facilityUuid, departmentUuid, templateTypeId, temp_id) => {
  if (displayOrder !== undefined) {
    return new Promise((resolve, reject) => {
      let findQuery = {
        attributes: ["display_order"],
        where: {
          display_order: displayOrder,
          user_uuid: userUuid,
          facility_uuid: facilityUuid,
          department_uuid: departmentUuid,
          template_type_uuid: templateTypeId,
          status: 1
        }
      }
      if (temp_id > 0) {
        findQuery.where = Object.assign(findQuery.where, {
          uuid: {
            [Op.not]: temp_id
          }
        });
      }
      let value = tempmstrTbl.findAll(findQuery);
      if (value) {
        resolve(value);
        return value;
      } else {
        reject({
          message: emr_constants.NAME_DISPLAY_NOTEXISTS
        });
      }
    });
  }
};

const nameExistsupdate = (temp_name, userUUID, facility_id, department_uuid, templateTypeId, temp_id) => {
  if (temp_name !== undefined) {
    return new Promise((resolve, reject) => {
      let value = tempmstrTbl.findAll({
        order: [
          ['created_date', 'DESC']
        ],
        attributes: ["name", "is_active", "status"],
        where: {
          name: temp_name,
          user_uuid: userUUID,
          facility_uuid: facility_id,
          department_uuid: department_uuid,
          template_type_uuid: templateTypeId,
          is_active: 1,
          status: 1,
          uuid: {
            [Op.not]: temp_id
          }
        }
      });
      if (value) {
        resolve(value);
        return value;
      } else {
        reject({
          message: emr_constants.NAME_DISPLAY_NOTEXISTS
        });
      }
    });
  }
};

function getTemplateTypeUUID(temp_type_id, dept_id, user_uuid, fId, lab_id, sMId) {
  switch (temp_type_id) {
    case "1":
      return {
        table_name: vw_template,
        query: {
          order: [
            ["tm_display_order", "ASC"]
          ],
          where: getTemplatesQuery(user_uuid, dept_id, temp_type_id, fId, sMId),
          attributes: {
            exclude: ["id", "createdAt", "updatedAt"]
          }
        }
      };
    case "2":
      lab_id = +(lab_id);
      const labValidation = !lab_id || lab_id === 0;
      const searchKey = labValidation ? 'tm_department_uuid' : 'tm_lab_uuid';
      const searchValue = labValidation ? dept_id : lab_id;
      return {
        table_name: vw_profile_lab,
        query: {
          order: [
            ["tm_display_order", "ASC"]
          ],
          where: {
            tm_template_type_uuid: temp_type_id,
            tm_is_active: 1,
            tm_status: 1,
            tmd_status: 1,
            tmd_active: 1,
            f_uuid: fId,
            [Op.or]: [{
              [searchKey]: {
                [Op.eq]: searchValue
              },
              "`tm_is_public`": {
                [Op.eq]: 1
              }
            },
            {
              tm_user_uuid: {
                [Op.eq]: user_uuid
              },
              [searchKey]: {
                [Op.eq]: searchValue
              },
              "`tm_is_public`": {
                [Op.eq]: 0
              }
            }
            ]
          }
        }
      };
    case "3":
      return {
        table_name: vw_profile_ris,
        query: {
          order: [
            ["tm_display_order", "ASC"]
          ],
          where: {
            tm_template_type_uuid: temp_type_id,
            tm_is_active: 1,
            tm_status: 1,
            tmd_status: 1,
            tmd_active: 1,
            f_uuid: fId,
            [Op.or]: [{
              tm_department_uuid: {
                [Op.eq]: dept_id
              },
              "`tm_is_public`": {
                [Op.eq]: 1
              }
            },
            {
              tm_user_uuid: {
                [Op.eq]: user_uuid
              },
              tm_department_uuid: {
                [Op.eq]: dept_id
              },
              "`tm_is_public`": {
                [Op.eq]: 0
              }
            }
            ]
          }
        }
      };
    case "4":
      return {
        table_name: tempmstrTbl,
        query: getVitalsQuery(temp_type_id, dept_id, user_uuid, fId)
      };
    case "7":
      return {
        table_name: vw_profile_invest,
        query: {
          order: [
            ["tm_display_order", "ASC"]
          ],
          where: {
            tm_template_type_uuid: temp_type_id,
            tm_is_active: 1,
            tm_status: 1,
            tmd_status: 1,
            tmd_active: 1,
            f_uuid: fId,
            [Op.or]: [{
              tm_department_uuid: {
                [Op.eq]: dept_id
              },
              "`tm_is_public`": {
                [Op.eq]: 1
              }
            },
            {
              tm_user_uuid: {
                [Op.eq]: user_uuid
              },
              tm_department_uuid: {
                [Op.eq]: dept_id
              },
              "`tm_is_public`": {
                [Op.eq]: 0
              }
            }
            ]
          }
        }
      };
    case "9":
      return {
        table_name: vw_diet,
        query: {
          order: [
            ["tm_display_order", "ASC"]
          ],
          where: getTemplatesDietQuery(user_uuid, dept_id, temp_type_id, fId),
          attributes: {
            exclude: ["id", "createdAt", "updatedAt"]
          }
        }
      };
  }
}

function getTemplatedetailsUUID(temp_type_id, temp_id, dept_id, user_uuid, lab_id, sMId) {
  switch (temp_type_id) {
    case "1":
      return {
        table_name: vw_template,
        query: {
          where: getTemplatesdetailsQuery(
            user_uuid,
            dept_id,
            temp_type_id,
            temp_id,
            sMId
          ),
          attributes: {
            exclude: ["id", "createdAt", "updatedAt"]
          }
        }
      };
    case "2":
      lab_id = +(lab_id);
      const labValidation = !lab_id || lab_id === 0;
      const searchKey = labValidation ? 'tm_department_uuid' : 'tm_lab_uuid';
      const searchValue = labValidation ? dept_id : lab_id;
      return {
        table_name: vw_profile_lab,
        query: {
          where: {
            tm_uuid: temp_id,
            tm_user_uuid: user_uuid,
            [searchKey]: searchValue,
            tm_template_type_uuid: temp_type_id,
            //ltm_lab_master_type_uuid: 1,
            tm_is_active: 1,
            tm_status: 1,
            tmd_status: 1,
            tmd_active: 1
          },
          order: [
            ["tm_display_order", "ASC"]
          ]
        }
      };
    case "3":
      lab_id = +(lab_id);
      const risValidation = !lab_id || lab_id === 0;
      const searchKey1 = risValidation ? 'tm_department_uuid' : 'tm_lab_uuid';
      const searchValue1 = risValidation ? dept_id : lab_id;
      return {
        table_name: vw_profile_ris,
        query: {
          where: {
            tm_uuid: temp_id,
            tm_user_uuid: user_uuid,
            [searchKey1]: searchValue1,
            tm_template_type_uuid: temp_type_id,
            // rtm_lab_master_type_uuid: 2,
            tm_is_active: 1,
            tm_status: 1,
            tmd_status: 1,
            tmd_active: 1
          },
          order: [
            ["tm_display_order", "ASC"]
          ]
        }
      };
    case "4":
      return {
        table_name: tempmstrTbl,
        query: getVitalsDetailedQuery(temp_type_id, dept_id, user_uuid, temp_id)
      };
    case "7":
      lab_id = +(lab_id);
      const InvestValidation = !lab_id || lab_id === 0;
      const investsearchKey = InvestValidation ? 'tm_department_uuid' : 'tm_lab_uuid';
      const investsearchValue = InvestValidation ? dept_id : lab_id;
      return {
        table_name: vw_profile_invest,
        query: {
          where: {
            tm_uuid: temp_id,
            tm_user_uuid: user_uuid,
            [investsearchKey]: investsearchValue,
            tm_template_type_uuid: temp_type_id,
            tm_is_active: 1,
            tm_status: 1,
            tmd_status: 1,
            tmd_active: 1
          },
          order: [
            ["tm_display_order", "ASC"]
          ]
        }
      };
    case "9":
      return {
        table_name: vw_diet,
        query: {
          where: getTemplatesdetailsQuery(
            user_uuid,
            dept_id,
            temp_type_id,
            temp_id
          ),
          attributes: {
            exclude: ["id", "createdAt", "updatedAt"]
          }
        }
      };
  }
}

function getTemplateDetailsData(temp_type_id, list) {
  let fetchdata;
  switch (temp_type_id) {
    case "1":
      fetchdata = getTemplateData(list);
      return fetchdata;
    case "2":
      fetchdata = getTempData(temp_type_id, list);
      return fetchdata &&
        fetchdata.templates_lab_list &&
        fetchdata.templates_lab_list.length > 0 ?
        fetchdata.templates_lab_list[0] :
        {};
    case "3":
      fetchdata = getTempData(temp_type_id, list);
      return fetchdata &&
        fetchdata.templates_radiology_list &&
        fetchdata.templates_radiology_list.length > 0 ?
        fetchdata.templates_radiology_list[0] :
        {};
    case "4":
      fetchdata = getTempData(temp_type_id, list);
      return fetchdata &&
        fetchdata.templateDetails &&
        fetchdata.templateDetails.length > 0 ?
        fetchdata.templateDetails[0] :
        {};
    case "7":
      fetchdata = getTempData(temp_type_id, list);
      return fetchdata &&
        fetchdata.templates_invest_list &&
        fetchdata.templates_invest_list.length > 0 ?
        fetchdata.templates_invest_list[0] :
        {};
    case "9":
      fetchdata = getTempData(temp_type_id, list);
      return fetchdata;
  }
}