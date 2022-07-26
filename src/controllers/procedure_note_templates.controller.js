const httpStatus = require("http-status");
const db = require("../config/sequelize");
const sequelizeDb = require('../config/sequelize');
// const sequelizeDb = require('../config/sequelize');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;




const procedureNoteTemplatesTbl = db.procedure_note_templates;
const noteTemplatetypeTbl = db.note_template_type;
const npotetemplateTbl = db.note_templates;

const procedureNoteTemplatesController = () => {
  /**
   * Returns jwt token if valid username and password is provided
   * @param req
   * @param res
   * @param next
   * @returns {*}
   */

  const getprocedureNoteTemplates = async (req, res, next) => {
    let getsearch = req.body;

    let pageNo = 0;
    const itemsPerPage = getsearch.paginationSize ? getsearch.paginationSize : 10;
    let sortField = 'created_date';
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
    let findQuery = {
      offset: offset,
      limit: itemsPerPage,
      order: [
        [sortField, sortOrder],
      ],
      where: { status: 1 },
      include: [
        {
          model: noteTemplatetypeTbl,
          attributes: ['uuid', 'name']
        }],
      include: [
        {
          model: npotetemplateTbl,
          attributes: ['uuid', 'name']
        }],

    };

    if (getsearch.search && /\S/.test(getsearch.search)) {

      findQuery.where = {
        [Op.or]: [{
          code: {
            [Op.like]: '%' + getsearch.search + '%',
          },


        }, {
          name: {
            [Op.like]: '%' + getsearch.search + '%',
          },
        }

        ]
      };
    }


    try {
      await procedureNoteTemplatesTbl.findAndCountAll(findQuery)


        .then((findData) => {

          return res

            .status(httpStatus.OK)
            .json({
              message: "success",
              statusCode: 200,
              responseContents: (findData.rows ? findData.rows : []),
              totalRecords: (findData.count ? findData.count : 0),

            });
        })
        .catch(err => {
          return res
            .status(httpStatus.OK)
            .json({
              message: "error",
              err: err,
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

  // const postprocedureNoteTemplates = async (req, res, next) => {
  //     const postData = req.body;
  //     postData.status=postData.is_active;
  //     postData.created_by = req.headers.user_uuid;
  //     postData.modified_by = req.headers.user_uuid;
  //     postData.created_date = new Date();
  //     postData.modified_date = new Date();
  //     if (postData) {

  //         procedureNoteTemplatesTbl.findAll({
  //             where: {
  //                 [Op.and]: [{
  //                     procedure_uuid: postData.procedure_uuid
  //                 }

  //                 ]
  //             }
  //         }).then(async (result) => {
  //             if (result.length != 0) {
  //                 // return res.status(400).send({ statusCode: 400, message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}` });

  //                 return res.send({
  //                     statusCode: 400,
  //                     status: "error",
  //                     msg: "Please enter New procedure"
  //                 });
  //             } else {
  //                 await procedureNoteTemplatesTbl.create(postData, {
  //                     returning: true
  //                 }).then(data => {

  //                     res.send({
  //                         statusCode: 200,
  //                         msg: "Inserted procedure note template details Successfully",
  //                         req: postData,
  //                         responseContents: data
  //                     });
  //                 }).catch(err => {

  //                     res.send({
  //                         status: "failed",
  //                         msg: "failed to procedure note template details",
  //                         error: err
  //                     });
  //                 });
  //             }
  //         });


  //     } else {

  //         res.send({
  //             statusCode: 422,
  //             status: 'failed',
  //             msg: 'Please enter procedure note template details and headers'
  //         });
  //     }
  // };

  const postprocedureNoteTemplates = async (req, res) => {

    if (Object.keys(req.body).length != 0) {

      const { user_uuid } = req.headers;
      const procedureNoteTemplatesData = req.body;

      if (user_uuid > 0 && procedureNoteTemplatesData) {

        try {

          const code_exits = await codeexists(req.body.procedure_uuid);
          const name_exits = await nameexists(req.body.display_order);
          const tblname_exits = await codenameexists(req.body.procedure_uuid, req.body.display_order);

          if (tblname_exits && tblname_exits.length > 0) {
            return res
              .status(400)
              .send({ statusCode: 400, message: "procedure_uuid and display_order already exists" });
          }
          else if (code_exits && code_exits.length > 0) {
            return res
              .status(400)
              .send({ statusCode: 400, message: "procedure_uuid already exists" });

          } else if (name_exits && name_exits.length > 0) {
            return res
              .status(400)
              .send({ statusCode: 400, message: "display_order already exists" });

          } else {

            procedureNoteTemplatesData.status = procedureNoteTemplatesData.is_active;
            procedureNoteTemplatesData.created_by = user_uuid;
            procedureNoteTemplatesData.modified_by = user_uuid;

            procedureNoteTemplatesData.created_date = new Date();
            procedureNoteTemplatesData.modified_date = new Date();
            procedureNoteTemplatesData.revision = 1;

            const procedureNoteTemplatesCreatedData = await procedureNoteTemplatesTbl.create(
              procedureNoteTemplatesData,
              { returning: true }
            );

            if (procedureNoteTemplatesCreatedData) {
              procedureNoteTemplatesData.uuid = procedureNoteTemplatesCreatedData.uuid;
              return res.status(200).send({
                statusCode: 200,
                message: "Inserted procedure NoteTemplates Successfully",
                responseContents: procedureNoteTemplatesData
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


  const deleteprocedureNoteTemplates = async (req, res, next) => {
    const postData = req.body;

    await procedureNoteTemplatesTbl.update({
      status: 0,
      is_active: 0
    }, {
      where: {
        uuid: postData.Procedures_id_NT
      }
    }).then((data) => {
      res.send({
        statusCode: 200,
        msg: "Deleted Successfully",
        req: postData,
        responseContents: data
      });
    }).catch(err => {
      res.send({
        status: "failed",
        msg: "failed to delete data",
        error: err
      });
    });
  };

  const updateprocedureNoteTemplates = async (req, res, next) => {
    const postData = req.body;
    postData.modified_by = req.headers.user_uuid;
    await procedureNoteTemplatesTbl.update(
      postData, {
      where: {
        uuid: postData.Procedures_id_NT
      }
    }
    ).then((data) => {
      res.send({
        statusCode: 200,
        msg: "Updated Successfully",
        req: postData,
        responseContents: data
      });
    });

  };


  const getprocedureNoteTemplatesById = async (req, res, next) => {
    const postData = req.body;
    try {

      const page = postData.page ? postData.page : 1;
      const itemsPerPage = postData.limit ? postData.limit : 10;
      const offset = (page - 1) * itemsPerPage;
      await procedureNoteTemplatesTbl.findOne({
        where: {
          uuid: postData.Procedures_id_NT
        },
        include: [
          {
            model: proceduresTbl,
            // attributes:['uuid','name']
          },
          {
            model: noteTemplatetypeTbl,
            attributes: ['uuid', 'name'],
          },
          {
            model: npotetemplateTbl,
            attributes: ['uuid', 'name']
          }],
        offset: offset,
        limit: itemsPerPage
      })
        .then((data) => {
          return res
            .status(httpStatus.OK)
            .json({
              statusCode: 200,
              req: '',
              responseContents: data
            });
        });

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

  // --------------------------------------------return----------------------------------
  return {
    getprocedureNoteTemplates,
    postprocedureNoteTemplates,
    deleteprocedureNoteTemplates,

    updateprocedureNoteTemplates,
    getprocedureNoteTemplatesById
  };
};


module.exports = procedureNoteTemplatesController();
const codeexists = (code, userUUID) => {
  if (code !== undefined) {
    return new Promise((resolve, reject) => {
      let value = procedureNoteTemplatesTbl.findAll({
        //order: [['created_date', 'DESC']],
        attributes: ["procedure_uuid"],
        where: { procedure_uuid: code }
      });
      if (value) {
        resolve(value);
        return value;
      } else {
        reject({ message: "procedure_uuid does not existed" });
      }
    });
  }
};

const nameexists = (name) => {
  if (name !== undefined) {
    return new Promise((resolve, reject) => {
      let value = procedureNoteTemplatesTbl.findAll({
        //order: [['created_date', 'DESC']],
        attributes: ["display_order"],
        where: { display_order: name }
      });
      if (value) {
        resolve(value);
        return value;
      } else {
        reject({ message: "display_order does not existed" });
      }
    });
  }
};

const codenameexists = (code, name) => {
  if (code !== undefined && name !== undefined) {
    return new Promise((resolve, reject) => {
      let value = procedureNoteTemplatesTbl.findAll({
        //order: [['created_date', 'DESC']],
        attributes: ["procedure_uuid", "display_order"],
        where: { procedure_uuid: code, display_order: name }
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