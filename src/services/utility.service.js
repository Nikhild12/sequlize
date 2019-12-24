const emr_constants = require('../config/constants');

const _getActiveAndStatusObject = (is_active) => {
    return {

        is_active: is_active ? emr_constants.IS_ACTIVE : emr_constants.IS_IN_ACTIVE,
        status: is_active ? emr_constants.IS_ACTIVE : emr_constants.IS_IN_ACTIVE

    };
};

const _createIsActiveAndStatus = (create_object, userId) => {

    create_object.modified_by = create_object.user_uuid = create_object.created_by = userId;
    create_object.is_active = create_object.status = emr_constants.IS_ACTIVE;
    create_object.created_date = ele.modified_date = new Date();
    create_object.revision = 1;
    return create_object;
    
}

module.exports = {

    getActiveAndStatusObject: _getActiveAndStatusObject,
    createIsActiveAndStatus: _createIsActiveAndStatus

};