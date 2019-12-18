// Package Import
const httpStatus = require("http-status");
// const tickSheetDebug = require('debug')('app:favourite');

// Sequelizer Import
const sequelizeDb = require('../config/sequelize');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

// Initialize Tick Sheet Master
const favouriteMasterTbl = sequelizeDb.favourite_master;
const favouritMasterDetailsTbl = sequelizeDb.favourite_master_details;
const vmTickSheetMasterTbl = sequelizeDb.vw_favourite_master_details;

const favourite_clinical_type_id = 1;

const active_boolean = 1;
const in_active_boolean = 0;
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
            notNullSearchKey = 'd_name';
            break;
        default:
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
    }
}

function getFavouriteQueryForDuplicate(dept_id, user_id, searchKey, searchvalue, fav_type_id) {

    return {
        tsm_favourite_type_uuid: fav_type_id,
        [searchKey]: searchvalue,
        tsm_status: active_boolean,
        [Op.or]: [
            { "tsm_dept": { [Op.eq]: dept_id }, "tsm_public": { [Op.eq]: active_boolean } }, { "tsm_userid": { [Op.eq]: user_id } }
        ]
    }
}

function getFavouriteById(fav_id) {
    return {
        tsm_uuid: fav_id,
        tsm_active: active_boolean
    }
}


const TickSheetMasterController = () => {

    /**
     * 
     * @param {*} req 
     * @param {*} res 
     */

    const _createTickSheetMaster = async (req, res) => {

        // plucking data req body
        const favouriteMasterReqData = req.body.headers;
        const favouriteMasterDetailsReqData = req.body.details;

        const { searchkey } = req.query;
        const { user_uuid } = req.headers;
        const { department_uuid } = favouriteMasterReqData;

        if (favouriteMasterReqData && favouriteMasterDetailsReqData.length > 0 && searchkey) {

            favouriteMasterReqData.created_by = favouriteMasterReqData.user_uuid = favouriteMasterReqData.modified_by = user_uuid;
            favouriteMasterReqData.created_date = favouriteMasterReqData.modified_date = new Date();
            favouriteMasterReqData.active_from = favouriteMasterReqData.active_to = new Date();
            favouriteMasterReqData.is_active = favouriteMasterReqData.status = true;

            try {

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

                const favouriteMasterCreatedData = await favouriteMasterTbl.create(favouriteMasterReqData, { returning: true });
                const favouriteMasterDetailsCreatedData = await Promise.all(getFavouriteMasterDetailsWithUUID(favouritMasterDetailsTbl, favouriteMasterDetailsReqData, favouriteMasterCreatedData, user_uuid));

                if (favouriteMasterDetailsCreatedData) {

                    // returning req data with inserted record Id
                    favouriteMasterReqData.uuid = favouriteMasterCreatedData.uuid;
                    favouriteMasterDetailsReqData.forEach((fMD, index) => {
                        fMD.uuid = favouriteMasterDetailsCreatedData[index].uuid;
                    });

                    return res.status(200).send({ code: httpStatus.OK, message: "Inserted Favourite Master Successfully", responseContents: { headers: favouriteMasterReqData, details: favouriteMasterDetailsReqData } });
                }
            } catch (ex) {

                // tickSheetDebug(`Exception Happened ${ex.message}`);
                return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });

            }
        } else {
            return res.status(400).send({ code: httpStatus[400], message: "No Request Body or Search key Found " });
        }
    }

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
                return res.status(httpStatus.OK).send(favouriteList);

            } catch (ex) {

                console.log(`Exception Happened ${ex}`);
                return res.status(400).send({ code: httpStatus[400], message: ex.message });

            }

        } else {
            return res.status(400).send({ code: httpStatus[400], message: "No Request headers or Query Param Found" });
        }


    }

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
                return res.status(httpStatus.OK).send(favouriteList[0]);

            } catch (ex) {

                console.log(`Exception Happened ${ex}`);
                return res.status(400).send({ code: httpStatus[400], message: ex.message });

            }
        } else {
            return res.status(400).send({ code: httpStatus[400], message: "No Request headers or Query Param Found" });
        }

    }

    const _updateFavouriteById = async (req, res) => {

        const { user_uuid } = req.headers;
        const favouriteMasterReqData = req.body;

        const favouriteMasterUpdateData = getFavouriteMasterUpdateData(user_uuid, favouriteMasterReqData);
        const favouriteMasterDetailsUpdateData = getFavouriteMasterDetailsUpdateData(user_uuid, favouriteMasterReqData);

        if (user_uuid && favouriteMasterReqData) {

            try {

                const updatedFavouriteData = await Promise.all([
                    favouriteMasterTbl.update(favouriteMasterUpdateData, { where: { uuid: favouriteMasterReqData.favourite_id } }),
                    favouritMasterDetailsTbl.update(favouriteMasterDetailsUpdateData, { where: { favourite_master_uuid: favouriteMasterReqData.favourite_id } }),
                ]);

                if (updatedFavouriteData) {
                    return res.status(200).send({ code: httpStatus.OK, message: "Updated Successfully", requestContent: favouriteMasterReqData });
                }

            } catch (ex) {

                console.log(`Exception Happened ${ex}`);
                return res.status(400).send({ code: httpStatus[400], message: ex.message });

            }

        } else {
            return res.status(400).send({ code: httpStatus[400], message: "No Request headers or Body Found" });
        }
    }

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

    }

    return {

        createTickSheetMaster: _createTickSheetMaster,
        getFavourite: _getFavourites,
        getFavouriteById: _getFavouriteById,
        updateFavouriteById: _updateFavouriteById,
        deleteFavourite: _deleteFavourite

    }

}

module.exports = TickSheetMasterController();

function getFavouriteMasterDetailsWithUUID(detailsTbl, detailsData, masterData, reqUserUUId) {


    let masterDetailsPromise = [];

    // Assigning tick Sheet Master Id
    // to tick sheet Master Details Id
    // creating a Promise Array to push All async 
    detailsData.forEach((mD) => {

        mD.favourite_master_uuid = masterData.uuid;
        mD.created_by = mD.modified_by = reqUserUUId;
        mD.created_date = mD.modified_date = new Date();
        mD.is_active = mD.status = true;
        masterDetailsPromise = [...masterDetailsPromise,
        detailsTbl.create(mD, { returning: true })
        ];

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
            }
        case 'lab':
        case 'radiology':
        case 'investigations':
            return {
                search_key: 'tsmd_test_master_uuid',
                search_value: details.test_master_uuid
            }

        case 'diagnosis':
            return {
                search_key: 'tmsd_diagnosis_uuid',
                search_value: details.diagnosis_uuid
            }
        case 'drug':
        default:
            return {
                search_key: 'im_uuid',
                search_value: details.item_master_uuid
            }
    }
}
