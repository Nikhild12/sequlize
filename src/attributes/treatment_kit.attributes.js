// Sequelizer Import
const sequelizeDb = require("../config/sequelize");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

// EMR Constants Import
const emr_constants = require("../config/constants");

// EMR Utitlize Import
const emr_utility = require("../services/utility.service");

// Get Treatment Kit List View
const treatmentKitListViewTbl = sequelizeDb.vw_treatment_kit_list;

// Get Treatment Fav Views
const vmTreatmentFavouriteDrug = sequelizeDb.vw_favourite_treatment_drug;
const vmTreatmentFavouriteDiagnosis = sequelizeDb.vw_favourite_treatment_diagnosis;
const vmTreatmentFavouriteInvesti = sequelizeDb.vw_favourite_treatment_investigation;
const vmTreatmentFavouriteRadiology = sequelizeDb.vw_favourite_treatment_radiology;
const vmTreatmentFavouriteLab = sequelizeDb.vw_favourite_treatment_lab;

// Treatment Kit Table
const treatmentkitLabTbl = sequelizeDb.treatment_kit_lab_map;
const treatmentkitRadiologyTbl = sequelizeDb.treatment_kit_radiology_map;
const treatmentkitDrugTbl = sequelizeDb.treatment_kit_drug_map;
const treatmentkitInvestigationTbl = sequelizeDb.treatment_kit_investigation_map;
const treatmentKitDiagnosisTbl = sequelizeDb.treatment_kit_diagnosis_map;

const treatmentKitAtt = [
    "u_uuid",
    "uc_first_name",
    "uc_middle_name",
    "uc_last_name",
    "um_uuid",
    "um_first_name",
    "um_middle_name",
    "um_last_name",
    "tk_uuid",
    "tk_status",
    "tk_name",
    "tk_is_public",
    "tk_code",
    "tk_is_active",
    "modified_date",
    "created_date",
    "d_uuid",
    "d_name",
    "activeactiveto",
    "activefrom",
    "description",
    'tk_facility_uuid',
    'f_name',
    'tk_share_uuid',
    's_name'
];

// Treatment Kit Common Attributes
const getTreatmentByIdInVWAtt = [
    "tk_uuid",
    "tk_code",
    "tk_name",
    "tk_treatment_kit_type_uuid",
    "tk_status",
    "tk_active",
];

// Drug Attributes
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
    "tkd_uuid"
];

// Concating Drug Attributes
gedTreatmentKitDrug = [...getTreatmentByIdInVWAtt, ...gedTreatmentKitDrug];

// Diagnosis Attribute
let getTreatmentKitDiaAtt = [
    "tkdm_diagnosis_uuid",
    "td_name",
    "td_code",
    "td_description",
    "tdkm_uuid"
];

// Concating Diagnosis
getTreatmentKitDiaAtt = [...getTreatmentByIdInVWAtt, ...getTreatmentKitDiaAtt];

// Investigation Attributes
let getTreatmentKitInvestigationAtt = [
    "tkim_test_master_uuid",
    "tm_code",
    "tm_name",
    "tm_description",
    "tkim_order_to_location_uuid",
    "tl_order_to_location_name", //30653
    "tkim_order_priority_uuid",
    "pm_profile_code",
    "pm_name",
    "pm_description",
    "tkim_profile_master_uuid",
    "tkim_uuid"
];

// Concating Investigation Attributes
getTreatmentKitInvestigationAtt = [...getTreatmentByIdInVWAtt, ...getTreatmentKitInvestigationAtt,];

// Radiology Attributes
let getTreatmentKitRadiologyAtt = [
    "tm_code",
    "tm_name",
    "tm_description",
    "tkrm_test_master_uuid",
    "tkrm_treatment_kit_uuid",
    "tkrm_order_to_location_uuid",
    "tl_order_to_location_name", //30653
    "tkrm_order_priority_uuid",
    "tkrm_profile_master_uuid",
    "pm_profile_code",
    "pm_name",
    "pm_description",
    "tkrm_uuid"
];

// Concating Radiology Attributes
getTreatmentKitRadiologyAtt = [...getTreatmentByIdInVWAtt, ...getTreatmentKitRadiologyAtt];

// Lab Attributes
let getTreatmentKitLabAtt = [
    "tm_code",
    "tm_name",
    "tm_description",
    "tklm_test_master_uuid",
    "tklm_treatment_kit_uuid",
    "tklm_order_to_location_uuid",
    "tl_order_to_location_name", //30653
    "tklm_order_priority_uuid",
    "pm_profile_code",
    "pm_name",
    "pm_description",
    "tklm_profile_master_uuid",
    "tklm_uuid"
];

// Concating Lab Attributes
getTreatmentKitLabAtt = [...getTreatmentByIdInVWAtt, ...getTreatmentKitLabAtt];

const _getTreatmentKitByIdQuery = (treatmentId, tType) => {

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

    if (["TreatmentKit"].includes(tType)) {
        delete treatmentQuery.tk_active;
        treatmentQuery.tk_is_active = emr_constants.IS_ACTIVE;
    }

    return treatmentQuery;
};
const _getTreatmentFavByIdPromise = (treatmentId) => {
    return Promise.all([

        treatmentKitListViewTbl.findAll({
            attributes: treatmentKitAtt,
            where: _getTreatmentKitByIdQuery(treatmentId, "TreatmentKit"),
        }),

        vmTreatmentFavouriteDrug.findAll({
            attributes: gedTreatmentKitDrug,
            where: _getTreatmentKitByIdQuery(treatmentId, "Drug"),
        }), // Drug Details
        vmTreatmentFavouriteDiagnosis.findAll({
            attributes: getTreatmentKitDiaAtt,
            where: _getTreatmentKitByIdQuery(treatmentId, "Diagnosis"),
        }),
        vmTreatmentFavouriteInvesti.findAll({
            attributes: getTreatmentKitInvestigationAtt,
            where: _getTreatmentKitByIdQuery(treatmentId, "Investigation"),
        }), // 
        vmTreatmentFavouriteRadiology.findAll({
            attributes: getTreatmentKitRadiologyAtt,
            where: _getTreatmentKitByIdQuery(treatmentId, "Radiology"),
        }), // Radiology
        vmTreatmentFavouriteLab.findAll({
            attributes: getTreatmentKitLabAtt,
            where: _getTreatmentKitByIdQuery(treatmentId, "Lab"),
        }), // lab
    ]);
};

const _getTreatmentFavouritesInHumanUnderstandable = (treatFav) => {
    let favouritesByIdResponse = {};

    favouritesByIdResponse = getTreatmentDetails(treatFav[0]);

    // Drug Details
    if (treatFav && treatFav.length > 0 && treatFav[1] && treatFav[1].length) {
        favouritesByIdResponse.drug_details = getDrugDetailsFromTreatment(
            treatFav[1]
        );
    }

    // Diagnosis Details
    if (treatFav && treatFav.length > 0 && treatFav[2] && treatFav[2].length) {
        favouritesByIdResponse.diagnosis_details = getDiagnosisDetailsFromTreatment(
            treatFav[2]
        );
    }

    // Investigation Details
    if (treatFav && treatFav.length > 0 && treatFav[3] && treatFav[3].length) {
        favouritesByIdResponse.investigation_details = getInvestigationDetailsFromTreatment(
            treatFav[3]
        );
    }

    // Radiology Details
    if (treatFav && treatFav.length > 0 && treatFav[4] && treatFav[4].length) {
        favouritesByIdResponse.radiology_details = getRadiologyDetailsFromTreatment(
            treatFav[4]
        );
    }

    // Lab Details
    if (treatFav && treatFav.length > 0 && treatFav[5] && treatFav[5].length) {
        favouritesByIdResponse.lab_details = getLabDetailsFromTreatment(
            treatFav[5]
        );
    }

    return favouritesByIdResponse;
};

// treatment Drug Update
const _updateDrug = (drug, uId, tkId) => {
    return updateTreatmentKit(drug, treatmentkitDrugTbl, uId, tkId, 'treatment_kit_drug_id', 'Drug');
};

// treatment Diagnosis Update
const _updateDiagnosis = (diagnosis, uId, tkId) => {
    return updateTreatmentKit(diagnosis, treatmentKitDiagnosisTbl, uId, tkId, 'treatment_kit_diagnosis_id', 'Diagnosis');
};

// treatment Lab Update
const _updateLab = (lab, uId, tkId) => {
    return updateTreatmentKit(lab, treatmentkitLabTbl, uId, tkId, 'treatment_kit_lab_id', 'Lab');
};

// treatment Radiology Update
const _updateRadiolgy = (radiology, uId, tkId) => {
    return updateTreatmentKit(radiology, treatmentkitRadiologyTbl, uId, tkId, 'treatment_kit_radiology_id', 'Radiology');
};

// treatment Investigation Update
const _updateInvestigation = (investigation, uId, tkId) => {
    return updateTreatmentKit(investigation, treatmentkitInvestigationTbl, uId, tkId, 'treatment_kit_investigation_id', 'Investigation');
};


module.exports = {
    getTreatmentFavByIdPromise: _getTreatmentFavByIdPromise,
    getTreatmentKitByIdQuery: _getTreatmentKitByIdQuery,
    getTreatmentFavouritesInHumanUnderstandable: _getTreatmentFavouritesInHumanUnderstandable,
    updateDrug: _updateDrug,
    updateDiagnosis: _updateDiagnosis,
    updateLab: _updateLab,
    updateRadiolgy: _updateRadiolgy,
    updateInvestigation: _updateInvestigation
};

// Returns Drug Details From Treatment Kit
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
            strength: d.strength,

            // treatment kit Drug
            treatment_kit_drug_id: d.tkd_uuid
        };
    });
}

// Returns Diagnosis Details From Treatment Kit
function getDiagnosisDetailsFromTreatment(diagnosisArray) {
    return diagnosisArray.map((di) => {
        return {
            diagnosis_id: di.tkdm_diagnosis_uuid,
            diagnosis_name: di.td_name,
            diagnosis_code: di.td_code,
            diagnosis_description: di.td_description,
            treatment_kit_diagnosis_id: di.tdkm_uuid
        };
    });
}

// Returns Investigation Details From Treatment Kit
function getInvestigationDetailsFromTreatment(investigationArray) {
    return investigationArray.map((iv) => {
        return {
            investigation_id: iv.tkim_test_master_uuid || iv.tkim_profile_master_uuid,
            investigation_name: iv.tm_name || iv.pm_name,
            investigation_code: iv.tm_code || iv.pm_profile_code,
            investigation_description: iv.tm_description || iv.pm_description,
            order_to_location_uuid: iv.tkim_order_to_location_uuid,
            order_to_location_name: iv.tl_order_to_location_name, //30653
            test_type: iv.tkim_test_master_uuid ? "test_master" : "profile_master",
            order_priority_uuid: iv.tkim_order_priority_uuid,
            treatment_kit_investigation_id: iv.tkim_uuid
        };
    });
}

// Returns Radiology Details From Treatment Kit
function getRadiologyDetailsFromTreatment(radiology) {
    return radiology.map((r) => {
        return {
            radiology_id: r.tkrm_test_master_uuid || r.tkrm_profile_master_uuid,
            radiology_name: r.tm_name || r.pm_name,
            radiology_code: r.tm_code || r.pm_profile_code,
            radiology_description: r.tm_description || r.pm_description,
            order_to_location_uuid: r.tkrm_order_to_location_uuid,
            order_to_location_name: r.tl_order_to_location_name, //30653
            test_type: r.tkrm_test_master_uuid ? "test_master" : "profile_master",
            order_priority_uuid: r.tkrm_order_priority_uuid,
            treatment_kit_radiology_id: r.tkrm_uuid
        };
    });
}

// Returns Lab Details From Treatment Kit
function getLabDetailsFromTreatment(lab) {
    return lab.map((l) => {
        return {
            lab_id: l.tklm_test_master_uuid || l.tklm_profile_master_uuid,
            lab_name: l.tm_name || l.pm_name,
            lab_code: l.tm_code || l.pm_profile_code,
            lab_description: l.tm_description || l.pm_description,
            order_to_location_uuid: l.tklm_order_to_location_uuid,
            order_to_location_name: l.tl_order_to_location_name, //30653
            test_type: l.tklm_test_master_uuid ? "test_master" : "profile_master",
            order_priority_uuid: l.tklm_order_priority_uuid,
            treatment_kit_lab_id: l.tklm_uuid
        };
    });
}

// Returns Treatment Kit Details
function getTreatmentDetails(treatFav) {
    // treatment Details
    return {
        treatment_name: treatFav[0].tk_name,
        treatment_code: treatFav[0].tk_code,
        treatment_id: treatFav[0].tk_uuid,
        treatment_active: treatFav[0].tk_is_active,
        treatment_created_date: treatFav[0].created_date,
        treatment_modified_date: treatFav[0].modified_date,
        treatment_is_public: treatFav[0].tk_is_public,
        department_name: treatFav[0].d_name,
        department_code: treatFav[0].d_code,
        created_by: treatFav[0].u_uuid,
        modified_by: treatFav[0].um_uuid,
        activefrom: treatFav[0].activefrom,
        activeto: treatFav[0].activeactiveto,
        description: treatFav[0].description,
        department_id: treatFav[0].d_uuid,
        facility_id:treatFav[0].tk_facility_uuid,
        facility_name:treatFav[0].f_name,
        share_id:treatFav[0].tk_share_uuid,
        share_name:treatFav[0].s_name
    };

}

function updateTreatmentKit(object, table, uId, tkId, updateColumn, tName) {
    let updateArray = [];

    // Deleting Records
    if (object.hasOwnProperty("delete") && Array.isArray(object.delete)) {
        updateArray = [...updateArray, ...deleteRecords(object.delete, table)];
    }

    // Updating Exisiting Record
    if (object.hasOwnProperty("update") && Array.isArray(object.update) && tName !== 'Diagnosis') {
        updateArray = [...updateArray, ...updateRecords(object.update, table, uId, updateColumn)];
    }

    // Creating new Record
    if (object.hasOwnProperty("create") && Array.isArray(object.create)) {
        updateArray = [...updateArray, ...createRecords(object.create, table, uId, tkId)];
    }

    return updateArray;
}

// to delete treatment Kit Multiple Records
function deleteRecords(records, table) {
    return records.map((r) => {
        return table.update(
            { status: emr_constants.IS_IN_ACTIVE, is_active: emr_constants.IS_IN_ACTIVE },
            { where: { uuid: r } }
        );
    });
}

// to update treatment Kit Multiple Records
function updateRecords(records, table, uId, columnName) {
    return records.map((r) => {
        r.modified_date = new Date();
        r.modified_by = uId;
        return table.update(r, { where: { uuid: r[columnName] } });
    });
}

// to create new treatmetn kit Multiple Records
function createRecords(records, table, uId, tkId) {
    return records.map((r) => {
        r.created_date = new Date();
        r.created_by = uId;
        r.modified_by = 0;
        r.treatment_kit_uuid = tkId;
        r.is_active = r.status = emr_constants.IS_ACTIVE;
        return table.create(r, { returning: true });
    });
}