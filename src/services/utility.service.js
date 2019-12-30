const emr_constants = require('../config/constants');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const _getActiveAndStatusObject = (is_active) => {
    return {

        is_active: is_active ? emr_constants.IS_ACTIVE : emr_constants.IS_IN_ACTIVE,
        status: is_active ? emr_constants.IS_ACTIVE : emr_constants.IS_IN_ACTIVE

    };
};

const _createIsActiveAndStatus = (create_object, userId) => {

    create_object.modified_by = create_object.user_uuid = create_object.created_by = userId;
    create_object.is_active = create_object.status = emr_constants.IS_ACTIVE;
    create_object.created_date = create_object.modified_date = new Date();
    create_object.revision = 1;
    return create_object;
};

const _assignDefaultValuesAndUUIdToObject = (target, assign, userId, assignCol) => {

    // assigning Default Values
    target = _createIsActiveAndStatus(target, userId);

    // assigning Master Id to child tables
    target[assignCol] = assign && assign.uuid || 0;

    return target;
};

const _getFilterByThreeQueryForCodeAndName = (searchValue) => {
    return {
        is_active: emr_constants.IS_ACTIVE,
        status: emr_constants.IS_ACTIVE,
        [Op.or]: [
            {
                name: {
                    [Op.like]: `%${searchValue}%`
                }
            },
            {
                code: {
                    [Op.like]: `%${searchValue}%`,
                }
            }
        ]
    };
};

module.exports = {

    getActiveAndStatusObject: _getActiveAndStatusObject,
    createIsActiveAndStatus: _createIsActiveAndStatus,
    assignDefaultValuesAndUUIdToObject: _assignDefaultValuesAndUUIdToObject,
    getFilterByThreeQueryForCodeAndName: _getFilterByThreeQueryForCodeAndName

};