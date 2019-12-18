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

const getChiefComplaintsAttributes= [
        'uuid',
        'code',
        'name',
        'description',
        'chief_complaint_category_uuid',
        'referrence_link',
        'body_site',
        'created_date'
    ];


function getChiefComplaintrUpdateData(user_uuid, ChiefComplaintsReqData) {

    return {
        uuid:ChiefComplaintsReqData.ChiefComplaints_id,
        code: ChiefComplaintsReqData.code,
        user_uuid: user_uuid,
        name: ChiefComplaintsReqData.name,
        description: ChiefComplaintsReqData.description,
        chief_complaint_category_uuid:ChiefComplaintsReqData.chief_complaint_category_uuid,
        referrence_link:ChiefComplaintsReqData.referrence_link,
        body_site:ChiefComplaintsReqData.body_site,
        modified_by: user_uuid,
        modified_date: new Date(),
        is_active: ChiefComplaintsReqData.is_active
    };

}

const ChiefComplaints = () => {


    const _getChiefComplaintsFilter = async (req, res) => {

        const { user_uuid } = req.headers;
        const { searchBy, searchValue } = req.query;

        if (user_uuid && searchBy && searchValue) {

            try {
                const chiefComplaintsData = await chief_complaints_tbl.findAll({
                    where: getChiefComplaintsFilterByQuery(searchBy, searchValue),
                    attributes: getChiefComplaintsAttributes
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

    const _createChiefComplaints = async (req, res) => {
        const { user_uuid } = req.headers;
        const chiefComplaintsData = req.body;

        if (user_uuid && chiefComplaintsData) {
            chiefComplaintsData.code = chiefComplaintsData & chiefComplaintsData.code ? chiefComplaintsData.code : chiefComplaintsData.name;
            chiefComplaintsData.description = chiefComplaintsData & chiefComplaintsData.description ? chiefComplaintsData.description : chiefComplaintsData.name;
            chiefComplaintsData.is_active = chiefComplaintsData.status = emr_const.IS_ACTIVE;
            chiefComplaintsData.created_by = chiefComplaintsData.modified_by = user_uuid;
            chiefComplaintsData.created_date = chiefComplaintsData.modified_date = new Date();
            chiefComplaintsData.revision = 1;
            try {
                const chiefComplaintsCreatedData = await chief_complaints_tbl.create(chiefComplaintsData, { returning: true });

                if (chiefComplaintsCreatedData) {
                    chiefComplaintsData.uuid = chiefComplaintsCreatedData.uuid;
                    return res.status(200).send({ code: httpStatus.OK, message: "Inserted Chief Complaints Successfully", responseContents: chiefComplaintsData });
                }
            } catch (ex) {
                console.log(ex.message);
                return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
            }
        } else {
            return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: 'No Headers Found' });
        }

    }
    const _getChiefComplaintsById = async (req, res) => {

        const { user_uuid } = req.headers;
        const { ChiefComplaints_id } = req.query;
        if (user_uuid && ChiefComplaints_id) {
            try {

                const chiefData = await chief_complaints_tbl.findAll({
                    attributes: getChiefComplaintsAttributes,
                    where: {uuid:ChiefComplaints_id}
                });

               
                return res.status(httpStatus.OK).send(chiefData)

            } catch (ex) {

                console.log(`Exception Happened ${ex}`);
                return res.status(400).send({ code: httpStatus[400], message: ex.message });

            }
        } else {
            return res.status(400).send({ code: httpStatus[400], message: "No Request headers or Query Param Found" });
        }

    }

    const _updateChiefComplaintsById = async (req, res) => {

        const { user_uuid } = req.headers;
        const ChiefComplaintsReqData = req.body;

        const ChiefComplaintsReqUpdateData = getChiefComplaintrUpdateData(user_uuid, ChiefComplaintsReqData);
       

        if (user_uuid && ChiefComplaintsReqData) {

            try {

                const updatedcheifcomplaintsData = await Promise.all([
                    chief_complaints_tbl.update(ChiefComplaintsReqUpdateData, { where: { uuid: ChiefComplaintsReqData.ChiefComplaints_id } })
                   
                ]);

                if (updatedcheifcomplaintsData) {
                    return res.status(200).send({ code: httpStatus.OK, message: "Updated Successfully", requestContent: ChiefComplaintsReqData });
                }

            } catch (ex) {

                console.log(`Exception Happened ${ex}`);
                return res.status(400).send({ code: httpStatus[400], message: ex.message });

            }

        } else {
            return res.status(400).send({ code: httpStatus[400], message: "No Request headers or Body Found" });
        }
    }

    const _deleteChiefComplaints = async (req, res) => {

        // plucking data req body
        const { ChiefComplaints_id } = req.body;
        const { user_uuid } = req.headers;

        if (ChiefComplaints_id) {
            const updatedcheifcomplaintsData = { status: 0, is_active: 0, modified_by: user_uuid, modified_date: new Date() };
            try {

                const updatedcheifcomplaintsAsync = await Promise.all(
                    [
                        chief_complaints_tbl.update(updatedcheifcomplaintsData, { where: { uuid: ChiefComplaints_id } })
                       
                    ]
                );

                if (updatedcheifcomplaintsAsync) {
                    return res.status(200).send({ code: httpStatus.OK, message: "Deleted Successfully" });
                }

            } catch (ex) {
                return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
            }

        } else {
            return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" });
        }

    }
    const _getChiefComplaints = async (req, res) => {

        const { user_uuid } = req.headers;
        

        if (user_uuid ) {
            let favouriteList = [];

            try {

                const chiefdata = await chief_complaints_tbl.findAll({
                    attributes: getChiefComplaintsAttributes,
                    
                });

                // favouriteList = getFavouritesInList(tickSheetData);
                return res.status(httpStatus.OK).send(chiefdata);

            } catch (ex) {

                console.log(`Exception Happened ${ex}`);
                return res.status(400).send({ code: httpStatus[400], message: ex.message });

            }

        } else {
            return res.status(400).send({ code: httpStatus[400], message: "No Request headers or Query Param Found" });
        }


    }
    return {
        getChiefComplaintsFilter: _getChiefComplaintsFilter,
        createChiefComplaints: _createChiefComplaints,
        getChiefComplaints:_getChiefComplaints,
        getChiefComplaintsById:_getChiefComplaintsById,
        updateChiefComplaintsById:_updateChiefComplaintsById,
        deleteChiefComplaints:_deleteChiefComplaints
    }

}

module.exports = ChiefComplaints();