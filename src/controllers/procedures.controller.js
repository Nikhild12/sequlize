const httpStatus = require("http-status");
const db = require("../config/sequelize");
const sequelizeDb = require("../config/sequelize");
// const sequelizeDb = require('../config/sequelize');
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const rp = require("request-promise");
var config = require("../config/config");

const proceduresTbl = db.procedures;
const procedureNoteTbl = db.procedure_note_templates;
const procedure_schemeTbl = db.procedure_scheme;
const procedure_technique = db.procedure_technique;
const procedure_version = db.procedure_version;
const procedure_region = db.procedure_region;
const procedure_type = db.procedure_type;
const procedure_category = db.procedure_category;
const procedure_sub_category = db.procedure_sub_category;
const operation_type = db.operation_type;
const anesthesia_type = db.anesthesia_type;
const body_site = db.body_site;
const noteTemplatetypeTbl = db.note_template_type;
const npotetemplateTbl = db.note_templates;
const equipment = db.equipment;
const speciality_sketches = db.speciality_sketches;
const categoriesTbl = db.categories;
// Constants Import
const emr_constants = require("../config/constants");

// Procedures Attributes
const proceduresAttributes = require("../attributes/procedure");

const proceduresController = () => {
  /**
   * Returns jwt token if valid username and password is provided
   * @param req
   * @param res
   * @param next
   * @returns {*}
   */

  const getprocedures = async (req, res, next) => {
    let getsearch = req.body;

    let pageNo = 0;
    const itemsPerPage = getsearch.paginationSize ?
      getsearch.paginationSize :
      10;
    let sortField = "modified_date";
    let sortOrder = "DESC";

    if (getsearch.pageNo) {
      let temp = parseInt(getsearch.pageNo);

      if (temp && temp != NaN) {
        pageNo = temp;
      }
    }

    const offset = pageNo * itemsPerPage;

    if (getsearch.sortField) {
      sortField = getsearch.sortField;
    }

    if (
      getsearch.sortOrder &&
      (getsearch.sortOrder == "ASC" || getsearch.sortOrder == "DESC")
    ) {
      sortOrder = getsearch.sortOrder;
    }
    let findQuery = {
      offset: offset,
      limit: itemsPerPage,
      order: [
        [sortField, sortOrder]
      ],
      where: {
        // is_active: 1,
        status: 1
      },
      include: [{
          model: procedureNoteTbl,
          // include: [
          //   {
          //     model: noteTemplatetypeTbl,
          //     attributes: ['uuid', 'name'],
          //   },
          //   {
          //     model: npotetemplateTbl,
          //     attributes: ['uuid', 'name']
          //   }]
        },
        {
          model: procedure_schemeTbl,
          attributes: ['uuid', 'name']
        },
        {
          model: procedure_technique,
          attributes: ['uuid', 'name']
        },
        {
          model: procedure_version,
          attributes: ['uuid', 'name']
        },
        {
          model: procedure_region,
          attributes: ['uuid', 'name']
        },
        {
          model: procedure_type,
          attributes: ['uuid', 'name']
        },
        {
          model: procedure_category,
          attributes: ['uuid', 'name']
        }, {
          model: procedure_sub_category,
          attributes: ['uuid', 'name']
        },
        {
          model: operation_type,
          attributes: ['uuid', 'name']
        },
        {
          model: anesthesia_type,
          attributes: ['uuid', 'name']
        },
        {
          model: body_site,
          attributes: ['uuid', 'name']
        }
      ],
    };

    if (getsearch.search && /\S/.test(getsearch.search)) {
      findQuery.where[Op.or] = [
        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('procedures.name')), 'LIKE', '%' + getsearch.search.toLowerCase() + '%'),
        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('procedures.code')), 'LIKE', '%' + getsearch.search.toLowerCase() + '%'),

      ];
    }
    if (getsearch.searchKeyWord && /\S/.test(getsearch.searchKeyWord)) {
      if (findQuery.where[Op.or]) {
        findQuery.where[Op.and] = [{
          [Op.or]: [
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('procedures.name')), 'LIKE', '%' + getsearch.searchKeyWord + '%'),
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('procedures.code')), 'LIKE', '%' + getsearch.searchKeyWord + '%'),
          ]
        }];
      } else {
        findQuery.where[Op.or] = [
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('procedures.name')), 'LIKE', '%' + getsearch.searchKeyWord + '%'),
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('procedures.code')), 'LIKE', '%' + getsearch.searchKeyWord + '%'),
        ];
      }
    }
    if (getsearch.procedure_scheme_uuid && /\S/.test(getsearch.procedure_scheme_uuid)) {
      if (findQuery.where[Op.or]) {
        findQuery.where[Op.and] = [{
          [Op.or]: [
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('procedures.procedure_scheme_uuid')), getsearch.procedure_scheme_uuid)
          ]
        }];
      } else {
        findQuery.where[Op.or] = [
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('procedures.procedure_scheme_uuid')), getsearch.procedure_scheme_uuid)
        ];
      }
    }
    if (getsearch.procedure_type_uuid && /\S/.test(getsearch.procedure_type_uuid)) {
      if (findQuery.where[Op.or]) {
        findQuery.where[Op.and] = [{
          [Op.or]: [
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('procedures.procedure_type_uuid')), getsearch.procedure_type_uuid)
          ]
        }];
      } else {
        findQuery.where[Op.or] = [
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('procedures.procedure_type_uuid')), getsearch.procedure_type_uuid)
        ];
      }
    }
    if (getsearch.hasOwnProperty('status') && /\S/.test(getsearch.status)) {
      findQuery.where['is_active'] = getsearch.status;
      //findQuery.where['status'] = getsearch.status;
      findQuery.where['status'] = emr_constants.IS_ACTIVE;
    }

    try {
      await proceduresTbl
        .findAndCountAll(findQuery)

        .then(findData => {
          return res.status(httpStatus.OK).json({
            message: "success",
            statusCode: 200,
            responseContents: findData.rows ? findData.rows : [],
            totalRecords: findData.count ? findData.count : 0
          });
        })
        .catch(err => {
          return res.status(httpStatus.OK).json({
            message: "error",
            err: err,
            req: ""
          });
        });
    } catch (err) {
      const errorMsg = err.errors ? err.errors[0].message : err.message;
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        message: "error"
      });
    }
  };


  const postprocedures = async (req, res) => {

    if (Object.keys(req.body).length != 0) {

      const {
        user_uuid
      } = req.headers;
      const postData = req.body;
      if (user_uuid > 0 && postData.code && postData.name) {

        try {
          // const duplicateProcedureRecord = await findDuplicateProceduresByCodeAndName(
          //   postData
          // );
          // if (duplicateProcedureRecord && duplicateProcedureRecord.length > 0) {
          //   return res.status(400).send({
          //     code: emr_constants.DUPLICATE_ENTRIE,
          //     message: getDuplicateMsg(duplicateProcedureRecord)
          //   });
          // }

          const code_exits = await codeexists(req.body.code);
          const name_exits = await nameexists(req.body.name);
          const tblname_exits = await codenameexists(req.body.code, req.body.name);

          if (tblname_exits && tblname_exits.length > 0) {
            return res
              .status(400)
              .send({
                statusCode: 402,
                message: "code and name already exists"
              });
          } else if (code_exits && code_exits.length > 0) {
            return res
              .status(401)
              .send({
                statusCode: 400,
                message: "code already exists"
              });

          } else if (name_exits && name_exits.length > 0) {
            return res
              .status(400)
              .send({
                statusCode: 400,
                message: "name already exists"
              });

          } else {

            // postData.status = postData.is_active;
            postData.status = emr_constants.IS_ACTIVE;
            postData.created_by = user_uuid;
            postData.modified_by = user_uuid;

            postData.created_date = new Date();
            postData.modified_date = new Date();
            postData.revision = 1;

            const proceduresCreatedData = await proceduresTbl.create(
              postData, {
                returning: true
              }
            );

            if (proceduresCreatedData) {
              postData.uuid = proceduresCreatedData.uuid;
              return res.status(200).send({
                statusCode: 200,
                message: "Inserted Procedures Master Successfully",
                responseContents: postData
              });
            }
          }
        } catch (ex) {
          console.log(ex.message);
          return res.status(400).send({
            statusCode: 400,
            message: ex.message
          });
        }
      } else {
        return res
          .status(400)
          .send({
            code: httpStatus[400],
            message: "No Request Body Found"
          });
      }
    } else {
      return res
        .status(400)
        .send({
          code: httpStatus[400],
          message: "No Request Body Found"
        });
    }
  };


  const deleteprocedures = async (req, res, next) => {
    const postData = req.body;

    await proceduresTbl
      .update({
        is_active: 0,
        status: 0
      }, {
        where: {
          uuid: postData.Procedures_id
        }
      })
      .then(data => {
        res.send({
          statusCode: 200,
          msg: "Deleted Successfully",
          req: postData,
          responseContents: data
        });
      })
      .catch(err => {
        res.send({
          status: "failed",
          msg: "failed to delete data",
          error: err
        });
      });
  };

  const updateproceduresId = async (req, res, next) => {
    const postData = req.body;
    postData.modified_by = req.headers.user_uuid;
    postData.modified_date = new Date();
    await proceduresTbl
      .update(postData, {
        where: {
          uuid: postData.Procedures_id
        }
      })
      .then(data => {
        res.send({
          statusCode: 200,
          msg: "Updated Successfully",
          req: postData,
          responseContents: data
        });
      });
  };

  const getproceduresById = async (req, res, next) => {
    const postData = req.body;
    postData.status = postData.is_active;
    postData.modified_by = req.headers;
    postData.modified_date = new Date();
    try {
      const page = postData.page ? postData.page : 1;
      const itemsPerPage = postData.limit ? postData.limit : 10;
      const offset = (page - 1) * itemsPerPage;
      const data = await proceduresTbl
        .findOne({
          where: {
            uuid: postData.Procedures_id
          },

          include: [{
              model: procedureNoteTbl,
              include: [{
                  model: noteTemplatetypeTbl,
                  attributes: ['uuid', 'name'],
                },
                {
                  model: npotetemplateTbl,
                  attributes: ['uuid', 'name']
                },
                {
                  model: categoriesTbl,
                  attributes: ['uuid', 'name'],
                }
              ]
            },
            {
              model: procedure_schemeTbl,
              attributes: ['uuid', 'name']
            },
            {
              model: procedure_technique,
              attributes: ['uuid', 'name']
            },
            {
              model: procedure_version,
              attributes: ['uuid', 'name']
            },
            {
              model: procedure_region,
              attributes: ['uuid', 'name']
            },
            {
              model: procedure_type,
              attributes: ['uuid', 'name']
            },
            {
              model: procedure_category,
              attributes: ['uuid', 'name']
            }, {
              model: procedure_sub_category,
              attributes: ['uuid', 'name']
            },
            {
              model: operation_type,
              attributes: ['uuid', 'name']
            },
            {
              model: anesthesia_type,
              attributes: ['uuid', 'name']
            },
            {
              model: body_site,
              attributes: ['uuid', 'name']
            },
            {
              model: equipment,
              attributes: ['uuid', 'name']
            },
            {
              model: speciality_sketches,
              attributes: ['uuid', 'name']
            }
          ],
          offset: offset,
          limit: itemsPerPage
        });
      if (!data) {
        return res.status(httpStatus.OK).json({
          statusCode: 200,
          message: 'No Record Found with this procedures Id'
        });
      } else {
        const getcuDetails = await getuserDetails(req.headers.user_uuid, data.created_by, req.headers.authorization);
        const getmuDetails = await getuserDetails(req.headers.user_uuid, data.modified_by, req.headers.authorization);
        const getdata = getfulldata(data, getcuDetails, getmuDetails);
        return res
          .status(httpStatus.OK)
          .json({
            statusCode: 200,
            req: '',
            responseContents: getdata
          });
      }
    } catch (err) {
      const errorMsg = err.errors ? err.errors[0].message : err.message;
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        status: "error",
        msg: errorMsg
      });
    }
  };

  const _getProceduresByFilters = async (req, res) => {
    const {
      user_uuid
    } = req.headers;

    const {
      searchKey,
      searchValue
    } = req.query;

    if (user_uuid && searchKey && searchValue) {
      try {
        const pQuery = proceduresAttributes.getSearchQueryFromSearchKey(
          searchKey,
          searchValue
        );
        const procedureSearchData = await proceduresTbl.findAll(pQuery);
        const responseMessage =
          procedureSearchData && procedureSearchData.length > 0 ?
          emr_constants.PROCEDURE_FETCHED :
          emr_constants.NO_RECORD_FOUND;
        return res.status(200).send({
          code: httpStatus.OK,
          message: responseMessage,
          responseContents: procedureSearchData.map(bS => {
            return {
              code: bS.code,
              name: bS.name,
              uuid: bS.uuid
            };
          }),
          responseLength: procedureSearchData.length
        });
      } catch (error) {
        console.log("Exception happened", error);
        return res
          .status(400)
          .send({
            code: httpStatus.BAD_REQUEST,
            message: error
          });
      }
    } else {
      return res.status(400).send({
        code: httpStatus[400],
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`
      });
    }
  };

  // --------------------------------------------return----------------------------------
  return {
    postprocedures,
    getprocedures,
    updateproceduresId,
    deleteprocedures,
    getproceduresById,
    getProceduresByFilters: _getProceduresByFilters
  };
};

module.exports = proceduresController();

async function getuserDetails(user_uuid, docid, authorization) {
  let options = {
    uri: config.wso2AppUrl + 'users/getusersById',
    //uri: 'https://qahmisgateway.oasyshealth.co/DEVAppmaster/v1/api/users/getusersById',
    //uri: "https://qahmisgateway.oasyshealth.co/DEVAppmaster/v1/api/userProfile/GetAllDoctors",
    method: "POST",
    headers: {
      Authorization: authorization,
      user_uuid: user_uuid
    },
    body: {
      "Id": docid
    },
    //body: {},
    json: true
  };
  const user_details = await rp(options);
  return user_details;
}

function getfulldata(data, getcuDetails, getmuDetails) {
  let newdata = {
    "uuid": data.uuid,
    "procedure_scheme_uuid": data.procedure_scheme_uuid,
    "code": data.code,
    "name": data.name,
    "procedure_technique_uuid": data.procedure_technique_uuid,
    "procedure_version_uuid": data.procedure_version_uuid,
    "procedure_region_uuid": data.procedure_region_uuid,
    "procedure_type_uuid": data.procedure_type_uuid,
    "procedure_category_uuid": data.procedure_category_uuid,
    "procedure_sub_category_uuid": data.procedure_sub_category_uuid,
    "operation_type_uuid": data.operation_type_uuid,
    "anaesthesia_type_uuid": data.anaesthesia_type_uuid,
    "speciality_uuid": data.speciality_uuid,
    "equipment_uuid": data.equipment_uuid,
    "body_site_uuid": data.body_site_uuid,
    "duration": data.duration,
    "description": data.description,
    "is_active": data.is_active,
    "status": data.status,
    "revision": data.revision,
    "created_by_id": data.created_by,
    "created_by": getcuDetails.responseContents ?
      getcuDetails.responseContents.title.name + " " + getcuDetails.responseContents.first_name :
      null,
    "modified_by_id": data.modified_by,
    "modified_by": getmuDetails.responseContents ?
      getmuDetails.responseContents.title.name + " " + getmuDetails.responseContents.first_name :
      null,
    "created_date": data.created_date,
    "modified_date": data.modified_date,
    "procedure_note_templates": data.procedure_note_templates,
    "procedure_technique": data.procedure_technique,
    "procedure_version": data.procedure_version,
    "procedure_region": data.procedure_region,
    "procedure_type": data.procedure_type,
    "procedure_category": data.procedure_category,
    "procedure_sub_category": data.procedure_sub_category,
    "operation_type": data.operation_type,
    "anesthesia_type": data.anesthesia_type,
    "body_site": data.body_site,
    "equipment": data.equipment,
    "speciality_sketch": data.speciality_sketch,
  };
  return newdata;
}

const codeexists = (code, userUUID) => {
  if (code !== undefined) {
    return new Promise((resolve, reject) => {
      let value = proceduresTbl.findAll({
        //order: [['created_date', 'DESC']],
        attributes: ["code"],
        where: {
          code: code
        }
      });
      if (value) {
        resolve(value);
        return value;
      } else {
        reject({
          message: "code does not existed"
        });
      }
    });
  }
};

const nameexists = (name) => {
  if (name !== undefined) {
    return new Promise((resolve, reject) => {
      let value = proceduresTbl.findAll({
        //order: [['created_date', 'DESC']],
        attributes: ["name"],
        where: {
          name: name
        }
      });
      if (value) {
        resolve(value);
        return value;
      } else {
        reject({
          message: "code does not existed"
        });
      }
    });
  }
};

const codenameexists = (code, name) => {
  if (code !== undefined && name !== undefined) {
    return new Promise((resolve, reject) => {
      let value = proceduresTbl.findAll({
        //order: [['created_date', 'DESC']],
        attributes: ["code", "name"],
        where: {
          code: code,
          name: name
        }
      });
      if (value) {
        resolve(value);
        return value;
      } else {
        reject({
          message: "code does not existed"
        });
      }
    });
  }
};
async function findDuplicateProceduresByCodeAndName({
  code,
  name
}) {
  // checking for Duplicate 
  // before creating procedures 
  return await proceduresTbl.findAll({
    attributes: ['code', 'name', 'is_active'],
    where: {
      [Op.or]: [{
          code: code
        },
        {
          name: name
        }
      ]
    }
  });
}

function getDuplicateMsg(record) {
  return record[0].is_active ? emr_constants.DUPLICATE_ACTIVE_MSG : emr_constants.DUPLICATE_IN_ACTIVE_MSG;
}