const httpStatus = require("http-status");
const db = require("../config/sequelize");

const Sequelize = require("sequelize");
var Op = Sequelize.Op;

// Constants Import
const emr_constants = require("../config/constants");

const BodySide = db.body_side;

const BodySideController = () => {
  /**
   * Returns jwt token if valid username and password is provided
   * @param req
   * @param res
   * @param next
   * @returns {*}
   */

  const getBodySide = async (req, res, next) => {
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
      order: [[sortField, sortOrder]]
    };

    if (getsearch.search && /\S/.test(getsearch.search)) {
      findQuery.where = {
        [Op.or]: [
          {
            name: {
              [Op.like]: "%" + getsearch.search + "%"
            }
          },
          {
            code: {
              [Op.like]: "%" + getsearch.search + "%"
            }
          }
        ]
      };
    }

    try {
      await BodySide.findAndCountAll(findQuery)

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
  const getBodySidefilter = async (req, res, next) => {
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
      attributes: ["uuid", "name"]
    };

    if (getsearch.search && /\S/.test(getsearch.search)) {
      findQuery.where = {
        [Op.or]: [
          {
            name: {
              [Op.like]: "%" + getsearch.search + "%"
            }
          },
          {
            code: {
              [Op.like]: "%" + getsearch.search + "%"
            }
          }
        ],
        attr
      };
    }

    try {
      await BodySide.findAndCountAll(findQuery)

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
  const postBodySide = async (req, res, next) => {
    const postData = req.body;
    postData.created_by = req.headers.user_uuid;

    if (postData) {
      BodySide.findAll({
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
      }).then(async result => {
        if (result.length != 0) {
          return res.send({
            status: "error",
            msg: "Record already Found. Please enter New DIAGNOSIS CATEGORY"
          });
        } else {
          await BodySide.create(postData, {
            returning: true
          })
            .then(data => {
              res.send({
                statusCode: 200,
                msg: "Inserted CATEGORY details Successfully",
                req: postData,
                responseContents: data
              });
            })
            .catch(err => {
              res.send({
                status: "failed",
                msg: "failed to insert  details",
                error: err
              });
            });
        }
      });
    } else {
      res.send({
        status: "failed",
        msg: "Please enter  diagnosis category details"
      });
    }
  };
  const getBodySideById = async (req, res, next) => {
    const postData = req.body;
    try {
      await BodySide.findOne({
        where: {
          uuid: postData.Id
        }
      }).then(data => {
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

  const _getBodySideList = async (req, res) => {
    const { user_uuid } = req.headers;

    if (user_uuid) {
      try {
        const bodySideListData = await BodySide.findAll({
          where: {
            is_active: emr_constants.IS_ACTIVE,
            status: emr_constants.IS_ACTIVE
          }
        });

        const responseMessage =
          bodySideListData && bodySideListData.length > 0
            ? emr_constants.EMR_FETCHED_SUCCESSFULLY
            : emr_constants.NO_RECORD_FOUND;
        return res.status(200).send({
          code: httpStatus.OK,
          message: responseMessage,
          responseContents: bodySideListData.map(bS => {
            return {
              code: bS.code,
              name: bS.name,
              uuid: bS.uuid
            };
          }),
          responseLength: bodySideListData.length
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
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}`
      });
    }
  };

  // --------------------------------------------return----------------------------------
  return {
    postBodySide,
    getBodySide,
    getBodySideById,

    getBodySidefilter,
    getBodySideList: _getBodySideList
  };
};

module.exports = BodySideController();
