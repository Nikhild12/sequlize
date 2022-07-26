// Package Import
const httpStatus = require("http-status");

// Sequelizer Import
const sequelizeDb = require("../config/sequelize");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const _requests = require('../requests/requests');

// Lodash Import
const _ = require("lodash");

// Initialize Tick Sheet Master
const favouriteMasterTbl = sequelizeDb.favourite_master;
const favouriteTypeTbl = sequelizeDb.favourite_type;
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
const vmTreatmentFavouriteChiefComplaints = sequelizeDb.vw_favourite_treatment_chief_complaints;


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
  "df_nooftimes",
  "df_perdayquantity",
  "df_comments",
  "di_name",
  "tsm_userid",
  "tsm_active",
  "tk_uuid",
  "tk_name",
  "tk_code",
  "dm_name",
  "dm_code",
  "ss_name",
  "ss_code",
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
  "tsmd_dosage",
  "tsm_favourite_type_uuid",
  "tsmd_test_master_uuid",
  "tsmd_profile_master_uuid",
  "cc_name",
  "cc_code",
  "cc_uuid",
  "vm_name",
  "vm_uom",
  "tsm_status",
  "ltm_code",
  "ltm_name",
  "ltm_description",
  "tmsd_diagnosis_uuid",
  "d_name",
  "d_code",
  "d_description",
  "im_is_emar",
  "im_can_calculate_frequency_qty",
  "im_code",
  "im_product_type_uuid",
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
  "de_name",
  "tsm_created_date",
  "tsm_modified_date",
  "si_store_master_uuid",
  "si_is_active",
  "si_status"
];

// Fav Treatment Kit Att
const treatmentKitAtt = [
  "fm_uuid",
  "fm_name",
  "fm_dept",
  "fm_userid",
  "fm_facilityid",
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
  "tk_is_public",
  "tk_share_uuid",
  "tk_description"
];

/* Treatment Kit Drug Attributes */
let gedTreatmentKitDrug = [
  "im_code",
  "im_name",
  "im_product_type_uuid",
  "im_strength",
  "tkd_item_master_uuid",
  "dr_code",
  "dr_name",
  "tkd_drug_route_uuid",
  "df_code",
  "df_name",
  "df_display",
  "tkd_drug_frequency_uuid",
  "tkd_drug_frequency_in_take",
  "tkd_drug_remarks",
  "dp_code",
  "dp_name",
  "tkd_duration_period_uuid",
  "di_code",
  "di_name",
  "tkd_drug_instruction_uuid",
  "tkd_quantity",
  "tkd_duration",
  "tkd_dosage",
  "im_is_emar",
  "im_can_calculate_frequency_qty",
  "store_uuid",
  "tkd_uuid"
];
gedTreatmentKitDrug = [...getTreatmentByIdInVWAtt, ...gedTreatmentKitDrug];

/* Treatment Kit Diagnosis Attributes */
let getTreatmentKitDiaAtt = [
  "tkdm_diagnosis_uuid",
  "td_name",
  "td_code",
  "td_description",
];
getTreatmentKitDiaAtt = [...getTreatmentByIdInVWAtt, ...getTreatmentKitDiaAtt];

/* Treatment Kit Chief Complaints Attributes */
let getTreatmentKitCCAtt = [
  "tkccm_chief_complaint_uuid",
  "cc_name",
  "cc_code",
  "cc_description",
];
getTreatmentKitCCAtt = [...getTreatmentByIdInVWAtt, ...getTreatmentKitCCAtt];

/* Treatment Kit Investigation Attributes */
let getTreatmentKitInvestigationAtt = [
  "tkim_test_master_uuid",
  "tm_code",
  "tm_name",
  "tm_description",
  "tkim_order_to_location_uuid",
  "tkim_order_priority_uuid",
  "pm_profile_code",
  "pm_name",
  "pm_description",
  "tkim_profile_master_uuid"
];
getTreatmentKitInvestigationAtt = [...getTreatmentByIdInVWAtt, ...getTreatmentKitInvestigationAtt];

/* Treatment Kit Radiology Attributes */
let getTreatmentKitRadiologyAtt = [
  "tm_code",
  "tm_name",
  "tm_description",
  "tkrm_test_master_uuid",
  "tkrm_treatment_kit_uuid",
  "tkrm_order_to_location_uuid",
  "tkrm_order_priority_uuid",
  "tkrm_profile_master_uuid",
  "pm_profile_code",
  "pm_name",
  "pm_description"
];
getTreatmentKitRadiologyAtt = [...getTreatmentByIdInVWAtt, ...getTreatmentKitRadiologyAtt];

/* Treatment Kit Lab Attributes */
let getTreatmentKitLabAtt = [
  "tm_code",
  "tm_name",
  "tm_description",
  "tklm_test_master_uuid",
  "tklm_treatment_kit_uuid",
  "tklm_order_to_location_uuid",
  "tklm_order_priority_uuid",
  "pm_profile_code",
  "pm_name",
  "pm_description",
  "tklm_profile_master_uuid"
];
getTreatmentKitLabAtt = [...getTreatmentByIdInVWAtt, ...getTreatmentKitLabAtt];

function getFavouriteQuery(dept_id, user_uuid, tsmd_test_id, fId, sMId) {
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
  let favouriteQuery = {
    tsm_active: active_boolean,
    tsm_status: active_boolean,
    [notNullSearchKey]: neQuery,
    tsm_favourite_type_uuid: tsmd_test_id,
    [activeKey]: emr_constants.IS_ACTIVE,
    [statusKey]: emr_constants.IS_ACTIVE,
    tsm_userid: user_uuid,
    fa_uuid: fId,
    tsm_dept: dept_id
  };

  if (+(tsmd_test_id) === 1) {

    favouriteQuery.si_store_master_uuid = sMId;
    favouriteQuery.si_is_active = emr_constants.IS_ACTIVE;
    favouriteQuery.si_status = emr_constants.IS_ACTIVE;
  }
  return favouriteQuery;
}

function getTreatmentQuery(dept_id, user_uuid, facility_uuid) {
  return {
    fm_active: active_boolean,
    fm_status: active_boolean,
    fm_favourite_type_uuid: 8,
    fm_userid: user_uuid,
    fm_facilityid: facility_uuid,
    fm_dept: dept_id
  };
}

/**
 * @param {*} user_uuid user Id
 * @param {*} dId department Id
 * @param {*} fId Facility Id
 */
function getDietFavouriteQuery(user_uuid, dId, fId) {
  return {
    fm_active: active_boolean,
    fm_status: active_boolean,
    fm_favourite_type_uuid: 9,
    fm_userid: user_uuid,
    fm_dept: dId,
    fa_uuid: fId,
    dm_status: active_boolean,
    dm_is_active: active_boolean
  };
}

function getTreatmentKitByIdQuery(treatmentId, tType) {

  let treatmentQuery = {
    tk_uuid: treatmentId,
    tk_status: emr_constants.IS_ACTIVE,
    tk_active: emr_constants.IS_ACTIVE,
  };
  if (["Lab", "Investigation", "Radiology"].includes(tType)) {
    treatmentQuery = {
      ...treatmentQuery, [Op.or]: [
        {
          tm_status: { [Op.eq]: emr_constants.IS_ACTIVE },
          tm_is_active: { [Op.eq]: emr_constants.IS_ACTIVE },
        },
        {
          pm_status: { [Op.eq]: emr_constants.IS_ACTIVE },
          pm_is_active: { [Op.eq]: emr_constants.IS_ACTIVE },
        },
      ]
    };
  }

  return treatmentQuery;
}

function getFavouriteQueryForDuplicate(
  dept_id, user_id, searchKey, searchvalue,
  fav_type_id, display_order, fId
) {
  if (display_order) {
    return {
      tsm_status: active_boolean,
      tsm_favourite_type_uuid: fav_type_id,
      tsm_display_order: display_order,
      tsm_dept: { [Op.eq]: dept_id },
      tsm_userid: { [Op.eq]: user_id },
      fa_uuid: { [Op.eq]: fId },
    }
  } else {
    return {
      tsm_status: active_boolean,
      tsm_favourite_type_uuid: fav_type_id,
      [searchKey]: searchvalue,
      tsm_dept: { [Op.eq]: dept_id },
      tsm_userid: { [Op.eq]: user_id },
      fa_uuid: { [Op.eq]: fId }
    }
  }
  // return {
  //   tsm_status: active_boolean,
  //   [Op.or]: [
  //     {
  //       tsm_favourite_type_uuid: fav_type_id,
  //       [searchKey]: searchvalue,
  //       tsm_dept: { [Op.eq]: dept_id },
  //       tsm_userid: { [Op.eq]: user_id },
  //       fa_uuid: { [Op.eq]: fId }
  //     },
  //     {
  //       tsm_favourite_type_uuid: fav_type_id,
  //       tsm_display_order: display_order,
  //       tsm_dept: { [Op.eq]: dept_id },
  //       tsm_userid: { [Op.eq]: user_id },
  //       fa_uuid: { [Op.eq]: fId }
  //     }
  //   ]
  // };
}

function getDisplayOrderByFavType(fav_type_id, user_id, dept_id, fId) {
  return {
    tsm_status: active_boolean,
    tsm_favourite_type_uuid: fav_type_id,
    tsm_userid: user_id,
    tsm_dept: dept_id,
    tsm_active: active_boolean,
    fa_uuid: fId
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
      const fav_master_user_uuid = favouriteMasterReqData.user_uuid;

      favouriteMasterReqData = emr_utility.createIsActiveAndStatus(
        favouriteMasterReqData, user_uuid
      );
      favouriteMasterReqData.is_active = fav_master_active ? 1 : 0;
      favouriteMasterReqData.user_uuid = fav_master_user_uuid ? fav_master_user_uuid : favouriteMasterReqData.user_uuid;
      try {
        const { search_key, search_value } = getSearchValueBySearchKey(
          favouriteMasterDetailsReqData[0], searchkey
        );

        // checking for duplicate before
        // creating a new favourite
        const favourite_type_uuid = +(favouriteMasterReqData.favourite_type_uuid);
        const { facility_uuid } = favouriteMasterReqData;
        const checkingForSameFavourite = await vmTickSheetMasterTbl.findAll({
          attributes: getFavouritesAttributes,
          where: getFavouriteQueryForDuplicate(department_uuid, user_uuid, search_key, search_value, favourite_type_uuid, display_order, facility_uuid)
        });
        const checkingForSameFavouriteTestMaster = await vmTickSheetMasterTbl.findAll({
          attributes: getFavouritesAttributes,
          logging: console.log,
          where: getFavouriteQueryForDuplicate(department_uuid, user_uuid, search_key, search_value, favourite_type_uuid, 0, facility_uuid)
        });

        if (checkingForSameFavouriteTestMaster && checkingForSameFavouriteTestMaster.length > 0) {
          throw ({ error_type: "validation", errors: 'Data Already exists' });
        }
        if (checkingForSameFavourite && checkingForSameFavourite.length > 0) {
          const { duplicate_msg, duplicate_code, } = emr_all_favourites.favouriteDuplicateMessage(
            checkingForSameFavourite, search_key, search_value, display_order
          );

          if (duplicate_code === emr_constants.DUPLICATE_DISPLAY_ORDER) {
            let displayOrdersList = [];
            const displayOrders = await vmTickSheetMasterTbl.findAll({
              attributes: ["tsm_display_order"],
              where: getDisplayOrderByFavType(favourite_type_uuid, user_uuid, department_uuid, facility_uuid),
            });

            if (displayOrders && displayOrders.length > 0) {

              displayOrdersList = displayOrders.map((dO) => dO.tsm_display_order);
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

        if (favourite_type_uuid !== 1) {
          fmd.item_master_uuid = 0;
        }
        const favouriteMasterDetailsCreatedData = await favouritMasterDetailsTbl.create(
          fmd, { returning: true, }
        );

        if (favouriteMasterDetailsCreatedData) {
          // returning req data with inserted record Id
          favouriteMasterReqData.uuid = favouriteMasterCreatedData.uuid;
          favouriteMasterDetailsReqData[0].uuid = favouriteMasterDetailsCreatedData.uuid;
          return res.status(200).send({
            code: httpStatus.OK,
            message: "Inserted Favourite Master Successfully",
            responseContents: {
              headers: favouriteMasterReqData, details: favouriteMasterDetailsReqData
            },
          });
        }
      } catch (ex) {
        if (typeof ex.error_type != 'undefined' && ex.error_type == 'validation') {
          return res.status(400).json({ statusCode: 400, code: "validationError", message: ex.errors });
        }
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
    const { user_uuid, facility_uuid } = req.headers;
    let dept_id, fav_type_id, lab_id, store_master_uuid;

    +({ dept_id, fav_type_id, lab_id, store_master_uuid } = req.query);

    if (user_uuid && (dept_id > 0 || lab_id > 0) && fav_type_id && facility_uuid > 0) {
      fav_type_id = +fav_type_id;
      if (isNaN(fav_type_id)) {
        return res.status(400).send({
          code: httpStatus[400], message: emr_constants.PROPER_FAV_ID,
        });
      }
      if (+(fav_type_id) === 1 && !store_master_uuid) {
        return res.status(400).send({
          code: httpStatus[400], message: emr_constants.PRESCRIPTION_STORE_MASTER,
        });
      }
      let favList = [];

      try {
        const favouriteData = await getFavouritesQuery(user_uuid, fav_type_id, dept_id, lab_id, facility_uuid, store_master_uuid);

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
        message: "No Request headers or Query Param Found or Bad Request or Facility Id Not Found",
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
    const { user_uuid, facility_uuid } = req.headers;
    const favouriteMasterReqData = req.body;

    const favouriteMasterUpdateData = getFavouriteMasterUpdateData(user_uuid, favouriteMasterReqData);
    const favouriteMasterDetailsUpdateData = getFavouriteMasterDetailsUpdateData(user_uuid, favouriteMasterReqData);

    if (user_uuid && favouriteMasterReqData &&
      favouriteMasterReqData.hasOwnProperty("favourite_id") &&
      favouriteMasterReqData.hasOwnProperty("is_active") &&
      favouriteMasterReqData.hasOwnProperty("department_uuid") &&
      favouriteMasterReqData.hasOwnProperty("favourite_display_order")
    ) {
      try {
        const updatingRecord = await favouriteMasterTbl.findAll({
          where: {
            uuid: favouriteMasterReqData.favourite_id,
            status: emr_constants.IS_ACTIVE,
          },
        });
        if (updatingRecord && updatingRecord.length === 0) {
          return res.status(400)
            .send({ code: httpStatus.BAD_REQUEST, message: emr_constants.NO_CONTENT_MESSAGE });
        }
        // Checking Duplicate Display Order
        if (favouriteMasterReqData && favouriteMasterReqData.favourite_display_order) {

          const existingDisplayOrder = +(favouriteMasterReqData.favourite_display_order);
          if (existingDisplayOrder != updatingRecord[0].display_order) {
            const { department_uuid, favourite_display_order } = req.body;
            const duplicateDisplay = await favouriteMasterTbl.findAll({
              attributes: ["display_order"],
              where: {
                favourite_type_uuid: updatingRecord[0].favourite_type_uuid,
                department_uuid: department_uuid,
                facility_uuid: facility_uuid,
                display_order: favourite_display_order,
                uuid: {
                  [Op.not]: updatingRecord[0].uuid
                }
              }
            });
            if (duplicateDisplay && duplicateDisplay.length > 0) {
              return res.status(400).send({
                code: emr_constants.DUPLICATE_DISPLAY_ORDER,
                message: `Already display Order '${favourite_display_order}' has been added to your Favorite list.`,
              });
            }
          }
        }

        const updatedFavouriteData = await Promise.all([
          favouriteMasterTbl.update(favouriteMasterUpdateData, {
            where: { uuid: favouriteMasterReqData.favourite_id }
          }),
          favouritMasterDetailsTbl.update(favouriteMasterDetailsUpdateData, {
            where: { favourite_master_uuid: favouriteMasterReqData.favourite_id }
          }),
        ]);

        return res.status(200)
          .send({ code: httpStatus.OK, message: "Updated Successfully", requestContent: favouriteMasterReqData });

      } catch (ex) {
        console.log(`Exception Happened ${ex}`);
        return res
          .status(400)
          .send({ code: httpStatus[400], message: ex.message });
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
    const { user_uuid, facility_uuid } = req.headers;
    const { departmentId } = req.query;

    if (user_uuid && departmentId) {
      try {
        const treatMentFav = await vmTreatmentFavourite.findAll({
          attributes: treatmentKitAtt,
          where: getTreatmentQuery(departmentId, user_uuid, facility_uuid),
          returning: true
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
          }
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
    const { user_uuid, facility_uuid } = req.headers;
    const { departmentId } = req.query;

    if (user_uuid && departmentId) {
      try {
        const dietFav = await vmTreatmentFavouriteDiet.findAll({
          attributes: emr_attributes_diet.favouriteDietAttributes,
          where: getDietFavouriteQuery(user_uuid, departmentId, facility_uuid),
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
//Bhaskar  H30-49679 API Changes for Department based screen load
  const _getAllFavourites_old = async (req, res) => {
    try {
      const { user_uuid, facility_uuid } = req.headers;
      // Destructuring Req Body
      const { paginationSize = 10, sortOrder = 'DESC', sortField = 'modified_date' } = req.body;
      const { pageNo = 0, status = 1, department_uuid, search } = req.body;

      let findQuery = {
        offset: +(pageNo) * +(paginationSize),
        limit: +(paginationSize),
        order: [[sortField, sortOrder]],
        attributes: { exclude: ["id", "createdAt", "updatedAt"] },
        where: { }
      };

      findQuery.where['is_active'] = status == '' || status == 1 ? 1 : 0;

      if (search && /\S/.test(search)) {
        findQuery.where[Op.or] = [
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('ft_name')), 'LIKE', '%' + search.toLowerCase() + '%'),
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('u_first_name')), 'LIKE', '%' + search.toLowerCase() + '%'),
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('d_name')), 'LIKE', '%' + search.toLowerCase() + '%')
        ];
      }

      if (req.body.name && /\S/.test(req.body.name)) {
        findQuery.where['fm_name'] = {
          [Op.like]: "%" + req.body.name + "%"
        };
      }
      if (facility_uuid && /\S/.test(facility_uuid)) {
        findQuery.where['fm_facility_uuid'] = facility_uuid;
      }

      if (department_uuid && /\S/.test(department_uuid)) {
        findQuery.where['fm_department_uuid'] = department_uuid;
      }

      if (user_uuid && /\S/.test(user_uuid)) {
        findQuery.where['fm_user_uuid'] = user_uuid;
      }

      if (req.body && req.body.hasOwnProperty('favourite_type_uuid') && req.body.favourite_type_uuid) {
        req.body.favourite_type_uuid = +(req.body.favourite_type_uuid);
        if (!isNaN(req.body.favourite_type_uuid)) {
          findQuery.where['fm_favourite_type_uuid'] = req.body.favourite_type_uuid;
        }
      }

      const templateList = await vmAllFavourites.findAndCountAll(findQuery);
      return res.status(httpStatus.OK).json({
        statusCode: 200,
        req: "",
        responseContents: templateList.rows ? templateList.rows : [],
        totalRecords: templateList.count ? templateList.count : 0
      });
    } catch (ex) {
      const errorMsg = ex.errors ? ex.errors[0].message : ex.message;
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ status: "error", msg: errorMsg });
    }
  };
  //Bhaskar  H30-49679 API Changes for Department based screen load
  // H30-49697  -- getAllFavourites view replace with api to api call - jevin -- Start 
  const _getAllFavourites = async (req, res) => {
    try {
      const {  facility_uuid } = req.headers;
      // Destructuring Req Body
      const { paginationSize = 10, sortOrder = 'DESC', sortField = 'modified_date' } = req.body;
      const { pageNo = 0, status = 1, facility_id, department_uuid,favourite_type_uuid, search, user_uuid } = req.body;
      let findQuery = {
        offset: +(pageNo) * +(paginationSize),
        limit: +(paginationSize),
        order: [[sortField, sortOrder]],
        attributes: [
          ["uuid","fm_uuid"],
          ["favourite_type_uuid","fm_favourite_type_uuid"],
         //["is_public","fm_is_public"]
         ["facility_uuid","fm_facility_uuid"],
         ["department_uuid","fm_department_uuid"],
          ["user_uuid","fm_user_uuid"],["status","fm_status"],["name","fm_name"],"is_active","modified_date","created_date"],
         
        where: { status: 1, facility_uuid: facility_id ? facility_id :  facility_uuid}
      };

      findQuery.where['is_active'] = +(status);
      // if (search && /\S/.test(search)) {
      //   findQuery.where[Op.or] = [
      //     Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('ft_name')), 'LIKE', '%' + search.toLowerCase() + '%'),
      //     Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('u_first_name')), 'LIKE', '%' + search.toLowerCase() + '%'),
      //     Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('d_name')), 'LIKE', '%' + search.toLowerCase() + '%')
      //   ];
      // }
      if (req.body.name && /\S/.test(req.body.name)) {
        findQuery.where['name'] = {
          [Op.like]: "%" + req.body.name + "%"
        };
      }
      if (facility_id && /\S/.test(facility_id)) {
        findQuery.where['facility_uuid'] = facility_id;
      }

      if (department_uuid && /\S/.test(department_uuid)) {
        findQuery.where['department_uuid'] = department_uuid;
      }

      if (user_uuid && /\S/.test(user_uuid)) {
        findQuery.where['user_uuid'] = user_uuid;
      }
      if (favourite_type_uuid && req.body.hasOwnProperty('favourite_type_uuid') && req.body.favourite_type_uuid) {
        req.body.favourite_type_uuid = +(req.body.favourite_type_uuid);
        if (!isNaN(req.body.favourite_type_uuid)) {
          findQuery.where['favourite_type_uuid'] = req.body.favourite_type_uuid;
        }
      }

      let includeQuery ={
        include : [{
          model : favouriteTypeTbl,
          attributes:[['uuid','f_uuid'],['is_active','ft_is_active'],['status','ft_status']],
      }]
      }
      let templateList = await favouriteMasterTbl.findAll({...findQuery,...includeQuery})
     if(templateList && templateList.length){
      templateList=  JSON.parse(JSON.stringify(templateList))
      let facilityIds = [...new Set(templateList.map(e => e.fm_facility_uuid))];
      let departmentIds = [...new Set(templateList.map(e => e.fm_department_uuid))];
      let userIds = [...new Set(templateList.map(e => e.fm_user_uuid))];
      let facilityData = await _requests.getResults('facility/getSpecificFacilitiesByIds', req, {
        uuid: facilityIds
      });
      let facilityGroupBy  = facilityData.responseContents && facilityData.responseContents.length ? _.groupBy(facilityData.responseContents, 'uuid') : [];
      let departmentData = await _requests.getResults('department/getDepartmentsByIds',req,{
        uuid: departmentIds
      })
      let departmentGroupBy  = departmentData.responseContent && departmentData.responseContent.length ? _.groupBy(departmentData.responseContent, 'uuid') : [];
      let userData = await _requests.getResults('userProfile/getSpecificUsersByIds', req, { uuid: userIds});
      let userGroupBy  = userData.responseContents && userData.responseContents.length ? _.groupBy(userData.responseContents, 'uuid') : [];
      let salutationIds = [...new Set(userData.responseContents.map(e => e.salutation_uuid))];
      let titleData = await _requests.getResults('title/getTitleByIds', req, { titleIds: salutationIds});
      let titleGroupBy  = titleData.responseContent && titleData.responseContent.length ? _.groupBy(titleData.responseContent, 'uuid') : [];
      let finalResp = []
      templateList.forEach(ele=>{
        let newObj = JSON.parse(JSON.stringify(ele))
        delete newObj.favourite_type;
        newObj = {...newObj,...ele.favourite_type}
        // for facility data 
        newObj.f_uuid = facilityGroupBy[ele.fm_facility_uuid] && facilityGroupBy[ele.fm_facility_uuid].length ? facilityGroupBy[ele.fm_facility_uuid][0].uuid : ''
        newObj.f_name = facilityGroupBy[ele.fm_facility_uuid] && facilityGroupBy[ele.fm_facility_uuid].length ? facilityGroupBy[ele.fm_facility_uuid][0].name : ''
        newObj.f_is_active = facilityGroupBy[ele.fm_facility_uuid] && facilityGroupBy[ele.fm_facility_uuid].length ? facilityGroupBy[ele.fm_facility_uuid][0].is_active : ''
        newObj.f_status = facilityGroupBy[ele.fm_facility_uuid] && facilityGroupBy[ele.fm_facility_uuid].length ? facilityGroupBy[ele.fm_facility_uuid][0].status : ''
        // for department data
        newObj.d_uuid = departmentGroupBy[ele.fm_department_uuid] && departmentGroupBy[ele.fm_department_uuid].length ? departmentGroupBy[ele.fm_department_uuid][0].uuid : ''
        newObj.d_name = departmentGroupBy[ele.fm_department_uuid] && departmentGroupBy[ele.fm_department_uuid].length ? departmentGroupBy[ele.fm_department_uuid][0].name : ''
        // for salutation
        newObj.u_salutation_uuid = userGroupBy[ele.fm_user_uuid] && userGroupBy[ele.fm_user_uuid].length ? userGroupBy[ele.fm_user_uuid][0].salutation_uuid : ''
        // for title 
        newObj.u_salutation_name = titleGroupBy[newObj.u_salutation_uuid] && titleGroupBy[newObj.u_salutation_uuid].length ?  titleGroupBy[newObj.u_salutation_uuid][0].dr_name : ''
        // for user 
        newObj.u_first_name = userGroupBy[ele.fm_user_uuid] && userGroupBy[ele.fm_user_uuid].length ? userGroupBy[ele.fm_user_uuid][0].first_name : ''
        newObj.u_middle_name = userGroupBy[ele.fm_user_uuid] && userGroupBy[ele.fm_user_uuid].length ? userGroupBy[ele.fm_user_uuid][0].middle_name : ''
        newObj.u_last_name = userGroupBy[ele.fm_user_uuid] && userGroupBy[ele.fm_user_uuid].length ? userGroupBy[ele.fm_user_uuid][0].last_name : ''
        newObj.u_is_active = userGroupBy[ele.fm_user_uuid] && userGroupBy[ele.fm_user_uuid].length ? userGroupBy[ele.fm_user_uuid][0].is_active : ''
        newObj.u_status = userGroupBy[ele.fm_user_uuid] && userGroupBy[ele.fm_user_uuid].length ? userGroupBy[ele.fm_user_uuid][0].status : ''
        finalResp.push(newObj);
      })
      return res.status(httpStatus.OK).json({
        statusCode: 200,
        req: "",
        responseContents: finalResp && finalResp.length ? finalResp : [],
        totalRecords: finalResp.length ? finalResp.length : 0
      });
     }else {
      return res.status(httpStatus.OK).json({
        statusCode: 200,
        req: "",
        responseContents: templateList && templateList.length ? templateList : [],
        totalRecords: templateList.length ? templateList.length : 0
      });
     }
   
    } catch (ex) {
      const errorMsg = ex.errors ? ex.errors[0].message : ex.message;
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ status: "error", msg: errorMsg });
    }
  };
  //H30-49697  -- getAllFavourites view replace with api to api call - jevin -- End

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

        treatment_kit_id: tD.tk_uuid,
        treatment_kit_name: tD.tk_name,
        treatment_kit_code: tD.tk_code,

        diet_master_name: tD.dm_name,
        diet_master_code: tD.dm_code,

        speciality_sketch_name: tD.ss_name,
        speciality_sketch_code: tD.ss_code,

        favourite_details_id: tD.tsmd_uuid,
        favourite_type_id: tD.tsm_favourite_type_uuid,
        created_date: tD.tsm_created_date,
        modified_date: tD.tsm_modified_date,
        favourite_description: tD.tsm_description,
        user_uuid: tD.tsm_userid,
        facility_id: tD.fa_uuid,
        department_id: tD.de_uuid,


        // Drug Details
        drug_name: tD.im_name,
        drug_id: tD.im_uuid,
        drug_route_name: tD.dr_code,
        drug_route_id: tD.dr_uuid,
        drug_frequency_id: tD.df_uuid,
        drug_frequency_name: tD.df_name,
        drug_frequency_code: tD.df_code,
        drug_frequency_nooftimes: tD.df_nooftimes,
        drug_frequency_perdayquantity: tD.df_perdayquantity,
        drug_frequency_comments: tD.df_comments,
        drug_period_id: tD.dp_uuid,
        drug_period_name: tD.dp_name,
        drug_period_code: tD.dp_code,
        drug_instruction_id: tD.di_uuid,
        drug_instruction_name: tD.di_name,
        drug_instruction_code: tD.di_code,
        favourite_display_order: tD.tsm_display_order,
        drug_duration: tD.tsmd_duration,
        drug_dosage: tD.tsmd_dosage,
        drug_active: tD.tsm_active[0] === 1 ? true : false,
        drug_code: tD.im_code,
        drug_product_type_uuid: tD.im_product_type_uuid,
        drug_is_emar: tD.im_is_emar,
        drug_can_calculate_frequency_qty: tD.im_can_calculate_frequency_qty,
        drug_strength: tD.tsmd_strength,
        store_master_uuid: tD.si_store_master_uuid || 0,

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
    status: favouriteMasterReqData.is_active
  };
}

function getFavouriteMasterDetailsUpdateData(user_uuid, favouriteMasterReqData) {
  return {
    drug_route_uuid: favouriteMasterReqData.drug_route_id,
    drug_frequency_uuid: favouriteMasterReqData.drug_frequency_id,
    drug_product_type_uuid: favouriteMasterReqData.drug_product_type_uuid,
    dosage: favouriteMasterReqData.drug_dosage,
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
      favourite_user_uuid: t.fm_userid,
      favourite_facility_uuid: t.fm_facilityid,
      favourite_department_uuid: t.fm_dept,
      favourite_display_order: t.fm_display_order
    };
  });
}

function getTreatmentFavouritesInHumanUnderstandable(treatFav) {
  let favouritesByIdResponse = {};

  const { name, code, id, active, is_public, description, share_uuid } = getTreatmentDetails(treatFav);

  // treatment Details
  favouritesByIdResponse.treatment_name = name;
  favouritesByIdResponse.treatment_code = code;
  favouritesByIdResponse.treatment_id = id;
  favouritesByIdResponse.treatment_active = active;
  favouritesByIdResponse.treatment_is_public = is_public;
  favouritesByIdResponse.treatment_description = description;
  favouritesByIdResponse.treatment_share_uuid = share_uuid;

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

  // Chief Complaints Details // Sreeni
  if (treatFav && treatFav.length > 0 && treatFav[5] && treatFav[5].length) {
    favouritesByIdResponse.chief_complaints_details = getChiefComplaintsDetailsFromTreatment(
      treatFav[5]
    );
  }

  return favouritesByIdResponse;
}

function getDrugDetailsFromTreatment(drugArray) {
  return drugArray.map((d) => {
    return {
      tkd_uuid: d.tkd_uuid,
      // Drug Details
      drug_name: d.im_name,
      drug_code: d.im_code,
      drug_product_type_uuid: d.im_product_type_uuid,
      drug_id: d.tkd_item_master_uuid,
      drug_quantity: d.tkd_quantity,
      drug_duration: d.tkd_duration,
      drug_dosage: d.tkd_dosage,

      // Drug Route Details
      drug_route_name: d.dr_name,
      drug_route_code: d.dr_code,
      drug_route_id: d.tkd_drug_route_uuid,

      // Drug Frequency Details
      drug_frequency_name: d.df_name,
      drug_frequency_id: d.tkd_drug_frequency_uuid,
      drug_frequency_in_take: d.tkd_drug_frequency_in_take,
      drug_remarks: d.tkd_drug_remarks,
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
      strength: d.im_strength,
      is_emar: d.im_is_emar,
      im_can_calculate_frequency_qty: d.im_can_calculate_frequency_qty,
      store_uuid: d.store_uuid
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

function getChiefComplaintsDetailsFromTreatment(chiefcomplaintsArray) {
  return chiefcomplaintsArray.map((cc) => {
    return {
      chief_complaint_id: cc.tkccm_chief_complaint_uuid,
      chief_complaint_name: cc.cc_name,
      chief_complaint_code: cc.cc_code,
      chief_complaint_description: cc.cc_description,
    };
  });
}

function getInvestigationDetailsFromTreatment(investigationArray) {
  return investigationArray.map((iv) => {
    return {
      investigation_id: iv.tkim_test_master_uuid || iv.tkim_profile_master_uuid,
      investigation_name: iv.tm_name || iv.pm_name,
      investigation_code: iv.tm_code || iv.pm_profile_code,
      investigation_description: iv.tm_description || iv.pm_description,
      order_to_location_uuid: iv.tkim_order_to_location_uuid,
      test_type: iv.tkim_test_master_uuid ? "test_master" : "profile_master",
      is_profile: iv.tkim_test_master_uuid ? 0 : 1,
      order_priority_uuid: iv.tkim_order_priority_uuid
    };
  });
}

function getRadiologyDetailsFromTreatment(radiology) {
  return radiology.map((r) => {
    return {
      radiology_id: r.tkrm_test_master_uuid || r.tkrm_profile_master_uuid,
      radiology_name: r.tm_name || r.pm_name,
      radiology_code: r.tm_code || r.pm_profile_code,
      radiology_description: r.tm_description || r.pm_description,
      order_to_location_uuid: r.tkrm_order_to_location_uuid,
      test_type: r.tkrm_test_master_uuid ? "test_master" : "profile_master",
      is_profile: r.tkrm_test_master_uuid ? 0 : 1,
      order_priority_uuid: r.tkrm_order_priority_uuid
    };
  });
}

function getLabDetailsFromTreatment(lab) {
  return lab.map((l) => {
    return {
      lab_id: l.tklm_test_master_uuid || l.tklm_profile_master_uuid,
      lab_name: l.tm_name || l.pm_name,
      lab_code: l.tm_code || l.pm_profile_code,
      lab_description: l.tm_description || l.pm_description,
      order_to_location_uuid: l.tklm_order_to_location_uuid,
      test_type: l.tklm_test_master_uuid ? "test_master" : "profile_master",
      is_profile: l.tklm_test_master_uuid ? 0 : 1,
      order_priority_uuid: l.tklm_order_priority_uuid
    };
  });
}

function getTreatmentDetails(treatFav) {
  let name, code, id, active, is_public, share_uuid, description;
  let argLength = treatFav.length;
  while (!name) {
    const selectedArray = treatFav[argLength - 1];
    if (selectedArray && selectedArray.length > 0) {
      name = selectedArray[0].tk_name;
      code = selectedArray[0].tk_code;
      id = selectedArray[0].tk_uuid;
      active = selectedArray[0].tk_active;
      is_public = selectedArray[0].tk_is_public;
      share_uuid = selectedArray[0].tk_share_uuid;
      description = selectedArray[0].tk_description;
    }
    argLength--;
  }
  return { name, code, id, active, is_public, description, share_uuid };
}

function getTreatmentFavByIdPromise(treatmentId) {
  return Promise.all([
    vmTreatmentFavouriteDrug.findAll({
      attributes: gedTreatmentKitDrug,
      where: getTreatmentKitByIdQuery(treatmentId, "Drug"),
    }), // Drug Details
    vmTreatmentFavouriteDiagnosis.findAll({
      attributes: getTreatmentKitDiaAtt,
      where: getTreatmentKitByIdQuery(treatmentId, "Diagnosis"),
    }),
    vmTreatmentFavouriteInvesti.findAll({
      attributes: getTreatmentKitInvestigationAtt,
      where: getTreatmentKitByIdQuery(treatmentId, "Investigation"),
    }), // 
    vmTreatmentFavouriteRadiology.findAll({
      attributes: getTreatmentKitRadiologyAtt,
      where: getTreatmentKitByIdQuery(treatmentId, "Radiology"),
    }), // Radiology
    vmTreatmentFavouriteLab.findAll({
      attributes: getTreatmentKitLabAtt,
      where: getTreatmentKitByIdQuery(treatmentId, "Lab"),
    }), // lab
    vmTreatmentFavouriteChiefComplaints.findAll({
      attributes: getTreatmentKitCCAtt,
      where: getTreatmentKitByIdQuery(treatmentId, "ChiefComplaints"),
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
      created_date: df.fm_created_date,
      modified_date: df.fm_modified_date,
      favourite_description: df.fm_description,
      user_uuid: df.fm_userid,
      facility_id: df.fa_uuid,
      department_id: df.dp_uuid,

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

/**
 * 
 * @param {*} uId UserId
 * @param {*} fTyId Favourite Type Id
 * @param {*} dId Department Id
 * @param {*} labId Lab Id
 * @param {*} fId Facility Id
 * @param {*} sM Store Master Id
 */
const getFavouritesQuery = (uId, fTyId, dId, labId, fId, sM) => {
  if (fTyId === 3) {
    return vmFavouriteRad.findAll({
      attributes: emr_all_favourites.favouriteRadVWAttributes(),
      where: emr_all_favourites.favouriteRadVWQuery(uId, dId, fId, labId),
    });
  } else if (fTyId === 7) { // Investigation
    return vwFavouriteInvestigation.findAll({
      attributes: emr_attributes_investigation.investigationAttributes,
      where: emr_attributes_investigation.getFavouriteInvestigationQuery(uId, fTyId, dId, fId, labId),
    });
  } else if (fTyId === 10) {
    return vwSpecialitySketch.findAll({
      attributes: emr_speciality_favourite_att.getSpecialityFavouriteAtt,
      where: emr_speciality_favourite_att.getFavouriteSpecialitySketchQuery(uId, fTyId, dId, fId),
    });
  } else if (fTyId === 2) {
    return vwFavouriteLab.findAll({
      attributes: emr_all_favourites.favouriteLabVWAttributes(),
      where: emr_all_favourites.favouriteLabVWQuery(uId, dId, fId, labId),
    });
  } else if (fTyId === 9) {
    return vmTreatmentFavouriteDiet.findAll({
      attributes: emr_attributes_diet.favouriteDietAttributes,
      where: getDietFavouriteQuery(uId, dId, fId),
    });
  } else {
    return vmTickSheetMasterTbl.findAll({
      attributes: getFavouritesAttributes,
      where: getFavouriteQuery(dId, uId, fTyId, fId, sM),
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
