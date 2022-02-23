const httpStatus = require("http-status");
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const db = require("../config/sequelize");
const utils = require("../helpers/utils");

const vitalmasterTbl = db.vital_masters;
const vitalValueTypeTbl = db.vital_value_type;
const emr_uomTbl = db.emr_uom;
const vitalmasteruomTbl = db.vital_master_uoms;

const vitalMasterUOMController = () => {
    /**
     * Returns jwt token if valid username and password is provided
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */

    //Create a New Record
    const addvitaluoms = async (req, res, next) => {
        const postData = req.body;
        
        const {
            user_uuid
        } = req.headers;
        
        try {
            /*
            const vital_data = await vitalmasterTbl.findOne({
                where: {
                    uuid: postData.vital_master_uuid
                }
            });
            postData.vital_value_type_uuid = vital_data.vital_value_type_uuid;
            */
            /* req.body valiadtion */
                /*
                const bodyValidationResult = Joi.validate(req.body, storeUserValidations.addStoreUsers);
                if (bodyValidationResult.error !== null) {
                    return utils.sendResponse(req, res, "VALIDATION_ERROR", "VALIDATION_ERROR", {}, "", bodyValidationResult.error.message);
                }
                */

                /* Appending the  created_by & modified_by to postData */
                postData.created_by = postData.modified_by = parseInt(user_uuid);

                /* duplicate record checking */
                let vital_master_uom_data = await vitalmasteruomTbl.findAll({
                    where: {
                        vital_master_uuid: postData.vital_master_uuid,
                        emr_uom_uuid: postData.emr_uom_uuid,
                        is_active: true,
                        status: 1
                    }
                });
                if (vital_master_uom_data.length > 0) {
                    return res.status(httpStatus.UNPROCESSABLE_ENTITY).send({
                        code: httpStatus.UNPROCESSABLE_ENTITY,
                        message: 'this uom already mapped with this vital'
                      });
                }

                //inserting data into db without duplicates
                const data = await vitalmasteruomTbl.create(postData, {
                    returning: true
                });
                /**Sending success response */
                return res.status(httpStatus.OK).send({
                    code: httpStatus.OK,
                    message: 'selected uom is mapped successfully',
                    responseContents: data
                  });
        } catch (err) {
            /**Sending error response */
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
                code: httpStatus.INTERNAL_SERVER_ERROR,
                message: 'selected uom mapping failed',
                errorMsg: err.message
              });
        }
    };

    //Update a Record based on uuid
    /*
    const updatevitaluoms = async (req, res, next) => {
        const postData = req.body;
        const {
            user_uuid
        } = req.headers;

        try {
            const bodyValidationResult = Joi.validate(req.body, storeUserValidations.updateStoreUsers);
            if (bodyValidationResult.error !== null) {
                return utils.sendResponse(req, res, "VALIDATION_ERROR", "VALIDATION_ERROR", {}, "", bodyValidationResult.error.message);
            }

            postData.modified_by = (user_uuid) ? parseInt(user_uuid) : 1;

            const data = await store_usersTbl.update(postData, {
                where: {
                    uuid: postData.Id
                },
            });
            if (data == 0) {
                return utils.sendResponse(req, res, "NO_CONTENT", "PUT_FAILED");
            } else {
                return utils.sendResponse(req, res, "SUCCESS", "PUT_SUCCESS", data);
            }
        } catch (err) {
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return utils.sendResponse(req, res, "DB_ERR", "DB_ERR", {}, "", errorMsg);
        }
    };
    */

    //Delete a Single Record based on uuid
    const deletevitaluoms = async (req, res, next) => {
        const postData = req.body;
        const {
            user_uuid
        } = req.headers;

        /* req.body validation */
        /*
        if (Object.keys(postData).length == 0) {
            return utils.sendResponse(req, res, "BAD_REQUEST", "BAD_PARAMS");
        } else {
            if (!postData.Id) {
                return utils.sendResponse(req, res, "UNPROCESSABLE_ENTITY", "BAD_PARAMS");
            }
        }
        */

        const upData = {
            is_active: 0,
            status: 0,
            modified_by: (user_uuid) ? parseInt(user_uuid) : 1
        };
        const upWhr = {
            where: {
                uuid: postData.Id
            }
        };

        try {
            const data = await vitalmasteruomTbl.update(upData, upWhr);
            if (data == 0) {
                /**Sending failure response */
                //return utils.sendResponse(req, res, "NO_CONTENT", "DELETE_FAILED");
                return res.status(httpStatus.UNPROCESSABLE_ENTITY).send({
                    code: httpStatus.UNPROCESSABLE_ENTITY,
                    message: 'No Content, UOM Deletion Failed for Selected Vital'
                  });
            } else {
                /**Sending success response */
                //return utils.sendResponse(req, res, "SUCCESS", "DELETE_SUCCESS", data);
                return res.status(httpStatus.OK).send({
                    code: httpStatus.OK,
                    message: 'deletion of mapped UOM from Selected Vital is Successful',
                    responseContents: data
                  });
            }
        } catch (err) {
            /**Sending error response */
            //const errorMsg = err.errors ? err.errors[0].message : err.message;
            //return utils.sendResponse(req, res, "DB_ERR", "DB_ERR", {}, "", errorMsg);

            return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
                code: httpStatus.INTERNAL_SERVER_ERROR,
                message: 'deletion of mapped UOM from Selected Vital failed',
                errorMsg: err.errors ? err.errors[0].message : err.message
              });
        }
    };

    //To Get All Records
    /*
    const getvitaluoms = async (req, res, next) => {
        const searchData = req.body;

        if (searchData.sortField) {
            if (!(/^[a-zA-Z_.]+$/.test(searchData.sortField)) || searchData.sortField == 'string') {
                return utils.sendResponse(req, res, "VALIDATION_ERROR", "VALIDATION_ERROR");
            }
        }
        if (searchData.pageNo) {
            if (searchData.pageNo < 0) {
                return utils.sendResponse(req, res, "VALIDATION_ERROR", "VALIDATION_ERROR", {}, '', 'pageNo should be equal to zero or more than zero');
            }
        }
        if (searchData.sortOrder) {
            const sortData = ['ASC', 'DESC', 'asc', 'desc'];
            if (!(sortData.includes(searchData.sortOrder))) {
                return utils.sendResponse(req, res, "VALIDATION_ERROR", "VALIDATION_ERROR", {}, '', 'sortOrder should be ASC/DESC');
            }
        }

        try {

            let findQuery = utils.getFindQuery(searchData);
            Object.assign(findQuery);
            if (searchData.StoreUsersname && /\S/.test(searchData.StoreUsersname)) {
                Object.assign(findQuery, {
                    name: searchData.StoreUsersname
                });
            }
            if (searchData.search && /\S/.test(searchData.search)) {
                Object.assign(findQuery, {
                    [Op.or]: [{
                            code: {
                                [Op.like]: '%' + searchData.search + '%',
                            }
                        },
                        {
                            name: {
                                [Op.like]: '%' + searchData.search + '%',
                            }
                        },
                    ]
                });
            }
            const data = await store_usersTbl.findAndCountAll(findQuery);
            if (data.count == 0) {
                return utils.sendResponse(req, res, "GET_SUCCESS", "NO_RECORDS");
            } else {
                return utils.sendResponse(req, res, "GET_SUCCESS", "RECORDS_FOUND", data);
            }
        } catch (err) {
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return utils.sendResponse(req, res, "DB_ERR", "DB_ERR", {}, "", errorMsg);
        }
    };
    */

    //Getting the All Records based on user_uuid
    /*
    const getuomvitals = async (req, res, next) => {
        const searchData = req.body;
        const {
            facility_uuid
        } = req.headers;

        if (Object.keys(searchData).length == 0) {
            return utils.sendResponse(req, res, "BAD_REQUEST", "BAD_PARAMS");
        } else {
            if (!searchData.userId) {
                return utils.sendResponse(req, res, "UNPROCESSABLE_ENTITY", "BAD_PARAMS", {}, '', 'userId is required');
            }
        }

        let findQuery = utils.getFindQuery(searchData);

        delete findQuery.limit;
        delete findQuery.offset;

        Object.assign(findQuery, {
            where: {
                is_active: 1,
                user_uuid: searchData.userId
            },
            include: [{
                    model: store_master_tbl,
                    attributes: ['uuid', 'store_code', 'store_name', 'store_type_uuid',
                        'facility_uuid'
                    ],
                    include: [{
                        model: store_category_tbl,
                        as: 'store_category',
                        attributes: ['uuid', 'code', 'name'],
                    }]
                },

            ]
        });

        if (searchData.search && /\S/.test(searchData.search)) {
            Object.assign(findQuery.where, {
                [Op.or]: [{
                    '$store_master.store_name$': {
                        [Op.like]: '%' + searchData.search + '%'
                    },
                    '$store_master.store_code$': {
                        [Op.like]: '%' + searchData.search + '%'
                    }
                }]
            });
        }

        if (searchData.store_type && /\S/.test(searchData.store_type)) {
            Object.assign(findQuery.where, {
                '$store_master.store_type_uuid$': 1,
            });
        }

        if (searchData.facility_uuid && /\S/.test(searchData.facility_uuid)) {
            Object.assign(findQuery.where, {
                facility_uuid: searchData.facility_uuid,
            });
        } else {
            Object.assign(findQuery.where, {
                facility_uuid: facility_uuid,
            });
        }

        try {
            const data = await store_usersTbl.findAndCountAll(findQuery);
            data.rows.forEach(i => {
                i.dataValues.store_name = i.dataValues.store_master.dataValues.store_name;
                i.dataValues.store_code = i.dataValues.store_master.dataValues.store_code;
            });

            let user_uuids = [...new Set(data.rows.map(e => e.dataValues.user_uuid))];
            const users = await appMaster.getSpecificusers(user_uuids, req);
            if (users.status) {
                data.rows.forEach(e => {
                    e.dataValues.user_name = (users.data[e.dataValues.user_uuid] ? users.data[e.dataValues.user_uuid] : null);
                });
            }

            return utils.sendGetAllRes(req, res, data);

        } catch (err) {

            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return utils.sendResponse(req, res, "DB_ERR", "DB_ERR", {}, "", errorMsg);
        }
    };
    */

    //Getting the Single Record based on uuid
    /*
    const getvitaluomsbyid = async (req, res, next) => {
        const reqData = req.body;

        if (Object.keys(reqData).length == 0) {
            return utils.sendResponse(req, res, "BAD_REQUEST", "BAD_PARAMS");
        } else {
            if (!reqData.Id) {
                return utils.sendResponse(req, res, "UNPROCESSABLE_ENTITY", "BAD_PARAMS");
            }
        }

        try {
            const data = await store_usersTbl.findOne({
                where: {
                    uuid: reqData.Id
                },
            });

            if (data == '' || data == undefined) {
                return utils.sendResponse(req, res, "GET_SUCCESS", "NO_RECORDS");
            } else {
                return utils.sendResponse(req, res, "GET_SUCCESS", "RECORDS_FOUND", data);
            }

        } catch (err) {
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return utils.sendResponse(req, res, "DB_ERR", "DB_ERR", {}, "", errorMsg);
        }
    };
    */

    //Getting the All Records based on store_master_uuid
    const getuomsbyvitalid = async (req, res, next) => {
        try {
            const postData = req.body;

            /* req.body validation */
            /*
            if (Object.keys(postData).length == 0) {
                return utils.sendResponse(req, res, "BAD_REQUEST", "BAD_PARAMS");
            } else {
                if (!postData.vital_master_uuid) {
                    return utils.sendResponse(req, res, "UNPROCESSABLE_ENTITY", "BAD_PARAMS", {}, '', 'store_master_uuid is required');
                }
            }
            if (postData.sortField) {
                if (!(/^[a-zA-Z_.]+$/.test(postData.sortField)) || postData.sortField == 'string') {
                    return utils.sendResponse(req, res, "VALIDATION_ERROR", "VALIDATION_ERROR");
                }
            }
            if (postData.pageNo) {
                if (postData.pageNo < 0) {
                    return utils.sendResponse(req, res, "VALIDATION_ERROR", "VALIDATION_ERROR", {}, '', 'pageNo should be equal to zero or more than zero');
                }
            }
            if (postData.sortOrder) {
                const sortData = ['ASC', 'DESC', 'asc', 'desc'];
                if (!(sortData.includes(postData.sortOrder))) {
                    return utils.sendResponse(req, res, "VALIDATION_ERROR", "VALIDATION_ERROR", {}, '', 'sortOrder should be ASC/DESC');
                }
            }
            */

            /* findquery initialization  */
            let findQuery = utils.getFindQuery(postData);

            Object.assign(findQuery, {
                include: [
                    {
                        model: vitalmasterTbl,
                        as: 'vital_master'
                    },
                    {
                        model: emr_uomTbl,
                        as: 'emr_uom'
                    },
                    {
                        model: vitalValueTypeTbl,
                        as: 'vital_value_type'
                    }
            ],
                where: {
                    vital_master_uuid: postData.Id
                }
            });

            const data = await vitalmasteruomTbl.findAndCountAll(findQuery);
            if (data.count > 0) {
                /* let storeUser_uuid = data.rows; */

                /*---------------user------------------*/
                /*
                let user_uuids = [...new Set(storeUser_uuid.map(e => e.dataValues.user_uuid))];
                let users = await appMaster.getSpecificusers(user_uuids, req);
                if (users.status) {
                    users = users.data;
                    storeUser_uuid.forEach(e => {
                        const user_id = e.dataValues.user_uuid;
                        e.dataValues.user_name = (users[user_id] ? users[user_id] : null);
                    });
                }
                */
                /*---------------user type------------------*/
                /*
                let user_type_uuids = [...new Set(storeUser_uuid.map(e => e.dataValues.user_type_uuid))];
                let usertypes = await appMaster.getSpecificusertypes(user_type_uuids, req);
                if (usertypes.status) {
                    usertypes = usertypes.data;
                    storeUser_uuid.forEach(e => {
                        const user_type_id = e.dataValues.user_type_uuid;
                        e.dataValues.user_type_name = (usertypes[user_type_id] ? usertypes[user_type_id] : null);
                    });
                }
                */
                /*---------------department------------------*/
                /*
                let dept_uuid = [...new Set(storeUser_uuid.map(e => e.dataValues.department_uuid))];
                let departmentData = await appMaster.getSpecificDepartments(dept_uuid, req);
                if (departmentData.status) {
                    const departments = departmentData.data;
                    storeUser_uuid.forEach(e => {
                        const uuid = e.dataValues.department_uuid;
                        e.dataValues.department_name = (departments[uuid] ? departments[uuid] : null);
                    });
                }
                */
                /**Sending success response */
                //return utils.sendResponse(req, res, "GET_SUCCESS", "RECORDS_FOUND", data);

                return res.status(httpStatus.OK).send({
                    code: httpStatus.OK,
                    message: 'selected vital uoms fetched successfully',
                    responseContents: data
                  });
            } else {
                /**Sending failure response */
                //return utils.sendResponse(req, res, "GET_SUCCESS", "NO_RECORDS");
                return res.status(httpStatus.OK).send({
                    code: httpStatus.OK,
                    message: 'no records found',
                    responseContents: data
                  });
            }
        } catch (err) {
            /**Sending error response */
            //const errorMsg = err.errors ? err.errors[0].message : err.message;
            //return utils.sendResponse(req, res, "DB_ERR", "DB_ERR", {}, "", errorMsg);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
                code: httpStatus.INTERNAL_SERVER_ERROR,
                message: 'vital uoms fetching failed',
                errorMsg: err.errors ? err.errors[0].message : err.message
              });
        }
    };

    return {
        addvitaluoms,
        //updatevitaluoms,
        deletevitaluoms,
        //getvitaluoms,
        //getuomvitals,
        //getvitaluomsbyid,
        getuomsbyvitalid
    };
};


module.exports = vitalMasterUOMController();