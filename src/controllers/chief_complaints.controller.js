// Package Import
const httpStatus = require("http-status");
const username = require("../config/config");
// Sequelizer Import
const sequelizeDb = require("../config/sequelize");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const chief_complaints_tbl = sequelizeDb.chief_complaints;

// Import EMR Constants
const emr_const = require("../config/constants");

// Import EMR Utilities
const emr_utilites = require("../services/utility.service");

function getChiefComplaintsFilterByQuery(searchBy, searchValue) {
  searchBy = searchBy.toLowerCase();
  switch (searchBy) {
    case "filterbythree":
      return {
        is_active: emr_const.IS_ACTIVE,
        status: emr_const.IS_ACTIVE,
        [Op.or]: [
          {
            name: {
              [Op.like]: `%${searchValue}%`
            }
          },
          {
            code: {
              [Op.like]: `%${searchValue}%`
            }
          }
        ]
      };

    case "chiefId":
    default:
      searchValue = +searchValue;
      return {
        is_active: emr_const.IS_ACTIVE,
        status: emr_const.IS_ACTIVE,
        uuid: searchValue
      };
  }
}

const getChiefComplaintsAttributes = [
  "uuid",
  "code",
  "name",
  "description",
  "chief_complaint_category_uuid",
  "referrence_link",
  "body_site",
  "created_date",
  "is_active",
  "created_by",
  "modified_by",
  "modified_date"
];

function getChiefComplaintrUpdateData(user_uuid, ChiefComplaintsReqData) {
  return {
    uuid: ChiefComplaintsReqData.ChiefComplaints_id,
    code: ChiefComplaintsReqData.code,
    user_uuid: user_uuid,
    name: ChiefComplaintsReqData.name,
    description: ChiefComplaintsReqData.description,
    chief_complaint_category_uuid:
      ChiefComplaintsReqData.chief_complaint_category_uuid,
    referrence_link: ChiefComplaintsReqData.referrence_link,
    body_site: ChiefComplaintsReqData.body_site,
    modified_by: user_uuid,
    modified_date: new Date(),
    created_by: user_uuid,
    created_date: new Date(),
    is_active: ChiefComplaintsReqData.is_active
  };
}

const ChiefComplaints = () => {
  const _getChiefComplaintsFilter = async (req, res) => {
    const { user_uuid } = req.headers;
    const { searchBy, searchValue } = req.query;

    if (user_uuid && searchBy && searchValue) {
      try {
        const chiefComplaintsData = await chief_complaints_tbl.findAll({
          where: getChiefComplaintsFilterByQuery(searchBy, searchValue),
          attributes: getChiefComplaintsAttributes
        });

        const responseCode = emr_utilites.getResponseCodeForSuccessRequest(
          chiefComplaintsData
        );
        const responseMessage = emr_utilites.getResponseMessageForSuccessRequest(
          responseCode,
          "cc"
        );

        return res.status(200).send({
          code: responseCode,
          message: responseMessage,
          responseContents:
            chiefComplaintsData && chiefComplaintsData.length > 0
              ? chiefComplaintsData
              : []
        });
      } catch (error) {
        console.log(error.message);
        return res
          .status(400)
          .send({ code: httpStatus.BAD_REQUEST, message: error.message });
      }
    } else {
      return res
        .status(400)
        .send({ code: httpStatus.BAD_REQUEST, message: "No Headers Found" });
    }
  };

  const _getChiefComplaintsSearch = async (req, res) => {
    const { user_uuid } = req.headers;
    const { searchValue } = req.body;
    const isValidSearchVal = searchValue && emr_utilites.isStringValid(searchValue);
    if (searchValue && isValidSearchVal && user_uuid) {
      try {
        const chiefComplaintsSearchData = await chief_complaints_tbl.findAll({
          where: emr_utilites.getFilterByThreeQueryForCodeAndName(searchValue),
          attributes: getChiefComplaintsAttributes
        });
        const responseCode = emr_utilites.getResponseCodeForSuccessRequest(
          chiefComplaintsSearchData
        );
        const responseMessage = emr_utilites.getResponseMessageForSuccessRequest(
          responseCode,
          "cc"
        );
        return res.status(200).send({
          code: responseCode,
          message: responseMessage,
          responseContents:
            chiefComplaintsSearchData && chiefComplaintsSearchData.length > 0
              ? chiefComplaintsSearchData
              : []
        });
      } catch (ex) {
        console.log('Exception Happened', ex);
        return res.status(400).send({ statusCode: httpStatus.BAD_REQUEST, message: ex.message });
      }
    } else {
      return res.status(400).send({
        code: httpStatus[400],
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}`
      });
    }
  };
  const _createChiefComplaints = async (req, res) => {
    const { user_uuid } = req.headers;
    const chiefComplaintsData = req.body;

    if (user_uuid && chiefComplaintsData) {
      chief_complaints_tbl
        .findAll({
          where: {
            [Op.or]: [
              {
                code: chiefComplaintsData.code
              },
              {
                name: chiefComplaintsData.name
              }
            ]
          }
        })
        .then(async result => {
          if (result.length != 0) {
            return res.send({
              statusCode: 400,
              status: "error",
              msg: "Record already Found. Please enter New CHIEF COMPLAINT "
            });
          }
        });

      try {
        chiefComplaintsData.code = chiefComplaintsData.code;
        chiefComplaintsData.name = chiefComplaintsData.name;
        chiefComplaintsData.description =
          chiefComplaintsData & chiefComplaintsData.description
            ? chiefComplaintsData.description
            : chiefComplaintsData.name;
        chiefComplaintsData.is_active = chiefComplaintsData.status =
          emr_const.IS_ACTIVE;
        chiefComplaintsData.created_by = chiefComplaintsData.modified_by = user_uuid;
        chiefComplaintsData.created_date = chiefComplaintsData.modified_date = new Date();
        chiefComplaintsData.revision = 1;
        const chiefComplaintsCreatedData = await chief_complaints_tbl.create(
          chiefComplaintsData,
          { returning: true }
        );

        if (chiefComplaintsCreatedData) {
          chiefComplaintsData.uuid = chiefComplaintsCreatedData.uuid;
          return res.status(200).send({
            statusCode: 200,
            message: "Inserted Chief Complaints Successfully",
            responseContents: chiefComplaintsData
          });
        }
      } catch (ex) {
        console.log(ex.message);
        return res.status(400).send({ statusCode: 400, message: ex.message });
      }
    } else {
      return res
        .status(400)
        .send({ statusCode: 400, message: "No Headers Found" });
    }
  };
  const _getChiefComplaintsById = async (req, res) => {
    const { user_uuid } = req.headers;
    const { ChiefComplaints_id } = req.body;

    if (user_uuid && ChiefComplaints_id) {
      try {
        const chiefData = await chief_complaints_tbl.findOne({
          attributes: getChiefComplaintsAttributes,
          where: { uuid: ChiefComplaints_id }
        });

        return res.status(httpStatus.OK).json({
          message: "success",
          statusCode: 200,
          responseContents: chiefData
        });
      } catch (ex) {
        console.log(`Exception Happened ${ex}`);
        return res
          .status(400)
          .send({ code: httpStatus[400], message: ex.message });
      }
    } else {
      return res.status(400).send({
        code: httpStatus[400],
        message: "No Request headers or Query Param Found"
      });
    }
  };

  const _updateChiefComplaintsById = async (req, res) => {
    const { user_uuid } = req.headers;
    const ChiefComplaintsReqData = req.body;

    const ChiefComplaintsReqUpdateData = getChiefComplaintrUpdateData(
      user_uuid,
      ChiefComplaintsReqData
    );

    if (user_uuid && ChiefComplaintsReqData) {
      try {
        const updatedcheifcomplaintsData = await Promise.all([
          chief_complaints_tbl.update(ChiefComplaintsReqUpdateData, {
            where: { uuid: ChiefComplaintsReqData.ChiefComplaints_id }
          })
        ]);

        if (updatedcheifcomplaintsData) {
          return res.status(200).send({
            statusCode: 200,
            message: "Updated Successfully",
            requestContent: ChiefComplaintsReqData
          });
        }
      } catch (ex) {
        console.log(`Exception Happened ${ex}`);
        return res.status(400).send({ statusCode: 400, message: ex.message });
      }
    } else {
      return res
        .status(400)
        .send({ statusCode: 400, message: "No Request headers or Body Found" });
    }
  };

  const _deleteChiefComplaints = async (req, res) => {
    // plucking data req body
    const { ChiefComplaints_id } = req.body;
    const { user_uuid } = req.headers;

    if (ChiefComplaints_id) {
      const updatedcheifcomplaintsData = {
        status: 0,
        modified_by: user_uuid,
        modified_date: new Date()
      };
      try {
        const updatedcheifcomplaintsAsync = await Promise.all([
          chief_complaints_tbl.update(updatedcheifcomplaintsData, {
            where: { uuid: ChiefComplaints_id }
          })
        ]);

        if (updatedcheifcomplaintsAsync) {
          return res
            .status(200)
            .send({ statusCode: 200, message: "Deleted Successfully" });
        }
      } catch (ex) {
        return res.status(400).send({ statusCode: 400, message: ex.message });
      }
    } else {
      return res
        .status(400)
        .send({ statusCode: 400, message: "No Request Body Found" });
    }
  };
  // const _getChiefComplaints = async (req, res) => {

  //     const { user_uuid } = req.headers;
  //     let getsearch = req.body;

  //     let pageNo = 0;
  //     const itemsPerPage = getsearch.paginationSize ? getsearch.paginationSize : 10;
  //     let sortField = 'created_date';
  //     let sortOrder = 'DESC';

  //     if (getsearch.pageNo) {
  //         let temp = parseInt(getsearch.pageNo);

  //         if (temp && (temp != NaN)) {
  //             pageNo = temp;
  //         }
  //     }
  //     const offset = pageNo * itemsPerPage;

  //     if (getsearch.sortField) {

  //         sortField = getsearch.sortField;
  //     }

  //     if (getsearch.sortOrder && ((getsearch.sortOrder == 'ASC') || (getsearch.sortOrder == 'DESC'))) {

  //         sortOrder = getsearch.sortOrder;
  //     }
  //     let findQuery = {
  //         offset: offset,
  //         limit: itemsPerPage,
  //         order: [
  //             [sortField, sortOrder],
  //         ],

  //     };

  //     if (getsearch.search && /\S/.test(getsearch.search)) {

  //         findQuery.where = {
  //             [Op.or]: [{
  //                     name: {
  //                         [Op.like]: '%' + getsearch.search + '%',
  //                     },

  //                 }, {
  //                     code: {
  //                         [Op.like]: '%' + getsearch.search + '%',
  //                     },
  //                 }

  //             ]
  //         };
  //     }
  //     // if (user_uuid ) {
  //     //     let favouriteList = [];

  //         try {

  //             const chiefdata = await chief_complaints_tbl.findAndCountAll({
  //                 attributes: getChiefComplaintsAttributes,
  //                findQuery:findQuery

  //             });

  //             // favouriteList = getFavouritesInList(tickSheetData);
  //             return res.status(httpStatus.OK).json({
  //                 message: "success",
  //                 statusCode: 200,
  //                 responseContents: (chiefdata.rows ? chiefdata.rows : []),
  //                 totalRecords: (chiefdata.count ? chiefdata.count : 0),

  //             });

  //         } catch (ex) {

  //             console.log(`Exception Happened ${ex}`);
  //             return res.status(400).send({ code: httpStatus[400], message: ex.message });

  //         }

  //     // } else {
  //     //     return res.status(400).send({ code: httpStatus[400], message: "No Request headers or Query Param Found" });
  //     // }

  // };

  const _getChiefComplaints = async (req, res, next) => {
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
      where: {
        is_active: 1,
        status: 1
      }
    };

    if (getsearch.search && /\S/.test(getsearch.search)) {
      findQuery.where = {
        is_active: 1,
        status: 1,
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

    // let bodyParse = await requests.getResults("users/getusersById", req, getsearch.Id);
    // console.log(bodyParse)
    try {
      await chief_complaints_tbl
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

  return {
    getChiefComplaintsFilter: _getChiefComplaintsFilter,
    getChiefComplaintsSearch: _getChiefComplaintsSearch,
    createChiefComplaints: _createChiefComplaints,
    getChiefComplaints: _getChiefComplaints,
    getChiefComplaintsById: _getChiefComplaintsById,
    updateChiefComplaintsById: _updateChiefComplaintsById,
    deleteChiefComplaints: _deleteChiefComplaints
  };
};

module.exports = ChiefComplaints();
