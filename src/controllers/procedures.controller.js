const httpStatus = require("http-status");
const db = require("../config/sequelize");
const sequelizeDb = require("../config/sequelize");
// const sequelizeDb = require('../config/sequelize');
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const proceduresTbl = db.procedures;
const procedureNoteTbl = db.procedure_note_templates;
const procedure_schemeTbl = db.procedure_scheme;
const procedure_technique = db.procedure_technique
const procedure_version = db.procedure_version
const procedure_region = db.procedure_region
const procedure_type = db.procedure_type
const procedure_category = db.procedure_category
const procedure_sub_category = db.procedure_sub_category
const operation_type = db.operation_type
const anesthesia_type = db.anesthesia_type
const body_site = db.body_site

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
    const itemsPerPage = getsearch.paginationSize
      ? getsearch.paginationSize
      : 10;
    let sortField = "created_date";
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
      order: [[sortField, sortOrder]],
      where: { is_active: 1 ,status:1},
      include: [{
        model: procedureNoteTbl
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
      }],
    };

    if (getsearch.search && /\S/.test(getsearch.search)) {
      findQuery.where = {
        [Op.or]: [
          {
            code: {
              [Op.like]: "%" + getsearch.search + "%"
            }
          },
          {
            name: {
              [Op.like]: "%" + getsearch.search + "%"
            }
          }
        ]
      };
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

  const postprocedures = async (req, res, next) => {
    const postData = req.body;
    postData.created_by = req.headers.user_uuid;

    if (postData) {
      proceduresTbl
        .findAll({
          where: {
            [Op.or]: [
              {
                code: postData.code
              },
              {
                name: postData.name
              }
            ]
          }
        })
        .then(async result => {
          if (result.length != 0) {
            return res.send({
              statusCode: 400,
              status: "error",
              msg: "Record already Found. Please enter procedures Master"
            });
          } else {
            await proceduresTbl
              .create(postData, {
                returning: true
              })
              .then(data => {
                res.send({
                  statusCode: 200,
                  msg: "Inserted procedures Master details Successfully",
                  req: postData,
                  responseContents: data
                });
              })
              .catch(err => {
                res.send({
                  status: "failed",
                  msg: "failed to procedures Master details",
                  error: err
                });
              });
          }
        });
    } else {
      res.send({
        status: "failed",
        msg: "Please enter procedures Master details"
      });
    }
  };

  const deleteprocedures = async (req, res, next) => {
    const postData = req.body;

    await proceduresTbl
      .update(
        {
          is_active: 0
        },
        {
          where: {
            uuid: postData.Procedures_id
          }
        }
      )
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
    try {
      const page = postData.page ? postData.page : 1;
      const itemsPerPage = postData.limit ? postData.limit : 10;
      const offset = (page - 1) * itemsPerPage;
      await proceduresTbl
        .findOne({
          where: {
            uuid: postData.Procedures_id
          },
          include: [{
            model: procedureNoteTbl
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
          }],
          offset: offset,
          limit: itemsPerPage
        })
        .then(data => {
          return res.status(httpStatus.OK).json({
            statusCode: 200,
            req: "",
            responseContents: data
          });
        });
    } catch (err) {
      const errorMsg = err.errors ? err.errors[0].message : err.message;
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        status: "error",
        msg: errorMsg
      });
    }
  };

  const _getProceduresByFilters = async (req, res) => {
    const { user_uuid } = req.headers;

    const { searchKey, searchValue } = req.query;

    if (user_uuid && searchKey && searchValue) {
      try {
        const pQuery = proceduresAttributes.getSearchQueryFromSearchKey(
          searchKey,
          searchValue
        );
        const procedureSearchData = await proceduresTbl.findAll(pQuery);
        const responseMessage =
          procedureSearchData && procedureSearchData.length > 0
            ? emr_constants.PROCEDURE_FETCHED
            : emr_constants.NO_RECORD_FOUND;
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
          .send({ code: httpStatus.BAD_REQUEST, message: error });
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
