// Package Import
const httpStatus = require("http-status");

// Sequelizer Import
const sequelizeDb = require("../config/sequelize");
const Sequelize = require("sequelize");

// Utility Service Import
const emr_utility = require("../services/utility.service");

// Constants Import
const emr_constants = require("../config/constants");

const favourite_type = sequelizeDb.favourite_type;


const FavouriteType = () => {

    const _getFavouriteType = async (req, res) => {

        let name, pageNo, paginationSize;
        let query = {
            attributes: { exclude: ['modified_by', 'modified_date'] },
        };
        const isPostMethod = req.method === "POST";
        if (isPostMethod) {
            ({ name, pageNo = 0, paginationSize = 10 } = req.body);
            const offset = pageNo * paginationSize;
            query.where = emr_utility.getFilterByThreeQueryForCodeAndName(name);
            query.offset = offset;
            query.limit = paginationSize;
        } else {
            query.where = {
                is_active: emr_constants.IS_ACTIVE,
                status: emr_constants.IS_ACTIVE
            };
        }
        try {

            let favouriteTypeList;
            if (isPostMethod) {
                favouriteTypeList = await favourite_type.findAndCountAll(query);
            } else {
                favouriteTypeList = await favourite_type.findAll(query);
            }

            const records = isPostMethod ? favouriteTypeList.rows : favouriteTypeList;
            const code = emr_utility.getResponseCodeForSuccessRequest(records);
            const message = emr_utility.getResponseMessageForSuccessRequest(code, 'favty');

            return res
                .status(200)
                .send({
                    statusCode: code, message: message,
                    [`${isPostMethod ? 'responseContents' : 'responseContent'}`]: isPostMethod ? favouriteTypeList.rows : favouriteTypeList,
                    totalRecords: isPostMethod ? favouriteTypeList.count : favouriteTypeList.length
                });

        } catch (ex) {
            console.log(ex);
            return res
                .status(500)
                .send({ code: httpStatus.INTERNAL_SERVER_ERROR, message: ex.message });
        }

    };


    return {
        getFavouriteType: _getFavouriteType
    };
};


module.exports = FavouriteType();