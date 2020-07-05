const httpStatus = require("http-status");
const db = require("../config/sequelize");
const sequelizeDb = require('../config/sequelize');
// const sequelizeDb = require('../config/sequelize');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const rp = require("request-promise");
var config = require("../config/config");

const emr_constants = require('../config/constants');



const allergyMastersTbl = db.allergy_masters;
const allergySourceTbl = db.allergy_source;
const allergySeverityTbl = db.allergy_severity;

const allergyMasterController = () => {
  /**
   * Returns jwt token if valid username and password is provided
   * @param req
   * @param res
   * @param next
   * @returns {*}
   */

  const getAllergyMaster = async (req, res, next) => {
    let getsearch = req.body;

    let pageNo = 0;
    const itemsPerPage = getsearch.paginationSize ? getsearch.paginationSize : 10;
    let sortField = 'modified_date';
    let sortOrder = 'DESC';

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
    let splitSortField;
    if (sortField == "allergy_source.name") {
      splitSortField = sortField.split('.');
    }
    let findQuery = {
      offset: offset,
      limit: itemsPerPage,
      where: { is_active: 1, status: 1 },
      include: [{
        model: allergySourceTbl,
        required: false,
      },
      {
        model: allergySeverityTbl,
        required: false,
        attributes: ['uuid', 'name'],
      }],
      order: [
        sortField == "allergy_source.name" ? [allergySourceTbl, splitSortField[1], sortOrder] : [sortField, sortOrder]
      ]
    };



    if (getsearch.search && /\S/.test(getsearch.search)) {
      findQuery.where[Op.or] = [
        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('allergy_masters.allergey_code')), 'LIKE', '%' + getsearch.search.toLowerCase() + '%'),
        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('allergy_masters.allergy_name')), 'LIKE', '%' + getsearch.search.toLowerCase() + '%'),

      ];
    }
    if (getsearch.allergy_source_uuid && /\S/.test(getsearch.allergy_source_uuid)) {
      if (findQuery.where[Op.or]) {
        findQuery.where[Op.and] = [{
          [Op.or]: [
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('allergy_masters.allergy_source_uuid')), getsearch.allergy_source_uuid)
          ]
        }];
      } else {
        findQuery.where[Op.or] = [
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('allergy_masters.allergy_source_uuid')), getsearch.allergy_source_uuid)
        ];
      }
    }

    if (getsearch.hasOwnProperty('status') && /\S/.test(getsearch.status)) {
      findQuery.where['is_active'] = getsearch.status;
    }


    try {
      await allergyMastersTbl.findAndCountAll(findQuery)


        .then((findData) => {
          const newTestJson = JSON.parse(JSON.stringify(findData.rows));
          newTestJson.forEach((item) => {
            if (item.allergy_source != null) {
              item.name = item.allergy_source.name;
            }
            else { item.name = null; }
          });

          row = newTestJson;
          return res
            .status(httpStatus.OK)
            .json({
              message: "success",
              statusCode: 200,
              responseContents: row,
              totalRecords: (findData.count ? findData.count : 0),

            });
        })
        .catch(err => {
          const errorMsg = err.errors ? err.errors[0].message : err.message;

          return res
            .status(httpStatus.OK)
            .json({
              message: "error",
              err: errorMsg,
              req: ''
            });
        });
    } catch (err) {
      const errorMsg = err.errors ? err.errors[0].message : err.message;
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({
          message: "error",
        });
    }


  };

  // const postAlleryMaster = async (req, res, next) => {



  //     if (Object.keys(req.body).length != 0) {
  //         const postData = req.body;
  //         postData.created_by = req.headers.user_uuid;
  //         postData.created_date = new Date();
  //         postData.modified_date = new Date();
  //         postData.modified_by = req.headers.user_uuid;
  //         allergyMastersTbl.findAll({
  //             where: {
  //                 [Op.or]: [{
  //                     allergey_code: postData.allergey_code
  //                 },
  //                 {
  //                     allergy_name: postData.allergy_name
  //                 }
  //                 ]
  //             }
  //         }).then(async (result) => {
  //             if (result.length != 0) {
  //                 return res.send({
  //                     statusCode: 400,
  //                     status: "error",
  //                     msg: "Record already exists"
  //                 });
  //             } else {
  //                 await allergyMastersTbl.create(postData, {
  //                     returning: true
  //                 }).then(data => {

  //                     res.send({
  //                         statusCode: 200,
  //                         msg: "Inserted Allery Master details Successfully",
  //                         req: postData,
  //                         responseContents: data
  //                     });
  //                 }).catch(err => {

  //                     res.send({
  //                         status: "failed",
  //                         msg: "failed to Allery Master details",
  //                         error: err
  //                     });
  //                 });
  //             }
  //         });


  //     } else {

  //         res.send({
  //             status: 'failed',
  //             msg: 'No Request Body Found'
  //         });
  //     }
  // };

  const postAlleryMaster = async (req, res) => {

    if (Object.keys(req.body).length != 0) {

      const { user_uuid } = req.headers;
      const postData = req.body;

      if (user_uuid > 0 && postData) {

        try {

          const code_exits = await codeexists(req.body.allergey_code);
          const name_exits = await nameexists(req.body.allergy_name);
          const tblname_exits = await codenameexists(req.body.allergey_code, req.body.allergy_name);

          if (tblname_exits && tblname_exits.length > 0) {
            return res
              .status(422)
              .send({ statusCode: 422, message: "code and name already exists" });
          }
          else if (code_exits && code_exits.length > 0) {
            return res
              .status(422)
              .send({ statusCode: 422, message: "code already exists" });

          } else if (name_exits && name_exits.length > 0) {
            return res
              .status(422)
              .send({ statusCode: 422, message: "name already exists" });

          } else {

            postData.status = postData.is_active;
            postData.created_by = user_uuid;
            postData.modified_by = user_uuid;

            postData.created_date = new Date();
            postData.modified_date = new Date();
            postData.revision = 1;

            const allergyCreatedData = await allergyMastersTbl.create(
              postData,
              { returning: true }
            );

            if (allergyCreatedData) {
              postData.uuid = allergyCreatedData.uuid;
              return res.status(200).send({
                statusCode: 200,
                message: "Inserted Allergy Master Successfully",
                responseContents: postData
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

  const deleteAlleryMaster = async (req, res, next) => {
    if (Object.keys(req.body).length != 0) {
      const postData = req.body;
      if (postData.Allergy_id <= 0) {
        return res.status(400).send({ code: 400, message: 'Please provide Valid Allergy id' });

      }

      await allergyMastersTbl.update({
        is_active: 0,
        status: 0
      }, {
        where: {
          uuid: postData.Allergy_id
        }
      }).then((data) => {
        res.send({
          statusCode: 200,
          msg: "Deleted Successfully",
          req: postData,
          responseContents: data
        });
      }).catch(err => {
        console.log(err.message);
        res.send({
          status: "failed",
          msg: "failed to delete data",
          error: err.message
        });
      });
    } else {
      return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" });

    }
  };
  const updateAlleryMasterById = async (req, res, next) => {
    if (Object.keys(req.body).length != 0) {
      const postData = req.body;

      postData.modified_by = req.headers.user_uuid;
      await allergyMastersTbl.update(
        postData, {
        where: {
          uuid: postData.Allergy_id
        }
      }
      ).then((data) => {
        res.send({
          statusCode: 200,
          msg: "Updated Successfully",
          req: postData,
          responseContents: data
        });
      }).catch(err => {
        console.log(err.message);
        res.send({
          status: "failed",
          msg: "failed to update data",
          error: err.message
        });
      });
    } else {
      return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" });
    }

  };


  const getAlleryMasterById = async (req, res, next) => {
    const postData = req.body;

    //var getcuDetails = {},getmuDetails={};
    try {
      if (postData.Allergy_id <= 0) {
        return res.status(400).send({ code: 400, message: 'Please provide Valid Allergy id' });
      }
      const page = postData.page ? postData.page : 1;
      const itemsPerPage = postData.limit ? postData.limit : 10;
      const offset = (page - 1) * itemsPerPage;
      const data = await allergyMastersTbl.findOne({
        where: {
          uuid: postData.Allergy_id
        },
        offset: offset,
        limit: itemsPerPage,
        // where: { status: 1, is_active: 1 },
        include: [{
          model: allergySourceTbl,
          required: false,
          // as: 'source' 
          attributes: ['uuid', 'name'],
          // where: { status: 1, is_active: 1 }
        }
          ,
        {
          model: allergySeverityTbl,
          required: false,
          // as: 'source' 
          attributes: ['uuid', 'name'],
          // where: { status: 1, is_active: 1 }
        }
        ]
      });
      if (!data) {
        return res.status(httpStatus.OK).json({ statusCode: 200, message: 'No Record Found with this Allergy Id' });
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
      console.log(err);
      const errorMsg = err.errors ? err.errors[0].message : err.message;
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({
          status: "error",
          msg: errorMsg
        });
    }
  };

  // --------------------------------------------return----------------------------------
  return {

    postAlleryMaster,
    getAllergyMaster,
    updateAlleryMasterById,
    deleteAlleryMaster,

    getAlleryMasterById

  };
};


module.exports = allergyMasterController();

async function getuserDetails(user_uuid, docid, authorization) {
  console.log(user_uuid, docid, authorization);
  let options = {
    uri: config.wso2AppUrl + 'users/getusersById',
    //uri: 'https://qahmisgateway.oasyshealth.co/DEVAppmaster/v1/api/users/getusersById',
    //uri: "https://qahmisgateway.oasyshealth.co/DEVAppmaster/v1/api/userProfile/GetAllDoctors",
    method: "POST",
    headers: {
      Authorization: authorization,
      user_uuid: user_uuid
    },
    body: { "Id": docid },
    //body: {},
    json: true
  };
  const user_details = await rp(options);
  return user_details;
}

function getfulldata(data, getcuDetails, getmuDetails) {
  let newdata = {
    "uuid": data.uuid,
    "allergey_code": data.allergey_code,
    "allergy_name": data.allergy_name,
    // "allergy_type_uuid": data.allergy_type_uuid,
    "allergy_description": data.allergy_description,
    "comments": data.comments,
    "allergy_source_uuid": data.allergy_source_uuid,
    "allergy_severity_uuid": data.allergy_severity_uuid,
    "status": data.status,
    "revision": data.revision,
    "is_active": data.is_active,
    "created_by_id": data.created_by,
    "created_by":
      getcuDetails.responseContents ?
        getcuDetails.responseContents.title.name + " " + getcuDetails.responseContents.first_name
        : null,
    "modified_by_id": data.modified_by,
    "modified_by":
      getmuDetails.responseContents ?
        getmuDetails.responseContents.title.name + " " + getmuDetails.responseContents.first_name
        : null,
    "created_date": data.created_date,
    "modified_date": data.modified_date,
    "allergy_source": data.allergy_source,
    "allergy_severity": data.allergy_severity

  };
  return newdata;
}
const codeexists = (code, userUUID) => {
  if (code !== undefined) {
    return new Promise((resolve, reject) => {
      let value = allergyMastersTbl.findAll({
        //order: [['created_date', 'DESC']],
        attributes: ["allergey_code"],
        where: { allergey_code: code }
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
      let value = allergyMastersTbl.findAll({
        //order: [['created_date', 'DESC']],
        attributes: ["allergy_name"],
        where: { allergy_name: name }
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
      let value = allergyMastersTbl.findAll({
        //order: [['created_date', 'DESC']],
        attributes: ["allergey_code", "allergy_name"],
        where: { allergey_code: code, allergy_name: name }
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

