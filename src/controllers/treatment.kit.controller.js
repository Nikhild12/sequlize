// Package Import
const httpStatus = require("http-status");

// Sequelizer Import
const sequelizeDb = require("../config/sequelize");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

// EMR Constants Import
const emr_constants = require("../config/constants");

const emr_utility = require("../services/utility.service");

// Initialize Treatment Kit
const treatmentkitTbl = sequelizeDb.treatment_kit;
const treatmentkitLabTbl = sequelizeDb.treatment_kit_lab_map;
const treatmentkitRadiologyTbl = sequelizeDb.treatment_kit_radiology_map;
const treatmentkitDrugTbl = sequelizeDb.treatment_kit_drug_map;
const treatmentkitInvestigationTbl =
  sequelizeDb.treatment_kit_investigation_map;
const treatmentKitDiagnosisTbl = sequelizeDb.treatment_kit_diagnosis_map;
const treatmentKitViewTbl = sequelizeDb.vw_treatment_kit;

// Treatment Kit Attribute
const treatmentKitAtt = require('../attributes/treatment_kit.attributes');

// Treatment Kit Filters Query Function
const getByFilterQuery = (searchBy, searchValue, user_uuid, dept_id) => {
  searchBy = searchBy.toLowerCase();

  switch (searchBy) {
    case emr_constants.FILTERBYTHREE:
      filterByQuery = {
        is_active: emr_constants.IS_ACTIVE,
        status: emr_constants.IS_ACTIVE,
        [Op.and]: [
          {
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
          },
          {
            [Op.or]: [
              {
                department_uuid: { [Op.eq]: dept_id },
                is_public: { [Op.eq]: emr_constants.IS_ACTIVE }
              },
              { user_uuid: { [Op.eq]: user_uuid } }
            ]
          }
        ]
      };
      return filterByQuery;
    case "treatment_kit_id":
    default:
      return {
        uuid: searchValue,
        is_active: emr_constants.IS_ACTIVE,
        status: emr_constants.IS_ACTIVE
      };
  }
};

const getFilterByCodeAndNameAttributes = [
  "uuid",
  "treatment_kit_type_uuid",
  "code",
  "name"
];

const TreatMent_Kit = () => {
  /**
   * Creating Treatment Kit
   * @param {*} req
   * @param {*} res
   */
  const _createTreatmentKit = async (req, res) => {
    const { user_uuid } = req.headers;
    // let treatTransStatus = false;
    //let treatmentTransaction;
    let { treatment_kit, treatment_kit_lab, treatment_kit_drug } = req.body;
    let { treatment_kit_investigation, treatment_kit_radiology, treatment_kit_diagnosis } = req.body;

    if (user_uuid && treatment_kit && treatment_kit.name && treatment_kit.code) {
      if (checkTreatmentKit(req)) {
        return res.status(400).send({
          code: httpStatus.BAD_REQUEST, message: emr_constants.TREATMENT_REQUIRED
        });
      }
      try {

        // treatmentTransaction = await sequelizeDb.sequelize.transaction();
        let treatmentSave = [];

        const duplicateTreatmentRecord = await findDuplicateTreatmentKitByCodeAndName(treatment_kit);

        if (duplicateTreatmentRecord && duplicateTreatmentRecord.length > 0) {
          return res.status(400).send({
            code: emr_constants.DUPLICATE_ENTRIE,
            message: getDuplicateMsg(duplicateTreatmentRecord)
          });
        }

        const treatment_active = treatment_kit.is_active;
        treatment_kit = emr_utility.createIsActiveAndStatus(
          treatment_kit,
          user_uuid
        );
        treatment_kit.is_active = treatment_active;
        const treatmentSavedData = await treatmentkitTbl.create(treatment_kit, {
          returning: true
        });
        // Lab
        if (
          treatment_kit_lab && Array.isArray(treatment_kit_lab) && treatment_kit_lab.length > 0 &&
          treatmentSavedData
        ) {
          // assigning Default Values
          treatment_kit_lab.forEach(l => {
            l = emr_utility.assignDefaultValuesAndUUIdToObject(
              l, treatmentSavedData, user_uuid, "treatment_kit_uuid"
            );
          });

          // Treatment Kit Lab Save
          treatmentSave = [
            ...treatmentSave,
            treatmentkitLabTbl.bulkCreate(treatment_kit_lab, {
              returning: true
            })
          ];
        }
        // Drug
        if (
          treatment_kit_drug &&
          Array.isArray(treatment_kit_drug) &&
          treatment_kit_drug.length > 0 &&
          treatmentSavedData
        ) {
          // assigning Default Values
          treatment_kit_drug.forEach(dr => {
            dr = emr_utility.assignDefaultValuesAndUUIdToObject(
              dr,
              treatmentSavedData,
              user_uuid,
              "treatment_kit_uuid"
            );
          });

          // Treatment Kit Drug Save
          treatmentSave = [
            ...treatmentSave,
            treatmentkitDrugTbl.bulkCreate(treatment_kit_drug, {
              returning: true
            })
          ];
        }
        // Investigation
        if (
          treatment_kit_investigation &&
          Array.isArray(treatment_kit_investigation) &&
          treatment_kit_investigation.length > 0 &&
          treatmentSavedData
        ) {
          // assigning Default Values
          treatment_kit_investigation.forEach(i => {
            i = emr_utility.assignDefaultValuesAndUUIdToObject(
              i,
              treatmentSavedData,
              user_uuid,
              "treatment_kit_uuid"
            );
          });

          // Treatment Kit Drug Save
          treatmentSave = [
            ...treatmentSave,
            treatmentkitInvestigationTbl.bulkCreate(
              treatment_kit_investigation,
              { returning: true }
            )
          ];
        }
        // Diagnosis
        if (
          treatment_kit_diagnosis &&
          Array.isArray(treatment_kit_diagnosis) &&
          treatment_kit_diagnosis.length > 0 &&
          treatmentSavedData
        ) {
          // assigning Default Values
          treatment_kit_diagnosis.forEach(d => {
            d = emr_utility.assignDefaultValuesAndUUIdToObject(
              d,
              treatmentSavedData,
              user_uuid,
              "treatment_kit_uuid"
            );
          });

          // Treatment Kit Drug Save
          treatmentSave = [
            ...treatmentSave,
            treatmentKitDiagnosisTbl.bulkCreate(treatment_kit_diagnosis, {
              returning: true
            })
          ];
        }
        // Radiology
        if (
          treatment_kit_radiology &&
          Array.isArray(treatment_kit_radiology) &&
          treatment_kit_radiology.length > 0 &&
          treatmentSavedData
        ) {
          // assigning Default Values
          treatment_kit_radiology.forEach(r => {
            r = emr_utility.assignDefaultValuesAndUUIdToObject(
              r,
              treatmentSavedData,
              user_uuid,
              "treatment_kit_uuid"
            );
          });

          // Treatment Kit Drug Save
          treatmentSave = [
            ...treatmentSave,
            treatmentkitRadiologyTbl.bulkCreate(treatment_kit_radiology, {
              returning: true
            })
          ];
        }

        await Promise.all(treatmentSave);
        //await treatmentTransaction.commit();
        //treatTransStatus = true;
        return res.status(200).send({
          code: httpStatus.OK,
          message: emr_constants.TREATMENT_SUCCESS,
          reqContents: req.body
        });
      } catch (ex) {
        console.log("Exception happened", ex);
        // if (treatmentTransaction) {
        //     await treatmentTransaction.rollback();
        //     treatTransStatus = true;
        // }
        return res
          .status(400)
          .send({ code: httpStatus.BAD_REQUEST, message: ex });
      } finally {
        // if (treatmentTransaction && !treatTransStatus) {
        //     treatmentTransaction.rollback();
        // }
      }
    } else {
      return res.status(400).send({
        code: httpStatus[400],
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}`
      });
    }
  };

  /**
   * Treatment Kit Filters Search
   * @param {*} req
   * @param {*} res
   */
  const _getTreatmentKitByFilters = async (req, res) => {
    const { user_uuid } = req.headers;
    //const { searchKey, searchValue, departmentId } = req.query;

    let searchKey, searchValue, departmentId;

    // If method is GET in query
    if (req.method === "GET") {
      ({ searchKey, searchValue, departmentId } = req.query);
    } else if (req.method === "POST") {

      ({ searchKey, searchValue, departmentId } = req.body);
    }


    if (user_uuid && searchKey && searchValue) {
      try {
        const treatmentKitFilteredData = await treatmentkitTbl.findAll({
          where: getByFilterQuery(
            searchKey,
            searchValue,
            user_uuid,
            departmentId
          ),
          attributes: getFilterByCodeAndNameAttributes
        });
        const returnMessage =
          treatmentKitFilteredData.length > 0
            ? emr_constants.FETCHD_TREATMENT_KIT_SUCCESSFULLY
            : emr_constants.NO_RECORD_FOUND;

        let response = getFilterTreatmentKitResponse(treatmentKitFilteredData);
        let responseLength = response.length;
        if (searchKey.toLowerCase() === "treatment_kit_id") {
          response = response[0];
        }
        return res.status(200).send({
          code: httpStatus.OK,
          message: returnMessage,
          responseContents: response,
          responseLength
        });
      } catch (ex) {
        console.log("Exception happened", ex);
        return res
          .status(400)
          .send({ code: httpStatus.BAD_REQUEST, message: ex });
      }
    } else {
      return res.status(400).send({
        code: httpStatus[400],
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`
      });
    }
  };


  const _getAllTreatmentKit = async (req, res, next) => {
    try {
      const getsearch = req.body;
      let pageNo = 0;
      const itemsPerPage = getsearch.paginationSize ? getsearch.paginationSize : 10;

      let sortArr = ["tk_uuid", "DESC"];
      let sortOrder = 'DESC';
      if (getsearch.pageNo) {
        let temp = parseInt(getsearch.pageNo);
        if (temp && (temp != NaN)) {
          pageNo = temp;
        }
      }
      const offset = pageNo * itemsPerPage;
      let fieldSplitArr = [];
      if (getsearch.sortField) {
        if (getsearch.sortField == 'modified_date') {
          getsearch.sortField = 'modified_date';
        }
        fieldSplitArr = getsearch.sortField.split('.');
        if (fieldSplitArr.length == 1) {
          sortArr[0] = getsearch.sortField;
        } else {
          for (let idx = 0; idx < fieldSplitArr.length; idx++) {
            const element = fieldSplitArr[idx];
            fieldSplitArr[idx] = element.replace(/\[\/?.+?\]/ig, '');
          }
          sortArr = fieldSplitArr;
        }
      }
      if (getsearch.sortOrder && ((getsearch.sortOrder.toLowerCase() == 'asc') || (getsearch.sortOrder.toLowerCase() == 'desc'))) {
        if ((fieldSplitArr.length == 1) || (fieldSplitArr.length == 0)) {
          sortArr[1] = getsearch.sortOrder;
        } else {
          sortArr.push(getsearch.sortOrder);
        }
      }
      let findQuery = {
        subQuery: false,
        offset: offset,
        limit: itemsPerPage,
        where: { tk_status: 1, tk_is_active: 1 },
        order: [sortArr],
        attributes: { "exclude": ['id', 'createdAt', 'updatedAt'] },
        group: ['tk_uuid']

      };
      if (getsearch.search && /\S/.test(getsearch.search)) {
        findQuery.where[Op.or] = [
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_treatment_kit.tk_code')), 'LIKE', '%' + getsearch.search.toLowerCase() + '%'),
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_treatment_kit.tk_name')), 'LIKE', '%' + getsearch.search.toLowerCase() + '%'),
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_treatment_kit.u_first_name')), 'LIKE', '%' + getsearch.search.toLowerCase() + '%'),

        ];
      }
      if (req.body.codeName && /\S/.test(req.body.codeName)) {
        if (findQuery.where[Op.or]) {
          findQuery.where[Op.and] = [{
            [Op.or]: [
              Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_treatment_kit.tk_code')), 'LIKE', '%' + req.body.codeName.toLowerCase() + '%'),
              Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_treatment_kit.tk_name')), 'LIKE', '%' + req.body.codeName.toLowerCase() + '%'),
            ]
          }];
        } else {
          findQuery.where[Op.or] = [
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_treatment_kit.tk_code')), 'LIKE', '%' + req.body.codeName.toLowerCase() + '%'),
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_treatment_kit.tk_name')), 'LIKE', '%' + req.body.codeName.toLowerCase() + '%'),
          ];
        }
      }

      if (getsearch.departmentId && /\S/.test(getsearch.departmentId)) {
        if (findQuery.where[Op.or]) {
          findQuery.where[Op.and] = [{
            [Op.or]: [Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_treatment_kit.d_uuid')), getsearch.departmentId)]
          }];
        } else {
          findQuery.where[Op.or] = [
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_treatment_kit.d_uuid')), getsearch.departmentId)
          ];
        }
      }

      if (getsearch.createdBy && /\S/.test(getsearch.createdBy)) {
        if (findQuery.where[Op.or]) {
          findQuery.where[Op.and] = [{
            [Op.or]: [Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_treatment_kit.u_first_name')), 'LIKE', '%' + getsearch.createdBy.toLowerCase() + '%')]
          }];
        } else {
          findQuery.where[Op.or] = [
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_treatment_kit.u_first_name')), 'LIKE', '%' + getsearch.createdBy.toLowerCase() + '%')
          ];
        }
      }

      if (getsearch.share && /\S/.test(getsearch.share)) {
        if (findQuery.where[Op.or]) {
          findQuery.where[Op.and] = [{
            [Op.or]: [Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_treatment_kit.tk_is_public')), getsearch.share)]
          }];
        } else {
          findQuery.where[Op.or] = [
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_treatment_kit.tk_is_public')), getsearch.share)
          ];
        }
      }

      if (getsearch.hasOwnProperty('status') && /\S/.test(getsearch.status)) {
        findQuery.where['tk_is_active'] = getsearch.status;
      }

      await treatmentKitViewTbl
        .findAndCountAll(findQuery)
        .then((data) => {
          return res
            .status(httpStatus.OK)
            .json({
              statusCode: 200,
              message: "Get Details Fetched successfully",
              req: '',
              responseContents: data.rows,
              totalRecords: data.count.length ? data.count.length : data.count
            });
        })
        .catch(err => {
          return res
            .status(409)
            .json({
              statusCode: 409,
              error: err
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


  const _deleteTreatmentKit = async (req, res) => {
    const { user_uuid } = req.headers;
    const { treatmentKitId } = req.query;

    const isTreatmenKitValid = emr_utility.isNumberValid(treatmentKitId);
    const treatmentUpdateValue = {
      status: emr_constants.IS_IN_ACTIVE,
      is_active: emr_constants.IS_IN_ACTIVE,
      modified_by: user_uuid
    };
    const treatementKitUpdateQuery = {
      where: {
        treatment_kit_uuid: treatmentKitId
      }
    };
    let deleteTreatmentPromise = [];
    if (user_uuid && isTreatmenKitValid) {
      try {
        deleteTreatmentPromise = [
          ...deleteTreatmentPromise,
          treatmentkitTbl.update(treatmentUpdateValue, {
            where: { uuid: treatmentKitId }
          }),
          treatmentkitLabTbl.update(treatmentUpdateValue, treatementKitUpdateQuery), // Lab
          treatmentkitRadiologyTbl.update(treatmentUpdateValue, treatementKitUpdateQuery), // Radiology
          treatmentkitDrugTbl.update(treatmentUpdateValue, treatementKitUpdateQuery), // Drug
          treatmentkitInvestigationTbl.update(treatmentUpdateValue, treatementKitUpdateQuery), // Investigation
          treatmentKitDiagnosisTbl.update(treatmentUpdateValue, treatementKitUpdateQuery) // Diagnosis
        ];

        const deleteTreatmentKitPromise = await Promise.all(
          deleteTreatmentPromise
        );
        console.log(deleteTreatmentKitPromise[0]);

        const responseCode = deleteTreatmentKitPromise[0][0] === 1 ? httpStatus.OK : httpStatus.NO_CONTENT;
        const responseMessage = deleteTreatmentKitPromise[0][0] === 1
          ? emr_constants.TREATMENT_DELETE_SUCCESS : emr_constants.NO_RECORD_FOUND;
        return res.status(200).send({
          code: responseCode, message: responseMessage
        });
      } catch (ex) {
        console.log("Exception happened", ex);
        return res
          .status(400)
          .send({ code: httpStatus.BAD_REQUEST, message: ex });
      }
    } else {
      return res.status(400).send({
        code: httpStatus[400],
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}`
      });
    }
  };

  const _getTreatmentKitById = async (req, res) => {

    const { user_uuid } = req.headers;
    let { treatmentKitId } = req.query;

    treatmentKitId = +(treatmentKitId);
    if (user_uuid && (treatmentKitId && treatmentKitId > 0)) {
      try {

        const treatmentById = await treatmentKitAtt.getTreatmentFavByIdPromise(treatmentKitId);

        // Checking Response
        const responseCount = treatmentById && treatmentById.reduce((acc, cur) => {
          return acc + cur.length;
        }, 0);
        let favouriteList = {};
        if (responseCount > 0) {
          favouriteList = treatmentKitAtt.getTreatmentFavouritesInHumanUnderstandable(treatmentById);
        }
        const returnMessage = responseCount > 0 ? emr_constants.FETCHD_TREATMENT_KIT_SUCCESSFULLY : emr_constants.NO_RECORD_FOUND;
        return res.status(httpStatus.OK).send({
          code: httpStatus.OK,
          message: returnMessage,
          responseContents: favouriteList,
          responseContentLength: responseCount > 0 ? 1 : 0,
        });
      } catch (error) {
        console.log("Exception happened", error);
        return res
          .status(500)
          .send({ code: httpStatus.INTERNAL_SERVER_ERROR, message: error.message });

      }
    } else {
      return res.status(400).send({
        code: httpStatus[400],
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`
      });
    }
  };

  return {
    createTreatmentKit: _createTreatmentKit,
    getTreatmentKitByFilters: _getTreatmentKitByFilters,
    getAllTreatmentKit: _getAllTreatmentKit,
    deleteTreatmentKit: _deleteTreatmentKit,
    getTreatmentKitById: _getTreatmentKitById
  };
};

module.exports = TreatMent_Kit();

async function findDuplicateTreatmentKitByCodeAndName({ code, name }) {
  // checking for Duplicate
  // before creating Treatment
  return await treatmentkitTbl.findAll({
    attributes: ["code", "name", "is_active"],
    where: {
      [Op.or]: [{ code: code }, { name: name }]
    }
  });
}

function getDuplicateMsg(record) {
  return record[0].is_active
    ? emr_constants.DUPLICATE_ACTIVE_MSG
    : emr_constants.DUPLICATE_IN_ACTIVE_MSG;
}

/**
 * In treatment Kit, 5 widgets are
 * included, in that any one of the widgets is required
 * before creating treatment kit
 * this methods checks that
 * @param {*} req
 */
function checkTreatmentKit(req) {
  const { treatment_kit_lab, treatment_kit_drug } = req.body;
  const {
    treatment_kit_investigation,
    treatment_kit_radiology,
    treatment_kit_diagnosis
  } = req.body;

  return (
    !checkTreatmentKitObj(treatment_kit_lab) &&
    !checkTreatmentKitDrug(treatment_kit_drug) &&
    !checkTreatmentKitObj(treatment_kit_investigation) &&
    !checkTreatmentKitObj(treatment_kit_radiology) &&
    !checkTreatmentKitDiagnosis(treatment_kit_diagnosis)
  );
}

function checkTreatmentKitObj(kit) {
  return kit && Array.isArray(kit) && kit.length > 0;
}

function checkTreatmentKitDiagnosis(diagnosis) {
  return diagnosis && Array.isArray(diagnosis) && diagnosis.length > 0;
}

function checkTreatmentKitDrug(drug) {
  return drug && Array.isArray(drug) && drug.length > 0;
}

function getFilterTreatmentKitResponse(argument) {
  return argument.map(a => {
    return {
      treatment_kit_id: a.uuid,
      treatment_code: a.code,
      treatment_name: a.name,
      treatment_type_id: a.treatment_kit_type_uuid
    };
  });
}

function treatmentKitResponse(treatmentKitData) {
  return treatmentKitData.map(tk => {
    return {
      uuid: tk.tk_uuid,
      code: tk.tk_code,
      name: tk.tk_name,
      share: tk.tk_is_public,
      department: tk.d_name,
      department_uuid: tk.d_uuid,
      doctor_uuid: tk.u_uuid,
      createdBy: tk.u_first_name + " " + tk.u_middle_name + "" + tk.u_last_name,
      status: tk.u_status
    };
  });
}
