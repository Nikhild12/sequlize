module.exports = Object.freeze({
    IS_ACTIVE: 1,
    IS_IN_ACTIVE: 0,
    NO: 'No',
    OR: 'or',
    FOUND: 'Found',
    NO_USER_ID: 'User Id',
    NO_REQUEST_BODY: 'Request Body',
    NO_REQUEST_PARAM: 'Request Param',
    DUPLICATE_ENTRIES: 'Duplicate Entries',
    DUPLICATE_ENTRIE: 'DUPLICATE ENTRIES',
    DUPLICATE_ENCOUNTER: 'Already Encounter Exists For the same Patient',
    NO_RECORD_FOUND: 'Sorry! No Record Found',
    EMR_FETCHED_SUCCESSFULLY: 'Fetched EMR Workflow Successfully',
    DUPLICATE_RECORD: 'Duplicate Record',
    GIVEN_USER_UUID: 'for the given user_uuid',
    SEND_PROPER_REQUEST: 'Send Proper Request Body',
    I_E_NUMBER_ARRAY: 'i.e. number array',
    UPDATE_EMR_HIS_SET_SUC: "Updated EMR History Settings Successfully",
    DUPLICATE_ACTIVE_MSG: 'Already item is available in the list',
    DUPLICATE_IN_ACTIVE_MSG: 'This item is Inactive! Please contact administrator',
    TREATMENT_SUCCESS: 'Treatment Kit Successfully Inserted',

    GetpleaseProvideMsg: function (columnname) {
        let returnProvideMsg = 'Please provide';
        switch (columnname) {
            case 'facility_uuid':
                return `${returnProvideMsg} Facility Id`;
            case 'department_uuid':
                return `${returnProvideMsg} Department Id`;
            case 'role_uuid':
                return `${returnProvideMsg} Role Id`;
            case 'context_uuid':
                return `${returnProvideMsg} Context Id`;
            case 'activity_uuid':
                return `${returnProvideMsg} Activity Id`;
            case 'context_activity_map_uuid':
                return `${returnProvideMsg} Context Activity Map Id`;
            case 'history_view_order':
                return `${returnProvideMsg} History View Order Id`;
            case 'chief_complaint_category_uuid':
                return `${returnProvideMsg} chief complaint category Id`;
            case 'treatment_kit_type_uuid':
                return `${returnProvideMsg} Treatment Type Id`;
            case 'code':
                return `${returnProvideMsg} Code`;
            case 'name':
                return `${returnProvideMsg} Name`;
            case 'activefrom':
                return `${returnProvideMsg} Active From`;
            case 'test_master_uuid':
                return `${returnProvideMsg} Test Master Id`;
            case 'diagnosis_uuid':
                return `${returnProvideMsg}  Diagnosis Id`;
            case 'doctor_uuid':
                return `${returnProvideMsg}  Doctor Id`;
            case 'encounter_type_uuid':
                return `${returnProvideMsg} Encounter Type Id`;
            case 'patient_uuid':
                return `${returnProvideMsg} Patient Id`;
            case 'item_master_uuid':
                return `${returnProvideMsg} Item Master Id`;
            case 'drug_route_uuid':
                return `${returnProvideMsg} Drug Route Id`;
            case 'duration_period_uuid':
                return `${returnProvideMsg} Duration Period Id`;
            case 'drug_instruction_uuid':
                return `${returnProvideMsg} Drug Instruction Id`;
            case 'quantity':
                return `${returnProvideMsg} Drug Quantity`;
            default:
                return `${returnProvideMsg} required Fields`;
        }
    },

    GetMinimumMessage: function (columnname) {
        let lengthMessage = 'must be greater than 0';
        switch (columnname) {
            case 'doctor_uuid':
                return `Doctor Id ${lengthMessage}`;
            case 'encounter_type_uuid':
                return `Encounter Type Id ${lengthMessage}`;
            case 'patient_uuid':
                return `Patient Id ${lengthMessage}`;
            case 'facility_uuid':
                return `Facility Id ${lengthMessage}`;
            case 'treatment_kit_type_uuid':
                return `Treatment Kit Type Id ${lengthMessage}`;
            case 'item_master_uuid':
                return `Item Master Id ${lengthMessage}`;
            case 'drug_route_uuid':
                return `Drug Route Id ${lengthMessage}`;
            case 'drug_frequency_uuid':
                return `Drug Frequency Id ${lengthMessage}`;
            case 'duration_period_uuid':
                return `Drug Period Id ${lengthMessage}`;
            case 'drug_instruction_uuid':
                return `Drug Instruction Id ${lengthMessage}`;
            case 'quantity':
                return `Drug Quantity ${lengthMessage}`;
            default:
                return `Value ${lengthMessage}`;
        }
    },

    GetZeroValidationMessage: function (columnname) {
        let validationMessage = 'must be greater than or equal to 0';
        switch (columnname) {
            case 'doctor_uuid':
                return `Doctor Id ${validationMessage}`;
            case 'encounter_type_uuid':
                return `Encounter Type Id ${validationMessage}`;
            case 'patient_uuid':
                return `Patient Id ${validationMessage}`;
            case 'department_uuid':
                return `Department Id ${validationMessage}`;
            case 'facility_uuid':
                return `Facility Id ${validationMessage}`;
            case 'diagnosis_uuid':
                return `Diagnosis Id ${validationMessage}`;
            case 'test_master_uuid':
                return `Test Master Id ${validationMessage}`;
            case 'item_master_uuid':
                return `Item Master Id ${validationMessage}`;
            case 'drug_route_uuid':
                return `Drug Route Id ${validationMessage}`;
            case 'drug_frequency_uuid':
                return `Drug Frequency Id ${validationMessage}`;
            case 'duration_period_uuid':
                return `Drug Period Id ${validationMessage}`;
            case 'drug_instruction_uuid':
                return `Drug Instruction Id ${validationMessage}`;
            case 'quantity':
                return `Drug Quantity ${validationMessage}`;
            default:
                return `Value ${validationMessage}`;
        }
    }
});