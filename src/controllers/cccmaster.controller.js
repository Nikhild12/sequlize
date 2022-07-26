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
const valueTypesTbl = db.value_types;

const config = require('../config/config');
const Q = require('q');
const rp = require('request-promise');


const cccMasterController = () => {
    /**
    * Returns jwt token if valid username and password is provided
    * @param req
    * @param res
    * @param next
    * @returns {*}
    */


    const getAllcccMaster = async (req, res) => {
        try {
            const getsearch = req.body;
            let pageNo = 0;
            const itemsPerPage = getsearch.paginationSize ? getsearch.paginationSize : 10;
            let sortArr = ['uuid', 'DESC'];
            if (getsearch.pageNo) {
                let temp = parseInt(getsearch.pageNo);
                if (temp && (temp != NaN)) {
                    pageNo = temp;
                }
            }
            const offset = pageNo * itemsPerPage;
            let fieldSplitArr = [];
            if (getsearch.sortField) {
                if (getsearch.sortField == 'uuid') {
                    getsearch.sortField = 'uuid';
                }
                fieldSplitArr = getsearch.sortField.split('.');
                if (fieldSplitArr.length == 1) {
                    sortArr[0] = getsearch.sortField;
                } else {
                    for (let idx = 0; idx < fieldSplitArr.length; idx++) {
                        const element = fieldSplitArr[idx];
                        fieldSplitArr[idx] = element.replace(/\[\/?.+?\]/ig, '');
                    }
                    sortArr = fieldSplitArr;
                }
            }
            if (getsearch.sortOrder && ((getsearch.sortOrder.toLowerCase() == 'asc') || (getsearch.sortOrder.toLowerCase() == 'desc'))) {
                if ((fieldSplitArr.length == 1) || (fieldSplitArr.length == 0)) {
                    sortArr[1] = getsearch.sortOrder;
                } else {
                    sortArr.push(getsearch.sortOrder);
                }
            }

            // sortArr[0] = { model: 'db.' + sortArr[0], as: sortArr[0] };
            // sortArry = [sortArr[0], sortArr[1], sortArr[2]];
            if (sortArr.length > 2) {
                sortArry = [sortArr[0], sortArr[1], sortArr[2]];
            } else {
                sortArry = [sortArr[0], sortArr[1]];
            }

            let findQuery = {
                // subQuery: false,

                where: { is_active: 1, status: 1 },
                order: [
                    sortArry
                ],
                //  attributes: { "exclude": ['id', 'createdAt', 'updatedAt'] },
                offset: offset,
                limit: itemsPerPage,
                attributes: ['uuid', 'critical_care_type_uuid', 'code', 'name', 'description', 'critical_care_uom_uuid'
                    , 'mnemonic_code_master_uuid', 'loinc_code_master_uuid', 'comments', 'is_active',
                    'status', 'modified_date'],
                where: {
                    is_active: 1, status: 1
                },
                include: [
                    {
                        model: conceptTbl,
                        as: 'critical_care_concepts',
                        attributes: ['uuid', 'cc_chart_uuid', 'concept_code', 'concept_name', 'value_type_uuid', 'is_multiple', 'is_default', 'is_mandatory', 'display_order', 'is_active', 'status'],
                        where: { is_active: 1, status: 1 },
                        //  subQuery: false,
                        include: [
                            {
                                model: valueTypesTbl,
                                as: 'value_types',
                                attributes: ['uuid', 'code', 'name', 'color', 'language', 'display_order', 'Is_default'],
                                where: { is_active: 1, status: 1 },
                            },
                            {
                                model: conceptdetailsTbl,
                                as: 'critical_care_concept_values',
                                attributes: ['uuid', 'cc_concept_uuid', 'concept_value', 'value_from', 'value_to', 'display_order', 'is_default', 'is_active', 'status'],
                                where: { is_active: 1, status: 1 },
                            }
                        ]
                    },
                    {
                        model: criticalcareTypeTbl,
                        as: 'critical_care_types',
                        attributes: ['uuid', 'name']
                    }
                ],
                distinct: true
            };
            // if (getsearch.search && /\S/.test(getsearch.search)) {
            //     findQuery.where[Op.or] = [
            //         Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), 'LIKE', '%' + getsearch.search.toLowerCase() + '%'),
            //         Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('critical_care_types.name')), 'LIKE', '%' + getsearch.search.toLowerCase() + '%'),

            //     ];
            // }


            if (getsearch.search && /\S/.test(getsearch.search)) {
                Object.assign(findQuery.where, {
                    [Op.or]: [
                        {
                            '$critical_care_charts.name$': {
                                [Op.like]: '%' + getsearch.search + '%'
                            }
                        },
                        {
                            '$critical_care_charts.code$': {
                                [Op.like]: '%' + getsearch.search + '%'
                            }
                        }
                    ]
                });
            }

            if (getsearch.cccType && /\S/.test(getsearch.cccType)) {
                if (findQuery.where[Op.or]) {
                    findQuery.where[Op.and] = [{
                        [Op.or]: [Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('critical_care_types.name')), getsearch.cccType)]
                    }];
                } else {
                    findQuery.where[Op.or] = [
                        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('critical_care_types.name')), getsearch.cccType)
                    ];
                }
            }
            /*Critical care type uuid filter*/
            if (getsearch.ccuuid && /\S/.test(getsearch.ccuuid)) {
                if (findQuery.where[Op.or]) {
                    findQuery.where[Op.and] = [{
                        [Op.or]: [Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('critical_care_charts.critical_care_type_uuid')), getsearch.ccuuid)]
                    }];
                } else {
                    findQuery.where[Op.or] = [
                        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('critical_care_charts.critical_care_type_uuid')), getsearch.ccuuid)
                    ];
                }
            }
            /*Critical care type uuid filter*/
            if (getsearch.codeName && /\S/.test(getsearch.codeName)) {
                if (findQuery.where[Op.or]) {
                    findQuery.where[Op.and] = [{
                        [Op.or]: [
                            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('critical_care_charts.name')), getsearch.codeName),
                            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('critical_care_charts.code')), getsearch.codeName)
                        ]
                    }];
                } else {
                    findQuery.where[Op.or] = [
                        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('critical_care_charts.name')), getsearch.codeName),
                        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('critical_care_charts.code')), getsearch.codeName)
                    ];
                }
            }
            // if (getsearch.hasOwnProperty('status') && /\S/.test(getsearch.status)) {
            //     findQuery.where['is_active'] = getsearch.status;
            //     findQuery.where['status'] = getsearch.status;

            // }
            if (getsearch.hasOwnProperty('status') && /\S/.test(getsearch.status)) {
                findQuery.where['is_active'] = getsearch.status;
            }
            const data = await cccMasterTbl.findAndCountAll(findQuery);
            return res
                .status(httpStatus.OK)
                .json({
                    statusCode: 200,
                    message: "Get Details Fetched successfully",
                    req: '',
                    totalRecords: data.count,
                    responseContents: data.rows
                });
        } catch (err) {
            console.log('Error = ', err);
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return res
                .status(httpStatus.INTERNAL_SERVER_ERROR)
                .json({
                    status: "error",
                    msg: errorMsg
                });
        }
    };

    const getAllcccMaster1 = async (req, res) => {
        try {
            const getsearch = req.body;
            let pageNo = 0;
            const itemsPerPage = getsearch.paginationSize ? getsearch.paginationSize : 10;
            let sortArr = ['modified_date', 'DESC'];
            if (getsearch.pageNo) {
                let temp = parseInt(getsearch.pageNo);
                if (temp && (temp != NaN)) {
                    pageNo = temp;
                }
            }
            const offset = pageNo * itemsPerPage;
            let fieldSplitArr = [];
            if (getsearch.sortField) {
                if (getsearch.sortField == 'modified_date') {
                    getsearch.sortField = 'modified_date';
                }
                fieldSplitArr = getsearch.sortField.split('.');
                if (fieldSplitArr.length == 1) {
                    sortArr[0] = getsearch.sortField;
                } else {
                    for (let idx = 0; idx < fieldSplitArr.length; idx++) {
                        const element = fieldSplitArr[idx];
                        fieldSplitArr[idx] = element.replace(/\[\/?.+?\]/ig, '');
                    }
                    sortArr = fieldSplitArr;
                }
            }
            if (getsearch.sortOrder && ((getsearch.sortOrder.toLowerCase() == 'asc') || (getsearch.sortOrder.toLowerCase() == 'desc'))) {
                if ((fieldSplitArr.length == 1) || (fieldSplitArr.length == 0)) {
                    sortArr[1] = getsearch.sortOrder;
                } else {
                    sortArr.push(getsearch.sortOrder);
                }
            }
            let findQuery = {
                // subQuery: false,

                where: { is_active: 1, status: 1 },
                order: [
                    sortArr
                ],
                //  attributes: { "exclude": ['id', 'createdAt', 'updatedAt'] },
                offset: offset,
                limit: itemsPerPage,
                attributes: ['uuid', 'critical_care_type_uuid', 'code', 'name', 'description', 'critical_care_uom_uuid'
                    , 'mnemonic_code_master_uuid', 'loinc_code_master_uuid', 'comments', 'is_active',
                    'status', 'modified_date'],
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
                    },
                    {
                        model: criticalcareTypeTbl,
                        as: 'critical_care_types',
                        attributes: ['uuid', 'name']
                    }
                ],

            };
            if (getsearch.search && /\S/.test(getsearch.search)) {
                findQuery.where[Op.or] = [
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), 'LIKE', '%' + getsearch.search.toLowerCase() + '%'),
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('critical_care_types.name')), 'LIKE', '%' + getsearch.search.toLowerCase() + '%'),

                ];
            }
            if (getsearch.cccType && /\S/.test(getsearch.cccType)) {
                if (findQuery.where[Op.or]) {
                    findQuery.where[Op.and] = [{
                        [Op.or]: [Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('critical_care_types.name')), getsearch.cccType)]
                    }];
                } else {
                    findQuery.where[Op.or] = [
                        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('critical_care_types.name')), getsearch.cccType)
                    ];
                }
            }

            if (getsearch.hasOwnProperty('status') && /\S/.test(getsearch.status)) {
                findQuery.where['is_active'] = getsearch.status;
                findQuery.where['status'] = getsearch.status;

            }
            const data = await cccMasterTbl.findAndCountAll(findQuery

                // {

                // offset: offset,
                // limit: itemsPerPage,
                // attributes: ['uuid', 'critical_care_type_uuid', 'code', 'name', 'description', 'critical_care_uom_uuid'
                //     , 'mnemonic_code_master_uuid', 'loinc_code_master_uuid', 'comments', 'is_active',
                //     'status', 'modified_date'],
                // where: {
                //     is_active: 1, status: 1
                // },
                // include: [
                //     {
                //         model: conceptTbl,
                //         as: 'critical_care_concepts',
                //         attributes: ['uuid', 'cc_chart_uuid', 'concept_code', 'concept_name', 'value_type_uuid', 'is_multiple', 'is_default', 'is_mandatory', 'display_order', 'is_active', 'status'],
                //         where: { is_active: 1, status: 1 },
                //         include: [
                //             {
                //                 model: conceptdetailsTbl,
                //                 as: 'critical_care_concept_values',
                //                 attributes: ['uuid', 'cc_concept_uuid', 'concept_value', 'value_from', 'value_to', 'display_order', 'is_default', 'is_active', 'status'],
                //                 where: { is_active: 1, status: 1 },
                //             }
                //         ]
                //     },
                //     {
                //         model: criticalcareTypeTbl,
                //         as: 'critical_care_types',
                //         attributes: ['uuid', 'name']
                //     }
                // ],
                //}
            );
            return res
                .status(httpStatus.OK)
                .json({
                    statusCode: 200,
                    message: "Get Details Fetched successfully",
                    req: '',
                    totalRecords: data.count,
                    responseContents: data.rows
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

    const postcccMaster = async (req, res, next) => {
        try {
            if (typeof req.body != "object" || Object.keys(req.body).length < 1) {
                /* empty */
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
                postDatabody.modified_by = user_uuid;
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
            is_active: 0,
            status: 0
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

    const updatecccMasterById = async (req, res) => {
        const { user_uuid } = req.headers;
         //const { data } = req.body;
        
        if (user_uuid) {
            try {
                let bulkUpdateCCCResponse = await bulkUpdateCCC(req.body,user_uuid);
                return res.send({ status: 'success', statusCode: 200, msg: 'success', responseContents: bulkUpdateCCCResponse });
            } catch (err) {
                return res.send({ status: 'error', statusCode: 400, msg: 'failed', error: err.message });
            }
        } else {
            return res.send({ status: 'error', statusCode: 400, msg: 'Authentication error or profile detail should not be empty' });
        }
    };

    const bulkUpdateCCC = async (req,user_uuid) => {
        var deferred = new Q.defer();
        var cccData = req;
        var cccData1 = req.body;
        var cccData2 = req.body1;
        var cccData3 = req.body2;
        let valuetypesSave = []; let valuetypesSave1 = [];
        let valuetypesSave2 = [];
       cccData2.modified_by= user_uuid;
        var cccDetailsUpdate = [];
        cccDetailsUpdate = await cccMasterTbl.update(cccData1,
            { where: { uuid: cccData1.critical_care_charts_uuid } });

        cccDetailsUpdate = await conceptTbl.update(cccData2,
            { where: { uuid: cccData2.critical_care_concepts_uuid } });
        if (cccData3.concept_value) {
            for (let i = 0; i < cccData3.concept_value.length; i++) {
                const element = cccData3.concept_value[i];
                cccDetailsUpdate.push(await conceptdetailsTbl.update({ concept_value: element.concept_value, cc_concept_uuid: cccData3.cc_concept_uuid,modified_by:user_uuid }, { where: { uuid: element.critical_care_concept_values_uuid } }));
            }
        }
        else {
            let obj_copy = {}; let obj_copy1 = {}; let obj_copy2 = {};
            // obj_copy.critical_care_concept_values_uuid = cccData3.critical_care_concept_values_uuid,
            obj_copy.cc_concept_uuid = cccData3.cc_concept_uuid,
                obj_copy.value_from = cccData3.normalrange.value_from,
                obj_copy.value_to = cccData3.normalrange.value_to,
                obj_copy.modified_by= user_uuid;
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

    const getcccMasterById = async (req, res, next) => {
        const postData = req.body;
        try {

            const page = postData.page ? postData.page : 1;
            const itemsPerPage = postData.limit ? postData.limit : 10;
            const offset = (page - 1) * itemsPerPage;
            let result = await cccMasterTbl.findAll({
                attributes: ['uuid', 'critical_care_type_uuid', 'code', 'name', 'description', 'critical_care_uom_uuid'
                    , 'mnemonic_code_master_uuid', 'loinc_code_master_uuid', 'comments', 'is_active',
                    'status', 'created_by', 'modified_by', 'created_date', 'modified_date'],
                where: {
                    uuid: postData.Ccc_id
                },
                include: [
                    {
                        model: conceptTbl,
                        as: 'critical_care_concepts',
                        attributes: ['uuid', 'cc_chart_uuid', 'concept_code', 'concept_name', 'value_type_uuid', 'is_multiple',
                            'is_default', 'is_mandatory', 'display_order', 'is_active', 'status', 'created_by', 'modified_by', 'created_date', 'modified_date'],
                        where: { is_active: 1, status: 1 },
                        include: [
                            {
                                require: false,
                                model: conceptdetailsTbl,
                                as: 'critical_care_concept_values',
                                attributes: ['uuid', 'cc_concept_uuid', 'concept_value', 'value_from', 'value_to', 'display_order', 'is_default', 'is_active',
                                    'status', 'created_by', 'modified_by', 'created_date', 'modified_date'],
                                where: { is_active: 1, status: 1 },
                            }
                        ]
                    },
                    {
                        require: false,
                        model: criticalcareTypeTbl,
                        as: 'critical_care_types',
                        where: { is_active: 1, status: 1 },
                    }

                ],
                offset: offset,
                limit: itemsPerPage
            });

            if (result) {
                let Emonic_Details = {};
                let Lonic_Details = {};
                let EmonicDetails = await getEmonicAndLonicDetails(req.headers.user_uuid, result[0].dataValues.mnemonic_code_master_uuid, 'mnemonic_code_master', req.headers.authorization);
                let LonicDetails = await getEmonicAndLonicDetails(req.headers.user_uuid, result[0].dataValues.loinc_code_master_uuid, 'loinc_code_master', req.headers.authorization);
                if (EmonicDetails.statusCode = 200 && EmonicDetails.responseContent == null || EmonicDetails.responseContent == undefined) {
                    result[0].dataValues.Emonic_Details = {};
                } else {
                    result[0].dataValues.Emonic_Details = EmonicDetails.responseContent;
                }
                if (LonicDetails.statusCode = 200 && LonicDetails.responseContent == null || LonicDetails.responseContent == undefined) {
                    result[0].dataValues.Lonic_Details = {};
                } else {

                    result[0].dataValues.Lonic_Details = LonicDetails.responseContent;
                }
                return res
                    .status(httpStatus.OK)
                    .json({
                        statusCode: 200,
                        req: '',
                        responseContents: result
                    });
            } else {
                return res
                    .status(httpStatus.OK)
                    .json({
                        statusCode: 200,
                        req: '',
                        msg: "No Data Found"
                    });
            }

        } catch (err) {
            console.log('Error === ', err);
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return res
                .status(httpStatus.INTERNAL_SERVER_ERROR)
                .json({
                    status: "error",
                    msg: errorMsg
                });
        }
    };


    async function getEmonicAndLonicDetails(user_uuid, Id, TableName, authorization) {

        let options = {
            uri: config.wso2LisUrl + 'commonReference/getReferenceById',
            method: "POST",
            headers: {
                'Content-type': "application/json",
                Authorization: authorization,
                user_uuid: user_uuid
            },
            body: {
                "table_name": TableName,
                "Id": Id
            },
            //body: {},
            json: true
        };
        const user_details = await rp(options);
        return user_details;
    }

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
                where: { name: postData.type, is_active: 1, status: 1 },
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

            }, { returning: true });

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