const httpStatus = require("http-status");
const db = require("../config/sequelize");
const _ = require("lodash");
var Sequelize = require('sequelize');
var Op = Sequelize.Op;


const emr_reference_group_tbl = db.emr_reference_group;
const vw_ref = db.vw_emr_reference;
// const module_tbl = db.app_module;
// const activity_tbl = db.activity;

const referenceGroupController = () => {
	/**
	 * Returns jwt token if valid username and password is provided
	 * @param req
	 * @param res
	 * @param next
	 * @returns {*}
	 */

    /*=============== marital status API's================*/

    const getreferenceGroupController = async (req, res, next) => {

        const postData = req.body;
        try {
            const pageNo = postData.pageNo;
            const limit = postData.paginationSize;
            const page = pageNo ? pageNo : 1;
            const itemsPerPage = limit ? limit : 10;
            const offset = (page - 1) * itemsPerPage;
            let sortArr = ['created_date', 'ASC'];
            let fieldSplitArr = [];
            if (postData.sortField) {
                fieldSplitArr = postData.sortField.split('.');
                if (fieldSplitArr.length == 1) {
                    sortArr[0] = postData.sortField;
                } else {
                    for (let idx = 0; idx < fieldSplitArr.length; idx++) {
                        const element = fieldSplitArr[idx];
                        fieldSplitArr[idx] = element.replace(/\[\/?.+?\]/ig, '');
                    }
                    sortArr = fieldSplitArr;
                }
            }
            if (postData.sortOrder && ((postData.sortOrder.toLowerCase() == 'asc') || (postData.sortOrder.toLowerCase() == 'desc'))) {
                if ((fieldSplitArr.length == 1) || (fieldSplitArr.length == 0)) {
                    sortArr[1] = postData.sortOrder;
                } else {
                    sortArr.push(postData.sortOrder);
                }
            }
            let findQuery = {
                subQuery: false,
                offset: offset,
                limit: itemsPerPage,

                order: [
                    sortArr
                ],

                where: {
                    is_active: 1, status: 1
                }
            };

            if (postData.table_name && /\S/.test(postData.table_name)) {
                findQuery.where[Op.and] = [
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('emr_reference_group.table_name')), 'LIKE', '%' + postData.table_name.toLowerCase() + '%'),
                ];
            }
            if (postData.search && /\S/.test(postData.search)) {
                findQuery.where[Op.or] = [
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('emr_reference_group.name')), 'LIKE', '%' + postData.search.toLowerCase() + '%'),
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('emr_reference_group.code')), 'LIKE', '%' + postData.search.toLowerCase() + '%'),
                    // Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('app_module.name')), 'LIKE', '%' + postData.search.toLowerCase() + '%'),
                    // Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('district_master.state_master.name')), 'LIKE', '%' + searchData.search.toLowerCase() + '%'),
                    //Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('state_master.name')), 'LIKE', '%' + postData.search.toLowerCase() + '%'),
                ];
            }

            if (postData.refCodeName && /\S/.test(postData.refCodeName)) {
                if (findQuery.where[Op.or]) {
                    findQuery.where[Op.and] = [{
                        [Op.or]: [
                            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('emr_reference_group.code')), postData.refCodeName.toLowerCase()),
                            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('emr_reference_group.name')), postData.refCodeName.toLowerCase()),
                        ]
                    }];
                } else {
                    findQuery.where[Op.or] = [
                        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('emr_reference_group.code')), postData.refCodeName.toLowerCase()),
                        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('emr_reference_group.name')), postData.refCodeName.toLowerCase()),
                    ];
                }
            }


            // if (postData.moduleId && /\S/.test(postData.moduleId)) {
            //     findQuery.where['$app_module.uuid$'] = postData.moduleId;
            // }


            if (postData.hasOwnProperty('status') && /\S/.test(postData.status)) {
                findQuery.where['is_active'] = postData.status;
                findQuery.where['status'] = postData.status;

            }


            // if (postData.hasOwnProperty('status') && /\S/.test(postData.status)) {
            //     findQuery.where['is_active'] = postData.status;
            // }

            await emr_reference_group_tbl.findAndCountAll(findQuery)
                .then((data) => {
                    return res
                        .status(httpStatus.OK)
                        .json({
                            statusCode: 200,
                            message: "Get Details Fetched successfully",
                            req: '',
                            responseContents: data.rows,
                            totalRecords: data.count
                        });
                });

        } catch (err) {
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return res
                .status(httpStatus.INTERNAL_SERVER_ERROR)
                .json({
                    status: "error",
                    msg: errorMsg
                });
        }
    };

    const addreferenceGroup = async (req, res, next) => {
        const { user_uuid } = req.headers;
        const reqdata = req.body;
        if (Object.keys(req.body).length != 0) {

            if (user_uuid && reqdata) {

                try {

                    const code_exits = await codeexists(reqdata.code);
                    const name_exits = await nameexists(reqdata.name);
                    const tblname_exits = await tblnameexists(reqdata.table_name);

                    if (code_exits && code_exits.length > 0) {
                        return res
                            .status(400)
                            .send({ code: httpStatus[400], message: "code already exists" });

                    } else if (name_exits && name_exits.length > 0) {
                        return res
                            .status(400)
                            .send({ code: httpStatus[400], message: "name already exists" });

                    } else if (tblname_exits && tblname_exits.length > 0) {
                        return res
                            .status(400)
                            .send({ code: httpStatus[400], message: "Table name already exists" });
                    } else {

                        reqdata.created_by = reqdata.modified_by = user_uuid;
                        reqdata.created_date = reqdata.modified_date = new Date();
                        reqdata.database_name = "dev_hmis_emr_18_12_2019";
                        //reqdata.activity_uuid = 176;
                        reqdata.module_uuid = 37;
                        reqdata.revision = reqdata.is_active = reqdata.Is_default = reqdata.display_order = 1;
                        reqdata.language = 0;

                        const insdata = await emr_reference_group_tbl.create(reqdata, { returning: true });
                        if (insdata) {
                            return res.status(200).send({
                                code: httpStatus.OK,
                                message: "reference inserted Successfully",
                                responseContent: insdata
                            });
                        }
                    }
                } catch (err) {
                    console.log(err);
                    const errorMsg = err.errors ? err.errors[0].message : err.message;
                    return res
                        .status(httpStatus.INTERNAL_SERVER_ERROR)
                        .json({
                            status: "error",
                            msg: errorMsg
                        });
                }
            } else {
                return res
                    .status(400)
                    .send({ code: httpStatus[400], message: "No Request Body Found" });
            }
        } else {
            return res
                .status(400)
                .send({ code: httpStatus[400], message: "No Request Body Found" });
        }
    };

    // const getAllreference = async (req, res, next) => {
    //     let getsearch = req.body;

    //     let pageNo = 0;
    //     const itemsPerPage = getsearch.paginationSize ? getsearch.paginationSize : 10;
    //     let sortField = 'modified_date';
    //     let sortOrder = 'DESC';

    //     Object.keys(getsearch).forEach((key) => (getsearch[key] == null || getsearch[key] == "") && delete getsearch[key]);

    //     if (getsearch.pageNo) {
    //         let temp = parseInt(getsearch.pageNo);

    //         if (temp && (temp != NaN)) {
    //             pageNo = temp;
    //         }
    //     }

    //     const offset = pageNo * itemsPerPage;


    //     if (getsearch.sortField) {

    //         sortField = getsearch.sortField;
    //     }

    //     if (getsearch.sortOrder && ((getsearch.sortOrder == 'ASC') || (getsearch.sortOrder == 'DESC'))) {

    //         sortOrder = getsearch.sortOrder;
    //     }
    //     let findQuery = {
    //         offset: offset,
    //         limit: itemsPerPage,
    //         where: { is_active: 1 },

    //         attributes: { "exclude": ['id', 'createdAt', 'updatedAt'] },
    //         order: [
    //             [sortField, sortOrder],
    //         ],

    //     };

    //     if (getsearch.search && /\S/.test(getsearch.search)) {
    //         findQuery.where[Op.or] = [
    //             Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_ref.code')), 'LIKE', '%' + getsearch.search.toLowerCase() + '%'),
    //             Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_ref.name')), 'LIKE', '%' + getsearch.search.toLowerCase() + '%'),

    //         ];
    //     }
    //     if (getsearch.refCodeName && /\S/.test(getsearch.refCodeName)) {
    //         if (findQuery.where[Op.or]) {
    //             findQuery.where[Op.and] = [{
    //                 [Op.or]: [
    //                     Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_ref.code')), getsearch.refCodeName.toLowerCase()),
    //                     Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_ref.name')), getsearch.refCodeName.toLowerCase()),
    //                 ]
    //             }];
    //         } else {
    //             findQuery.where[Op.or] = [
    //                 Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_ref.code')), getsearch.refCodeName.toLowerCase()),
    //                 Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_ref.name')), getsearch.refCodeName.toLowerCase()),
    //             ];
    //         }
    //     }
    //     if (getsearch.moduleId && /\S/.test(getsearch.moduleId)) {
    //         if (findQuery.where[Op.or]) {
    //             findQuery.where[Op.and] = [{
    //                 [Op.or]: [
    //                     Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_ref.module_uuid')), getsearch.moduleId)
    //                 ]
    //             }];
    //         } else {
    //             findQuery.where[Op.or] = [
    //                 Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_ref.module_uuid')), getsearch.moduleId)
    //             ];
    //         }
    //     }

    //     if (getsearch.hasOwnProperty('status') && /\S/.test(getsearch.status)) {
    //         findQuery.where['is_active'] = getsearch.status;
    //         // findQuery.where['status'] = getsearch.status;

    //     }
    //     try {

    //         const { user_uuid } = req.headers;

    //         if (user_uuid > 0) {

    //             const data = await vw_ref.findAndCountAll(findQuery);
    //             if (data) {
    //                 return res
    //                     .status(httpStatus.OK)
    //                     .json({
    //                         statusCode: 200,
    //                         message: "Get Details Fetched successfully",
    //                         req: '',
    //                         responseContents: data.rows,
    //                         totalRecords: data.count
    //                     });
    //             }
    //         } else {
    //             return res
    //                 .status(400)
    //                 .send({ code: httpStatus[400], message: "your not authorized" });
    //         }
    //     } catch (err) {
    //         const errorMsg = err.errors ? err.errors[0].message : err.message;
    //         return res
    //             .status(httpStatus.INTERNAL_SERVER_ERROR)
    //             .json({
    //                 status: "error",
    //                 msg: errorMsg
    //             });
    //     }
    // };
    const getAllreference = async (req, res, next) => {

        let getsearch = req.body;

        Object.keys(getsearch).forEach((key) => (getsearch[key] == null || getsearch[key] == "") && delete getsearch[key]);

        let pageNo = 0;
        const itemsPerPage = getsearch.paginationSize ? getsearch.paginationSize : 10;
        let sortField = 'modified_date';
        let sortOrder = 'DESC';

        if (getsearch.pageNo) {
            let temp = parseInt(getsearch.pageNo);

            if (temp && (temp != NaN)) {
                pageNo = temp;
            }
        }

        const offset = pageNo * itemsPerPage;

        if (getsearch.sortField) {

            sortField = getsearch.sortField;
        }

        if (getsearch.sortOrder && ((getsearch.sortOrder == 'ASC') || (getsearch.sortOrder == 'DESC'))) {

            sortOrder = getsearch.sortOrder;
        }
        let findQuery = {
            offset: offset,
            limit: itemsPerPage,
            order: [[sortField, sortOrder]],
            attributes: { "exclude": ['id', 'createdAt', 'updatedAt'] },
            where: { is_active: 1 }

        };

        if (getsearch.search && /\S/.test(getsearch.search)) {
            findQuery.where[Op.or] = [
                Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('code')), 'LIKE', '%' + getsearch.search.toLowerCase() + '%'),
                Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), 'LIKE', '%' + getsearch.search.toLowerCase() + '%'),

            ];
        }
        if (getsearch.refCodeName && /\S/.test(getsearch.refCodeName)) {
            if (findQuery.where[Op.or]) {
                findQuery.where[Op.and] = [{
                    [Op.or]: [
                        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('code')), getsearch.refCodeName.toLowerCase()),
                        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), getsearch.refCodeName.toLowerCase()),
                    ]
                }];
            } else {
                findQuery.where[Op.or] = [
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('code')), getsearch.refCodeName.toLowerCase()),
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), getsearch.refCodeName.toLowerCase()),
                ];
            }
        }
        if (getsearch.moduleId && /\S/.test(getsearch.moduleId)) {
            if (findQuery.where[Op.or]) {
                findQuery.where[Op.and] = [{
                    [Op.or]: [
                        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('module_uuid')), getsearch.moduleId)
                    ]
                }];
            } else {
                findQuery.where[Op.or] = [
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('module_uuid')), getsearch.moduleId)
                ];
            }
        }
        if (getsearch.hasOwnProperty('status') && /\S/.test(getsearch.status)) {
            findQuery.where['is_active'] = getsearch.status;
        }

        try {
            const data = await vw_ref.findAndCountAll(findQuery);

            if (data) {
                return res
                    .status(httpStatus.OK)
                    .json({
                        message: "success", statusCode: 200,
                        responseContents: (data.rows ? data.rows : []),
                        totalRecords: (data.count ? data.count : 0),
                    });
            }

        } catch (err) {

            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return res
                .status(400)
                .send({ code: httpStatus.BAD_REQUEST, message: err.message });
        }


    };

    return {
        getreferenceGroupController,
        addreferenceGroup,
        getAllreference
    };
};


module.exports = referenceGroupController();

const codeexists = (code, userUUID) => {
    if (code !== undefined) {
        return new Promise((resolve, reject) => {
            let value = emr_reference_group_tbl.findAll({
                //order: [['created_date', 'DESC']],
                attributes: ["code"],
                where: { code: code, status: 1 }
            });
            if (value) {
                resolve(value);
                return value;
            } else {
                reject({ message: "code does not existed" });
            }
        });
    }
};

const nameexists = (name) => {
    if (name !== undefined) {
        return new Promise((resolve, reject) => {
            let value = emr_reference_group_tbl.findAll({
                //order: [['created_date', 'DESC']],
                attributes: ["name"],
                where: { name: name, status: 1 }
            });
            if (value) {
                resolve(value);
                return value;
            } else {
                reject({ message: "code does not existed" });
            }
        });
    }
};

const tblnameexists = (tblname) => {
    if (tblname !== undefined) {
        return new Promise((resolve, reject) => {
            let value = emr_reference_group_tbl.findAll({
                //order: [['created_date', 'DESC']],
                attributes: ["table_name"],
                where: { table_name: tblname }
            });
            if (value) {
                resolve(value);
                return value;
            } else {
                reject({ message: "code does not existed" });
            }
        });
    }
};