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
        if (req.method === "POST") {
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
            const favouriteTypeList = await favourite_type.findAll(query);
            const code = emr_utility.getResponseCodeForSuccessRequest(favouriteTypeList);
            const message = emr_utility.getResponseMessageForSuccessRequest(code, 'favty');

            return res
                .status(200)
                .send({ code, statusCode:code, message: message, responseContent: favouriteTypeList });

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