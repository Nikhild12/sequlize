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

        try {
            const favouriteTypeList = await favourite_type.findAll({
                attributes: { exclude: ['modified_by', 'modified_date'] },
                where: {
                    is_active: emr_constants.IS_ACTIVE,
                    status: emr_constants.IS_ACTIVE
                }
            });
            const code = emr_utility.getResponseCodeForSuccessRequest(favouriteTypeList);
            const message = emr_utility.getResponseMessageForSuccessRequest(code, 'favty');

            return res
                .status(200)
                .send({ code: code, message: message, responseContent: favouriteTypeList });

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