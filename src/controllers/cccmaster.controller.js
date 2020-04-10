const httpStatus = require("http-status");
const db = require("../config/sequelize");
const sequelizeDb = require('../config/sequelize');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const cccMasterTbl = db.critical_care_charts;
const conceptTbl = db.critical_care_concepts;
const conceptdetailsTbl = db.critical_care_concept_values;
const criticalcareTypeTbl = db.critical_care_types;
const criticalCareUomsTbl = db.critical_care_uoms;
const Q = require('q');


const cccMasterController = () => {
    /**
    * Returns jwt token if valid username and password is provided
    * @param req
    * @param res
    * @param next
    * @returns {*}
    */

    const getAllcccMaster = async (req, res, next) => {
        try {
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
                // include: [
                //     {
                //         model: criticalcareTypeTbl,
                //         as: 'critical_care_types'
                //     }
                //     // {
                //     //     model: conceptTbl,
                //     //     include: [{ model: conceptdetailsTbl }]
                //     // }
                // ]

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
            let data = await cccMasterTbl.findAndCountAll({
                findQuery,

                attributes: ['uuid', 'critical_care_type_uuid', 'code', 'name', 'description', 'critical_care_uom_uuid'
                    , 'mnemonic_code_master_uuid', 'loinc_code_master_uuid', 'comments', 'is_active',
                    'status'],
                where: {
                    is_active: 1, status: 1
                },
                include: [
                    {
                        model: conceptTbl,
                        as: 'critical_care_concepts',
                        attributes: ['uuid', 'cc_chart_uuid', 'concept_code', 'concept_name', 'value_type_uuid', 'is_multiple', 'is_default', 'is_mandatory', 'display_order', 'is_active', 'status'],
                        where: { is_active: 1, status: 1 },
                        include: [
                            {
                                model: conceptdetailsTbl,
                                as: 'critical_care_concept_values',
                                attributes: ['uuid', 'cc_concept_uuid', 'concept_value', 'value_from', 'value_to', 'display_order', 'is_default', 'is_active', 'status'],
                                where: { is_active: 1, status: 1 },
                            }
                        ]
                    }

                ], returning: true
            });

            return res
                .status(httpStatus.OK)
                .json({
                    statusCode: 200,
                    req: '',
                    responseContents: (data.rows ? data.rows : [])
                });

        }
        catch (err) {
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return res
                .status(httpStatus.INTERNAL_SERVER_ERROR)
                .json({
                    status: "error",
                    msg: errorMsg
                });
        }
    };
    const getAllcccMaster_old = async (req, res, next) => {
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
    const postcccMaster_old = async (req, res, next) => {
        try {
            if (typeof req.body != "object" || Object.keys(req.body).length < 1) {
            }
            const { user_uuid, facility_uuid } = req.headers;
            let concept_detail_output;
            // let transaction;

            //let transaction_status = false;
            try {

                //   transaction = await db.sequelize.transaction();

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


                let ccc_master_output = await cccMasterTbl.create(postDatabody, { returning: true });

                postDatabody1.cc_chart_uuid = ccc_master_output.dataValues.uuid
                postDatabody1.created_by = user_uuid;
                postDatabody1.modified_by = 0;
                postDatabody1.created_by = req.headers.user_uuid
                let concept_output = await conceptTbl.create(postDatabody1, { returning: true });

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
                //  await transaction.commit();
                // transaction_status = true;
                res.send({ statusCode: 200, message: "Created Successfully", responseContents: finalCConceptData })
            } catch (err) {
                console.log(err);
                // if (transaction) await transaction.rollback();
                // transaction_status = true;
                throw err;
            } finally {
                // if (!transaction_status && transaction) {
                //     await transaction.rollback();
                // }
            }
        } catch (err) {
            console.log(err);
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return res.status(500).json({ status: "error", msg: errorMsg });
        }

    };


    const postcccMaster = async (req, res, next) => {
        try {
            if (typeof req.body != "object" || Object.keys(req.body).length < 1) {
            }
            const { user_uuid, facility_uuid } = req.headers;
            let concept_detail_output;
            // let transaction;

            //let transaction_status = false;
            try {

                //   transaction = await db.sequelize.transaction();

                //Body Request
                const postData = req.body;
                const postDatabody = req.body.body;
                const postDatabody1 = req.body.body1;
                const postDatabody2 = req.body.body2;

                postDatabody.created_by = user_uuid;
                postDatabody.modified_by = 0;
                postData.created_by = req.headers.user_uuid;
                postData.code = postData.fieldname;
                postData.name = postData.fieldname;

                let ccc_master_output = await cccMasterTbl.create(postDatabody, { returning: true });

                postDatabody1.cc_chart_uuid = ccc_master_output.dataValues.uuid;
                postDatabody1.created_by = user_uuid;
                postDatabody1.modified_by = 0;
                postDatabody1.created_by = req.headers.user_uuid;
                let concept_output = await conceptTbl.create(postDatabody1, { returning: true });

                let valuetypesSave = [];
                if (postDatabody2.concept_value) {
                    for (let i = 0; i < postDatabody2.concept_value.length; i++) {
                        const element = postDatabody2.concept_value[i];
                        valuetypesSave.push({
                            cc_concept_uuid: concept_output.uuid,
                            concept_value: element.concept_value
                        });
                    }
                    if (valuetypesSave.length > 0) {
                        let conceptValuesResponse = await conceptdetailsTbl.bulkCreate(valuetypesSave);
                    }
                } else {
                    let obj_copy = {}; let obj_copy1 = {}; let obj_copy2 = {};
                    obj_copy.cc_concept_uuid = concept_output.uuid,
                        obj_copy.value_from = postDatabody2.normalrange.value_from,
                        obj_copy.value_to = postDatabody2.normalrange.value_to;

                    valuetypesSave.push(obj_copy);

                    obj_copy1.cc_concept_uuid = concept_output.uuid,
                        obj_copy1.value_from = postDatabody2.lowrange.value_from,
                        obj_copy1.value_to = postDatabody2.lowrange.value_to;
                    valuetypesSave.push(obj_copy1);

                    obj_copy2.cc_concept_uuid = concept_output.uuid,
                        obj_copy2.value_from = postDatabody2.highrange.value_from,
                        obj_copy2.value_to = postDatabody2.highrange.value_to;
                    valuetypesSave.push(obj_copy2);

                    let conceptRangesResponse = await conceptdetailsTbl.bulkCreate(valuetypesSave, { returning: true });
                }
                res.send({
                    statusCode: 200, message: "Created Successfully", responseContents: {
                        ccc_master_output: ccc_master_output, concept_output: concept_output,
                        conceptValuesResponse: valuetypesSave
                    }
                });
            } catch (err) {
                console.log(err);
                // if (transaction) await transaction.rollback();
                // transaction_status = true;
                throw err;
            } finally {
                // if (!transaction_status && transaction) {
                //     await transaction.rollback();
                // }
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
    const updatecccMasterById_old = async (req, res, next) => {
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

    const updatecccMasterById = async (req, res) => {
        const { user_uuid } = req.headers;
        //   const { data } = req.body;
        if (user_uuid) {
            try {
                let bulkUpdateCCCResponse = await bulkUpdateCCC(req.body);
                return res.send({ status: 'success', statusCode: 200, msg: 'success', responseContents: bulkUpdateCCCResponse });
            } catch (err) {
                return res.send({ status: 'error', statusCode: 400, msg: 'failed', error: err.message });
            }
        } else {
            return res.send({ status: 'error', statusCode: 400, msg: 'Authentication error or profile detail should not be empty' });
        }
    };

    const bulkUpdateCCC = async (req) => {
        var deferred = new Q.defer();
        var cccData = req;
        var cccData1 = req.body;
        var cccData2 = req.body1;
        var cccData3 = req.body2;
        let valuetypesSave = []; let valuetypesSave1 = [];
        let valuetypesSave2 = [];

        var cccDetailsUpdate = [];
        cccDetailsUpdate = await cccMasterTbl.update(cccData1,
            { where: { uuid: cccData1.critical_care_charts_uuid } });

        cccDetailsUpdate = await conceptTbl.update(cccData2,
            { where: { uuid: cccData2.critical_care_concepts_uuid } });
        if (cccData3.concept_value) {
            for (let i = 0; i < cccData3.concept_value.length; i++) {
                const element = cccData3.concept_value[i];
                cccDetailsUpdate.push(await conceptdetailsTbl.update({ concept_value: element.concept_value, cc_concept_uuid: cccData3.cc_concept_uuid }, { where: { uuid: element.critical_care_concept_values_uuid } }));
            }
        }
        else {
            let obj_copy = {}; let obj_copy1 = {}; let obj_copy2 = {};
            // obj_copy.critical_care_concept_values_uuid = cccData3.critical_care_concept_values_uuid,
            obj_copy.cc_concept_uuid = cccData3.cc_concept_uuid,
                obj_copy.value_from = cccData3.normalrange.value_from,
                obj_copy.value_to = cccData3.normalrange.value_to;

            //valuetypesSave.push(obj_copy);
            cccDetailsUpdate = await conceptdetailsTbl.update(obj_copy,
                { where: { uuid: cccData3.normalrange.critical_care_concept_values_uuid } },
                { returning: true });

            // obj_copy.critical_care_concept_values_uuid = cccData3.critical_care_concept_values_uuid,
            obj_copy1.cc_concept_uuid = cccData3.cc_concept_uuid,
                obj_copy1.value_from = cccData3.lowrange.value_from,
                obj_copy1.value_to = cccData3.lowrange.value_to;
            //valuetypesSave.push(obj_copy1);

            cccDetailsUpdate = await conceptdetailsTbl.update(obj_copy1,
                { where: { uuid: cccData3.lowrange.critical_care_concept_values_uuid } });
            //obj_copy.critical_care_concept_values_uuid = cccData3.critical_care_concept_values_uuid,
            obj_copy2.cc_concept_uuid = cccData3.cc_concept_uuid,
                obj_copy2.value_from = cccData3.highrange.value_from,
                obj_copy2.value_to = cccData3.highrange.value_to;
            // valuetypesSave.push(obj_copy2);
            cccDetailsUpdate = await conceptdetailsTbl.update(obj_copy2,
                { where: { uuid: cccData3.highrange.critical_care_concept_values_uuid } });
        }
        if (cccDetailsUpdate.length > 0) {
            var response = await Q.allSettled(cccDetailsUpdate);
            if (response.length > 0) {
                var responseMsg = [];
                for (let i = 0; i < response.length; i++) {
                    const element = response[i];
                    if (element.state == "rejected") {
                        responseMsg.push(element.reason);
                    }
                }

                if (responseMsg.length == 0) {
                    deferred.resolve({ status: 'success', statusCode: 200, msg: 'Updated successfully.', responseContents: response });
                } else {
                    deferred.resolve({ status: 'error', statusCode: 400, msg: 'Not Updated.', responseContents: responseMsg });
                }
            }
        }
        return deferred.promise;
    };

    const getcccMasterById_old = async (req, res, next) => {
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
    const getcccMasterById = async (req, res, next) => {
        const postData = req.body;
        try {

            const page = postData.page ? postData.page : 1;
            const itemsPerPage = postData.limit ? postData.limit : 10;
            const offset = (page - 1) * itemsPerPage;
            await cccMasterTbl.findAll({
                attributes: ['uuid', 'critical_care_type_uuid', 'code', 'name', 'description', 'critical_care_uom_uuid'
                    , 'mnemonic_code_master_uuid', 'loinc_code_master_uuid', 'comments', 'is_active',
                    'status'],
                where: {
                    uuid: postData.Ccc_id, is_active: 1, status: 1
                },
                include: [
                    {
                        model: conceptTbl,
                        as: 'critical_care_concepts',
                        attributes: ['uuid', 'cc_chart_uuid', 'concept_code', 'concept_name', 'value_type_uuid', 'is_multiple', 'is_default', 'is_mandatory', 'display_order', 'is_active', 'status'],
                        where: { is_active: 1, status: 1 },
                        include: [
                            {
                                model: conceptdetailsTbl,
                                as: 'critical_care_concept_values',
                                attributes: ['uuid', 'cc_concept_uuid', 'concept_value', 'value_from', 'value_to', 'display_order', 'is_default', 'is_active', 'status'],
                                where: { is_active: 1, status: 1 },
                            }
                        ]
                    }

                ],
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
    const getcccMasterByType_old = async (req, res, next) => {
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
    const getcccMasterByType_old1 = async (req, res, next) => {
        const postData = req.body;
        const criticalId = [];
        const concepId = [];
        // if (!postData.type) {
        //     return res
        //         .status(httpStatus.INTERNAL_SERVER_ERROR)
        //         .json({
        //             status: "info",
        //             msg: 'Required type: type'
        //         });
        // }
        try {
            await criticalcareTypeTbl.findAll({
                attributes: ['uuid', 'name', 'color', 'language', 'display_order', 'Is_default', 'is_active', 'status'],
                where: { name: postData.type },
                include: [
                    {
                        model: cccMasterTbl,
                        as: 'critical_care_charts',
                        attributes: ['uuid', 'critical_care_type_uuid', 'code', 'name', 'description', 'critical_care_uom_uuid'
                            , 'mnemonic_code_master_uuid', 'loinc_code_master_uuid', 'comments', 'is_active',
                            'status'],
                        where: { is_active: 1, status: 1 },
                        include: [
                            {
                                model: conceptTbl,
                                as: 'critical_care_concepts',
                                attributes: ['uuid', 'cc_chart_uuid', 'concept_code', 'concept_name', 'value_type_uuid', 'is_multiple', 'is_default', 'is_mandatory', 'display_order', 'is_active', 'status'],
                                where: { is_active: 1, status: 1 },
                                include: [
                                    {
                                        model: conceptdetailsTbl,
                                        as: 'critical_care_concept_values',
                                        attributes: ['uuid', 'cc_concept_uuid', 'concept_value', 'value_from', 'value_to', 'display_order', 'is_default', 'is_active', 'status'],
                                        where: { is_active: 1, status: 1 },
                                    }
                                ]
                            },
                            // {
                            //     model: criticalCareUomsTbl,
                            //     as: 'critical_care_uoms',
                            //     attributes: ['uuid', 'code', 'name', 'color', 'language', 'display_order', 'Is_default', 'is_active', 'status', 'revision', 'created_by', 'created_date', 'modified_by', 'modified_date'],
                            //     where: { is_active: 1, status: 1 }
                            // }

                        ],
                    }
                ]
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
            //return res.send({ conceptDetails_Tab: conceptDetails_Tab, criticalType: criticalType, ccMaster: ccMaster, conceptTbl_data: conceptTbl_data });
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
            let result = await criticalcareTypeTbl.findOne({
                attributes: ['uuid', 'name', 'color', 'language', 'display_order', 'Is_default', 'is_active', 'status'],
                where: { name: postData.type },
                include: [{
                    model: cccMasterTbl,
                    required: false,
                    model: cccMasterTbl,
                    attributes: ['uuid', 'critical_care_type_uuid', 'code', 'name', 'description', 'critical_care_uom_uuid'
                        , 'mnemonic_code_master_uuid', 'loinc_code_master_uuid', 'comments', 'is_active',
                        'status'],
                    where: { is_active: 1, status: 1 },
                    include: [
                        {
                            model: conceptTbl,
                            as: 'critical_care_concepts',
                            required: false,
                            order: [['display_order', 'DESC']],
                            attributes: ['uuid', 'cc_chart_uuid', 'concept_code', 'concept_name', 'value_type_uuid', 'is_multiple', 'is_default', 'is_mandatory', 'display_order', 'is_active', 'status'],
                            where: { is_active: 1, status: 1 },
                            include: [
                                {
                                    model: conceptdetailsTbl,
                                    as: 'critical_care_concept_values',
                                    required: false,
                                    attributes: ['uuid', 'cc_concept_uuid', 'concept_value', 'value_from', 'value_to', 'display_order', 'is_default', 'is_active', 'status'],
                                    where: { is_active: 1, status: 1 },
                                }
                            ]
                        }]
                }]

            }, { returning: true })

            // return res.send({ results: result });
            return res
                .status(httpStatus.OK)
                .json({
                    statusCode: 200,
                    req: '',
                    responseContents: result
                });

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