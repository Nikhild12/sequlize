// Package Import
const httpStatus = require("http-status");

// Sequelizer Import
const sequelizeDb = require('../config/sequelize');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

// Initialize EMR Workflow
const chief_complaints_tbl = sequelizeDb.chief_complaints;

const emr_const = require('../config/constants');


function getChiefComplaintsFilterByQuery(searchBy, searchValue) {
    searchBy = searchBy.toLowerCase();
    switch (searchBy) {
        case 'filterbythree':

            return {
                is_active: emr_const.IS_ACTIVE,
                status: emr_const.IS_ACTIVE,
                [Op.or]: [
                    {
                        name: {
                            [Op.like]: `%${searchValue}%`
                        }
                    },
                    {
                        code: {
                            [Op.like]: `%${searchValue}%`,
                        }
                    }
                ]
            }


        case 'chiefId':
        default:
            searchValue = +searchValue;
            return {
                is_active: emr_const.IS_ACTIVE,
                status: emr_const.IS_ACTIVE,
                uuid: searchValue
            }
    }
}

function getChiefComplaintsAttributes() {
    return [
        'uuid',
        'code',
        'name',
        'description',
        'chief_complaint_category_uuid',
        'referrence_link',
        'body_site'
    ]
}

const ChiefComplaints = () => {


    const _getChiefComplaintsFilter = async (req, res) => {

        const { user_uuid } = req.headers;
        const { searchBy, searchValue } = req.query;

        if (user_uuid && searchBy && searchValue) {

            try {
                const chiefComplaintsData = await chief_complaints_tbl.findAll({
                    where: getChiefComplaintsFilterByQuery(searchBy, searchValue),
                    attributes: getChiefComplaintsAttributes()
                });

                if (chiefComplaintsData) {
                    return res.status(200).send({ code: httpStatus.OK, message: "Fetched Chief Complaints Successfully", responseContents: chiefComplaintsData ? chiefComplaintsData : [] });
                }
            } catch (error) {
                console.log(error.message);
                return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: error.message });
            }
        } else {
            return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: 'No Headers Found' });
        }
    }

    return {
        getChiefComplaintsFilter: _getChiefComplaintsFilter
    }

}

module.exports = ChiefComplaints();