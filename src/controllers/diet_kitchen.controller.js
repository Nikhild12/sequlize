// Package Import
const httpStatus = require("http-status");
// Sequelizer Import
const sequelizeDb = require("../config/sequelize");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
var rp = require('request-promise');
const config = require("../config/config");

const dietKitchen = () => {
    // H30-43948 Diet Kitchen api Vignesh K
    const _getDietMaster = async (req, res) => {
        try {
            const reqData = req.body;
            const { user_uuid, authorization } = req.headers;
            const _url = config.wso2DietKitchen + 'dietmaster/getAllDietMaster';
            
            let options = {
                uri: _url,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', 'accept-language': 'en',
                    user_uuid: user_uuid,
                    // Authorization: 'Bearer e222c12c-e0d1-3b8b-acaa-4ca9431250e2',
                    Authorization: authorization
                },
                body: {
                    pageNo: reqData.pageNo,
                    paginationSize: reqData.paginationSize,
                    sortField: reqData.sortField,
                    sortOrder: reqData.sortOrder,
                    search: reqData.search
                },
                json: true
            };
            const dietKitchen_results = await rp(options);

            return res
                .status(httpStatus.OK)
                .json({
                    status: 'success',
                    statusCode: httpStatus.OK,
                    message: dietKitchen_results.message,
                    totalRecords: dietKitchen_results.totalRecords,
                    responseContents: dietKitchen_results.responseContents
                });


        } catch (err) {
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return res
                .status(httpStatus.OK)
                .json({
                    status: "error",
                    statusCode: httpStatus.INTERNAL_SERVER_ERROR,
                    msg: 'Failed to get diet master details',
                    actualMsg: errorMsg
                });
        }
    }
    return {
        getDietMaster: _getDietMaster
    };
};

module.exports = dietKitchen();