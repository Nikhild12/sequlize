const httpStatus = require("http-status");

const db = require("../config/sequelize");

var Sequelize = require('sequelize');
var Op = Sequelize.Op;

const moment = require('moment');

const ventilatorTbl = db.ventilator_charts;
const cccTbl = db.critical_care_charts;
const cctypeTbl = db.critical_care_types;
const vmodeTbl = db.ventilator_modes;

const ventilatorchartsController = () => {
    /**
    * Returns jwt token if valid username and password is provided
    * @param req
    * @param res
    * @param next
    @returns {}
    */


    const _createVentilator = async (req, res) => {

        try {

            let { user_uuid } = req.headers;
            let data1 = req.body.headers;
            let data2 = req.body.observed_data;

            if (user_uuid && data1 && data2) {

                data2.forEach((item, index) => {
                    item.patient_uuid = data1.patient_uuid;
                    item.encounter_uuid = data1.encounter_uuid;
                    item.facility_uuid = data1.facility_uuid;
                    item.encounter_type_uuid = data1.encounter_type_uuid;
                    item.ventilator_mode_uuid = data1.ventilator_mode_uuid;
                    item.comments = data1.comments;
                    item.modified_by = 0;
                    item.is_active = item.status = 1;
                    item.revision = 1;
                    item.created_date = item.modified_date = new Date();
                    item.created_by = user_uuid;
                });
                const createdData = await ventilatorTbl.bulkCreate(data2, { returning: true });
                if (createdData) {
                    res.send({ "status": 200, "Ventilator data": createdData, "message": "Inserted Successfully " });
                }
            } else {
                return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" });
            }
        } catch (ex) {
            res.send({ "status": 400, "message": ex.message });
        }
    };

    const _getventilatorbypatientid = async (req, res) => {

        let { user_uuid } = req.headers;
        let { patient_uuid } = req.query;

        try {
            if (user_uuid && patient_uuid) {
                const data = await ventilatorTbl.findAll({
                    where: {
                        patient_uuid: patient_uuid,
                        is_active: 1,
                        status: 1
                    },

                    include: [
                        {
                            model: vmodeTbl,
                            as: 'ventilator_modes',
                            attributes: ['uuid', 'code', 'name'],
                            where: {
                                is_active: 1,
                                status: 1
                            }
                        },
                        {
                            model: cccTbl,
                            as: 'critical_care_charts',
                            attributes: ['uuid', 'code', 'name', 'description'],
                            where: { is_active: 1, status: 1 },

                            include: [
                                {
                                    model: cctypeTbl,
                                    as: 'critical_care_types',
                                    attributes: ['uuid', 'code', 'name'],
                                    where: { is_active: 1, status: 1 },
                                },]

                        },]

                }, { returning: true });

                if (data) {
                    console.log("fetched sucessfylly");
                    const vdata = getventilatorData(data);
                    return res
                        .status(httpStatus.OK)
                        .json({ statusCode: 200, req: '', responseContents: vdata });
                }
            }
            else {
                return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" });
            }
        } catch (err) {
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return res
                .status(httpStatus.INTERNAL_SERVER_ERROR)
                .json({ status: "error", msg: errorMsg });
        }
    };

    const _updateventilatorbypatientid = async (req, res) => {

        try {
            // plucking data req body
            let { user_uuid } = req.headers;
            let data1 = req.body.headers;
            let data2 = req.body.observed_data;

            if (user_uuid ) {

                const data = await Promise.all(updatevetilatordata(ventilatorTbl, data1, data2, user_uuid));
                if (data) {
                    res.send({ "status": 200, "message": "updated Successfully " });
                }
            }
            else {
                return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" });
            }
        } catch (err) {
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return res
                .status(httpStatus.INTERNAL_SERVER_ERROR)
                .json({ status: "error", msg: errorMsg });
        }
    };

    const _deleteVentilatorDetails = async (req, res) => {

        // plucking data req body
        const { ventilator_uuid } = req.query;
        const { user_uuid } = req.headers;

        try {
            if (ventilator_uuid && user_uuid) {
                const updatedVenlitorData = { status: 0, is_active: 0, modified_by: user_uuid, modified_date: new Date() };

                const updatedVenlator = await ventilatorTbl.update(updatedVenlitorData,
                    { where: { uuid: ventilator_uuid } });

                if (updatedVenlator) {
                    return res.status(200).send({ code: httpStatus.OK, message: "Deleted Successfully" });
                }

            } else {
                return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" });
            }
        } catch (ex) {
            return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
        }
    };

    const _getventilatorcomparedata = async (req, res) => {
        let { user_uuid } = req.headers;
        let { patient_uuid, from_date, to_date } = req.query;

        try {
            if (user_uuid && patient_uuid) {
                const data = await ventilatorTbl.findAll({
                    where: {
                        patient_uuid: patient_uuid,
                        is_active: 1,
                        status: 1,
                        from_date: {
                            [Op.and]: [
                                Sequelize.where(Sequelize.fn('date', Sequelize.col('from_date')), '>=', moment(from_date).format('YYYY-MM-DD')),
                                Sequelize.where(Sequelize.fn('date', Sequelize.col('from_date')), '<=', moment(to_date).format('YYYY-MM-DD'))
                            ]
                        }
                    },
                    include: [
                        {
                            model: vmodeTbl,
                            as: 'ventilator_modes',
                            attributes: ['uuid', 'code', 'name'],
                            where: {
                                is_active: 1,
                                status: 1
                            }
                        },
                        {
                            model: cccTbl,
                            as: 'critical_care_charts',
                            attributes: ['uuid', 'code', 'name', 'description'],
                            where: { is_active: 1, status: 1 },

                            include: [
                                {
                                    model: cctypeTbl,
                                    as: 'critical_care_types',
                                    attributes: ['uuid', 'code', 'name'],
                                    where: { is_active: 1, status: 1 },
                                },]

                        },]
                }, { returning: true });

                if (data) {
                    const vdata = getventilatorData(data);
                    return res
                        .status(httpStatus.OK)
                        .json({ statusCode: 200, req: '', responseContents: vdata });
                }
            }
            else {
                return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" });
            }
        } catch (err) {
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return res
                .status(httpStatus.INTERNAL_SERVER_ERROR)
                .json({ status: "error", msg: errorMsg });
        }
    };

    const _getcccdetails = async (req, res) => {

        let { user_uuid } = req.headers;
        //let { patient_uuid } = req.query;

        try {
            if (user_uuid) {
                const data = await cccTbl.findAll({
                    attributes: ['uuid', 'code', 'name', 'description', 'critical_care_type_uuid'],
                    where: {
                        //patient_uuid: patient_uuid,
                        is_active: 1,
                        status: 1
                    },

                    include: [
                        {
                            model: cctypeTbl,
                            as: 'critical_care_types',
                            attributes: ['uuid', 'code', 'name'],
                            where: { is_active: 1, status: 1 },
                        },]

                }, { returning: true });

                if (data) {
                    return res
                        .status(httpStatus.OK)
                        .json({ statusCode: 200, req: '', responseContents: data });
                }
            }
            else {
                return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" });
            }
        } catch (err) {
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return res
                .status(httpStatus.INTERNAL_SERVER_ERROR)
                .json({ status: "error", msg: errorMsg });
        }
    };

    const _getventilatormodes = async (req, res) => {

        let { user_uuid } = req.headers;
        //let { patient_uuid } = req.query;

        try {
            if (user_uuid) {
                const data = await vmodeTbl.findAll({
                    attributes: ['uuid', 'code', 'name'],
                    where: {
                        //patient_uuid: patient_uuid,
                        is_active: 1,
                        status: 1
                    }
                }, { returning: true });

                if (data) {
                    return res
                        .status(httpStatus.OK)
                        .json({ statusCode: 200, req: '', responseContents: data });
                }
            }
            else {
                return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" });
            }
        } catch (err) {
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return res
                .status(httpStatus.INTERNAL_SERVER_ERROR)
                .json({ status: "error", msg: errorMsg });
        }
    };


    return {
        createVentilator: _createVentilator,
        getventilatorbypatientid: _getventilatorbypatientid,
        updateventilatorbypatientid: _updateventilatorbypatientid,
        deleteVentilatorDetails: _deleteVentilatorDetails,
        getventilatorcomparedata: _getventilatorcomparedata,
        getcccdetails: _getcccdetails,
        getventilatormodes: _getventilatormodes
    };
};

module.exports = ventilatorchartsController();

async function create_ventilator(user_uuid, data1, data2) {

    //const templateMasterCreatedData = await tempmstrTbl.create(templateMasterReqData, { returning: true, transaction: templateTransaction });
    data2.forEach((item, index) => {
        item.patient_uuid = data1.patient_uuid;
        item.encounter_uuid = data1.encounter_uuid;
        item.facility_uuid = data1.facility_uuid;
        item.encounter_type_uuid = data1.encounter_type_uuid;
        item.ventilator_mode_uuid = data1.ventilator_mode_uuid;
        item.modified_by = 0;
        item.created_date = item.modified_date = new Date();
        item.created_by = user_uuid;
    });
    const dtls_result = await ventilatorTbl.bulkCreate(data2, { returning: true });
    return { "Ventilator Data": dtls_result };
}

function updatevetilatordata(ventilatorTbl, data1, data2, user_uuid) {
    let updatePromise = [];

    data2.forEach((item) => {
        item.patient_uuid = data1.patient_uuid;
        item.encounter_uuid = data1.encounter_uuid;
        item.facility_uuid = data1.facility_uuid;
        item.encounter_type_uuid = data1.encounter_type_uuid;
        item.ventilator_mode_uuid = data1.ventilator_mode_uuid;
        item.comments = data1.comments;
        item.modified_by = 0;
        item.is_active = item.status = 1;
        item.revision = 1;
        item.created_date = item.modified_date = new Date();
        item.created_by = user_uuid;
        updatePromise = [...updatePromise,
        ventilatorTbl.update(item, { where: { patient_uuid: item.patient_uuid, ccc_uuid: item.ccc_uuid } }, { returning: true })];
    });
    return updatePromise;
}

function getventilatorData(fetchedData) {
    let vList = [];
  
    if (fetchedData && fetchedData.length > 0) {
      ventilator_details = {
        patient_uuid: fetchedData[0].dataValues.patient_uuid,
        encounter_uuid: fetchedData[0].dataValues.encounter_uuid,
  
        facility_uuid: fetchedData[0].dataValues.facility_uuid,
        encounter_type_uuid: fetchedData[0].dataValues.encounter_type_uuid,
        ventilator_mode_uuid: fetchedData[0].dataValues.ventilator_mode_uuid,
        ventilator_mode_code: fetchedData[0].ventilator_modes.code,
        ventilator_mode_name: fetchedData[0].ventilator_modes.name,
        comments: fetchedData[0].dataValues.comments,
      };
  
      fetchedData.forEach((tD) => {
        //   console.log("td---",tD);
        //   console.log("td-----",tD.dataValues.uuid);
        //   console.log("cc charts-----",tD.critical_care_charts.uuid);
        //   console.log("care types----",tD.critical_care_charts.critical_care_types.uuid);
        vList = [...vList,
        {
          ventilator_uuid: tD.dataValues.uuid,
          ventilator_date: tD.dataValues.from_date,
          
          ccc_uuid: tD.critical_care_charts.uuid,
          ccc_code: tD.critical_care_charts.code,
          ccc_name: tD.critical_care_charts.name,
          ccc_desc: tD.critical_care_charts.description,
  
          critical_care_type_uuid : tD.critical_care_charts.critical_care_types.uuid,
          critical_care_type_code : tD.critical_care_charts.critical_care_types.code,
          critical_care_type_name : tD.critical_care_charts.critical_care_types.name,
          
          }
        ];
      });
      return { "ventilator_details": ventilator_details, "observed_values": vList };
    }
    else {
      return {};
    }
  }