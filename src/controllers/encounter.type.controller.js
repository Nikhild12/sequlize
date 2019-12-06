// Package Import
const httpStatus = require("http-status");

// Sequelizer Import
const sequelizeDb = require('../config/sequelize');

// Initialize Encounter
const encounter_type_tbl = sequelizeDb.encounter_type;

const emr_constants = require('../config/constants');

const EncounterType = () => {
    
    /**
     * 
     * @param {*} req 
     * @param {*} res 
     */

    const _getEncounterTypeList = async (req, res) => {

        const { user_uuid } = req.headers;

        if (user_uuid) {

            try {

                const encounter_type_list = await encounter_type_tbl.findAll({
                    where: { status: emr_constants.IS_ACTIVE, is_active: emr_constants.IS_ACTIVE }
                });
                return res.status(200).send({ code: httpStatus.OK, message: "Encounter Type Fetched Sucessfully", responseContents: encounter_type_list });

            } catch (ex) {

                console.log(ex.message);
                return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });

            }
        } else {

            return res.status(400).send({ code: httpStatus[400], message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}` });

        }
    }

    return {
        getEncounterTypeList: _getEncounterTypeList
    }
}


module.exports = EncounterType();