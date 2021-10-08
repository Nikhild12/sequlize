// Package Import
const httpStatus = require("http-status");
const username = require("../config/config");
// Sequelizer Import
const sequelizeDb = require("../config/sequelize");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const emr_constants = require("../config/constants");

const chief_complaints_tbl = sequelizeDb.chief_complaints;
const chief_complaint_sections_tbl = sequelizeDb.chief_complaint_sections;
const chief_complaints_section_values_tbl = sequelizeDb.chief_complaint_section_values;
// const chief_complaint_section_concept_tbl = sequelizeDb.chief_complaint_section_concepts;
// const chief_complaint_section_concept_value_tbl = sequelizeDb.chief_complaint_section_concept_values;
const value_type_tbl = sequelizeDb.value_types;

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
  "modified_date",
  "comments"
];

function getChiefComplaintrUpdateData(user_uuid, ChiefComplaintsReqData) {
  return {
    uuid: ChiefComplaintsReqData.ChiefComplaints_id,
    code: ChiefComplaintsReqData.code,
    user_uuid: user_uuid,
    name: ChiefComplaintsReqData.name,
    description: ChiefComplaintsReqData.description,
    comments: ChiefComplaintsReqData.comments,
    chief_complaint_category_uuid:
      ChiefComplaintsReqData.chief_complaint_category_uuid,
    referrence_link: ChiefComplaintsReqData.referrence_link,
    body_site: ChiefComplaintsReqData.body_site,
    modified_by: user_uuid,
    modified_date: new Date(),
    is_active: ChiefComplaintsReqData.is_active,
    status: ChiefComplaintsReqData.status
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
        message: `${emr_const.NO} ${emr_const.NO_USER_ID} ${emr_const.OR} ${emr_const.NO_REQUEST_BODY} ${emr_const.FOUND}`
      });
    }
  };

  const _createChiefComplaints = async (req, res) => {

    if (Object.keys(req.body).length != 0) {

      const { user_uuid } = req.headers;
      const chiefComplaintsData = req.body;

      if (user_uuid > 0 && chiefComplaintsData) {

        try {

          const code_exits = await codeexists(req.body.code);
          const name_exits = await nameexists(req.body.name);
          const tblname_exits = await codenameexists(req.body.code, req.body.name);

          if (tblname_exits && tblname_exits.length > 0) {
            return res
              .status(400)
              .send({ code: httpStatus[400], message: "code and name already exists" });
          }
          else if (code_exits && code_exits.length > 0) {
            return res
              .status(400)
              .send({ code: httpStatus[400], message: "code already exists" });

          } else if (name_exits && name_exits.length > 0) {
            return res
              .status(400)
              .send({ code: httpStatus[400], message: "name already exists" });

          } else {

            chiefComplaintsData.status = 1;
            chiefComplaintsData.is_active = chiefComplaintsData.is_active;
            chiefComplaintsData.created_by = user_uuid;
            chiefComplaintsData.modified_by = user_uuid;

            chiefComplaintsData.created_date = new Date();
            chiefComplaintsData.modified_date = new Date();
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
          }
        } catch (ex) {
          console.log(ex.message);
          return res.status(400).send({ statusCode: 400, message: ex.message });
        }
      } else {
        return res
          .status(400)
          .send({ code: httpStatus[400], message: "No Request Body Found" });
      }
    } else {
      return res
        .status(400)
        .send({ code: httpStatus[400], message: "No Request Body Found" });
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
        is_active: 0,
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
  const _getChiefComplaints = async (req, res, next) => {
    let getsearch = req.body;
    let pageNo = 0;
    const itemsPerPage = getsearch.paginationSize ? getsearch.paginationSize : 10;
    let sortField = 'modified_date';
    let sortOrder = 'ASC';
    if (getsearch.pageNo) {
      let temp = parseInt(getsearch.pageNo);


      if (temp && (temp != NaN)) {
        pageNo = temp;
      }
    }
    const offset = pageNo * itemsPerPage;


    if (getsearch.sortField) {

      sortField = getsearch.sortField;
    }

    if (getsearch.sortOrder && ((getsearch.sortOrder == 'ASC') || (getsearch.sortOrder == 'DESC'))) {

      sortOrder = getsearch.sortOrder;
    }
    // Object.keys(req.body).forEach((key) => (req.body[key] == null || req.body[key] == "") && delete req.body[key]);

    let postingData = {
      offset: offset,
      limit: itemsPerPage,
      where: { is_active: 1, status: 1, },
      order: [[sortField, sortOrder]]
    };

    if (getsearch.search && /\S/.test(getsearch.search)) {
      postingData.where = Object.assign(postingData.where, {
        [Op.and]: [{
          [Op.or]: [{
            code: {
              [Op.like]: '%' + getsearch.search.toLowerCase() + '%',
            }
          }, {
            name: {
              [Op.like]: '%' + getsearch.search.toLowerCase() + '%',
            }
          },
          {
            description: {
              [Op.like]: '%' + getsearch.search.toLowerCase() + '%',
            }
          }]
        }]
      });
    }
    if (getsearch.searchKeyWord && /\S/.test(getsearch.searchKeyWord)) {
      postingData.where = Object.assign(postingData.where, {
        [Op.and]: [{
          [Op.or]: [{
            code: {
              [Op.like]: '%' + getsearch.searchKeyWord.toLowerCase() + '%',
            }
          }, {
            name: {
              [Op.like]: '%' + getsearch.searchKeyWord.toLowerCase() + '%',
            }
          }]
        }]
      });
    }
    getsearch.status = 1;
    postingData.where.is_active = getsearch.status;

    try {
      let data = await chief_complaints_tbl.findAndCountAll(postingData);
      const code = data.rows.length === 0 ? 204 : 200;
      const message = data.rows.length === 0 ? emr_constants.NO_RECORD_FOUND : emr_constants.DRUG_FREQUENCY;
      return res
        .status(httpStatus.OK)
        .json({
          message, code, statusCode: 200, responseContents: data.rows, totalRecords: data.count,
        });

    } catch (err) {
      const errorMsg = err.errors ? err.errors[0].message : err.message;
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({
          statusCode: 500,
          msg: errorMsg
        });
    }
  };

  // const _getChiefComplaints = async (req, res, next) => {
  //   let getsearch = req.body;
  //   const { search, searchKeyWord, status = 1, pageNo = 0, paginationSize, sortField = 'modified_date', sortOrder = 'ASC' } = getsearch;
  //   const itemsPerPage = paginationSize ? paginationSize : 10;

  //   Object.keys(req.body).forEach((key) => (req.body[key] == null || req.body[key] == "") && delete req.body[key]);

  //   let postingData = {
  //     offset: pageNo * itemsPerPage,
  //     where: { is_active: 1, status: 1, },
  //     limit: paginationSize,
  //     order: [[sortField, sortOrder]],

  //   };

  //   if (search && /\S/.test(search)) {
  //     postingData.where = Object.assign(postingData.where, {
  //       [Op.and]: [{
  //         [Op.or]: [{
  //           code: {
  //             [Op.like]: '%' + search.toLowerCase() + '%',
  //           }
  //         }, {
  //           name: {
  //             [Op.like]: '%' + search.toLowerCase() + '%',
  //           }
  //         },
  //         {
  //           description: {
  //             [Op.like]: '%' + search.toLowerCase() + '%',
  //           }
  //         }]
  //       }]
  //     });
  //   }
  //   if (searchKeyWord && /\S/.test(searchKeyWord)) {
  //     postingData.where = Object.assign(postingData.where, {
  //       [Op.and]: [{
  //         [Op.or]: [{
  //           code: {
  //             [Op.like]: '%' + searchKeyWord.toLowerCase() + '%',
  //           }
  //         }, {
  //           name: {
  //             [Op.like]: '%' + searchKeyWord.toLowerCase() + '%',
  //           }
  //         }]
  //       }]
  //     });
  //   }

  //   postingData.where.is_active = status;

  //   try {
  //     let data = await chief_complaints_tbl.findAndCountAll(postingData);
  //     const code = data.rows.length === 0 ? 204 : 200;
  //     const message = data.rows.length === 0 ? emr_constants.NO_RECORD_FOUND : emr_constants.DRUG_FREQUENCY;
  //     return res
  //       .status(httpStatus.OK)
  //       .json({
  //         message, code, responseContents: data.rows, totalRecords: data.count,
  //       });

  //   } catch (err) {
  //     const errorMsg = err.errors ? err.errors[0].message : err.message;
  //     return res
  //       .status(httpStatus.INTERNAL_SERVER_ERROR)
  //       .json({
  //         statusCode: 500,
  //         msg: errorMsg
  //       });
  //   }
  // };

  const _getChiefComplaintAndSectionsByNameorCode = async (req, res) => {
    try {
      let reqData = req.body;
      if (!reqData.searchValue) {
        return res
          .status(400)
          .send({
            statusCode: 400,
            req: reqData,
            msg: "search value is required"
          });
      }

      let findQueryCC = {
        attributes: ['uuid', 'code', 'name', 'description',
          'chief_complaint_category_uuid', 'comments', 'referrence_link', 'body_site'],
        where: {
          [Op.or]: [
            {
              name: { [Op.like]: '%' + reqData.searchValue + '%' }
            },
            {
              code: { [Op.like]: '%' + reqData.searchValue + '%' }
            }
          ],
          is_active: 1,
          status: 1
        }
      }
      const findCCResponse = await chief_complaints_tbl.findAndCountAll(findQueryCC);
      let cc = findCCResponse.rows;
      let cc_uuid = cc.reduce((acc, cur) => {
        acc.push(cur.uuid);
        return acc;
      }, []);


      let findQueryCCSection = {
        required: false,
        attributes: ['uuid', 'chief_complaint_uuid', 'section_name', 'value_type_uuid', 'display_order'],
        where: {
          chief_complaint_uuid: { [Op.or]: cc_uuid },
          is_active: 1,
          status: 1
        }
      }
      const findCCSectionResponse = await chief_complaint_sections_tbl.findAndCountAll(findQueryCCSection);
      let cc_section = findCCSectionResponse.rows;
      let cc_section_uuid = cc_section.reduce((acc, cur) => {
        acc.push(cur.uuid);
        return acc;
      }, []);

      let cc_section_value_type_uuid = cc_section.reduce((acc, cur) => {
        acc.push(cur.value_type_uuid);
        return acc;
      }, []);
      let uniq_vt_uuid = [... new Set(cc_section_value_type_uuid)];

      let findValueTypeNameQuery = {
        required: false,
        attributes: ['uuid', 'code', 'name'],
        where: {
          uuid: { [Op.or]: uniq_vt_uuid },
          is_active: 1,
          status: 1
        }
      };
      const findCCSectionValueTypeResponse = await value_type_tbl.findAndCountAll(findValueTypeNameQuery);
      let value_type_concept_value = findCCSectionValueTypeResponse.rows;

      // let findQueryCCSectionConcept = {
      //   required: false,
      //   attributes: ['uuid', 'concept_name', 'chief_complaint_section_uuid',
      //     'value_type_uuid', 'is_multiple', 'is_mandatory'],
      //   where: {
      //     chief_complaint_section_uuid: { [Op.or]: cc_section_uuid },
      //     is_active: 1,
      //     status: 1
      //   }
      // }
      // const findCCSectionConceptResponse = await chief_complaint_section_concept_tbl.findAndCountAll(findQueryCCSectionConcept);
      // let cc_section_concept = findCCSectionConceptResponse.rows;
      // let cc_section_concept_uuid = cc_section_concept.reduce((acc, cur) => {
      //   acc.push(cur.uuid);
      //   return acc;
      // }, []);

      // let cc_section_concept_value_type_uuid = cc_section_concept.reduce((acc, cur) => {
      //   acc.push(cur.value_type_uuid);
      //   return acc;
      // }, []);
      // let uniq_vt_uuid = [... new Set(cc_section_concept_value_type_uuid)];

      // let findValueTypeNameQuery = {
      //   required: false,
      //   attributes: ['uuid', 'code', 'name'],
      //   where: {
      //     uuid: { [Op.or]: uniq_vt_uuid },
      //     is_active: 1,
      //     status: 1
      //   }
      // };
      // const findCCSectionValueTypeResponse = await value_type_tbl.findAndCountAll(findValueTypeNameQuery);
      // let value_type_concept_value = findCCSectionValueTypeResponse.rows;

      let findQueryCCSectionValues = {
        required: false,
        attributes: ['uuid', 'chief_complaint_section_uuid',
          'value_name', 'display_order'],
        where: {
          chief_complaint_section_uuid: { [Op.or]: cc_section_uuid },
          is_active: 1,
          status: 1
        }
      }
      const findCCSectionValueResponse = await chief_complaints_section_values_tbl.findAndCountAll(findQueryCCSectionValues);
      let cc_section_value = findCCSectionValueResponse.rows;

      let section_values_with_no_vt = [];
      for (let i = 0; i < cc_section.length; i++) {
        let section_and_values_obj = {
          uuid: cc_section[i].uuid,
          chief_complaint_uuid: cc_section[i].chief_complaint_uuid,
          section_name: cc_section[i].section_name,
          value_type_uuid: cc_section[i].value_type_uuid,
          display_order: cc_section[i].display_order,
          chief_complaint_section_value: []
        };
        for (let j = 0; j < cc_section_value.length; j++) {
          if (cc_section[i].uuid === cc_section_value[j].chief_complaint_section_uuid) {
            section_and_values_obj.chief_complaint_section_value.push(cc_section_value[j])
          }
        }
        section_values_with_no_vt.push(section_and_values_obj)
      }

      let section_and_values = [];
      for (let i = 0; i < section_values_with_no_vt.length; i++) {
        let concept_and_vt_obj = {
          uuid: section_values_with_no_vt[i].uuid,
          chief_complaint_uuid: section_values_with_no_vt[i].chief_complaint_uuid,
          section_name: section_values_with_no_vt[i].section_name,
          value_type_uuid: section_values_with_no_vt[i].value_type_uuid,
          display_order: section_values_with_no_vt[i].display_order,
          value_type_name: '',
          value_type_code: '',
          chief_complaint_section_value: section_values_with_no_vt[i].chief_complaint_section_value
        }
        for (let j = 0; j < value_type_concept_value.length; j++) {
          if (section_values_with_no_vt[i].value_type_uuid === value_type_concept_value[j].uuid) {
            concept_and_vt_obj.value_type_name = value_type_concept_value[j].name;
            concept_and_vt_obj.value_type_code = value_type_concept_value[j].code;
          }
        }
        section_and_values.push(concept_and_vt_obj);
      }

      // let section_and_concept_values = [];
      // for (let i = 0; i < cc_section.length; i++) {
      //   const section_concept = {
      //     uuid: cc_section[i].uuid,
      //     chief_complaint_uuid: cc_section[i].chief_complaint_uuid,
      //     section_name: cc_section[i].section_name,
      //     display_order: cc_section[i].display_order,
      //     chief_complaint_section_concept: []
      //   }
      //   for (let j = 0; j < concept_and_values.length; j++) {
      //     if (cc_section[i].uuid === concept_and_values[j].chief_complaint_section_uuid) {
      //       section_concept.chief_complaint_section_concept.push(concept_and_values[j])
      //     }
      //   }
      //   section_and_concept_values.push(section_concept)
      // }

      let cc_section_arr = [];
      for (let i = 0; i < cc.length; i++) {
        let cc_obj = {
          uuid: cc[i].uuid,
          code: cc[i].code,
          name: cc[i].name,
          description: cc[i].description,
          chief_complaint_category_uuid: cc[i].chief_complaint_category_uuid,
          comments: cc[i].comments,
          referrence_link: cc[i].referrence_link,
          body_site: cc[i].body_site,
          chief_complaint_section: []
        };
        for (let j = 0; j < section_and_values.length; j++) {
          if (cc[i].uuid === section_and_values[j].chief_complaint_uuid) {
            cc_obj.chief_complaint_section.push(section_and_values[j])
          }
        }
        cc_section_arr.push(cc_obj);
      }

      if (findCCResponse.count === 0) {
        return res
          .status(200)
          .send({
            statusCode: 200,
            msg: "No data found!",
            req: reqData,
            responseContents: [],
            totalRecords: 0
          });
      }

      return res
        .status(httpStatus.OK)
        .json({
          status: 'success',
          statusCode: httpStatus.OK,
          msg: "Chief complaint details fetched successfully",
          req: reqData,
          totalRecords: cc_section_arr.length,
          responseContents: cc_section_arr
        });


    } catch (err) {
      const errorMsg = err.errors ? err.errors[0].message : err.message;
      return res
        .status(httpStatus.OK)
        .json({
          status: "error",
          statusCode: httpStatus.INTERNAL_SERVER_ERROR,
          msg: 'Failed to get chief complaints and section details',
          actualMsg: errorMsg
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
    deleteChiefComplaints: _deleteChiefComplaints,
    getChiefComplaintAndSectionsByNameorCode: _getChiefComplaintAndSectionsByNameorCode //H30-43597 get chief complaints and their section,concept and values by code or name api done by Vignesh K
  };
};

module.exports = ChiefComplaints();

const codeexists = (code, userUUID) => {
  if (code !== undefined) {
    return new Promise((resolve, reject) => {
      let value = chief_complaints_tbl.findAll({
        //order: [['created_date', 'DESC']],
        attributes: ["code"],
        where: { code: code }
      });
      if (value) {
        resolve(value);
        return value;
      } else {
        reject({ message: "code does not existed" });
      }
    });
  }
};

const nameexists = (name) => {
  if (name !== undefined) {
    return new Promise((resolve, reject) => {
      let value = chief_complaints_tbl.findAll({
        //order: [['created_date', 'DESC']],
        attributes: ["name"],
        where: { name: name }
      });
      if (value) {
        resolve(value);
        return value;
      } else {
        reject({ message: "code does not existed" });
      }
    });
  }
};

const codenameexists = (code, name) => {
  if (code !== undefined && name !== undefined) {
    return new Promise((resolve, reject) => {
      let value = chief_complaints_tbl.findAll({
        //order: [['created_date', 'DESC']],
        attributes: ["code", "name"],
        where: { code: code, name: name }
      });
      if (value) {
        resolve(value);
        return value;
      } else {
        reject({ message: "code does not existed" });
      }
    });
  }
};