// Package Import
const httpStatus = require("http-status");

// Sequelizer Import
const sequelizeDb = require('../config/sequelize');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

// Initialize Tick Sheet Master
const favouriteMasterTbl = sequelizeDb.favourite_master;
const favouritMasterDetailsTbl = sequelizeDb.favourite_master_details;
const vmTickSheetMasterTbl = sequelizeDb.vw_favourite_master_details;
const vmTreatmentFavourite = sequelizeDb.vw_favourite_treatment_kit;

// Get Treatment Fav Views
const vmTreatmentFavouriteDrug = sequelizeDb.vw_favourite_treatment_drug;
const vmTreatmentFavouriteDiagnosis = sequelizeDb.vw_favourite_treatment_diagnosis;
const vmTreatmentFavouriteInvesti = sequelizeDb.vw_favourite_treatment_investigation;
const vmTreatmentFavouriteRadiology = sequelizeDb.vw_favourite_treatment_radiology;
const vmTreatmentFavouriteLab = sequelizeDb.vw_favourite_treatment_lab;

// Utility Service Import
const emr_utility = require('../services/utility.service');

// Constants Import
const emr_constants = require('../config/constants');


const active_boolean = 1;
const neQuery = { [Op.ne]: null };

const duplicate_active_msg = 'Already item is available in the list';
const duplicate_in_active_msg = 'This item is Inactive! Please contact administrator';

const getFavouritesAttributes = [
    'df_name',
    'di_name',
    'tsm_userid',
    'tsm_active',
    'tsm_name',
    'tsm_uuid',
    'tsmd_uuid',
    'im_name',
    'im_uuid',
    'dr_uuid',
    'dr_code',
    'dp_name',
    'dp_uuid',
    'dp_code',
    'di_uuid',
    'di_name',
    'di_code',
    'df_uuid',
    'df_code',
    'tsm_display_order',
    'tsmd_duration',
    'tsm_favourite_type_uuid',
    'tsmd_test_master_uuid',
    'cc_name',
    'cc_code',
    'cc_uuid',
    'vm_name',
    'vm_uom',
    'tsm_status',
    'tsmd_test_master_uuid',
    'ltm_code',
    'ltm_name',
    'ltm_description',
    "tmsd_diagnosis_uuid",
    "d_name",
    "d_code",
    "d_description"
];

// Fav Treatment Kit Att
const treatmentKitAtt = [
    'fm_uuid',
    'fm_name',
    'fm_dept',
    'fm_userid',
    'fm_favourite_type_uuid',
    'fm_active',
    'fm_public',
    'fm_status',
    'tk_uuid',
    'tk_code',
    'tk_name',
    'tk_treatment_kit_type_uuid'
];

const getTreatmentByIdInVWAtt = [
    'tk_uuid',
    'tk_code',
    'tk_name',
    'tk_treatment_kit_type_uuid',
    'tk_status',
    'tk_active'
];
let gedTreatmentKitDrug = [

    'im_code',
    'im_name',
    'tkd_item_master_uuid',
    'dr_code',
    'dr_name',
    'tkd_drug_route_uuid',
    'df_code',
    'df_name',
    'df_display',
    'tkd_drug_frequency_uuid',
    'dp_code',
    'dp_name',
    'tkd_duration_period_uuid',
    'di_code',
    'di_name',
    'tkd_drug_instruction_uuid',
    'tkd_quantity',
    'tkd_duration'
];

gedTreatmentKitDrug = [...getTreatmentByIdInVWAtt, ...gedTreatmentKitDrug];

let getTreatmentKitDiaAtt = [
    'tkdm_diagnosis_uuid',
    'td_name',
    'td_code',
    'td_description'
];
getTreatmentKitDiaAtt = [...getTreatmentByIdInVWAtt, ...getTreatmentKitDiaAtt];

let getTreatmentKitInvestigationAtt = [
    'tkim_test_master_uuid',
    'tm_code',
    'tm_name',
    'tm_description'
];
getTreatmentKitInvestigationAtt = [...getTreatmentByIdInVWAtt, ...getTreatmentKitInvestigationAtt];


let getTreatmentKitRadiologyAtt = [
    'tm_code',
    'tm_name',
    'tm_description',
    'tkrm_test_master_uuid',
    'tkrm_treatment_kit_uuid'
];

getTreatmentKitRadiologyAtt = [...getTreatmentByIdInVWAtt, ...getTreatmentKitRadiologyAtt];


let getTreatmentKitLabAtt = [
    'tm_code',
    'tm_name',
    'tm_description',
    'tklm_test_master_uuid',
    'tklm_treatment_kit_uuid'
];

getTreatmentKitLabAtt = [...getTreatmentByIdInVWAtt, ...getTreatmentKitLabAtt];


function getFavouriteQuery(dept_id, user_uuid, tsmd_test_id) {

    let notNullSearchKey;
    tsmd_test_id = typeof tsmd_test_id === 'string' ? +tsmd_test_id : tsmd_test_id;
    switch (tsmd_test_id) {
        case 1:
            notNullSearchKey = 'im_name';
            break;
        case 2:
        case 3:
        case 7:
            notNullSearchKey = 'ltm_name';
            break;
        case 5:
            notNullSearchKey = 'cc_name';
            break;
        case 6:
        default:
            notNullSearchKey = 'd_name';
            break;
    }
    return {
        tsm_active: active_boolean,
        tsm_status: active_boolean,
        [notNullSearchKey]: neQuery,
        tsm_favourite_type_uuid: tsmd_test_id,
        [Op.or]: [
            { "tsm_dept": { [Op.eq]: dept_id }, "tsm_public": { [Op.eq]: 1 } }, { "tsm_userid": { [Op.eq]: user_uuid } }
        ]
    };
}

function getTreatmentQuery(dept_id, user_uuid) {
    return {
        fm_active: active_boolean,
        fm_status: active_boolean,
        fm_favourite_type_uuid: 8,
        [Op.or]: [
            { "fm_dept": { [Op.eq]: dept_id }, "fm_public": { [Op.eq]: 1 } }, { "fm_userid": { [Op.eq]: user_uuid } }
        ]
    };
}

function getTreatmentKitByIdQuery(treatmentId) {
    return {
        tk_uuid: treatmentId,
        tk_status: emr_constants.IS_ACTIVE,
        tk_active: emr_constants.IS_ACTIVE
    };
}

function getFavouriteQueryForDuplicate(dept_id, user_id, searchKey, searchvalue, fav_type_id) {


    return {
        tsm_favourite_type_uuid: fav_type_id,
        [searchKey]: searchvalue,
        tsm_status: active_boolean,
        [Op.or]: [
            { "tsm_dept": { [Op.eq]: dept_id }, "tsm_public": { [Op.eq]: active_boolean } }, { "tsm_userid": { [Op.eq]: user_id } }
        ]
    };
}

function getFavouriteById(fav_id) {
    return {
        tsm_uuid: fav_id,
        tsm_active: active_boolean,
        tsm_status: active_boolean
    };
}


const TickSheetMasterController = () => {

    /**
     * 
     * @param {*} req 
     * @param {*} res 
     */

    let favouriteTransaction;
    let favouriteTransStatus = false;

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

        if (favouriteMasterReqData && Array.isArray(favouriteMasterDetailsReqData) && favouriteMasterDetailsReqData.length > 0 && searchkey) {

            const { department_uuid } = favouriteMasterReqData;
            favouriteMasterReqData.active_from = new Date();
            favouriteMasterReqData = emr_utility.createIsActiveAndStatus(favouriteMasterReqData, user_uuid);

            try {
                favouriteTransaction = await sequelizeDb.sequelize.transaction();
                const { search_key, search_value } = getSearchValueBySearchKey(favouriteMasterDetailsReqData[0], searchkey);
                // checking for duplicate before 
                // creating a new favourite
                const checkingForSameFavourite = await vmTickSheetMasterTbl
                    .findAll({
                        attributes: getFavouritesAttributes,
                        where: getFavouriteQueryForDuplicate(department_uuid, user_uuid, search_key, search_value, favouriteMasterReqData.favourite_type_uuid)
                    });

                if (checkingForSameFavourite && checkingForSameFavourite.length > 0) {
                    const duplicate_msg = checkingForSameFavourite[0].tsm_active[0] === 1 ? duplicate_active_msg : duplicate_in_active_msg;
                    return res.status(400).send({ code: "DUPLICATE_RECORD", message: duplicate_msg });
                }

                const favouriteMasterCreatedData = await favouriteMasterTbl.create(favouriteMasterReqData, { returning: true, transaction: favouriteTransaction });
                const favouriteMasterDetailsCreatedData = await Promise.all(getFavouriteMasterDetailsWithUUID(favouritMasterDetailsTbl, favouriteMasterDetailsReqData, favouriteMasterCreatedData, user_uuid, favouriteTransaction));

                if (favouriteMasterDetailsCreatedData) {
                    // returning req data with inserted record Id
                    favouriteMasterReqData.uuid = favouriteMasterCreatedData.uuid;
                    favouriteMasterDetailsReqData.forEach((fMD, index) => {
                        fMD.uuid = favouriteMasterDetailsCreatedData[index].uuid;
                    });
                    await favouriteTransaction.commit();
                    favouriteTransStatus = true;
                    return res.status(200).send({ code: httpStatus.OK, message: "Inserted Favourite Master Successfully", responseContents: { headers: favouriteMasterReqData, details: favouriteMasterDetailsReqData } });
                }
            } catch (ex) {
                // tickSheetDebug(`Exception Happened ${ex.message}`);
                await favouriteTransaction.rollback();
                favouriteTransStatus = true;
                return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });

            }
            finally {
                if (favouriteTransaction && !favouriteTransStatus) {
                    await favouriteTransaction.rollback();
                }
            }
        } else {
            return res.status(400).send({ code: httpStatus[400], message: "No Request Body or Search key Found " });
        }
    };

    /**
     * Get All Favourites Except Treatment Kit
     * @param {*} req 
     * @param {*} res 
     */
    const _getFavourites = async (req, res) => {

        const { user_uuid } = req.headers;
        const { dept_id, fav_type_id } = req.query;

        if (user_uuid && dept_id && fav_type_id) {
            let favouriteList = [];

            try {

                const tickSheetData = await vmTickSheetMasterTbl.findAll({
                    attributes: getFavouritesAttributes,
                    where: getFavouriteQuery(dept_id, user_uuid, fav_type_id)
                });

                favouriteList = getFavouritesInList(tickSheetData);
                const returnMessage = favouriteList && favouriteList.length > 0 ? emr_constants.FETCHED_FAVOURITES_SUCCESSFULLY : emr_constants.NO_RECORD_FOUND;
                return res.status(httpStatus.OK).send({ code: httpStatus.OK, message: returnMessage, responseContents: favouriteList, responseContentLength: favouriteList.length });

            } catch (ex) {

                console.log(`Exception Happened ${ex}`);
                return res.status(400).send({ code: httpStatus[400], message: ex.message });

            }

        } else {
            return res.status(400).send({ code: httpStatus[400], message: "No Request headers or Query Param Found" });
        }


    };

    /**
     * Get Favourite By Id
     * @param {*} req 
     * @param {*} res 
     */
    const _getFavouriteById = async (req, res) => {

        const { user_uuid } = req.headers;
        const { favourite_id } = req.query;
        if (user_uuid && favourite_id) {
            try {

                const tickSheetData = await vmTickSheetMasterTbl.findAll({
                    attributes: getFavouritesAttributes,
                    where: getFavouriteById(favourite_id)
                });


                favouriteList = getFavouritesInList(tickSheetData);
                const returnMessage = favouriteList && favouriteList.length > 0 ? emr_constants.FETCHED_FAVOURITES_SUCCESSFULLY : emr_constants.NO_RECORD_FOUND;
                return res.status(httpStatus.OK).send({ code: httpStatus.OK, message: returnMessage, responseContents: favouriteList[0], responseContentLength: favouriteList.length });

            } catch (ex) {

                console.log(`Exception Happened ${ex}`);
                return res.status(400).send({ code: httpStatus[400], message: ex.message });

            }
        } else {
            return res.status(400).send({ code: httpStatus[400], message: "No Request headers or Query Param Found" });
        }

    };

    /**
     * Updating Favourite By Id
     * @param {*} req 
     * @param {*} res 
     */
    const _updateFavouriteById = async (req, res) => {
        // let favouriteTransaction;
        // let favouriteTransStatus = false;

        const { user_uuid } = req.headers;
        const favouriteMasterReqData = req.body;


        const favouriteMasterUpdateData = getFavouriteMasterUpdateData(user_uuid, favouriteMasterReqData);
        const favouriteMasterDetailsUpdateData = getFavouriteMasterDetailsUpdateData(user_uuid, favouriteMasterReqData);

        if (user_uuid && favouriteMasterReqData && favouriteMasterReqData.hasOwnProperty('favourite_id') && favouriteMasterReqData.hasOwnProperty('is_active')) {

            try {
                favouriteTransaction = await sequelizeDb.sequelize.transaction();
                const updatingRecord = await favouriteMasterTbl.findAll({
                    where: {
                        uuid: favouriteMasterReqData.favourite_id,
                        status: emr_constants.IS_ACTIVE
                    }
                });

                if (updatingRecord && updatingRecord.length === 0) {
                    return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: emr_constants.NO_CONTENT_MESSAGE });
                }

                const updatedFavouriteData = await Promise.all([
                    favouriteMasterTbl.update(favouriteMasterUpdateData, { where: { uuid: favouriteMasterReqData.favourite_id }, transaction: favouriteTransaction }),
                    favouritMasterDetailsTbl.update(favouriteMasterDetailsUpdateData, { where: { favourite_master_uuid: favouriteMasterReqData.favourite_id }, transaction: favouriteTransaction }),

                ]);
                await favouriteTransaction.commit();
                favouriteTransStatus = true;

                if (updatedFavouriteData) {
                    return res.status(200).send({ code: httpStatus.OK, message: "Updated Successfully", requestContent: favouriteMasterReqData });
                }

            } catch (ex) {

                console.log(`Exception Happened ${ex}`);
                await favouriteTransaction.rollback();
                favouriteTransaction = true;
                return res.status(400).send({ code: httpStatus[400], message: ex.message });

            }
            finally {
                if (favouriteTransaction && !favouriteTransStatus) {
                    await favouriteTransaction.rollback();
                }
            }

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

        if (favouriteId) {
            const updatedFavouriteData = { status: 0, is_active: 0, modified_by: user_uuid, modified_date: new Date() };
            try {

                const updateFavouriteAsync = await Promise.all(
                    [
                        favouriteMasterTbl.update(updatedFavouriteData, { where: { uuid: favouriteId } }),
                        favouritMasterDetailsTbl.update(updatedFavouriteData, { where: { favourite_master_uuid: favouriteId } }),
                    ]
                );

                if (updateFavouriteAsync) {
                    return res.status(200).send({ code: httpStatus.OK, message: "Deleted Successfully" });
                }

            } catch (ex) {
                return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
            }

        } else {
            return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" });
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

                const treatMentFav = await vmTreatmentFavourite.findAll(
                    {
                        attributes: treatmentKitAtt,
                        where: getTreatmentQuery(departmentId, user_uuid)
                    }
                );

                const favouriteList = getAllTreatmentFavsInReadable(treatMentFav);
                const returnMessage = treatMentFav && treatMentFav.length > 0 ? emr_constants.FETCHED_FAVOURITES_SUCCESSFULLY : emr_constants.NO_RECORD_FOUND;
                return res.status(httpStatus.OK).send({ code: httpStatus.OK, message: returnMessage, responseContents: favouriteList, responseContentLength: favouriteList.length });
            } catch (error) {

                console.log(`Exception Happened ${error}`);
                return res.status(400).send({ code: httpStatus[400], message: error.message });

            }
        } else {
            return res.status(400).send({ code: httpStatus[400], message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}` });
        }
    };

    /**
     * Get Treatment Fav By Id
     * @param {*} req 
     * @param {*} res 
     */
    const _getTreatmentFavById = async (req, res) => {
        const { user_uuid } = req.headers;
        const { treatmentId } = req.query;

        if (user_uuid && treatmentId) {
            try {
                const treatmentById = await getTreatmentFavByIdPromise(treatmentId);

                const favouriteList = getTreatmentFavouritesInHumanUnderstandable(treatmentById);
                const responseCount = treatmentById && treatmentById.reduce((acc, cur) => {
                    return acc + cur.length;
                }, 0);
                const returnMessage = responseCount > 0 ? emr_constants.FETCHED_FAVOURITES_SUCCESSFULLY : emr_constants.NO_RECORD_FOUND;
                return res.status(httpStatus.OK).send({ code: httpStatus.OK, message: returnMessage, responseContents: favouriteList, responseContentLength: responseCount > 0 ? 1 : 0 });
            } catch (ex) {
                console.log(`Exception Happened ${ex}`);
                return res.status(400).send({ code: httpStatus[400], message: ex.message });
            }
        } else {
            return res.status(400).send({ code: httpStatus[400], message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}` });
        }
    };

    return {

        createTickSheetMaster: _createTickSheetMaster,
        getFavourite: _getFavourites,
        getFavouriteById: _getFavouriteById,
        updateFavouriteById: _updateFavouriteById,
        deleteFavourite: _deleteFavourite,
        getTreatmentKitFavourite: _getTreatmentKitFavourite,
        getTreatmentFavById: _getTreatmentFavById

    };

};

module.exports = TickSheetMasterController();

function getFavouriteMasterDetailsWithUUID(detailsTbl, detailsData, masterData, reqUserUUId, favouriteTransaction) {


    let masterDetailsPromise = [];

    // Assigning tick Sheet Master Id
    // to tick sheet Master Details Id
    // creating a Promise Array to push All async 
    detailsData.forEach((mD) => {
        mD = emr_utility.assignDefaultValuesAndUUIdToObject(mD, masterData, reqUserUUId, 'favourite_master_uuid');
        masterDetailsPromise = [...masterDetailsPromise, detailsTbl.create(mD, { returning: true, transaction: favouriteTransaction })];
    });
    return masterDetailsPromise;
}

// Get Favourite API Response Model
function getFavouritesInList(fetchedData) {


    let favouriteList = [];

    fetchedData.forEach((tD) => {
        favouriteList = [...favouriteList,
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
            drug_frequency_name: tD.df_code,
            drug_period_id: tD.dp_uuid,
            drug_period_name: tD.dp_name,
            drug_period_code: tD.dp_code,
            drug_instruction_id: tD.di_uuid,
            drug_instruction_name: tD.di_name,
            drug_instruction_code: tD.di_code,
            favourite_display_order: tD.tsm_display_order,
            drug_duration: tD.tsmd_duration,
            drug_active: tD.tsm_active[0] === 1 ? true : false,

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
            diagnosis_description: tD.d_description

        }
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
        is_active: favouriteMasterReqData.is_active
    };

}

function getFavouriteMasterDetailsUpdateData(user_uuid, favouriteMasterReqData) {

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
    };

}

// To find Duplicate Before Creating Favourites
// generating query based on search key
function getSearchValueBySearchKey(details, search_key) {
    switch (search_key) {
        case 'chiefComplaints':
            return {
                search_key: 'cc_uuid',
                search_value: details.chief_complaint_uuid
            };
        case 'lab':
        case 'radiology':
        case 'investigations':
            return {
                search_key: 'tsmd_test_master_uuid',
                search_value: details.test_master_uuid
            };

        case 'diagnosis':
            return {
                search_key: 'tmsd_diagnosis_uuid',
                search_value: details.diagnosis_uuid
            };
        case 'treatment':
            return {
                search_key: 'tsmd_treatment_kit_uuid',
                search_value: details.treatment_kit_uuid
            };
        case 'drug':
        default:
            return {
                search_key: 'im_uuid',
                search_value: details.item_master_uuid
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
            favourite_type_id: t.fm_favourite_type_uuid
        };
    });
}

function getTreatmentFavouritesInHumanUnderstandable(treatFav) {
    let favouritesByIdResponse = {};

    const { name, code, id } = getTreatmentDetails(treatFav);

    // treatment Details
    favouritesByIdResponse.treatment_name = name;
    favouritesByIdResponse.treatment_code = code;
    favouritesByIdResponse.treatment_id = id;

    // Drug Details
    if (treatFav && treatFav.length > 0 && (treatFav[0] && treatFav[0].length)) {
        favouritesByIdResponse.drug_details = getDrugDetailsFromTreatment(treatFav[0]);
    }

    // Diagnosis Details
    if (treatFav && treatFav.length > 0 && (treatFav[1] && treatFav[1].length)) {
        favouritesByIdResponse.diagnosis_details = getDiagnosisDetailsFromTreatment(treatFav[1]);
    }

    // Investigation Details
    if (treatFav && treatFav.length > 0 && (treatFav[2] && treatFav[2].length)) {
        favouritesByIdResponse.investigation_details = getInvestigationDetailsFromTreatment(treatFav[2]);
    }

    // Radiology Details
    if (treatFav && treatFav.length > 0 && (treatFav[3] && treatFav[3].length)) {
        favouritesByIdResponse.radiology_details = getRadiologyDetailsFromTreatment(treatFav[3]);
    }

    // Lab Details
    if (treatFav && treatFav.length > 0 && (treatFav[4] && treatFav[4].length)) {
        favouritesByIdResponse.lab_details = getLabDetailsFromTreatment(treatFav[4]);
    }

    return favouritesByIdResponse;
}

function getDrugDetailsFromTreatment(drugArray) {
    return drugArray.map((d) => {
        return {

            // Drug Details
            drug_name: d.dr_name,
            drug_code: d.dr_code,
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
            drug_instruction_id: d.tkd_drug_instruction_uuid

        };
    });
}

function getDiagnosisDetailsFromTreatment(diagnosisArray) {
    return diagnosisArray.map((di) => {
        return {
            diagnosis_id: di.tkdm_diagnosis_uuid,
            diagnosis_name: di.td_name,
            diagnosis_code: di.td_code,
            diagnosis_description: di.td_description
        };
    });
}

function getInvestigationDetailsFromTreatment(investigationArray) {
    return investigationArray.map((iv) => {
        return {
            investigation_id: iv.tkim_test_master_uuid,
            investigation_name: iv.tm_name,
            investigation_code: iv.tm_name,
            investigation_description: iv.tm_name
        };
    });
}

function getRadiologyDetailsFromTreatment(radiology) {
    return radiology.map((r) => {
        return {
            radiology_id: r.tkrm_test_master_uuid,
            radiology_name: r.tm_name,
            radiology_code: r.tm_name,
            radiology_description: r.tm_name
        };
    });
}

function getLabDetailsFromTreatment(lab) {
    return lab.map((l) => {
        return {
            lab_id: l.tklm_test_master_uuid,
            lab_name: l.tm_name,
            lab_code: l.tm_name,
            lab_description: l.tm_name
        };
    });
}

function getTreatmentDetails(treatFav) {
    let name, code, id;
    let argLength = treatFav.length;
    while (!name) {
        const selectedArray = treatFav[argLength - 1];
        if (selectedArray && selectedArray.length > 0) {
            name = selectedArray[0].tk_name;
            code = selectedArray[0].tk_code;
            id = selectedArray[0].tk_uuid;
        }
        argLength--;
    }
    return { name, code, id };
}

function getTreatmentFavByIdPromise(treatmentId) {
    return Promise.all(
        [
            vmTreatmentFavouriteDrug.findAll({
                attributes: gedTreatmentKitDrug,
                where: getTreatmentKitByIdQuery(treatmentId)
            }), // Drug Details 
            vmTreatmentFavouriteDiagnosis.findAll({
                attributes: getTreatmentKitDiaAtt,
                where: getTreatmentKitByIdQuery(treatmentId)
            }),
            vmTreatmentFavouriteInvesti.findAll({
                attributes: getTreatmentKitInvestigationAtt,
                where: getTreatmentKitByIdQuery(treatmentId)
            }),
            vmTreatmentFavouriteRadiology.findAll({
                attributes: getTreatmentKitRadiologyAtt,
                where: getTreatmentKitByIdQuery(treatmentId)
            }),
            vmTreatmentFavouriteLab.findAll({
                attributes: getTreatmentKitLabAtt,
                where: getTreatmentKitByIdQuery(treatmentId)
            })
        ]
    );
}

