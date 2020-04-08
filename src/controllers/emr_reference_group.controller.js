const httpStatus = require("http-status");
const db = require("../config/sequelize");
const _ = require("lodash");
var Sequelize = require('sequelize');
var Op = Sequelize.Op;


const emr_reference_group_tbl = db.emr_reference_group;
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
                    is_active: 1
                }
            };

            if (postData.search && /\S/.test(postData.search)) {
                findQuery.where[Op.or] = [
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('emr_reference_group.name')), 'LIKE', '%' + postData.search.toLowerCase() + '%'),
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('emr_reference_group.code')), 'LIKE', '%' + postData.search.toLowerCase() + '%'),
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('app_module.name')), 'LIKE', '%' + postData.search.toLowerCase() + '%'),
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


            if (postData.moduleId && /\S/.test(postData.moduleId)) {
                findQuery.where['$app_module.uuid$'] = postData.moduleId;
            }


            if (postData.hasOwnProperty('status') && /\S/.test(postData.status)) {
                findQuery.where['is_active'] = postData.status;
            }

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

    return {
        getreferenceGroupController

    };
};


module.exports = referenceGroupController();

