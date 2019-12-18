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
            default:
                return `${returnProvideMsg} required Fields`;
        }
    }
});