const httpStatus = require("http-status");
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const emr_const = require('../config/constants');
const db = require("../config/sequelize");
const emr_constants = require("../config/constants");
const clinical_const = require('../config/constants');
const emr_utilities = require('../services/utility.service');

//import tables
const vitalmstrTbl = db.vital_masters;
const vitalTypeTbl = db.vital_type;
const vitalValueTypeTbl = db.vital_value_type;
const vitalLonicTbl = db.vital_loinc;
const vw_vitals_master = db.vw_vitals_master;
const emr_uom = db.emr_uom;
const vitalmstruomTbl = db.vital_master_uoms;

const vitalmstrController = () => {
  /**
   * Returns jwt token if valid username and password is provided
   * @param req
   * @param res
   * @param next
   * @returns {*}
   */



  const _createVital = async (req, res) => {

    if (Object.keys(req.body).length != 0) {

      const { user_uuid } = req.headers;
      const vitalsMasterData = req.body;
      if (user_uuid && vitalsMasterData) {

        vitalsMasterData.name = vitalsMasterData.name;
        vitalsMasterData.description = vitalsMasterData.description;
        // vitalsMasterData.is_active = vitalsMasterData.status = emr_const.IS_ACTIVE;
        vitalsMasterData.created_by = vitalsMasterData.modified_by = user_uuid;
        vitalsMasterData.created_date = vitalsMasterData.modified_date = new Date();
        vitalsMasterData.revision = 1;
        try {

          const exists = await nameExists(vitalsMasterData.name);

          if (exists && exists.length > 0) {
            //vital already exits
            return res
              .status(200)
              .send({ statusCode: 400, message: "Name already exists" });
          } else {

            const vitalsCreatedData = await vitalmstrTbl.create(vitalsMasterData, { returning: true });
            if (vitalsCreatedData) {
              vitalsMasterData.uuid = vitalsCreatedData.uuid;
              return res.status(200).send({ statusCode: 200, message: "Inserted vitals Successfully", responseContents: vitalsMasterData });
            }
          }
        } catch (ex) {
          console.log(ex.message);
          return res.status(400).send({ statusCode: 400, message: ex.message });
        }
      } else {
        return res.status(400).send({ statusCode: 400, message: 'No Headers Found' });
      }
    } else {
      return res
        .status(400)
        .send({ statusCode: 400, message: "No Request Body Found" });
    }
  };

  //function for getting default vitals
  const _getVitals = async (req, res) => {

    try {
      const result = await vitalmstrTbl.findAll(getdefaultVitalsQuery(), { returning: true });
      if (result) {
        return res.status(200).send({ statusCode: httpStatus.OK, message: "Fetched Vital Master details Successfully", responseContents: { getVitals: result } });
      }
    }
    catch (ex) {
      return res.status(400).send({ statusCode: httpStatus.BAD_REQUEST, message: ex.message });
    }
  };
  //function for getting all vitals
  const _getALLVitals = async (req, res) => {
    /*
    let query = {
      where: { is_active: 1, status: 1 }
    };
    */

    try {
      const result = await vitalmstrTbl.findAll(getAllVitalsQuery(), { returning: true });
      /* const result = await vitalmstrTbl.findAll(query, { returning: true }); */
      if (result) {
        return res.status(200).send({ statusCode: httpStatus.OK, message: "Fetched Vital Master details Successfully", responseContents: { getVitals: result } });
      }
    }
    catch (ex) {
      return res.status(400).send({ statusCode: httpStatus.BAD_REQUEST, message: ex.message });
    }
  };

  const _getAllVitalsFilter = async (req, res) => {
    const { user_uuid } = req.headers;
    const { searchValue } = req.body;
    const isValidSearchVal = searchValue && emr_utilities.isStringValid(searchValue);
    let query;
    query = {
      is_active: emr_const.IS_ACTIVE,
      status: emr_const.IS_ACTIVE,
      [Op.and]: [
        {
          name: {
            [Op.like]: `%${searchValue}%`
          }
        }
      ]
    };


    if (isValidSearchVal && user_uuid) {

      try {
        const filterdVitalData = await vitalmstrTbl.findAll({
          where: query
        });
        if (filterdVitalData.length > 0) {
          return res.status(200).send({ statusCode: httpStatus.OK, message: 'Data Fetched Successfully', responseContents: filterdVitalData });
        } else {
          return res.status(200).send({ code: httpStatus.OK, message: 'No Record Found' });
        }
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

  const _getALLVitalsmaster = async (req, res) => {
    let getsearch = req.body;
    let pageNo = 0;
    const itemsPerPage = getsearch.paginationSize ? getsearch.paginationSize : 10;
    let sortField = 'created_date';
    let sortOrder = 'DESC';
    // Object.keys(getsearch).forEach((key) => (getsearch[key] == null || getsearch[key] == "") && delete getsearch[key]);
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
      attributes: { exclude: ["id", "createdAt", "updatedAt"] },
      offset: offset,
      where: { is_active: 1, status: 1 },
      limit: itemsPerPage,
      include: [
        {
          model: vitalLonicTbl,
          require: false,
        }
      ],
      order: [
        [sortField, sortOrder],
      ],
    };

    if (getsearch.search && /\S/.test(getsearch.search)) {
      findQuery.where[Op.or] = [
        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_vitals_master.name')), 'LIKE', '%' + getsearch.search.toLowerCase() + '%'),
        // Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_emr_immunizations.i_code')), 'LIKE', '%' + getsearch.search.toLowerCase() + '%'),

      ];
    }
    if (getsearch.name && /\S/.test(getsearch.name)) {
      if (findQuery.where[Op.or]) {
        findQuery.where[Op.and] = [{
          [Op.or]: [
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_vitals_master.name')), 'LIKE', '%' + getsearch.name.toLowerCase() + '%')
          ]
        }];
      } else {
        findQuery.where[Op.or] = [
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_vitals_master.name')), 'LIKE', '%' + getsearch.name.toLowerCase() + '%')
        ];
      }
    }
    if (getsearch.vital_value_type_uuid && /\S/.test(getsearch.vital_value_type_uuid)) {
      if (findQuery.where[Op.or]) {
        findQuery.where[Op.and] = [{
          [Op.or]: [
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_vitals_master.vital_value_type_uuid')), getsearch.vital_value_type_uuid)
          ]
        }];
      } else {
        findQuery.where[Op.or] = [
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_vitals_master.vital_value_type_uuid')), getsearch.vital_value_type_uuid)
        ];
      }
    }
    if (getsearch.hasOwnProperty('status') && /\S/.test(getsearch.status)) {
      findQuery.where['is_active'] = getsearch.status;
    }

    try {
      const result = await vw_vitals_master.findAndCountAll(findQuery, { returning: true });
      if (result) {
        return res.status(200).send({
          statusCode: 200, message: "Fetched Vital Master details Successfully", responseContents: (result.rows ? result.rows : []),
          totalRecords: (result.count ? result.count : 0),
        });
      }
    }
    catch (ex) {
      return res.status(400).send({ statusCode: httpStatus.BAD_REQUEST, message: ex.message });
    }
  };

  const _getVitalByID = async (req, res, next) => {
    if (Object.keys(req.body).length != 0) {
      const postData = req.body;
      try {

        const page = postData.page ? postData.page : 1;
        const itemsPerPage = postData.limit ? postData.limit : 10;
        const offset = (page - 1) * itemsPerPage;
        await vitalmstrTbl.findOne({
          //attributes: { exclude: ["id", "createdAt", "updatedAt"] },
          where: {
            uuid: postData.Vital_id
          },
          offset: offset,
          limit: itemsPerPage,
          include: [
            {
              model: vitalLonicTbl,
              // as: 'vital_lonic',
              require: false,
              // where: {
              //   is_active: clinical_const.IS_ACTIVE,
              //   status: clinical_const.IS_ACTIVE
              // }
            }
          ]
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
    } else {
      return res
        .status(400)
        .send({ code: httpStatus[400], message: "No Request Body Found" });
    }
  };
  const _getVitalsByUUID = async (req, res, next) => {
    if (Object.keys(req.body).length != 0) {
      const postData = req.body;
      try {

        const page = postData.page ? postData.page : 1;
        const itemsPerPage = postData.limit ? postData.limit : 10;
        const offset = (page - 1) * itemsPerPage;
        await vw_vitals_master.findOne({
          attributes: { exclude: ["id", "createdAt", "updatedAt"] },
          where: {
            uuid: postData.Vital_id
          },
          offset: offset,
          limit: itemsPerPage,
          include: [
            {
              model: vitalLonicTbl,
              require: false,

            }
          ]
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
    } else {
      return res
        .status(400)
        .send({ code: httpStatus[400], message: "No Request Body Found" });
    }
  };
  const _updatevitalsById = async (req, res, next) => {
    try {
      const postData = req.body;
      postData.modified_by = req.headers.user_uuid;
      if (req.body.vitals_id > 0) {
        await vitalmstrTbl.update(
          postData, {
          where: {
            uuid: postData.vitals_id
          }
        }
        ).then((data) => {
          res.send({
            code: 200,
            msg: "Updated Successfully",
            req: postData,
            responseContents: data
          });
        });
      } else {
        return res
          .status(400)
          .send({ code: httpStatus[400], message: "please provide valid data" });
      }
    } catch (ex) {
      console.log(ex.message);
      return res.status(400).send({ statusCode: 400, message: ex.message });
    }
  };
  const _deletevitals = async (req, res) => {

    // plucking data req body
    const { vitals_id } = req.body;
    const { user_uuid } = req.headers;

    if (vitals_id) {
      const updatedvitalsData = { status: 0, is_active: 0, modified_by: user_uuid, modified_date: new Date() };
      try {

        const updateddiagnosissAsync = await Promise.all(
          [
            vitalmstrTbl.update(updatedvitalsData, { where: { uuid: vitals_id } })

          ]
        );

        if (updateddiagnosissAsync) {
          return res.status(200).send({ code: 200, message: "Deleted Successfully" });
        }

      } catch (ex) {
        return res.status(400).send({ code: 400, message: ex.message });
      }

    } else {
      return res.status(400).send({ code: 400, message: "No Request Body Found" });
    }

  };
  const _getdefultVitals = async (req, res) => {
    let { is_default } = req.query;
    try {

      const result = await vitalmstrTbl.findAll(getdefaultVitals(is_default), { returning: true });

      const returnMessage = result > 0 ? emr_constants.FETCHD_VITAL_MASTER_SUCCESSFULLY : emr_constants.NO_RECORD_FOUND;
      return res.status(httpStatus.OK).send({
        code: httpStatus.OK,
        message: returnMessage,
        responseContents: result
      });

    }
    catch (ex) {
      return res.status(400).send({ statusCode: httpStatus.BAD_REQUEST, message: ex.message });
    }
  };
  return {
    createVital: _createVital,
    getVitals: _getVitals,
    getAllVitals: _getALLVitals,
    getAllVitalsFilter: _getAllVitalsFilter,
    getVitalByID: _getVitalByID,
    getALLVitalsmaster: _getALLVitalsmaster,
    updatevitalsById: _updatevitalsById,
    deletevitals: _deletevitals,
    getVitalsByUUID: _getVitalsByUUID,
    getdefultVitals: _getdefultVitals
  };
};

module.exports = vitalmstrController();

function getdefaultVitalsQuery(vital_uuid) {
  let q = {
    where: { is_default: 1, is_active: clinical_const.IS_ACTIVE, status: clinical_const.IS_ACTIVE },
    include: [
      {
        model: vitalValueTypeTbl,
        as: 'vital_value_type',
        where: {
          is_active: clinical_const.IS_ACTIVE,
          status: clinical_const.IS_ACTIVE
        }
      },
      {
        model: vitalTypeTbl,
        as: 'vital_type',
        where: {
          is_active: clinical_const.IS_ACTIVE,
          status: clinical_const.IS_ACTIVE
        }
      },
      {
        model: vitalmstruomTbl,
        required: false,
        include: [
          {
            model: emr_uom,
            as: 'emr_uom',
            where: {
              is_active: clinical_const.IS_ACTIVE,
              status: clinical_const.IS_ACTIVE
            }
          },
          {
            model: vitalValueTypeTbl,
            as: 'vital_value_type',
            where: {
              is_active: clinical_const.IS_ACTIVE,
              status: clinical_const.IS_ACTIVE
            }
          }
        ]
      }
    ]
  };

  if (vital_uuid) {
    q.where.uuid = vital_uuid;
  }
  return q;
}
function getAllVitalsQuery() {
  let q = {
    where: { is_active: clinical_const.IS_ACTIVE, status: clinical_const.IS_ACTIVE },
    include: [
      {
        model: vitalValueTypeTbl,
        as: 'vital_value_type',
        where: {
          is_active: clinical_const.IS_ACTIVE,
          status: clinical_const.IS_ACTIVE
        }
      },
      {
        model: vitalTypeTbl,
        as: 'vital_type',
        where: {
          is_active: clinical_const.IS_ACTIVE,
          status: clinical_const.IS_ACTIVE
        }
      },
      {
        model: vitalmstruomTbl,
        required: false,
        include: [
          {
            model: emr_uom,
            as: 'emr_uom',
            where: {
              is_active: clinical_const.IS_ACTIVE,
              status: clinical_const.IS_ACTIVE
            }
          },
          {
            model: vitalValueTypeTbl,
            as: 'vital_value_type',
            where: {
              is_active: clinical_const.IS_ACTIVE,
              status: clinical_const.IS_ACTIVE
            }
          }
        ]
      }
    ]
  };
  return q;
}
function getdefaultVitals(is_default) {
  let q = {
    where: { is_active: 1, status: 1 },
    include: [
      {
        model: vitalValueTypeTbl,
        as: 'vital_value_type',
        where: {
          is_active: clinical_const.IS_ACTIVE,
          status: clinical_const.IS_ACTIVE
        }
      },
      {
        model: vitalTypeTbl,
        as: 'vital_type',
        where: {
          is_active: clinical_const.IS_ACTIVE,
          status: clinical_const.IS_ACTIVE
        }
      },
      {
        model: vitalmstruomTbl,
        required: false,
        include: [
          {
            model: emr_uom,
            as: 'emr_uom',
            where: {
              is_active: clinical_const.IS_ACTIVE,
              status: clinical_const.IS_ACTIVE
            }
          },
          {
            model: vitalValueTypeTbl,
            as: 'vital_value_type',
            where: {
              is_active: clinical_const.IS_ACTIVE,
              status: clinical_const.IS_ACTIVE
            }
          }
        ]
      }
    ]
  };
  if (is_default) {
    q.where.is_default = is_default;
  }
  return q;
}
const nameExists = (name) => {
  if (name !== undefined) {
    return new Promise((resolve, reject) => {
      let value = vitalmstrTbl.findAll({
        attributes: ["name"],
        where: { name: name, status: 1 }
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