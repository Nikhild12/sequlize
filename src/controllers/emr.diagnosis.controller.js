const httpStatus = require("http-status");
const db = require("../config/sequelize");
const _ = require("lodash");
const diagnosis_tbl = db.diagnosis;

var Sequelize = require('sequelize');
var Op = Sequelize.Op;


const emrDiagnosisController = () => {
    /**
    * Returns jwt token if valid username and password is provided
    * @param req
    * @param res
    * @param next
    @returns {}
    */

    /*=============== village API's================*/

    const _getEmrDiagnosis = async (req, res, next) => {
        const postData = req.body;
        try {
            const pageNo = postData.pageNo;
            const limit = postData.paginationSize;
            const page = pageNo ? pageNo : 1;
            const itemsPerPage = limit ? limit : 10;
            const offset = postData.offset ? parseInt(postData.offset) :0; 
            let sortArr = ['name', 'ASC'];
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
            let query ={
                offset: offset,
                limit: itemsPerPage,
                order: [
                    sortArr
                ],
                where: {
                    is_active: 1,
                    status: 1,
                }
            }
            if(postData.searchKey && /\S/.test(postData.searchKey) )
            {
                query.where[Op.or] = [
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('diagnosis.name')), 'LIKE', '%' + postData.searchKey.toLowerCase() + '%'),
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('diagnosis.code')), 'LIKE', '%' + postData.searchKey.toLowerCase() + '%'),
                ];
            }
            await diagnosis_tbl.findAndCountAll(query)
                .then((findData) => {
                    return res
                        .status(httpStatus.OK)
                        .json({
                            statusCode: 200,
                            responseContents: (findData.rows ? findData.rows : []),
                            totalRecords: (findData.count ? findData.count : 0)
                        });
                })
                .catch(err => {
                    return res
                        .status(500)
                        .json({
                            statusCode: 500,
                            msg: "Village Data is not found",
                            err: err
                        });
                })
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
    const _getEmrDiagnosisById = async(req,res) => {
        const {diagnosis_uuid} = req.query;
        if(diagnosis_uuid !== undefined){
            try {
                const result =  await diagnosis_tbl.findOne({where:{uuid:diagnosis_uuid,is_active:1,status:1}});
                if(result){
                    return res.status(200).send({ code: httpStatus.OK, message: "Fetched EMR Diagnosis Successfully", responseContents:result  });
                }    
            }
            catch(ex) {
                console.log(ex);
                return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
            }
        } else {
            return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found " });
        }   
    }
    // --------------------------------------------return----------------------------------
    return {
        getEmrDiagnosis:_getEmrDiagnosis,
        getEmrDiagnosisById:_getEmrDiagnosisById
    };
};


module.exports = emrDiagnosisController();