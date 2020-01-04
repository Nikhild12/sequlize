const httpStatus = require("http-status");
const sequelize = require('sequelize');
const Op = sequelize.Op;

const db = require("../config/sequelize");

//import tables
const tempmstrTbl = db.template_master;
const tempmstrdetailsTbl = db.template_master_details;
const vitalMasterTbl = db.vital_masters;
const vw_template = db.vw_template_master_details;
const vw_lab = db.vw_lab_template;

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
      if (user_uuid && temp_type_id && dept_id) {

        const { table_name, query } = getTemplateTypeUUID(temp_type_id, dept_id, user_uuid);
        const templateList = await table_name.findAll(query);

        return res
          .status(httpStatus.OK)
          .json({ statusCode: 200, req: '', responseContents: getTempData(temp_type_id, templateList) });

      } else {
        return res.status(400).send({ code: httpStatus[400], message: "No Request Body or Search key Found " });
      }
    }
    catch (ex) {
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
      if (tempuuid) {
        const updatedtempData = { status: 0, modified_by: userUUID, modified_date: new Date() };

        const updatetempAsync = await Promise.all(
          [
            tempmstrTbl.update(updatedtempData, { where: { uuid: tempuuid } }),
            tempmstrdetailsTbl.update(updatedtempData, { where: { template_master_uuid: tempuuid } }),
          ]
        );
        if (updatetempAsync) {
          return res.status(200).send({ code: httpStatus.OK, message: "Deleted Successfully" });
        }

      } else {
        return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" });
      }
    } catch (ex) {
      return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
    }
  };

  const _gettempdetails = async (req, res) => {
    const user_uuid = req.headers.user_uuid;
    const { temp_id, temp_type_id, dept_id } = req.query;
    try {
      if (user_uuid && temp_id && temp_type_id && dept_id) {

        const { table_name, query } = getTemplatedetailsUUID(temp_type_id, temp_id, dept_id, user_uuid);
        const templateList = await table_name.findAll(query);

        if (templateList) {
          const templateData = getTemplateDetailsData(temp_type_id, templateList);

          return res
            .status(httpStatus.OK)
            .json({ statusCode: 200, req: '', responseContent: templateData });
        }

      } else {
        return res.status(400).send({ code: httpStatus[400], message: "No Request Body or Search key Found " });
      }
    } catch (err) {
      const errorMsg = err.errors ? err.errors[0].message : err.message;
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ status: "error", msg: errorMsg });
    }
  };

  const _createTemplate = async (req, res) => {

    try {
      // plucking data req body
      const templateMasterReqData = req.body.headers;
      const templateMasterDetailsReqData = req.body.details;
      let userUUID = req.headers.user_uuid;
      let temp_name = templateMasterReqData.name;
      let temp_type_id = templateMasterReqData.template_type_uuid;

      const exists = await nameExists(temp_name, userUUID);
  //    console.log("*****",exists[0]);
//console.log("---------",exists[0].dataValues.is_active);
//console.log("---------",exists[0].status );

      if (exists && exists.length > 0 && (exists[0].dataValues.is_active == 1 || 0) && exists[0].dataValues.status == 1) {
        return res.status(400).send({ code: httpStatus.OK, message: "Template name exists" });
      }
      else if ((exists.length == 0 || exists[0].dataValues.status == 0 ) && userUUID && templateMasterReqData && templateMasterDetailsReqData.length > 0) {

        let createData = await createtemp(userUUID, templateMasterReqData, templateMasterDetailsReqData);
        if (createData) {
          return res.status(200).send({ code: httpStatus.OK, responseContent: { "headers": templateMasterReqData, "details": templateMasterDetailsReqData }, message: "Template details Inserted Successfully" });
        }
      } else {
        return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" });
      }
    } catch (err) {
      return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: err.message });
    }

  };

  const _updateTemplateById = async (req, res) => {

    if (Object.keys(req.body).length != 0) {
      const { user_uuid } = req.headers;
      const templateMasterReqData = req.body.headers;

      const templateMasterDetailsReqData = req.body.existing_details;
      const templateMasterNewDrugsDetailsReqData = getNewTemplateDetails(user_uuid, req.body.new_details);
      const templateMasterUpdateData = getTemplateMasterUpdateData(user_uuid, templateMasterReqData);
      const tmpDtlsRmvdDrugs = req.body.removed_details;

      try {
        if (user_uuid && templateMasterReqData && templateMasterDetailsReqData) {

          const del_temp_drugs = (tmpDtlsRmvdDrugs && tmpDtlsRmvdDrugs.length > 0) ? await removedTmpDetails(tempmstrdetailsTbl, tmpDtlsRmvdDrugs, user_uuid) : '';
          const new_temp_drugs = await tempmstrdetailsTbl.bulkCreate(templateMasterNewDrugsDetailsReqData, { returning: true });
          const temp_mas = await tempmstrTbl.update(templateMasterUpdateData, { where: { uuid: templateMasterReqData.template_id } }, { returning: true, plain: true });
          const temp_mas_dtls = await Promise.all(getTemplateMasterDetailsWithUUID(tempmstrdetailsTbl, templateMasterDetailsReqData, templateMasterReqData, user_uuid));

          if (temp_mas && temp_mas_dtls) {
            return res.status(200).send({ code: httpStatus.OK, message: "Updated Successfully", responseContent: { tm: temp_mas, tmd: temp_mas_dtls } });
          }
        } else {
          return res.status(400).send({ code: httpStatus[400], message: "No Request headers or Body Found" });
        }
      } catch (ex) {
        return res.status(400).send({ code: httpStatus[400], message: ex.message });
      }
    } else {
      return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" });
    }
  };

  // Dyanmic function for template drugs and vitals update
  const _updateTemplateDetailsByID = async (req, res) => {

    const { user_uuid } = req.headers;
    const tempReqBody = req.body;
    const templateMasterReqData = req.body.headers;
    const templateMasterDetailsReqData = req.body.existing_temp_details ? req.body.existing_temp_details : "";
    const new_temp_details = req.body.new_temp_details ? req.body.new_temp_details : "";
    const templateMasterNewTempDetailsReqData = getNewTemplateDetails(user_uuid, new_temp_details);
    const templateMasterUpdateData = templateMasterReqData ? getTemplateMasterUpdateData(user_uuid, templateMasterReqData) : '';
    const tmpDtlsRmvd = req.body.removed_temp_dtls;

    try {
      if (user_uuid && tempReqBody) {

        if (templateMasterReqData.template_type_uuid == 1) {
          const del_temp_dtls = (tmpDtlsRmvd && tmpDtlsRmvd.length > 0) ? await removedTmpDetails(tempmstrdetailsTbl, tmpDtlsRmvd, user_uuid) : '';
          const new_temp_dtls = await tempmstrdetailsTbl.bulkCreate(templateMasterNewTempDetailsReqData, { returning: true });
          const temp_mas = await tempmstrTbl.update(templateMasterUpdateData, { where: { uuid: templateMasterReqData.template_id } }, { returning: true, plain: true });
          const temp_mas_dtls = await Promise.all(getTemplateMasterDetailsWithUUID(tempmstrdetailsTbl, templateMasterDetailsReqData, templateMasterReqData, user_uuid));
          return res.status(200).send({ code: httpStatus.OK, message: "Updated Successfully", responseContent: { tm: temp_mas, tmd: temp_mas_dtls } });
        }
        if (templateMasterReqData.template_type_uuid == 4) {
          del_temp_dtls = (tmpDtlsRmvd && tmpDtlsRmvd.length > 0) ? await removedTmpDetails(tempmstrdetailsTbl, tmpDtlsRmvd, user_uuid) : '';
          new_temp_dtls = await tempmstrdetailsTbl.bulkCreate(templateMasterNewTempDetailsReqData, { returning: true });
          return res.status(200).send({ code: httpStatus.OK, message: "Updated Successfully", responseContent: { new_temp_dtls } });
        }

      } else {
        return res.status(400).send({ code: httpStatus[400], message: "No Request headers or Body Found" });
      }
    } catch (ex) {
      console.log('ex', ex);
      return res.status(400).send({ code: httpStatus[400], message: ex.message });
    }
  };

  return {
    gettemplateByID: _gettemplateByID,
    createTemplate: _createTemplate,
    deleteTemplateDetails: _deleteTemplateDetails,
    gettempdetails: _gettempdetails,
    updateTemplateById: _updateTemplateById,

    updateTemplateDetailsByID: _updateTemplateDetailsByID
  };
};

module.exports = tmpmstrController();

function getTemplateMasterUpdateData(user_uuid, templateMasterReqData) {

  return {
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
    revision: templateMasterReqData.revision,
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

    };

    fetchedData.forEach((tD) => {
      templateList = [...templateList,
      {
        template_details_id: tD.tmd_uuid,

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

        is_active: tD.im_acive[0] === 1 ? true : false
      }
      ];
    });
    return { "template_details": temp_details, "drug_details": templateList };
  }
  else {
    return {};
  }
}
// function for arrange the list of templates data 
function getTemplateListData(fetchedData) {
  let templateList = [], drug_details = [];

  if (fetchedData && fetchedData.length > 0) {

    fetchedData.forEach((tD) => {
      templateList = [...templateList,
      {
        temp_details: {
          template_id: tD.dataValues.tm_uuid,
          template_name: tD.dataValues.tm_name,

          template_department: tD.dataValues.tm_dept,
          user_uuid: tD.dataValues.tm_userid,
          display_order: tD.dataValues.tm_display_order,
          template_desc: tD.dataValues.tm_description,
        },

        drug_details: [...drug_details, ...getDrugsListForTemplate(fetchedData, tD.dataValues.tm_uuid)]
      }
      ];
    });
    let uniq = {};
    let temp_list = templateList.filter(obj => !uniq[obj.temp_details.template_id] && (uniq[obj.temp_details.template_id] = true));
    return { "templates_list": temp_list };
  }
  else {
    return {};
  }
}
// function for updating the data for template master details
function getTemplateMasterDetailsWithUUID(detailsTbl, detailsData, masterData, user_uuid) {
  let masterDetailsPromise = [];
  // assigning data to the template master details
  // updating template master details  
  detailsData.forEach((mD) => {
    mD.template_details_uuid = mD.template_details_uuid,
      mD.chief_complaint_uuid = mD.chief_complaint_uuid,
      mD.vital_master_uuid = mD.vital_master_uuid,
      mD.item_master_uuid = mD.drug_id,
      mD.drug_route_uuid = mD.drug_route_uuid,
      mD.drug_frequency_uuid = mD.drug_frequency_uuid,
      mD.display_order = mD.display_order,
      mD.duration = mD.drug_duration,
      mD.duration_period_uuid = mD.drug_period_uuid,
      mD.drug_instruction_uuid = mD.drug_instruction_uuid,
      mD.modified_by = user_uuid,
      mD.modified_date = new Date(),
      mD.quantity = mD.quantity,
      mD.status = mD.status,
      mD.revision = mD.revision,
      mD.is_active = mD.is_active;
    masterDetailsPromise = [...masterDetailsPromise,
    detailsTbl.update(mD, { where: { uuid: mD.template_details_uuid, template_master_uuid: masterData.template_id } }, { returning: true })
    ];

  });

  return masterDetailsPromise;
}
//function for adding new values to template details table when perform update action
function getNewTemplateDetails(user_uuid, temp_master_details) {
  let newTempDtls = [];
  if (temp_master_details && temp_master_details.length > 0) {
    temp_master_details.forEach((tD) => {
      newTempDtls = [...newTempDtls,
      {

        template_master_uuid: tD.template_master_uuid,
        test_master_uuid: tD.test_master_uuid,
        chief_complaint_uuid: tD.chief_complaint_uuid,
        vital_master_uuid: tD.vital_master_uuid,
        item_master_uuid: tD.drug_id,
        drug_route_uuid: tD.drug_route_uuid,
        drug_frequency_uuid: tD.drug_frequency_uuid,
        duration: tD.drug_duration,
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
  dtls.forEach((mD) => {

    mD.modified_by = user_id;
    mD.modified_date = new Date();
    mD.status = 0;
    mD.is_active = 0;
    masterDetailsPromise = [...masterDetailsPromise,
    dtlsTbl.update(mD, { where: { uuid: mD.template_details_uuid, template_master_uuid: mD.template_uuid } }, { returning: true })
    ];
  });
  return masterDetailsPromise;
}

function getDrugsListForTemplate(fetchedData, template_id) {

  let drug_list = [];
  const filteredData = fetchedData.filter((fD) => {
    return fD.dataValues.tm_uuid === template_id;
  });

  if (filteredData && filteredData.length > 0) {
    filteredData.forEach((dD) => {
      drug_list = [...drug_list,
      {
        template_details_uuid: dD.tmd_uuid,
        drug_name: dD.im_name,
        drug_code: dD.im_code,
        drug_id: dD.im_uuid,

        drug_route_name: dD.dr_code,
        drug_route_id: dD.dr_uuid,

        drug_frequency_id: dD.df_uuid,
        drug_frequency_name: dD.df_code,

        drug_period_id: dD.dp_uuid,
        drug_period_name: dD.dp_name,
        drug_period_code: dD.dp_code,

        drug_instruction_id: dD.di_uuid,
        drug_instruction_name: dD.di_name,
        drug_instruction_code: dD.di_code,

        drug_duration: dD.tmd_duration,

        is_active: dD.im_acive[0] === 1 ? true : false
      }
      ];
    });
  }
  return drug_list;
}

function getLabListData(fetchedData) {
  let templateList = [], lab_details = [];

  if (fetchedData && fetchedData.length > 0) {

    fetchedData.forEach((tD) => {
      templateList = [...templateList,
      {
        temp_details: {
          template_id: tD.dataValues.tm_uuid,
          template_name: tD.dataValues.tm_name,
          template_department: tD.dataValues.tm_department_uuid,
          user_uuid: tD.dataValues.tm_user_uuid,
          template_description: tD.dataValues.tm_description,
          template_displayorder: tD.dataValues.tm_display_order,
          template_type_uuid: tD.dataValues.tm_template_type_uuid,
          template_is_active: tD.dataValues.tm_is_active[0] === 1 ? true : false,
          template_status: tD.dataValues.tm_status[0] === 1 ? true : false,
        },

        lab_details: [...lab_details, ...getLabListForTemplate(fetchedData, tD.dataValues.tm_uuid)]
      }
      ];
    });
    let uniq = {};
    let temp_list = templateList.filter(obj => !uniq[obj.temp_details.template_id] && (uniq[obj.temp_details.template_id] = true));
    return { "templates_lab_list": temp_list };
  }
  else {
    return {};
  }
}

function getLabListForTemplate(fetchedData, template_id) {

  let lab_list = [];
  const filteredData = fetchedData.filter((fD) => {
    return fD.dataValues.tm_uuid === template_id;
  });

  if (filteredData && filteredData.length > 0) {
    filteredData.forEach((lD) => {
      lab_list = [...lab_list,
      {
        template_details_uuid: lD.tmd_uuid,
        lab_test_uuid: lD.ltm_uuid,
        lab_code: lD.ltm_code,
        lab_name: lD.ltm_name,
        lab_test_description: lD.ltm_description,
        lab_test_status: lD.ltm_status[0] === 1 ? true : false,
        lab_test_is_active: lD.ltm_is_active[0] === 1 ? true : false,
        lab_type_uuid: lD.ltm_lab_master_type_uuid
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
      { "tm_dept": { [Op.eq]: dept_id }, "tm_public": { [Op.eq]: 1 } }, { "tm_userid": { [Op.eq]: user_uuid } }
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
      { "tm_dept": { [Op.eq]: dept_id }, "tm_public": { [Op.eq]: 1 } }, { "tm_userid": { [Op.eq]: user_uuid } }
    ]
  };
}

function getVitalsDetailedQuery(temp_type_id, dept_id, user_uuid, temp_id) {
  return {
    attributes: { "exclude": ['id', 'createdAt', 'updatedAt'] },
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
      }
      ,
      include: [{
        model: vitalMasterTbl,
        require: false,
        where: {
          status: 1,
          is_active: 1
        },
      }],
    }]
  };
}

function getVitalsQuery(temp_type_id, dept_id, user_uuid) {
  return {
    attributes: { "exclude": ['id', 'createdAt', 'updatedAt'] },
    where: {
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
      }
      ,
      include: [{
        model: vitalMasterTbl,
        require: false,
        where: {
          status: 1,
          is_active: 1
        },
      }],
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
      return getLabListData(result);
    case "9":
      return getTemplateListData(result);
    default:
      let templateDetails = result;
      return { templateDetails };
  }
}

async function createtemp(userUUID, templateMasterReqData, templateMasterDetailsReqData) {

  templateMasterReqData.user_uuid = templateMasterReqData.created_by = templateMasterReqData.modified_by = userUUID;
  templateMasterReqData.template_type_uuid = templateMasterReqData.template_type_uuid;
  templateMasterReqData.active_from = templateMasterReqData.active_to = new Date();
  templateMasterReqData.created_date = templateMasterReqData.modified_date = new Date();
  templateMasterReqData.is_active = true;

  const templateMasterCreatedData = await tempmstrTbl.create(templateMasterReqData, { returning: true });
  templateMasterDetailsReqData.forEach((item, index) => {
    item.template_master_uuid = templateMasterCreatedData.dataValues.uuid;
    item.created_by = userUUID;
    item.modified_by = 0;
    item.created_date = item.modified_date = new Date();
  });
  const dtls_result = await tempmstrdetailsTbl.bulkCreate(templateMasterDetailsReqData, { returning: true });
  return { "templateMasterReqData": templateMasterCreatedData, "templateMasterDetailsReqData": dtls_result };
}

const nameExists = (temp_name, userUUID) => {

  if (temp_name !== undefined) {
    return new Promise((resolve, reject) => {
      let value = tempmstrTbl.findAll({
        attributes: ['name','is_active','status'],
        where: { name: temp_name, user_uuid: userUUID }
      }); if (value) {
        resolve(value);
        return value;
      }
      else { reject({ 'message': 'name does not existed' }); }
    });
  }
};

function getTemplateTypeUUID(temp_type_id, dept_id, user_uuid) {
  switch (temp_type_id) {
    case "1":
      return {
        table_name: vw_template,
        query: {
          where: getTemplatesQuery(user_uuid, dept_id, temp_type_id),
          attributes: { "exclude": ['id', 'createdAt', 'updatedAt'] }
        }
      };
    case "2":
      return {
        table_name: vw_lab,
        query: {
          where: {
            tm_user_uuid: user_uuid,
            tm_department_uuid: dept_id,
            tm_template_type_uuid: temp_type_id,
            ltm_lab_master_type_uuid: 1,
            tm_is_active: 1,
            tm_status: 1,
            tmd_status: 1,
            tmd_active: 1
          }
        }
      };
    case "3":
      return {
        table_name: vw_lab,
        query: {
          where: {
            tm_user_uuid: user_uuid,
            tm_department_uuid: dept_id,
            tm_template_type_uuid: temp_type_id,
            ltm_lab_master_type_uuid: 2,
            tm_is_active: 1,
            tm_status: 1,
            tmd_status: 1,
            tmd_active: 1
          }
        }
      };
    case "4":
      return {
        table_name: tempmstrTbl,
        query: getVitalsQuery(temp_type_id, dept_id, user_uuid),
      };
      case "9":
      return {
        table_name: vw_template,
        query: {
          where: getTemplatesQuery(user_uuid, dept_id, temp_type_id),
          attributes: { "exclude": ['id', 'createdAt', 'updatedAt'] }
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
          where: getTemplatesdetailsQuery(user_uuid, dept_id, temp_type_id, temp_id),
          attributes: { "exclude": ['id', 'createdAt', 'updatedAt'] }
        }
      };
    case "2":
      return {
        table_name: vw_lab,
        query: {
          where: {
            tm_uuid: temp_id,
            tm_user_uuid: user_uuid,
            tm_department_uuid: dept_id,
            tm_template_type_uuid: temp_type_id,
            ltm_lab_master_type_uuid: 1,
            tm_is_active: 1,
            tm_status: 1,
            tmd_status: 1,
            tmd_active: 1
          }
        }
      };
    case "3":
      return {
        table_name: vw_lab,
        query: {
          where: {
            tm_uuid: temp_id,
            tm_user_uuid: user_uuid,
            tm_department_uuid: dept_id,
            tm_template_type_uuid: temp_type_id,
            ltm_lab_master_type_uuid: 2,
            tm_is_active: 1,
            tm_status: 1,
            tmd_status: 1,
            tmd_active: 1
          }
        }
      };
    case "4":
      return {
        table_name: tempmstrTbl,
        query: getVitalsDetailedQuery(temp_type_id, dept_id, user_uuid, temp_id),
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
      return (fetchdata && fetchdata.templates_lab_list && fetchdata.templates_lab_list.length > 0) ? fetchdata.templates_lab_list[0] : {};
    case "3":
      fetchdata = getTempData(temp_type_id, list);
      return (fetchdata && fetchdata.templates_lab_list && fetchdata.templates_lab_list.length > 0) ? fetchdata.templates_lab_list[0] : {};
    case "4":
      fetchdata = getTempData(temp_type_id, list);
      return (fetchdata && fetchdata.templateDetails && fetchdata.templateDetails.length > 0) ? fetchdata.templateDetails[0] : {};
  }
}