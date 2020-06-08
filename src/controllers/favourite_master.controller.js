// Package Import
const httpStatus = require("http-status");

// Sequelizer Import
const sequelizeDb = require("../config/sequelize");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

// Lodash Import
const _ = require("lodash");

// Initialize Tick Sheet Master
const favouriteMasterTbl = sequelizeDb.favourite_master;
const favouritMasterDetailsTbl = sequelizeDb.favourite_master_details;
const vmTickSheetMasterTbl = sequelizeDb.vw_favourite_master_details;
const vmTreatmentFavourite = sequelizeDb.vw_favourite_treatment_kit;
const specialitySketchesTbl = sequelizeDb.speciality_sketches;

// Get Treatment Fav Views
const vmTreatmentFavouriteDrug = sequelizeDb.vw_favourite_treatment_drug;
const vmTreatmentFavouriteDiagnosis = sequelizeDb.vw_favourite_treatment_diagnosis;
const vmTreatmentFavouriteInvesti = sequelizeDb.vw_favourite_treatment_investigation;
const vmTreatmentFavouriteRadiology = sequelizeDb.vw_favourite_treatment_radiology;
const vmTreatmentFavouriteLab = sequelizeDb.vw_favourite_treatment_lab;
const vmTreatmentFavouriteDiet = sequelizeDb.vw_favourite_master_diet;


const vmFavouriteRad = sequelizeDb.vw_favourite_ris;
const vwFavouriteLab = sequelizeDb.vw_favourite_lab;
const vmAllFavourites = sequelizeDb.vw_all_favourites;
const vwSpecialitySketch = sequelizeDb.vw_favourite_speciality_sketch;

const vwFavouriteInvestigation = sequelizeDb.vw_favourite_investigation;

// Utility Service Import
const emr_utility = require("../services/utility.service");

// Favourite Diet Attributes
const emr_attributes_diet = require("../attributes/favourite.diet");

// Favourite Radiology Attributes
const emr_attributes_investigation = require("../attributes/vw_favourite_investigation");

// All Favourites Attributes
const emr_all_favourites = require("../attributes/favourites");

// Speciality Sketch Attributes
const emr_speciality_favourite_att = require("../attributes/favourite_speciality_sketch.attributes");

// Constants Import
const emr_constants = require("../config/constants");

const active_boolean = 1;
const neQuery = { [Op.ne]: null };

const getFavouritesAttributes = [
  "df_name",
  "di_name",
  "tsm_userid",
  "tsm_active",
  "tsm_name",
  "tsm_uuid",
  "tsmd_uuid",
  "im_name",
  "im_uuid",
  "dr_uuid",
  "dr_code",
  "dp_name",
  "dp_uuid",
  "dp_code",
  "di_uuid",
  "di_name",
  "di_code",
  "df_uuid",
  "df_code",
  "tsm_display_order",
  "tsmd_duration",
  "tsm_favourite_type_uuid",
  "tsmd_test_master_uuid",
  "tsmd_profile_master_uuid",
  "cc_name",
  "cc_code",
  "cc_uuid",
  "vm_name",
  "vm_uom",
  "tsm_status",
  "tsmd_test_master_uuid",
  "ltm_code",
  "ltm_name",
  "ltm_description",
  "tmsd_diagnosis_uuid",
  "d_name",
  "d_code",
  "d_description",
  "im_is_emar",
  "sm_uuid",
  "sm_store_code",
  "sm_store_name",
  "tsmd_strength",
  "tsmd_treatment_kit_uuid",
  "tsmd_diet_master_uuid",
  "tsmd_speciality_sketch_uuid",
  "uct_name",
  "uc_first_name",
  "uc_middle_name",
  "uc_last_name",
  "umt_name",
  "um_first_name",
  "um_middle_name",
  "um_last_name",
  "fa_uuid",
  "fa_name",
  "de_uuid",
  "de_name"
];

// Fav Treatment Kit Att
const treatmentKitAtt = [
  "fm_uuid",
  "fm_name",
  "fm_dept",
  "fm_userid",
  "fm_favourite_type_uuid",
  "fm_active",
  "fm_public",
  "fm_status",
  "fm_display_order",
  "tk_uuid",
  "tk_code",
  "tk_name",
  "tk_treatment_kit_type_uuid",
];

const getTreatmentByIdInVWAtt = [
  "tk_uuid",
  "tk_code",
  "tk_name",
  "tk_treatment_kit_type_uuid",
  "tk_status",
  "tk_active",
];
let gedTreatmentKitDrug = [
  "im_code",
  "im_name",
  "im_strength",
  "tkd_item_master_uuid",
  "dr_code",
  "dr_name",
  "tkd_drug_route_uuid",
  "df_code",
  "df_name",
  "df_display",
  "tkd_drug_frequency_uuid",
  "dp_code",
  "dp_name",
  "tkd_duration_period_uuid",
  "di_code",
  "di_name",
  "tkd_drug_instruction_uuid",
  "tkd_quantity",
  "tkd_duration",
];

gedTreatmentKitDrug = [...getTreatmentByIdInVWAtt, ...gedTreatmentKitDrug];

let getTreatmentKitDiaAtt = [
  "tkdm_diagnosis_uuid",
  "td_name",
  "td_code",
  "td_description",
];
getTreatmentKitDiaAtt = [...getTreatmentByIdInVWAtt, ...getTreatmentKitDiaAtt];

let getTreatmentKitInvestigationAtt = [
  "tkim_test_master_uuid",
  "tm_code",
  "tm_name",
  "tm_description",
  "tkim_order_to_location_uuid"
];
getTreatmentKitInvestigationAtt = [
  ...getTreatmentByIdInVWAtt,
  ...getTreatmentKitInvestigationAtt,
];

let getTreatmentKitRadiologyAtt = [
  "tm_code",
  "tm_name",
  "tm_description",
  "tkrm_test_master_uuid",
  "tkrm_treatment_kit_uuid",
  "tkrm_order_to_location_uuid"
];

getTreatmentKitRadiologyAtt = [
  ...getTreatmentByIdInVWAtt,
  ...getTreatmentKitRadiologyAtt,
];

let getTreatmentKitLabAtt = [
  "tm_code",
  "tm_name",
  "tm_description",
  "tklm_test_master_uuid",
  "tklm_treatment_kit_uuid",
  "tklm_order_to_location_uuid"
];

getTreatmentKitLabAtt = [...getTreatmentByIdInVWAtt, ...getTreatmentKitLabAtt];

function getFavouriteQuery(dept_id, user_uuid, tsmd_test_id, isMaster) {
  let notNullSearchKey, activeKey, statusKey;
  tsmd_test_id =
    typeof tsmd_test_id === "string" ? +tsmd_test_id : tsmd_test_id;
  switch (tsmd_test_id) {
    case 1:
      notNullSearchKey = "im_name";
      activeKey = "im_is_active";
      statusKey = "im_status";
      break;
    case 2:
    case 3:
    case 7:
      notNullSearchKey = "ltm_name";
      activeKey = "ltm_is_active";
      statusKey = "ltm_status";
      break;
    case 5:
      notNullSearchKey = "cc_name";
      activeKey = "cc_is_active";
      statusKey = "cc_status";
      break;
    case 6:
    default:
      notNullSearchKey = "d_name";
      activeKey = "d_is_active";
      statusKey = "d_status";
      break;
  }
  return {
    tsm_active: active_boolean,
    tsm_status: active_boolean,
    [notNullSearchKey]: neQuery,
    tsm_favourite_type_uuid: tsmd_test_id,
    [activeKey]: emr_constants.IS_ACTIVE,
    [statusKey]: emr_constants.IS_ACTIVE,
    tsm_userid: user_uuid,
  };
}

function getTreatmentQuery(dept_id, user_uuid) {
  return {
    fm_active: active_boolean,
    fm_status: active_boolean,
    fm_favourite_type_uuid: 8,
    fm_userid: user_uuid
  };
}

function getDietFavouriteQuery(user_uuid) {
  return {
    fm_active: active_boolean,
    fm_status: active_boolean,
    fm_favourite_type_uuid: 9,
    fm_userid: user_uuid
  };
}

function getTreatmentKitByIdQuery(treatmentId) {
  return {
    tk_uuid: treatmentId,
    tk_status: emr_constants.IS_ACTIVE,
    tk_active: emr_constants.IS_ACTIVE,
  };
}

function getFavouriteQueryForDuplicate(
  dept_id,
  user_id,
  searchKey,
  searchvalue,
  fav_type_id,
  display_order
) {
  return {
    tsm_status: active_boolean,
    [Op.and]: [
      {
        [Op.or]: [
          {
            tsm_dept: { [Op.eq]: dept_id },
            tsm_public: { [Op.eq]: active_boolean },
          },
          { tsm_userid: { [Op.eq]: user_id } },
        ],
      },
      {
        [Op.or]: [
          {
            tsm_favourite_type_uuid: fav_type_id,
            [searchKey]: searchvalue,
          },
          {
            tsm_favourite_type_uuid: fav_type_id,
            tsm_display_order: display_order,
          },
        ],
      },
    ],
  };
}

function getDisplayOrderByFavType(fav_type_id, user_id, dept_id) {
  return {
    tsm_status: active_boolean,
    tsm_favourite_type_uuid: fav_type_id,
    [Op.or]: [
      {
        tsm_dept: { [Op.eq]: dept_id },
        tsm_public: { [Op.eq]: active_boolean },
      },
      { tsm_userid: { [Op.eq]: user_id } },
    ],
  };
}

function getFavouriteById(fav_id, isMaster) {
  const favouriteByIdQuery = {
    tsm_uuid: fav_id,
    tsm_active: active_boolean,
    tsm_status: active_boolean,
  };

  // If it's from Clinical Master Req
  // not including the is_active property
  if (isMaster === "true" || isMaster) {
    delete favouriteByIdQuery.tsm_active;
  }
  return favouriteByIdQuery;
}

function getFavouriteByIdQuery(fav_id, isMaster, activeKey) {
  const favouriteByIdQuery = {
    fm_uuid: fav_id,
    [activeKey]: active_boolean,
    fm_status: active_boolean,
  };
  // If it's from Clinical Master Req
  // not including the is_active property
  if (isMaster === "true") {
    delete favouriteByIdQuery[activeKey];
  }
  return favouriteByIdQuery;
}



const TickSheetMasterController = () => {
  /**
   *
   * @param {*} req
   * @param {*} res
   */

  /**
   * Create Favourite
   * @param {*} req
   * @param {*} res
   */
  const _createTickSheetMaster = async (req, res) => {
    // plucking data req body
    let favouriteMasterReqData = req.body.headers;
    let favouriteMasterDetailsReqData = req.body.details;

    const { searchkey } = req.query;
    const { user_uuid } = req.headers;

    if (
      favouriteMasterReqData && Array.isArray(favouriteMasterDetailsReqData) &&
      favouriteMasterDetailsReqData.length > 0 && searchkey
    ) {
      const { department_uuid, display_order } = favouriteMasterReqData;
      favouriteMasterReqData.active_from = new Date();
      const fav_master_active = favouriteMasterReqData.is_active;

      favouriteMasterReqData = emr_utility.createIsActiveAndStatus(
        favouriteMasterReqData, user_uuid
      );
      favouriteMasterReqData.is_active = fav_master_active ? 1 : 0;

      try {
        const { search_key, search_value } = getSearchValueBySearchKey(
          favouriteMasterDetailsReqData[0], searchkey
        );

        // checking for duplicate before
        // creating a new favourite
        const favourite_type_uuid = +(favouriteMasterReqData.favourite_type_uuid);
        const checkingForSameFavourite = await vmTickSheetMasterTbl.findAll({
          attributes: getFavouritesAttributes,
          where: getFavouriteQueryForDuplicate(
            department_uuid, user_uuid, search_key, search_value, favourite_type_uuid, display_order
          ),
        });


        if (checkingForSameFavourite && checkingForSameFavourite.length > 0) {
          const { duplicate_msg, duplicate_code, } = emr_all_favourites.favouriteDuplicateMessage(
            checkingForSameFavourite, search_key, search_value, display_order
          );

          if (duplicate_code === emr_constants.DUPLICATE_DISPLAY_ORDER) {
            let displayOrdersList = [];
            const displayOrders = await vmTickSheetMasterTbl.findAll({
              attributes: ["tsm_display_order"],
              where: getDisplayOrderByFavType(
                favourite_type_uuid, user_uuid, department_uuid
              ),
            });

            if (displayOrders && displayOrders.length > 0) {
              displayOrdersList = displayOrders.map((dO) => {
                return dO.tsm_display_order;
              });
              displayOrdersList = [...new Set(displayOrdersList)].sort((a, b) => a - b);
            }
            return res.status(400).send({
              code: duplicate_code, message: duplicate_msg, displayOrdersList,
            });
          } else {
            return res
              .status(400)
              .send({ code: duplicate_code, message: duplicate_msg });
          }
        }

        const favouriteMasterCreatedData = await favouriteMasterTbl.create(
          favouriteMasterReqData, { returning: true, }
        );

        let fmd = favouriteMasterDetailsReqData[0];
        fmd = emr_utility.assignDefaultValuesAndUUIdToObject(
          fmd, favouriteMasterCreatedData, user_uuid, "favourite_master_uuid"
        );
        const favouriteMasterDetailsCreatedData = await favouritMasterDetailsTbl.create(
          fmd, { returning: true, }
        );

        if (favouriteMasterDetailsCreatedData) {
          // returning req data with inserted record Id
          favouriteMasterReqData.uuid = favouriteMasterCreatedData.uuid;
          favouriteMasterDetailsReqData[0].uuid =
            favouriteMasterDetailsCreatedData.uuid;
          return res.status(200).send({
            code: httpStatus.OK,
            message: "Inserted Favourite Master Successfully",
            responseContents: {
              headers: favouriteMasterReqData, details: favouriteMasterDetailsReqData
            },
          });
        }
      } catch (ex) {
        favouriteTransStatus = true;
        return res
          .status(400)
          .send({ code: httpStatus.BAD_REQUEST, message: ex.message });
      }
    } else {
      return res.status(400).send({
        code: httpStatus[400],
        message: "No Request Body or Search key Found ",
      });
    }
  };

  /**
   * Get All Favourites Except Treatment Kit
   * @param {*} req
   * @param {*} res
   */
  const _getFavourites = async (req, res) => {
    const { user_uuid } = req.headers;
    let { dept_id, fav_type_id, lab_id } = req.query;

    if (user_uuid && (dept_id > 0 || lab_id > 0) && fav_type_id) {
      fav_type_id = +fav_type_id;
      if (isNaN(fav_type_id)) {
        return res.status(400).send({
          code: httpStatus[400], message: emr_constants.PROPER_FAV_ID,
        });
      }
      let favList = [];

      try {
        const favouriteData = await getFavouritesQuery(user_uuid, fav_type_id, dept_id, lab_id);

        favList = getFavouritesRes(favouriteData, fav_type_id);
        favList = _.orderBy(favList, ['favourite_display_order'], ['asc']);

        const returnMessage =
          favList && favList.length > 0
            ? emr_constants.FETCHED_FAVOURITES_SUCCESSFULLY : emr_constants.NO_RECORD_FOUND;

        return res.status(httpStatus.OK).send({
          code: httpStatus.OK, message: returnMessage,
          responseContents: favList, responseContentLength: favList.length,
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
        message: "No Request headers or Query Param Found or Bad Request ",
      });
    }
  };

  /**
   * Get Favourite By Id
   * @param {*} req
   * @param {*} res
   */
  const _getFavouriteById = async (req, res) => {
    const { user_uuid } = req.headers;
    let { favourite_id, favourite_type_id, is_master } = req.query;
    let tickSheetData;
    if (user_uuid && favourite_id) {
      try {
        if (favourite_type_id) {
          favourite_type_id = +favourite_type_id;
          if (isNaN(favourite_type_id)) {
            return res.status(400).send({ code: httpStatus[400], message: emr_constants.PROPER_FAV_ID, });
          } else {
            tickSheetData = await getFavouriteQueryById(favourite_type_id, favourite_id, is_master);
          }
        } else { // All
          tickSheetData = await vmTickSheetMasterTbl.findAll({
            attributes: getFavouritesAttributes,
            where: getFavouriteById(favourite_id, is_master),
          });
        }

        favouriteList = getFavouritesRes(tickSheetData, favourite_type_id);

        const returnMessage = favouriteList && favouriteList.length > 0
          ? emr_constants.FETCHED_FAVOURITES_SUCCESSFULLY : emr_constants.NO_RECORD_FOUND;

        return res.status(httpStatus.OK).send({
          code: httpStatus.OK, message: returnMessage,
          responseContents: favouriteList[0], responseContentLength: favouriteList.length,
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
        message: "No Request headers or Query Param Found",
      });
    }
  };

  /**
   * Updating Favourite By Id
   * @param {*} req
   * @param {*} res
   */
  const _updateFavouriteById = async (req, res) => {
    const { user_uuid } = req.headers;
    const favouriteMasterReqData = req.body;

    const favouriteMasterUpdateData = getFavouriteMasterUpdateData(
      user_uuid,
      favouriteMasterReqData
    );
    const favouriteMasterDetailsUpdateData = getFavouriteMasterDetailsUpdateData(
      user_uuid,
      favouriteMasterReqData
    );

    if (
      user_uuid &&
      favouriteMasterReqData &&
      favouriteMasterReqData.hasOwnProperty("favourite_id") &&
      favouriteMasterReqData.hasOwnProperty("is_active")
    ) {
      try {
        const updatingRecord = await favouriteMasterTbl.findAll({
          where: {
            uuid: favouriteMasterReqData.favourite_id,
            status: emr_constants.IS_ACTIVE,
          },
        });

        if (updatingRecord && updatingRecord.length === 0) {
          return res.status(400).send({
            code: httpStatus.BAD_REQUEST,
            message: emr_constants.NO_CONTENT_MESSAGE,
          });
        }

        const updatedFavouriteData = await Promise.all([
          favouriteMasterTbl.update(favouriteMasterUpdateData, {
            where: { uuid: favouriteMasterReqData.favourite_id },
          }),
          favouritMasterDetailsTbl.update(favouriteMasterDetailsUpdateData, {
            where: {
              favourite_master_uuid: favouriteMasterReqData.favourite_id,
            },
          }),
        ]);
        favouriteTransStatus = true;

        if (updatedFavouriteData) {
          return res.status(200).send({
            code: httpStatus.OK,
            message: "Updated Successfully",
            requestContent: favouriteMasterReqData,
          });
        }
      } catch (ex) {
        console.log(`Exception Happened ${ex}`);
        return res
          .status(400)
          .send({ code: httpStatus[400], message: ex.message });
      } finally {
        console.log("Finally");
      }
    } else {
      return res.status(400).send({
        code: httpStatus[400],
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}`,
      });
    }
  };

  /**
   * Soft Delete Favourite By Id
   * @param {*} req
   * @param {*} res
   */
  const _deleteFavourite = async (req, res) => {
    // plucking data req body
    const { favouriteId } = req.body;
    const { user_uuid } = req.headers;
    if (favouriteId <= 0 || isNaN(+favouriteId)) {
      return res
        .status(400)
        .send({ code: 400, message: "Please provide valid FavouriteId" });
    }

    if (favouriteId) {
      const updatedFavouriteData = {
        status: 0,
        is_active: 0,
        modified_by: user_uuid,
        modified_date: new Date(),
      };
      try {
        const updateFavouriteAsync = await Promise.all([
          favouriteMasterTbl.update(updatedFavouriteData, {
            where: { uuid: favouriteId },
          }),
          favouritMasterDetailsTbl.update(updatedFavouriteData, {
            where: { favourite_master_uuid: favouriteId },
          }),
        ]);

        const isDeleteSuccess = updateFavouriteAsync[0][0] === 1;
        const responseCode = isDeleteSuccess
          ? httpStatus.OK
          : httpStatus.NO_CONTENT;
        const responseMessage = isDeleteSuccess
          ? emr_constants.FAVOURITE_DELETED_SUCCESSFULLY
          : emr_constants.NO_RECORD_FOUND;

        return res
          .status(200)
          .send({ code: responseCode, message: responseMessage });
      } catch (ex) {
        return res
          .status(400)
          .send({ code: httpStatus.BAD_REQUEST, message: ex.message });
      }
    } else {
      return res
        .status(400)
        .send({ code: httpStatus[400], message: "No Request Body Found" });
    }
  };

  /**
   * Get All Treatment Kit Favourites
   * @param {*} req
   * @param {*} res
   */
  const _getTreatmentKitFavourite = async (req, res) => {
    const { user_uuid } = req.headers;
    const { departmentId } = req.query;

    if (user_uuid && departmentId) {
      try {
        const treatMentFav = await vmTreatmentFavourite.findAll({
          attributes: treatmentKitAtt,
          where: getTreatmentQuery(departmentId, user_uuid),
        });

        let favouriteList = getAllTreatmentFavsInReadable(treatMentFav);
        if (favouriteList && favouriteList.length > 0) {
          favouriteList = _.orderBy(favouriteList, ['favourite_display_order'], ['asc']);
        }
        const returnMessage =
          treatMentFav && treatMentFav.length > 0
            ? emr_constants.FETCHED_FAVOURITES_SUCCESSFULLY
            : emr_constants.NO_RECORD_FOUND;
        return res.status(httpStatus.OK).send({
          code: httpStatus.OK,
          message: returnMessage,
          responseContents: favouriteList,
          responseContentLength: favouriteList.length,
        });
      } catch (error) {
        console.log(`Exception Happened ${error}`);
        return res
          .status(400)
          .send({ code: httpStatus[400], message: error.message });
      }
    } else {
      return res.status(400).send({
        code: httpStatus[400],
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`,
      });
    }
  };

  /**
   * Get Treatment Fav By Id
   * @param {*} req
   * @param {*} res
   */
  const _getTreatmentFavById = async (req, res) => {
    const { user_uuid } = req.headers;
    const { treatmentId, favouriteId } = req.query;

    if (user_uuid && treatmentId && favouriteId) {
      let favouriteList;
      try {
        const treatmentById = await getTreatmentFavByIdPromise(treatmentId, favouriteId);
        const favourite_details = await favouriteMasterTbl.findAll({
          where: {
            uuid: favouriteId,
          },
        });

        const responseCount = treatmentById && treatmentById.reduce((acc, cur) => {
          return acc + cur.length;
        }, 0);
        if (responseCount > 0) {
          favouriteList = getTreatmentFavouritesInHumanUnderstandable(treatmentById, favouriteId);

          if (favourite_details && favourite_details.length > 0) {
            favouriteList.favourite_details = {
              display_order: favourite_details[0].display_order,
              favourite_id: +(favouriteId)
            };
          }
        }

        const returnMessage =
          responseCount > 0
            ? emr_constants.FETCHED_FAVOURITES_SUCCESSFULLY : emr_constants.NO_RECORD_FOUND;
        return res.status(httpStatus.OK).send({
          code: httpStatus.OK,
          message: returnMessage,
          responseContents: favouriteList,
          responseContentLength: responseCount > 0 ? 1 : 0,
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
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`,
      });
    }
  };

  const _getFavouriteDiet = async (req, res) => {
    const { user_uuid } = req.headers;
    const { departmentId } = req.query;

    if (user_uuid && departmentId) {
      try {
        const dietFav = await vmTreatmentFavouriteDiet.findAll({
          attributes: emr_attributes_diet.favouriteDietAttributes,
          where: getDietFavouriteQuery(user_uuid),
        });

        const favouriteList = getAllDietFavsInReadableFormat(dietFav);
        const returnMessage =
          dietFav && dietFav.length > 0
            ? emr_constants.FETCHED_FAVOURITES_SUCCESSFULLY
            : emr_constants.NO_RECORD_FOUND;
        return res.status(httpStatus.OK).send({
          code: httpStatus.OK,
          message: returnMessage,
          responseContents: favouriteList,
          responseContentLength: favouriteList.length,
        });
      } catch (error) {
        console.log(`Exception Happened ${error}`);
        return res
          .status(400)
          .send({ code: httpStatus[400], message: error.message });
      }
    } else {
      return res.status(400).send({
        code: httpStatus[400],
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`,
      });
    }
  };

  const _getAllFavourites_0ld = async (req, res) => {
    const { user_uuid } = req.headers;
    let { recordsPerPage, searchPageNo, searchKey, searchValue } = req.body;
    let pageNo = 0;
    let perPageRecords = 10;
    let itemsPerPage;
    if (user_uuid) {
      if (recordsPerPage) {
        let records = parseInt(recordsPerPage);
        if (records && records != NaN) {
          recordsPerPage = records;
        }
      }
      itemsPerPage = recordsPerPage ? recordsPerPage : perPageRecords;

      if (searchPageNo) {
        let temp = parseInt(searchPageNo);
        if (temp && temp != NaN) {
          pageNo = temp;
        }
      }

      const offset = pageNo * itemsPerPage;

      let findQuery = {
        offset: offset,
        limit: itemsPerPage,
        attributes: emr_all_favourites.getAllFavouritesAttributes(),
      };

      if (searchKey) {
        findQuery.where = emr_all_favourites.getSearchKeyWhere(
          searchKey,
          searchValue
        );
      }

      try {
        const allFavouritesData = await vmAllFavourites.findAndCountAll(
          findQuery
        );

        const returnMessage =
          allFavouritesData.rows && allFavouritesData.rows.length > 0
            ? emr_constants.FETCHED_FAVOURITES_SUCCESSFULLY
            : emr_constants.NO_RECORD_FOUND;
        return res.status(httpStatus.OK).send({
          code: httpStatus.OK,
          message: returnMessage,
          responseContentLength: allFavouritesData.rows.length,
          responseContents: emr_all_favourites.getFavouritesInHumanReadableFormat(
            allFavouritesData.rows
          ),
          totalRecords: allFavouritesData.count,
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
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`,
      });
    }
  };

  const _getAllFavourites = async (req, res) => {
    const { user_uuid } = req.headers;
    let getsearch = req.body;

    pageNo = 0;

    const itemsPerPage = getsearch.paginationSize
      ? getsearch.paginationSize
      : 10;
    let sortField = "modified_date";
    let sortOrder = "DESC";

    if (getsearch.pageNo) {
      let temp = parseInt(getsearch.pageNo);
      if (temp && temp != NaN) {
        pageNo = temp;
      }
    }

    if (getsearch.sortField) {
      sortField = getsearch.sortField;
    }
    if (
      getsearch.sortOrder &&
      (getsearch.sortOrder == "ASC" || getsearch.sortOrder == "DESC")
    ) {
      sortOrder = getsearch.sortOrder;
    }

    const offset = pageNo * itemsPerPage;

    let findQuery = {
      offset: offset,
      limit: itemsPerPage,
      order: [[sortField, sortOrder]],
      attributes: { exclude: ["id", "createdAt", "updatedAt"] },
      where: { is_active: 1, fm_status: 1 },
    };

    if (getsearch.search && /\S/.test(getsearch.search)) {
      findQuery.where = {
        fm_name: {
          [Op.like]: "%" + getsearch.search + "%"
        }
      };
    }
    if (getsearch.name && /\S/.test(getsearch.name)) {
      findQuery.where['fm_name'] = {
        [Op.like]: "%" + getsearch.name + "%"
      };
    }

    if (getsearch.faourite_type_uuid && /\S/.test(getsearch.fm_favourite_type_uuid)) {
      findQuery.where['fm_favourite_type_uuid'] = getsearch.template_type_uuid;

    }

    if (getsearch.hasOwnProperty('status') && /\S/.test(getsearch.status)) {
      //findQuery.where['is_active'] = getsearch.status;
      findQuery.where['fm_status'] = getsearch.status;
    }

    try {
      if (user_uuid) {
        const templateList = await vmAllFavourites.findAndCountAll(findQuery);

        return res.status(httpStatus.OK).json({
          statusCode: 200,
          req: "",
          responseContents: templateList.rows ? templateList.rows : [],
          totalRecords: templateList.count ? templateList.count : 0
        });
      } else {
        return res.status(400).send({
          code: httpStatus[400],
          message: "No Request Body or Search key Found "
        });
      }
    } catch (ex) {
      const errorMsg = ex.errors ? ex.errors[0].message : ex.message;
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ status: "error", msg: errorMsg });
    }
  };


  return {
    createTickSheetMaster: _createTickSheetMaster,
    getFavourite: _getFavourites,
    getFavouriteById: _getFavouriteById,
    updateFavouriteById: _updateFavouriteById,
    deleteFavourite: _deleteFavourite,
    getTreatmentKitFavourite: _getTreatmentKitFavourite,
    getTreatmentFavById: _getTreatmentFavById,
    getFavouriteDiet: _getFavouriteDiet,
    getAllFavourites: _getAllFavourites,
  };
};

module.exports = TickSheetMasterController();


// Get Favourite API Response Model
function getFavouritesInList(fetchedData) {
  let favouriteList = [];

  fetchedData.forEach((tD) => {
    favouriteList = [
      ...favouriteList,
      {
        favourite_id: tD.tsm_uuid,
        favourite_name: tD.tsm_name,

        favourite_details_id: tD.tsmd_uuid,

        // Drug Details
        drug_name: tD.im_name,
        drug_id: tD.im_uuid,
        drug_route_name: tD.dr_code,
        drug_route_id: tD.dr_uuid,
        drug_frequency_id: tD.df_uuid,
        drug_frequency_name: tD.df_name,
        drug_frequency_code: tD.df_code,
        drug_period_id: tD.dp_uuid,
        drug_period_name: tD.dp_name,
        drug_period_code: tD.dp_code,
        drug_instruction_id: tD.di_uuid,
        drug_instruction_name: tD.di_name,
        drug_instruction_code: tD.di_code,
        favourite_display_order: tD.tsm_display_order,
        drug_duration: tD.tsmd_duration,
        drug_active: tD.tsm_active[0] === 1 ? true : false,
        drug_is_emar: tD.im_is_emar,
        drug_strength: tD.tsmd_strength,

        // Store Master Details
        store_id: tD.sm_uuid,
        store_code: tD.sm_store_code,
        store_name: tD.sm_store_name,

        // Chief Complaints Details
        chief_complaint_id: tD.cc_uuid,
        chief_complaint_name: tD.cc_name,
        chief_complaint_code: tD.cc_code,

        // Vitals Details
        vital_master_name: tD.vm_name,
        vital_master_uom: tD.vm_uom,

        // Lab Related Details
        test_master_id: tD.tsmd_test_master_uuid,
        test_master_code: tD.ltm_code,
        test_master_name: tD.ltm_name,
        test_master_description: tD.ltm_description,

        // Diagnosis Details
        diagnosis_id: tD.tmsd_diagnosis_uuid,
        diagnosis_name: tD.d_name,
        diagnosis_code: tD.d_code,
        diagnosis_description: tD.d_description,

        // User details
        created_user_name: `${tD.uct_name ? `${tD.uct_name} ` : ''}${tD.uc_first_name}${tD.uc_last_name ? `${tD.uc_last_name} ` : ''}`,
        modified_user_name: `${tD.umt_name ? `${tD.umt_name} ` : ''}${tD.um_first_name}${tD.um_last_name ? `${tD.um_last_name} ` : ''}`,

        // Facility and Department Name
        facility_name: tD.fa_name,
        department_name: tD.de_name
      },
    ];
  });
  return favouriteList;
}

function getFavouriteMasterUpdateData(user_uuid, favouriteMasterReqData) {
  return {
    is_public: favouriteMasterReqData.is_public,
    user_uuid: user_uuid,
    department_uuid: favouriteMasterReqData.department_id,
    display_order: favouriteMasterReqData.favourite_display_order,
    modified_by: user_uuid,
    modified_date: new Date(),
    is_active: favouriteMasterReqData.is_active,
  };
}

function getFavouriteMasterDetailsUpdateData(
  user_uuid,
  favouriteMasterReqData
) {
  return {
    drug_route_uuid: favouriteMasterReqData.drug_route_id,
    drug_frequency_uuid: favouriteMasterReqData.drug_frequency_id,
    duration: favouriteMasterReqData.drug_duration,
    duration_period_uuid: favouriteMasterReqData.drug_period_id,
    drug_instruction_uuid: favouriteMasterReqData.drug_instruction_id,
    modified_by: user_uuid,
    modified_date: new Date(),
    chief_complaint_uuid: favouritMasterDetailsTbl.chief_complaint_id,
    vital_master_uuid: favouritMasterDetailsTbl.vital_master_id,
    diet_frequency_uuid: favouriteMasterReqData.diet_frequency_uuid,
    diet_category_uuid: favouriteMasterReqData.diet_category_uuid,
    quantity: favouriteMasterReqData.quantity,
    injection_room_uuid: favouriteMasterReqData.injection_room_uuid || 0
  };
}

// To find Duplicate Before Creating Favourites
// generating query based on search key
function getSearchValueBySearchKey(details, search_key) {
  switch (search_key) {
    case "chiefComplaints":
      return {
        search_key: "cc_uuid",
        search_value: details.chief_complaint_uuid,
      };
    case "lab":
    case "radiology":
    case "investigations":
      const testMasterId = +(details.test_master_uuid);
      search_key = testMasterId && testMasterId > 0 ? 'tsmd_test_master_uuid' : 'tsmd_profile_master_uuid';
      search_value = testMasterId && testMasterId > 0 ? details.test_master_uuid : details.profile_master_uuid;
      return { search_key, search_value };
    case "diagnosis":
      return {
        search_key: "tmsd_diagnosis_uuid",
        search_value: details.diagnosis_uuid,
      };
    case "treatment":
      return {
        search_key: "tsmd_treatment_kit_uuid",
        search_value: details.treatment_kit_uuid,
      };
    case "diet":
      return {
        search_key: "tsmd_diet_master_uuid",
        search_value: details.diet_master_uuid,
      };

    case "speciality":
      return {
        search_key: "tsmd_speciality_sketch_uuid",
        search_value: details.speciality_sketch_uuid,
      };
    case "drug":
    default:
      return {
        search_key: "im_uuid",
        search_value: details.item_master_uuid,
      };
  }
}

function getAllTreatmentFavsInReadable(treatFav) {
  return treatFav.map((t) => {
    return {
      favourite_id: t.fm_uuid,
      favourite_name: t.tk_name,
      treatment_kit_type_id: t.tk_treatment_kit_type_uuid,
      favourite_code: t.tk_code,
      treatment_kit_id: t.tk_uuid,
      favourite_active: t.fm_active,
      favourite_type_id: t.fm_favourite_type_uuid,
      favourite_active: t.fm_active,
      favourite_display_order: t.fm_display_order,
    };
  });
}

function getTreatmentFavouritesInHumanUnderstandable(treatFav) {
  let favouritesByIdResponse = {};

  const { name, code, id, active } = getTreatmentDetails(treatFav);

  // treatment Details
  favouritesByIdResponse.treatment_name = name;
  favouritesByIdResponse.treatment_code = code;
  favouritesByIdResponse.treatment_id = id;
  favouritesByIdResponse.treatment_active = active;

  // Drug Details
  if (treatFav && treatFav.length > 0 && treatFav[0] && treatFav[0].length) {
    favouritesByIdResponse.drug_details = getDrugDetailsFromTreatment(
      treatFav[0]
    );
  }

  // Diagnosis Details
  if (treatFav && treatFav.length > 0 && treatFav[1] && treatFav[1].length) {
    favouritesByIdResponse.diagnosis_details = getDiagnosisDetailsFromTreatment(
      treatFav[1]
    );
  }

  // Investigation Details
  if (treatFav && treatFav.length > 0 && treatFav[2] && treatFav[2].length) {
    favouritesByIdResponse.investigation_details = getInvestigationDetailsFromTreatment(
      treatFav[2]
    );
  }

  // Radiology Details
  if (treatFav && treatFav.length > 0 && treatFav[3] && treatFav[3].length) {
    favouritesByIdResponse.radiology_details = getRadiologyDetailsFromTreatment(
      treatFav[3]
    );
  }

  // Lab Details
  if (treatFav && treatFav.length > 0 && treatFav[4] && treatFav[4].length) {
    favouritesByIdResponse.lab_details = getLabDetailsFromTreatment(
      treatFav[4]
    );
  }

  return favouritesByIdResponse;
}

function getDrugDetailsFromTreatment(drugArray) {
  return drugArray.map((d) => {
    return {
      // Drug Details
      drug_name: d.im_name,
      drug_code: d.im_code,
      drug_id: d.tkd_item_master_uuid,
      drug_quantity: d.tkd_quantity,
      drug_duration: d.tkd_duration,

      // Drug Route Details
      drug_route_name: d.dr_name,
      drug_route_code: d.dr_code,
      drug_route_id: d.tkd_drug_route_uuid,

      // Drug Frequency Details
      drug_frequency_name: d.df_name,
      drug_frequency_id: d.tkd_drug_frequency_uuid,
      drug_frequency_code: d.df_code,
      drug_frequency_display: d.df_display,

      // Drug Period Details
      drug_period_name: d.dp_name,
      drug_period_id: d.tkd_duration_period_uuid,
      drug_period_code: d.dp_code,

      // Drug Instruction Details
      drug_instruction_code: d.di_code,
      drug_instruction_name: d.di_name,
      drug_instruction_id: d.tkd_drug_instruction_uuid,

      // Strength
      strength: d.strength
    };
  });
}

function getDiagnosisDetailsFromTreatment(diagnosisArray) {
  return diagnosisArray.map((di) => {
    return {
      diagnosis_id: di.tkdm_diagnosis_uuid,
      diagnosis_name: di.td_name,
      diagnosis_code: di.td_code,
      diagnosis_description: di.td_description,
    };
  });
}

function getInvestigationDetailsFromTreatment(investigationArray) {
  return investigationArray.map((iv) => {
    return {
      investigation_id: iv.tkim_test_master_uuid,
      investigation_name: iv.tm_name,
      investigation_code: iv.tm_name,
      investigation_description: iv.tm_name,
      order_to_location_uuid: iv.tkim_order_to_location_uuid,
    };
  });
}

function getRadiologyDetailsFromTreatment(radiology) {
  return radiology.map((r) => {
    return {
      radiology_id: r.tkrm_test_master_uuid,
      radiology_name: r.tm_name,
      radiology_code: r.tm_name,
      radiology_description: r.tm_name,
      order_to_location_uuid: r.tkrm_order_to_location_uuid
    };
  });
}

function getLabDetailsFromTreatment(lab) {
  return lab.map((l) => {
    return {
      lab_id: l.tklm_test_master_uuid,
      lab_name: l.tm_name,
      lab_code: l.tm_name,
      lab_description: l.tm_name,
      order_to_location_uuid: l.tklm_order_to_location_uuid
    };
  });
}

function getTreatmentDetails(treatFav) {
  let name, code, id, active;
  let argLength = treatFav.length;
  while (!name) {
    const selectedArray = treatFav[argLength - 1];
    if (selectedArray && selectedArray.length > 0) {
      name = selectedArray[0].tk_name;
      code = selectedArray[0].tk_code;
      id = selectedArray[0].tk_uuid;
      active = selectedArray[0].tk_active;
    }
    argLength--;
  }
  return { name, code, id, active };
}

function getTreatmentFavByIdPromise(treatmentId, favouriteId) {
  return Promise.all([
    vmTreatmentFavouriteDrug.findAll({
      attributes: gedTreatmentKitDrug,
      where: getTreatmentKitByIdQuery(treatmentId),
    }), // Drug Details
    vmTreatmentFavouriteDiagnosis.findAll({
      attributes: getTreatmentKitDiaAtt,
      where: getTreatmentKitByIdQuery(treatmentId),
    }),
    vmTreatmentFavouriteInvesti.findAll({
      attributes: getTreatmentKitInvestigationAtt,
      where: getTreatmentKitByIdQuery(treatmentId),
    }),
    vmTreatmentFavouriteRadiology.findAll({
      attributes: getTreatmentKitRadiologyAtt,
      where: getTreatmentKitByIdQuery(treatmentId),
    }),
    vmTreatmentFavouriteLab.findAll({
      attributes: getTreatmentKitLabAtt,
      where: getTreatmentKitByIdQuery(treatmentId),
    }),
  ]);
}

function getAllDietFavsInReadableFormat(dietFav) {
  return dietFav.map((df) => {
    return {
      favourite_id: df.fm_uuid,
      favourite_name: df.tk_name,
      favourite_code: df.tk_code,
      favourite_active: df.fm_active,
      favourite_type_id: df.fm_favourite_type_uuid,
      favourite_active: df.fm_active,
      favourite_display_order: df.fm_display_order,
      department_id: df.fm_dept,

      // Diet Master
      diet_master_id: df.fmd_diet_master_uuid,
      diet_master_name: df.dm_name,
      diet_master_code: df.dm_code,
      diet_quantity: df.fmd_quantity,

      // Diet Frequency
      diet_frequency_id: df.fmd_diet_frequency_uuid,
      diet_frequency_name: df.df_name,
      diet_frequency_code: df.df_code,

      // Diet Category
      diet_category_id: df.fmd_diet_category_uuid,
      diet_category_name: df.dc_name,
      diet_category_code: df.dc_code,
    };
  });
}



const getFavouritesQuery = (uId, fTyId, dId, labId) => {
  if (fTyId === 3) {
    return vmFavouriteRad.findAll({
      attributes: emr_all_favourites.favouriteRadVWAttributes(),
      where: emr_all_favourites.favouriteRadVWQuery(uId, fTyId),
    });
  } else if (fTyId === 7) { // Investigation
    return vwFavouriteInvestigation.findAll({
      attributes: emr_attributes_investigation.investigationAttributes,
      where: emr_attributes_investigation.getFavouriteInvestigationQuery(uId, fTyId),
    });
  } else if (fTyId === 10) {
    return vwSpecialitySketch.findAll({
      attributes: emr_speciality_favourite_att.getSpecialityFavouriteAtt,
      where: emr_speciality_favourite_att.getFavouriteSpecialitySketchQuery(uId, fTyId),
    });
  } else if (fTyId === 2) {
    return vwFavouriteLab.findAll({
      attributes: emr_all_favourites.favouriteLabVWAttributes(),
      where: emr_all_favourites.favouriteLabVWQuery(uId, dId, labId),
    });
  } else if (fTyId === 9) {
    return vmTreatmentFavouriteDiet.findAll({
      attributes: emr_attributes_diet.favouriteDietAttributes,
      where: getDietFavouriteQuery(uId),
    });
  } else {
    return vmTickSheetMasterTbl.findAll({
      attributes: getFavouritesAttributes,
      where: getFavouriteQuery(dId, uId, fTyId),
      order: [["tsm_display_order", "ASC"]],
    });
  }
};

const getFavouritesRes = (favData, fTypeId) => {
  if (fTypeId === 3) {
    return emr_all_favourites.favouriteRadResponse(favData);
  } else if (fTypeId === 7) {
    return emr_attributes_investigation.getInvestigationResponse(favData);
  } else if (fTypeId === 10) {
    return emr_speciality_favourite_att.getSpecialitySketchFavouriteRes(favData);
  } else if (fTypeId === 2) {
    return emr_all_favourites.favouriteLabResponse(favData);
  } else if (fTypeId === 9) {
    return getAllDietFavsInReadableFormat(favData);
  } else {
    return getFavouritesInList(favData);
  }
};


const getFavouriteQueryById = async (fTypeId, fId, is_master) => {

  if (fTypeId === 9) { // Diet
    return vmTreatmentFavouriteDiet.findAll({
      attributes: emr_attributes_diet.favouriteDietAttributes,
      where: getFavouriteByIdQuery(fId, is_master, "fm_active")
    });
  } else if (fTypeId === 3) { // Radiology
    return vmFavouriteRad.findAll({
      attributes: emr_all_favourites.favouriteRadVWAttributes(),
      where: getFavouriteByIdQuery(fId, is_master, "fm_is_active")
    });
  } else if (fTypeId === 7) { // Investigation
    return vwFavouriteInvestigation.findAll({
      attributes: emr_attributes_investigation.investigationAttributes,
      where: getFavouriteByIdQuery(fId, is_master, "fm_active")
    });
  } else if (fTypeId === 2) { // Lab
    return vwFavouriteLab.findAll({
      attributes: emr_all_favourites.favouriteLabVWAttributes(),
      where: getFavouriteByIdQuery(fId, is_master, "fm_is_active")
    });
  } else if (fTypeId === 10) { // Speciality Sketch
    return vwSpecialitySketch.findAll({
      attributes: emr_speciality_favourite_att.getSpecialityFavouriteAtt,
      where: getFavouriteByIdQuery(fId, is_master, "fm_is_active"),
    });

  } else { // All
    return vmTickSheetMasterTbl.findAll({
      attributes: getFavouritesAttributes,
      where: getFavouriteById(fId, is_master),
    });
  }
};

