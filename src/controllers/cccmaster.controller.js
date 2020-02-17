const httpStatus = require("http-status");
const db = require("../config/sequelize");
const sequelizeDb = require('../config/sequelize');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const cccMasterTbl = db.critical_care_charts;
const conceptTbl = db.critical_care_concepts;
const conceptdetailsTbl = db.critical_care_concept_values
const criticalcareTypeTbl = db.critical_care_types

const cccMasterController = () => {
    /**
    * Returns jwt token if valid username and password is provided
    * @param req
    * @param res
    * @param next
    * @returns {*}
    */

    const getAllcccMaster = async (req, res, next) => {
        let getsearch = req.body;
        let pageNo = 0;
        const itemsPerPage = getsearch.paginationSize ? getsearch.paginationSize : 10;
        let sortField = 'created_date';
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
            order: [
                [sortField, sortOrder],
            ],
            where: { is_active: 1, status: 1 },
            include: [
                {
                    model: criticalcareTypeTbl,
                    as: 'critical_care_types'
                },
                {
                    model: conceptTbl,
                    include: [{ model: conceptdetailsTbl }]
                }
            ]
        };
        if (getsearch.search && /\S/.test(getsearch.search)) {

            findQuery.where = {
                [Op.or]: [{
                    code: {
                        [Op.like]: '%' + getsearch.search + '%',
                    },


                }, {
                    name: {
                        [Op.like]: '%' + getsearch.search + '%',
                    },
                }

                ]
            };
        }
        let data = await cccMasterTbl.findAndCountAll(findQuery,


            { returning: true });

        return res
            .status(httpStatus.OK)
            .json({
                statusCode: 200,
                req: '',
                responseContents: (data.rows ? data.rows : [])
            });

    };

    const postcccMaster = async (req, res, next) => {
        try {
            if (typeof req.body != "object" || Object.keys(req.body).length < 1) {
            }
            const { user_uuid, facility_uuid } = req.headers;
            let concept_detail_output;
            let transaction;

            let transaction_status = false;
            try {

                transaction = await db.sequelize.transaction();

                //Body Request
                const postData = req.body;
                const postDatabody = req.body.body;
                const postDatabody1 = req.body.body1;
                const postDatabody2 = req.body.body2;

                postDatabody.created_by = user_uuid;
                postDatabody.modified_by = 0;
                postData.created_by = req.headers.user_uuid
                postData.code = postData.fieldname
                postData.name = postData.fieldname;


                let ccc_master_output = await cccMasterTbl.create(postDatabody, { returning: true, transaction });

                postDatabody1.cc_chart_uuid = ccc_master_output.dataValues.uuid
                postDatabody1.created_by = user_uuid;
                postDatabody1.modified_by = 0;
                postDatabody1.created_by = req.headers.user_uuid
                let concept_output = await conceptTbl.create(postDatabody1, { returning: true, transaction });

                let finalCConceptData = [];

                postDatabody2.forEach(e => {
                    let obj = {};
                    obj.cc_concept_uuid = concept_output.dataValues.uuid;
                    if (e.concept_value.length > 0) {
                        e.concept_value.forEach(e2 => {
                            let obj_copy = JSON.parse(JSON.stringify(obj));
                            obj_copy.concept_value = e2.term
                            finalCConceptData.push(obj_copy);
                        })
                    } else {
                        let obj_copy = JSON.parse(JSON.stringify(obj));
                        obj_copy.value_from = e.value_from1;
                        obj_copy.value_to = e.value_to1;
                        obj_copy.value_from = e.value_from2;
                        obj_copy.value_to = e.value_to2;
                        obj_copy.value_from = e.value_from3;
                        obj_copy.value_to = e.value_to3;
                        finalCConceptData.push(obj_copy);
                    }
                });

                // if (finalCConceptData.length > 0) {
                //     concept_detail_output = await conceptdetailsTbl.bulkCreate(finalCConceptData, { returning: true, transaction });
                // }
                await transaction.commit();
                transaction_status = true;
                res.send({ statusCode: 200, message: "Created Successfully", responseContents: finalCConceptData })
            } catch (err) {
                console.log(err)
                if (transaction) await transaction.rollback();
                transaction_status = true;
                throw err;
            } finally {
                if (!transaction_status && transaction) {
                    await transaction.rollback();
                }
            }
        } catch (err) {
            console.log(err);
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return res.status(500).json({ status: "error", msg: errorMsg });
        }

    };

    const deletecccMaster = async (req, res, next) => {
        const postData = req.body;

        await cccMasterTbl.update({
            is_active: 0
        }, {
            where: {
                uuid: postData.Ccc_id
            }
        }).then((data) => {
            res.send({
                statusCode: 200,
                msg: "Deleted Successfully",
                req: postData,
                responseContents: data
            });
        }).catch(err => {
            res.send({
                status: "failed",
                msg: "failed to delete data",
                error: err
            });
        });
    };
    const updatecccMasterById = async (req, res, next) => {
        const postData = req.body;
        postData.modified_by = req.headers.user_uuid;
        await cccMasterTbl.update(
            postData, {
            where: {
                uuid: postData.Ccc_id
            }
        }
        ).then((data) => {
            res.send({
                statusCode: 200,
                msg: "Updated Successfully",
                req: postData,
                responseContents: data
            });
        });
    };
    const getcccMasterById = async (req, res, next) => {
        const postData = req.body;
        try {

            const page = postData.page ? postData.page : 1;
            const itemsPerPage = postData.limit ? postData.limit : 10;
            const offset = (page - 1) * itemsPerPage;
            await cccMasterTbl.findOne({
                where: {
                    uuid: postData.Ccc_id
                },
                offset: offset,
                limit: itemsPerPage
            })
                .then((data) => {
                    return res
                        .status(httpStatus.OK)
                        .json({
                            statusCode: 200,
                            req: '',
                            responseContents: data
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
    const getcccMasterByType = async (req, res, next) => {
        const postData = req.body;
        const criticalId = [];
        const concepId = [];
        if (!postData.type) {
            return res
                .status(httpStatus.INTERNAL_SERVER_ERROR)
                .json({
                    status: "info",
                    msg: 'Required type: type'
                });
        }
        try {
            let criticalType = await criticalcareTypeTbl.findOne({
                where: {
                    name: postData.type
                }
            })
            let ccMaster = await cccMasterTbl.findAndCountAll({
                where: {
                    critical_care_type_uuid: criticalType.uuid
                }
            })
            ccMaster.rows.forEach(e => {
                criticalId.push(e.dataValues.uuid)
            })
            let conceptTbl_data = await conceptTbl.findAndCountAll({
                where: {
                    cc_chart_uuid: {
                        [Op.in]: criticalId
                    }
                }
            })
            conceptTbl_data.rows.forEach(e1 => {
                concepId.push(e1.dataValues.uuid)
            })
            let conceptDetails_Tab = await conceptdetailsTbl.findAndCountAll({
                where: {
                    cc_concept_uuid: {
                        [Op.in]: concepId
                    }
                }
            })
            return res.send({ conceptDetails_Tab: conceptDetails_Tab, criticalType: criticalType, ccMaster: ccMaster, conceptTbl_data: conceptTbl_data });
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
    };
    const getcccMasterByTypeById = async (req, res, next) => {
        // console.log("inside api.........")
        const postData = req.body;
        if (!postData.type) {
            return res
                .status(httpStatus.INTERNAL_SERVER_ERROR)
                .json({
                    status: "info",
                    msg: 'Required type: type'
                });
        }
        try {
            const page = postData.page ? postData.page : 1;
            const itemsPerPage = postData.limit ? postData.limit : 10;
            const offset = (page - 1) * itemsPerPage;
            await criticalcareTypeTbl.findOne({
                where: {
                    critical_care_type_uuid: postData.typeId
                }
            })
                .then((data) => {
                    if (!data) {
                        return res
                            .status(httpStatus.INTERNAL_SERVER_ERROR)
                            .json({
                                status: "info",
                                msg: 'Required type:type'
                            });
                    }
                    cccMasterTbl.findOne({
                        where: {
                            // facility_uuid : req.headers.facility_uuid,
                            cc_chart_uuid: data.dataValues.uuid
                        }
                    })
                    // .then((data1) => {
                    //     return res
                    //         .status(httpStatus.OK)
                    //         .json({
                    //             message: "success",
                    //             // statusCode: 200,
                    //             // responseContents: data1 || [],
                    //             // totalRecords: data1.length

                    //         });
                    // });
                    conceptdetailsTbl.findAll({
                        where: {
                            cc_concept_uuid: data1.dataValues.uuid
                        }
                    })
                        .then((data1) => {
                            return res
                                .status(httpStatus.OK)
                                .json({
                                    message: "success",
                                    statusCode: 200,
                                    responseContents: data1 || [],
                                    totalRecords: data1.length

                                });
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
    return {
        getcccMasterByType,
        postcccMaster,
        deletecccMaster,
        updatecccMasterById,
        getcccMasterById,
        getAllcccMaster
    };

};
module.exports = cccMasterController();