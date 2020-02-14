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
            // offset: offset,
            // limit: itemsPerPage,
            // order: [
            //     [sortField, sortOrder],
            // ],
            where: { is_active: 1, status: 1 },
            include: [
                {
                    model: criticalcareTypeTbl,
                    as: 'critical_care_types'
                    // as: "parent_health_office",
                    // attributes: ['uuid', 'name']
                }
                // include : [

                //     { model: bio_waste_detail_tbl ,

                //     include : [ {model: bin_code_master_tbl,include : [ {model: bin_code_color_tbl}]

                //     }]},
                //     // where:{is_active:1,status:1}}, {
                //     {model: bio_med_waste_status_tbl

                //     }]
                // {
                //     model: conceptTbl,
                //     attributes: ['uuid','concept_name','value_type_uuid','is_default']
                // },
                // {
                //     model: conceptdetailsTbl,
                //     attributes: ['uuid', 'concept_values','value_from','value_to']
                // },
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

            let transaction;

            let transaction_status = false;
            let patient_orders_output_uuid = null;
            try {

                transaction = await db.sequelize.transaction();

                //Body Request
                const postData = req.body;
                const postDatabody = req.body.body;
                const postDatabody1 = req.body.body1;
                const postDatabody2 = req.body.body2;


                postDatabody.is_active = 1;
                postDatabody.status = 1;
                postDatabody.revision = 1;
                postDatabody.created_by = user_uuid;
                postDatabody.modified_by = 0;
                postData.created_by = req.headers.user_uuid
                postData.code = postData.fieldname
                postData.name = postData.fieldname;


                let ccc_master_output = await cccMasterTbl.create(postDatabody, { returning: true, transaction });

                postDatabody1.cc_chart_uuid = ccc_master_output.dataValues.uuid
                // postDatabody1.concept_name = ccc_master_output.name
                // postDatabody1.concept_code = ccc_master_output.code
                // postDatabody1.is_multiple = 1;
                // postDatabody1.is_default = 1;
                // postDatabody1.display_order = 1;
                // postDatabody1.is_active = 1;
                // postDatabody1.status = 1;
                // postDatabody1.revision = 1;
                postDatabody1.created_by = user_uuid;
                postDatabody1.modified_by = 0;
                postDatabody1.created_by = req.headers.user_uuid
                let concept_output = await conceptTbl.create(postDatabody1, { returning: true, transaction })
                console.log(concept_output, 'concept');


                postDatabody2.forEach((pD) => {
                    pD.cc_concept_uuid = concept_output.uuid
                    // pD.display_order = 1;
                    // pD.is_default = 1;
                    // pD.is_active = 1;
                    // pD.status = 1;
                    // pD.revision = 1;
                    pD.created_by = user_uuid;
                    pD.modified_by = 0;
                    pD.created_by = req.headers.user_uuid
                    // pD.concept_value = 44;
                });
                let concept_detail_output = await conceptdetailsTbl.bulkCreate(postDatabody2, { returning: true, transaction });

                await transaction.commit();
                transaction_status = true;
                res.send({ statusCode: 200, message: "Created Successfully" })
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


















            // let transaction;
            // let transaction_status = false;
            // try {
            //     transaction = await db.sequelize.transaction();
            //     const postData = req.body;
            //     const postDatabody1 = req.body.body1;
            //     const postDatabody2 = req.body.body2;
            //     postData.created_by = req.headers.user_uuid
            //     postData.code = postData.fieldname
            //     postData.name = postData.fieldname
            //     if (postData) {
            //         await cccMasterTbl.create(postData, { returning: true,transaction })
            //             .then(async (data) => {
            //                 postData.cc_chart_uuid = data.uuid
            //                 postDatabody1.code = postData.fieldname
            //                 postDatabody1.name =postData.fieldname
            //                 await conceptTbl.create(postData, { returning: true, transaction })
            //                     .then(async (result) => {
            //                         postData.cc_concept_uuid = result.uuid
            //                         await conceptdetailsTbl.create(postData, { returning: true, transaction })
            //                             .then(async (details) => {
            //                                 await transaction.commit();
            //                                 transaction_status = true;
            //                                 res.send({ statusCode: 200, message: "Inserted concept details successfully", responseContents: details, transaction })
            //                             })
            //                     }).catch((locationErr) => {
            //                         await transaction.rollback();
            //                         transaction_status = true;
            //                         res.send({ statusCode: 500, msg: "failed to insert concept details", error: locationErr })
            //                     })
            //             }).catch(err => {
            //                 console.log("cccMasterTbl error",err);
            //                 res.status(500).send({ statusCode: 500, msg: "failed to insert Ccc Master details", error: err })
            //             })
            //     }
            //     else {
            //         res.send({ status: 'failed', msg: 'Please enter Ccc Master details' })
            //     }
            // } catch (error) {

            // }

        } catch (err) {
            console.log(err);
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return res.status(500).json({ status: "error", msg: errorMsg });
        }

    };
    // const postcccMaster = async (req, res, next) => { const postData = req.body;
    //     postData.created_by = req.headers.user_uuid;
    //     if (postData) {
    //         cccMasterTbl.findAll({
    //             where: {
    //               [Op.or]: [{
    //                 code: postData.code
    //                 },
    //                 {
    //                    name: postData.name
    //                 }
    //               ]
    //             }
    //           }).then(async (result) =>{
    //             if (result.length != 0) {
    //                 return res.send({
    //                     statusCode: 400,
    //                   status: "error",
    //                   msg: "Record already Found. Please enter ccc Master"
    //                 });
    //               } else{
    //                 await cccMasterTbl.create(postData, {
    //                     returning: true
    //                 }).then(data => {

    //                     res.send({
    //                         statusCode: 200,
    //                         msg: "Inserted ccc Master details Successfully",
    //                         req: postData,
    //                         responseContents: data
    //                     });
    //                 }).catch(err => {

    //                     res.send({
    //                         status: "failed",
    //                         msg: "failed to ccc Master details",
    //                         error: err
    //                     });
    //                 });
    //               }
    //           });


    //     } else {

    //         res.send({
    //             status: 'failed',
    //             msg: 'Please enter ccc Master details'
    //         });
    //     }};
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
        // console.log("inside api.........")
        const postData = req.body;
        const criticalId = [];
        const concepId =[];
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
            let conceptDetails_Tab =await conceptdetailsTbl.findAndCountAll({
                where:{
                    cc_concept_uuid:{
                        [Op.in]:concepId
                    }
                }
            })
            return res.send({conceptDetails_Tab:conceptDetails_Tab, criticalType: criticalType, ccMaster: ccMaster, conceptTbl_data: conceptTbl_data });
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