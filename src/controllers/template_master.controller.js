const httpStatus = require("http-status");
const sequelize = require("sequelize");
const Op = sequelize.Op;

const db = require("../config/sequelize");
const emr_utility = require("../services/utility.service");

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

const tmpmstrController = () => {
  /**
   * Returns jwt token if valid username and password is provided
   * @param req
   * @param res
   * @param next
   * @returns {*}
   */

  const _gettemplateByID = async (req, res) => {
    const { user_uuid } = req.headers;
    const { temp_type_id, dept_id } = req.query;
    try {
      if (user_uuid > 0 && temp_type_id > 0 && dept_id > 0) {
        if (temp_type_id == 5 || temp_type_id == 6 || temp_type_id == 7 || temp_type_id == 8) {
          return res.status(400).send({
            code: httpStatus[400],
            message: "templete type id must be 1 or 2 or 3 or 4 or 9"
          });
        }
        const { table_name, query } = getTemplateTypeUUID(
          temp_type_id,
          dept_id,
          user_uuid
        );
        const templateList = await table_name.findAll(query);
        //console.log("line no 41 ", templateList);
        return res.status(httpStatus.OK).json({
          statusCode: 200,
          responseContents: getTempData(temp_type_id, templateList),
          message:
            templateList && templateList.length > 0
              ? emr_constants.TEMPLATE_FETCH_SUCCESS
              : emr_constants.NO_RECORD_FOUND
        });

      }
      else {
        return res.status(400).send({
          code: httpStatus[400],
          message: "No Request Body or Search key Found "
        });
      }
    } catch (ex) {
      const errorMsg = ex.errors ? ex.errors[0].message : ex.message;
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ status: "error", msg: errorMsg });
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
          message: "Please provide valid template id"
        });
      }
      if (tempuuid) {
        const updatedtempData = {
          status: 0,
          modified_by: userUUID,
          modified_date: new Date()
        };
        const updatetempAsync = await Promise.all([
          tempmstrTbl.update(updatedtempData, { where: { uuid: tempuuid } }),
          tempmstrdetailsTbl.update(updatedtempData, {
            where: { template_master_uuid: tempuuid }
          })
        ]);
        if (updatetempAsync) {
          const isDeleted = updatetempAsync[0][0] === 1;
          const responseCode = isDeleted
            ? httpStatus.OK
            : httpStatus.NO_CONTENT;
          const responseMessage = isDeleted
            ? emr_constants.TEMPLATE_DELETED
            : emr_constants.NO_RECORD_FOUND;
          return res
            .status(200)
            .send({ code: responseCode, message: responseMessage });
        }
      } else {
        return res
          .status(400)
          .send({ code: httpStatus[400], message: "No Request Body Found" });
      }
    } catch (ex) {
      return res
        .status(400)
        .send({ code: httpStatus.BAD_REQUEST, message: ex.message });
    }
  };

  const _gettempdetails = async (req, res) => {
    const user_uuid = req.headers.user_uuid;
    const { temp_id, temp_type_id, dept_id } = req.query;
    try {
      if (user_uuid > 0 && temp_id > 0 && temp_type_id > 0 && dept_id > 0) {
        if (temp_type_id == 5 || temp_type_id == 6 || temp_type_id == 7 || temp_type_id == 8) {
          return res.status(400).send({
            code: httpStatus[400],
            message: "templete type id must be 1 or 2 or 3 or 4 or 9"
          });
        }
        const { table_name, query } = getTemplatedetailsUUID(
          temp_type_id,
          temp_id,
          dept_id,
          user_uuid
        );
        const templateList = await table_name.findAll(query);

        if (templateList.length > 0) {
          const templateData = getTemplateDetailsData(
            temp_type_id,
            templateList
          );

          return res
            .status(httpStatus.OK)
            .json({ statusCode: 200, req: "", responseContent: templateData });
        } else {
          return res
            .status(200)
            .send({ statusCode: 200, message: "No Record Found" });
        }
      } else {
        return res.status(400).send({
          code: httpStatus[400],
          message: "No Request Body or Search key Found "
        });
      }
    } catch (err) {
      const errorMsg = err.errors ? err.errors[0].message : err.message;
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ status: "error", msg: errorMsg });
    }
  };

  const _createTemplate = async (req, res) => {
    if (Object.keys(req.body).length != 0) {
      try {
        // plucking data req body
        const templateMasterReqData = req.body.headers;
        const templateMasterDetailsReqData = req.body.details;
        let userUUID = req.headers.user_uuid;
        let temp_name = templateMasterReqData.name;
        //let display_order = templateMasterReqData.display_order;

        //checking template already exits or not
        const exists = await nameExists(temp_name, userUUID);
        console.log(exists);
        //chechking display order allocation
        //const dspexists = await dspExists(display_order, userUUID);

        if (exists && exists.length > 0 && (exists[0].dataValues.is_active == 1 || 0) && exists[0].dataValues.status == 1) {
          //template already exits
          return res
            .status(400)
            .send({ code: httpStatus[400], message: "Template name exists" });
        }
        // else if (dspexists && dspexists.length > 0) {
        //   //template not exits and display order already allocated
        //   return res.status(400).send({ code: httpStatus[400], message: "display order already allocated" });
        // }
        else if (
          (exists.length == 0 || exists[0].dataValues.status == 0) &&
          userUUID &&
          templateMasterReqData &&
          templateMasterDetailsReqData.length > 0
        ) {
          let createData = await createtemp(
            userUUID,
            templateMasterReqData,
            templateMasterDetailsReqData
          );
          if (createData) {
            return res.status(200).send({
              code: httpStatus.OK,
              responseContent: {
                headers: templateMasterReqData,
                details: templateMasterDetailsReqData
              },
              message: "Template details Inserted Successfully"
            });
          }
        } else {
          return res
            .status(400)
            .send({ code: httpStatus[400], message: "No Request Body Found" });
        }
      } catch (err) {
        return res
          .status(400)
          .send({ code: httpStatus.BAD_REQUEST, message: err.message });
      }
    } else {
      return res
        .status(400)
        .send({ code: httpStatus[400], message: "No Request Body Found" });
    }
  };

  const _updateTemplateById = async (req, res) => {
    if (Object.keys(req.body).length != 0) {
      const { user_uuid } = req.headers;
      const templateMasterReqData = req.body.headers;
      const temp_name = templateMasterReqData.name;
      const temp_id = templateMasterReqData.template_id
      const templateMasterDetailsReqData = req.body.existing_details;
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

        const exists = await nameExistsupdate(temp_name, user_uuid, temp_id);
        if (exists && exists.length > 0 && (exists[0].dataValues.is_active == 1 || 0) && exists[0].dataValues.status == 1) {
          //template already exits
          return res
            .status(400)
            .send({ code: httpStatus[400], message: "Template name exists" });
        }
        else if (
          (exists.length == 0 || exists[0].dataValues.status == 0) &&
          user_uuid &&
          templateMasterReqData &&
          templateMasterDetailsReqData
        ) {
          //templateTransaction = await db.sequelize.transaction();
          if (templateMasterReqData.template_id <= 0) {
            return res.status(400).send({
              code: httpStatus[400],
              message: "Please provide valid template id"
            });
          }
          const del_temp_drugs =
            tmpDtlsRmvdDrugs && tmpDtlsRmvdDrugs.length > 0
              ? await removedTmpDetails(
                tempmstrdetailsTbl,
                tmpDtlsRmvdDrugs,
                user_uuid
              )
              : "";
          const new_temp_drugs = await tempmstrdetailsTbl.bulkCreate(
            templateMasterNewDrugsDetailsReqData,
            { returning: true }
          );
          const temp_mas = await tempmstrTbl.update(
            templateMasterUpdateData,
            { where: { uuid: templateMasterReqData.template_id } },
            { returning: true, plain: true }
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
              message: "Updated Successfully",
              responseContent: { tm: temp_mas, tmd: temp_mas_dtls }
            });
          }
        } else {
          // await templateTransaction.rollback();
          // templateTransStatus = true;
          return res.status(400).send({
            code: httpStatus[400],
            message: "No Request headers or Body Found"
          });
        }
      } catch (ex) {
        // await templateTransaction.rollback();npm
        // templateTransStatus = true;
        return res
          .status(400)
          .send({ code: httpStatus[400], message: ex.message });
      }
      // finally {
      //   if (templateTransaction && !templateTransStatus) {
      //     await templateTransaction.rollback();
      //   }
      // }
    } else {
      return res
        .status(400)
        .send({ code: httpStatus[400], message: "No Request Body Found" });
    }
  };

  // Dyanmic function for template drugs and vitals update
  const _updateTemplateDetailsByID = async (req, res) => {
    const { user_uuid } = req.headers;
    const tempReqBody = req.body;
    const templateMasterReqData = req.body.headers;
    const templateMasterDetailsReqData = req.body.existing_temp_details
      ? req.body.existing_temp_details
      : "";
    const new_temp_details = req.body.new_temp_details
      ? req.body.new_temp_details
      : "";
    const templateMasterNewTempDetailsReqData = getNewTemplateDetails(
      user_uuid,
      new_temp_details
    );
    const templateMasterUpdateData = templateMasterReqData
      ? getTemplateMasterUpdateData(user_uuid, templateMasterReqData)
      : "";
    const tmpDtlsRmvd = req.body.removed_temp_dtls;

    try {
      if (user_uuid && tempReqBody) {
        if (templateMasterReqData.template_type_uuid == 1) {
          const del_temp_dtls =
            tmpDtlsRmvd && tmpDtlsRmvd.length > 0
              ? await removedTmpDetails(
                tempmstrdetailsTbl,
                tmpDtlsRmvd,
                user_uuid
              )
              : "";
          const new_temp_dtls = await tempmstrdetailsTbl.bulkCreate(
            templateMasterNewTempDetailsReqData,
            { returning: true }
          );
          const temp_mas = await tempmstrTbl.update(
            templateMasterUpdateData,
            { where: { uuid: templateMasterReqData.template_id } },
            { returning: true, plain: true }
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
            message: "Updated Successfully",
            responseContent: { tm: temp_mas, tmd: temp_mas_dtls }
          });
        }
        if (templateMasterReqData.template_type_uuid == 4) {
          del_temp_dtls =
            tmpDtlsRmvd && tmpDtlsRmvd.length > 0
              ? await removedTmpDetails(
                tempmstrdetailsTbl,
                tmpDtlsRmvd,
                user_uuid
              )
              : "";
          new_temp_dtls = await tempmstrdetailsTbl.bulkCreate(
            templateMasterNewTempDetailsReqData,
            { returning: true }
          );
          return res.status(200).send({
            code: httpStatus.OK,
            message: "Updated Successfully",
            responseContent: { new_temp_dtls }
          });
        }
      } else {
        return res.status(400).send({
          code: httpStatus[400],
          message: "No Request headers or Body Found"
        });
      }
    } catch (ex) {
      return res
        .status(400)
        .send({ code: httpStatus[400], message: ex.message });
    }
  };

  const _getalltemplates = async (req, res) => {
    const { user_uuid } = req.headers;
    let getsearch = req.body;

    pageNo = 0;

    const itemsPerPage = getsearch.paginationSize
      ? getsearch.paginationSize
      : 10;
    let sortField = "tm_template_type_uuid";
    let sortOrder = "ASC";

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
      order: [[sortField, sortOrder]],
      attributes: { exclude: ["id", "createdAt", "updatedAt"] },
      where: { is_active: 1, tm_status: 1 },
    };

    if (getsearch.search && /\S/.test(getsearch.search)) {
      findQuery.where = {
        tm_name: {
          [Op.like]: "%" + getsearch.search + "%"
        }
      };
    }
    if (getsearch.name && /\S/.test(getsearch.name)) {
      findQuery.where ['tm_name'] = {
                  [Op.like]: "%" + getsearch.name + "%"
        };
      }
    
    if (getsearch.template_type_uuid && /\S/.test(getsearch.tm_template_type_uuid)) {
      findQuery.where['tm_template_type_uuid'] = getsearch.template_type_uuid;
    
  }
        
    if (getsearch.hasOwnProperty('status') && /\S/.test(getsearch.status)) {
      //findQuery.where['is_active'] = getsearch.status;
      findQuery.where['tm_status'] = getsearch.status;
    }
    try {
      if (user_uuid) {
        const templateList = await vw_all_temp.findAndCountAll(findQuery);

        return res.status(httpStatus.OK).json({
          statusCode: 200,
          req: "",
          responseContents: templateList.rows ? templateList.rows : [],
          totalRecords: templateList.count ? templateList.count : 0
        });
      } else {
        return res.status(400).send({
          code: httpStatus[400],
          message: "No Request Body or Search key Found "
        });
      }
    } catch (ex) {
      const errorMsg = ex.errors ? ex.errors[0].message : ex.message;
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ status: "error", msg: errorMsg });
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

  if (fetchedData && fetchedData.length > 0) {
    temp_details = {
      template_id: fetchedData[0].dataValues.tm_uuid,
      template_name: fetchedData[0].dataValues.tm_name,

      template_department: fetchedData[0].dataValues.tm_dept,
      user_uuid: fetchedData[0].dataValues.tm_userid,
      display_order: fetchedData[0].dataValues.tm_display_order,
      template_desc: fetchedData[0].dataValues.tm_description,
      is_public: fetchedData[0].dataValues.tm_public[0] === 1 ? true : false
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

          drug_route_name: tD.dr_code,
          drug_route_id: tD.dr_uuid,

          drug_frequency_id: tD.df_uuid,
          drug_frequency_name: tD.df_code,

          drug_period_id: tD.dp_uuid,
          drug_period_name: tD.dp_name,
          drug_period_code: tD.dp_code,

          drug_instruction_id: tD.di_uuid,
          drug_instruction_name: tD.di_name,
          drug_instruction_code: tD.di_code,

          drug_duration: tD.tmd_duration,
          store_id: tD.sm_uuid,
          store_code: tD.sm_store_code,
          store_name: tD.sm_store_name,

          is_active: tD.im_acive
        }
      ];
    });
    return { template_details: temp_details, drug_details: templateList };
  } else {
    return {};
  }
}

// function for arrange the list of templates data
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
    return { templates_list: temp_list };
  } else {
    return {};
  }
}

function getTemplateListData1(fetchedData) {
  let templateList = [],
    diet_details = [];

  if (fetchedData && fetchedData.length > 0) {
    fetchedData.forEach(tD => {
      templateList = [
        ...templateList,
        {
          temp_details: {
            template_id: tD.dataValues.tm_uuid,
            template_name: tD.dataValues.tm_name,

            template_department: tD.dataValues.tm_dept,
            user_uuid: tD.dataValues.tm_userid,
            display_order: tD.dataValues.tm_display_order,
            template_desc: tD.dataValues.tm_description,
            is_public: tD.dataValues.tm_public[0] === 1 ? true : false
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

    return { templates_list: temp_list };
  } else {
    return {};
  }
}

// function for updating the data for template master details
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
      (mD.drug_route_uuid = mD.drug_route_uuid),
      (mD.drug_frequency_uuid = mD.drug_frequency_uuid),
      (mD.diet_master_uuid = mD.diet_master_uuid),
      (mD.diet_category_uuid = mD.diet_category_uuid),
      (mD.diet_frequency_uuid = mD.diet_frequency_uuid),
      (mD.display_order = mD.display_order),
      (mD.duration = mD.drug_duration),
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
        mD,
        {
          where: {
            uuid: mD.template_details_uuid,
            template_master_uuid: masterData.template_id
          },
          transaction: templateTransaction
        },
        { returning: true }
      )
    ];
  });
  return masterDetailsPromise;
}

//function for adding new values to template details table when perform update action
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
          drug_route_uuid: tD.drug_route_uuid,
          drug_frequency_uuid: tD.drug_frequency_uuid,
          duration: tD.drug_duration,
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

//function for delete values from template details table when perform update action
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
        mD,
        {
          where: {
            uuid: mD.template_details_uuid,
            template_master_uuid: mD.template_uuid
          }
        },
        { returning: true }
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

          drug_route_name: dD.dr_code,
          drug_route_id: dD.dr_uuid,
          drug_is_emar: dD.im_is_emar,
          drug_frequency_id: dD.df_uuid,
          drug_frequency_name: dD.df_code,

          drug_period_id: dD.dp_uuid,
          drug_period_name: dD.dp_name,
          drug_period_code: dD.dp_code,

          drug_instruction_id: dD.di_uuid,
          drug_instruction_name: dD.di_name,
          drug_instruction_code: dD.di_code,

          drug_duration: dD.tmd_duration,
          store_id: dD.sm_uuid,
          store_code: dD.sm_store_code,
          store_name: dD.sm_store_name,

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
            template_description: tD.dataValues.tm_description,
            template_displayorder: tD.dataValues.tm_display_order,
            template_type_uuid: tD.dataValues.tm_template_type_uuid,
            template_is_active: tD.dataValues.tm_is_active,
            template_status: tD.dataValues.tm_status,
            is_public: tD.dataValues.tm_is_public
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
    return { templates_lab_list: temp_list };
  } else {
    return {};
  }
}

function getRisListData(fetchedData) {
  let templateList = [],
    lab_details = [];

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
            template_description: tD.dataValues.tm_description,
            template_displayorder: tD.dataValues.tm_display_order,
            template_type_uuid: tD.dataValues.tm_template_type_uuid,
            template_is_active: tD.dataValues.tm_is_active,
            template_status: tD.dataValues.tm_status,
            is_public: tD.dataValues.tm_is_public
          },

          lab_details: [
            ...lab_details,
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
    return { templates_lab_list: temp_list };
  } else {
    return {};
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
  return lab_list;
}

function getTemplatesQuery(user_uuid, dept_id, temp_type_id) {
  return {
    tm_status: 1,
    tm_active: 1,
    tmd_is_active: 1,
    tmd_status: 1,
    tm_template_type_uuid: temp_type_id,
    [Op.or]: [
      { tm_dept: { [Op.eq]: dept_id }, tm_public: { [Op.eq]: 1 } },
      { tm_userid: { [Op.eq]: user_uuid } }
    ]
  };
}

function getTemplatesdetailsQuery(user_uuid, dept_id, temp_type_id, temp_id) {
  return {
    tm_uuid: temp_id,
    tm_status: 1,
    tm_active: 1,
    tmd_is_active: 1,
    tmd_status: 1,
    tm_template_type_uuid: temp_type_id,
    [Op.or]: [
      { tm_dept: { [Op.eq]: dept_id }, tm_public: { [Op.eq]: 1 } },
      { tm_userid: { [Op.eq]: user_uuid } }
    ]
  };
}

function getVitalsDetailedQuery(temp_type_id, dept_id, user_uuid, temp_id) {
  return {
    attributes: { exclude: ["id", "createdAt", "updatedAt"] },
    where: {
      uuid: temp_id,
      user_uuid: user_uuid,
      department_uuid: dept_id,
      template_type_uuid: temp_type_id,
      status: 1,
      is_active: 1
    },
    include: [
      {
        model: tempmstrdetailsTbl,
        where: {
          status: 1,
          is_active: 1
        },
        include: [
          {
            model: vitalMasterTbl,
            require: false,
            where: {
              status: 1,
              is_active: 1
            }
          }
        ]
      }
    ]
  };
}

function getVitalsQuery(temp_type_id, dept_id, user_uuid) {
  return {
    attributes: { exclude: ["id", "createdAt", "updatedAt"] },
    where: {
      user_uuid: user_uuid,
      department_uuid: dept_id,
      template_type_uuid: temp_type_id,
      status: 1,
      is_active: 1
    },
    include: [
      {
        model: tempmstrdetailsTbl,
        where: {
          status: 1,
          is_active: 1
        },
        include: [
          {
            model: vitalMasterTbl,
            require: false,
            where: {
              status: 1,
              is_active: 1
            }
          }
        ]
      }
    ]
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
    case "9":
      return getTemplateListData1(result);
    default:
      let templateDetails = result;
      return { templateDetails };
  }
}

async function createtemp(
  userUUID,
  templateMasterReqData,
  templateMasterDetailsReqData
) {
  templateMasterReqData = emr_utility.createIsActiveAndStatus(
    templateMasterReqData,
    userUUID
  );
  templateMasterReqData.active_from = templateMasterReqData.active_to = new Date();

  const templateMasterCreatedData = await tempmstrTbl.create(
    templateMasterReqData,
    { returning: true }
  );
  templateMasterDetailsReqData.forEach((item, index) => {
    item.template_master_uuid = templateMasterCreatedData.dataValues.uuid;
    item.created_by = userUUID;
    item.modified_by = 0;
    item.created_date = item.modified_date = new Date();
  });
  const dtls_result = await tempmstrdetailsTbl.bulkCreate(
    templateMasterDetailsReqData,
    { returning: true }
  );
  return {
    templateMasterReqData: templateMasterCreatedData,
    templateMasterDetailsReqData: dtls_result
  };
}

const nameExists = (temp_name, userUUID) => {
  if (temp_name !== undefined) {
    return new Promise((resolve, reject) => {
      let value = tempmstrTbl.findAll({
        order: [['created_date', 'DESC']],
        attributes: ["name", "is_active", "status"],
        where: { name: temp_name, user_uuid: userUUID }
      });
      if (value) {
        resolve(value);
        return value;
      } else {
        reject({ message: "name does not existed" });
      }
    });
  }
};
const nameExistsupdate = (temp_name, userUUID, temp_id) => {
  if (temp_name !== undefined) {
    return new Promise((resolve, reject) => {
      let value = tempmstrTbl.findAll({
        order: [['created_date', 'DESC']],
        attributes: ["name", "is_active", "status"],
        where: {
          name: temp_name,
          user_uuid: userUUID,
          uuid: { [Op.not]: temp_id }
        }
      });
      if (value) {
        resolve(value);
        return value;
      } else {
        reject({ message: "name does not existed" });
      }
    });
  }
};
function getTemplateTypeUUID(temp_type_id, dept_id, user_uuid) {
  switch (temp_type_id) {
    case "1":
      return {
        table_name: vw_template,
        query: {
          order: [["tm_display_order", "ASC"]],
          where: getTemplatesQuery(user_uuid, dept_id, temp_type_id),
          attributes: { exclude: ["id", "createdAt", "updatedAt"] }
        }
      };
    case "2":
      return {
        table_name: vw_profile_lab,
        query: {
          order: [["tm_display_order", "ASC"]],
          where: {
            //tm_user_uuid: user_uuid,
            //tm_department_uuid: dept_id,
            tm_template_type_uuid: temp_type_id,
            //ltm_lab_master_type_uuid: 1,
            tm_is_active: 1,
            tm_status: 1,
            tmd_status: 1,
            tmd_active: 1,
            [Op.or]: [
              {
                tm_department_uuid: { [Op.eq]: dept_id },
                "`tm_is_public`": { [Op.eq]: 1 }
              },
              { tm_user_uuid: { [Op.eq]: user_uuid } }
            ]
          }
        }
      };
    case "3":
      return {
        table_name: vw_profile_ris,
        query: {
          order: [["tm_display_order", "ASC"]],
          where: {
            //tm_user_uuid: user_uuid,
            //tm_department_uuid: dept_id,
            tm_template_type_uuid: temp_type_id,
            //rtm_lab_master_type_uuid: 2,
            tm_is_active: 1,
            tm_status: 1,
            tmd_status: 1,
            tmd_active: 1,
            [Op.or]: [
              {
                tm_department_uuid: { [Op.eq]: dept_id },
                "`tm_is_public`": { [Op.eq]: 1 }
              },
              { tm_user_uuid: { [Op.eq]: user_uuid } }
            ]
          }
        }
      };
    case "4":
      return {
        table_name: tempmstrTbl,
        query: getVitalsQuery(temp_type_id, dept_id, user_uuid)
      };

    case "9":
      return {
        table_name: vw_diet,
        query: {
          order: [["tm_display_order", "ASC"]],
          where: getTemplatesQuery(user_uuid, dept_id, temp_type_id),
          attributes: { exclude: ["id", "createdAt", "updatedAt"] }
        }
      };
  }
}

function getTemplatedetailsUUID(temp_type_id, temp_id, dept_id, user_uuid) {
  switch (temp_type_id) {
    case "1":
      return {
        table_name: vw_template,
        query: {
          where: getTemplatesdetailsQuery(
            user_uuid,
            dept_id,
            temp_type_id,
            temp_id
          ),
          attributes: { exclude: ["id", "createdAt", "updatedAt"] }
        }
      };
    case "2":
      return {
        table_name: vw_profile_lab,
        query: {
          where: {
            tm_uuid: temp_id,
            tm_user_uuid: user_uuid,
            tm_department_uuid: dept_id,
            tm_template_type_uuid: temp_type_id,
            //ltm_lab_master_type_uuid: 1,
            tm_is_active: 1,
            tm_status: 1,
            tmd_status: 1,
            tmd_active: 1
          },
          order: [["tm_display_order", "ASC"]]
        }
      };
    case "3":
      return {
        table_name: vw_profile_ris,
        query: {
          where: {
            tm_uuid: temp_id,
            tm_user_uuid: user_uuid,
            tm_department_uuid: dept_id,
            tm_template_type_uuid: temp_type_id,
            rtm_lab_master_type_uuid: 2,
            tm_is_active: 1,
            tm_status: 1,
            tmd_status: 1,
            tmd_active: 1
          },
          order: [["tm_display_order", "ASC"]]
        }
      };
    case "4":
      return {
        table_name: tempmstrTbl,
        query: getVitalsDetailedQuery(temp_type_id, dept_id, user_uuid, temp_id)
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
          attributes: { exclude: ["id", "createdAt", "updatedAt"] }
        }
      };
  }
}

//function is for getting single Template Detailed Data
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
        fetchdata.templates_lab_list.length > 0
        ? fetchdata.templates_lab_list[0]
        : {};
    case "3":
      fetchdata = getTempData(temp_type_id, list);
      return fetchdata &&
        fetchdata.templates_lab_list &&
        fetchdata.templates_lab_list.length > 0
        ? fetchdata.templates_lab_list[0]
        : {};
    case "4":
      fetchdata = getTempData(temp_type_id, list);
      return fetchdata &&
        fetchdata.templateDetails &&
        fetchdata.templateDetails.length > 0
        ? fetchdata.templateDetails[0]
        : {};
    case "9":
      fetchdata = getTempData(temp_type_id, list);
      return fetchdata;
  }
}

//function for chechking display order allocated or not
const dspExists = (display_order, userUUID) => {
  if (display_order !== undefined) {
    return new Promise((resolve, reject) => {
      let value = tempmstrTbl.findAll({
        attributes: ["user_uuid", "display_order", "is_active", "status"],
        where: { display_order: display_order, user_uuid: userUUID }
      });
      if (value) {
        resolve(value);
        return value;
      } else {
        reject({ message: "not existed" });
      }
    });
  }
};

function getAllTempData(fetchedData) {
  let templateList = [];

  if (fetchedData && fetchedData.length > 0) {
    fetchedData.forEach(tD => {
      templateList = [
        ...templateList,
        {
          template_id: tD.dataValues.tm_uuid,
          template_name: tD.dataValues.tm_name,
          template_status: tD.dataValues.tm_status,
          template_isactive: tD.dataValues.is_active,
          template_is_public: tD.dataValues.tm_is_public,
          template_type_id: tD.dataValues.tm_template_type_uuid,
          template_type: tD.dataValues.tt_name,
          template_type_status: tD.dataValues.tt_status,
          template_type_isactive: tD.dataValues.tt_is_active,
          facility_id: tD.dataValues.tm_facility_uuid,
          facility_name: tD.dataValues.f_name,
          facility_isactive: tD.dataValues.f_is_active,
          facility_status: tD.dataValues.f_status,
          department_id: tD.dataValues.tm_department_uuid,
          departiment_name: tD.dataValues.d_name,
          user_uuid: tD.dataValues.tm_user_uuid,
          doctor_name:
            tD.dataValues.u_first_name +
            " " +
            tD.dataValues.u_middle_name +
            " " +
            tD.dataValues.u_last_name,
          doctor_isactive: tD.dataValues.u_is_active,
          doctor_status: tD.dataValues.u_status
        }
      ];
    });
    return { templates_list: templateList };
  } else {
    return {};
  }
}
