const _getActiveAndStatusObject = (is_active) => {
    return {

        is_active: is_active ? emr_constants.IS_ACTIVE : emr_constants.IS_IN_ACTIVE,
        status: is_active ? emr_constants.IS_ACTIVE : emr_constants.IS_IN_ACTIVE

    };
};

module.exports = {
    getActiveAndStatusObject: _getActiveAndStatusObject
};