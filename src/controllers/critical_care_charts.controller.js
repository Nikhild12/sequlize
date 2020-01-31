const httpStatus = require("http-status");

const db = require("../config/sequelize");
const validate = require("../config/validate");
var Sequelize = require('sequelize');
var Op = Sequelize.Op;

const moment = require('moment');

const ventilatorTbl = db.ventilator_charts;
const abgTbl = db.abg_charts;
const monitorTbl = db.monitor_charts;
const in_out_takeTbl = db.in_out_take_charts;
const bpTbl = db.bp_charts;
const diabetesTbl = db.diabetes_charts;
const dialysisTbl = db.dialysis_charts;
const cccTbl = db.critical_care_charts;
const cctypeTbl = db.critical_care_types;


const CCchartsController = () => {
    /**
    * Returns jwt token if valid username and password is provided
    * @param req
    * @param res
    * @param next
    @returns {}
    */

    const _createCCC = async (req, res) => {

        if (Object.keys(req.body).length != 0) {
            try {

                let { user_uuid, critical_care_type } = req.headers;
                let data1 = req.body.headers;
                let data2 = req.body.observed_data;
                let createdData1, createdData2, createdData3, createdData4, createdData5, createdData6, createdData7;

                const body_header_validation_result = validate.validate(data1, ['patient_uuid', 'encounter_uuid', 'facility_uuid', 'encounter_type_uuid']);
                if (!body_header_validation_result.status) {
                    return res.status(400).send({ code: httpStatus[400], message: body_header_validation_result.errors });
                }

                for (let detail of data2) {
                    let body_details_validation_result = validate.validate(detail, ['cc_chart_uuid', 'cc_concept_uuid', 'cc_concept_value_uuid', 'from_date', 'observed_value']);
                    if (!body_details_validation_result.status) {
                        return res.status(400).send({ code: httpStatus[400], message: body_details_validation_result.errors });
                    }
                }

                if (user_uuid && data1 && data2 && critical_care_type) {

                    switch (critical_care_type) {
                        case "1":
                            createdData1 = create_CC(ventilatorTbl, user_uuid, data1, data2);
                            break;
                        case "2":
                            createdData2 = create_CC(abgTbl, user_uuid, data1, data2);
                            break;
                        case "3":
                            createdData3 = create_CC(monitorTbl, user_uuid, data1, data2);
                            break;
                        case "4":
                            createdData4 = create_CC(in_out_takeTbl, user_uuid, data1, data2);
                            break;
                        case "5":
                            createdData5 = create_CC(bpTbl, user_uuid, data1, data2);
                            break;
                        case "6":
                            createdData6 = create_CC(diabetesTbl, user_uuid, data1, data2);
                            break;
                        case "7":
                            createdData7 = create_CC(dialysisTbl, user_uuid, data1, data2);
                            break;
                    }

                    if (createdData1) {
                        res.send({ "status": 200, "Ventilator data": data2, "message": "Inserted Successfully " });
                    } else if (createdData2) {
                        res.send({ "status": 200, "abg_data": data2, "message": "Inserted Successfully " });
                    } else if (createdData3) {
                        res.send({ "status": 200, "monitor_data": data2, "message": "Inserted Successfully " });
                    } else if (createdData4) {
                        res.send({ "status": 200, "in_out_take_data": data2, "message": "Inserted Successfully " });
                    } else if (createdData5) {
                        res.send({ "status": 200, "bp_data": data2, "message": "Inserted Successfully " });
                    } else if (createdData6) {
                        res.send({ "status": 200, "diabetes_data": data2, "message": "Inserted Successfully " });
                    } else if (createdData7) {
                        res.send({ "status": 200, "dialysis_data": data2, "message": "Inserted Successfully " });
                    }

                } else {
                    return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" });
                }
            } catch (ex) {
                res.send({ "status": 400, "message": ex.message });
            }
        } else {
            return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" });
        }

    };

    const _getCCCbypatientid = async (req, res) => {

        let { user_uuid } = req.headers;
        let { patient_uuid, critical_care_type } = req.query;
        let data1, data2, data3, data4, data5, data6, data7, vdata;

        try {
            if (user_uuid && patient_uuid && critical_care_type) {

                switch (critical_care_type) {
                    case "1":
                        data1 = await ventilatorTbl.findAll(getCCquery(patient_uuid));
                        break;
                    case "2":
                        data2 = await abgTbl.findAll(getCCquery(patient_uuid));
                        break;
                    case "3":
                        data3 = await monitorTbl.findAll(getCCquery(patient_uuid));
                        break;
                    case "4":
                        data4 = await in_out_takeTbl.findAll(getCCquery(patient_uuid));
                        break;
                    case "5":
                        data5 = await bpTbl.findAll(getCCquery(patient_uuid));
                        break;
                    case "6":
                        data6 = await diabetesTbl.findAll(getCCquery(patient_uuid));
                        break;
                    case "7":
                        data7 = await dialysisTbl.findAll(getCCquery(patient_uuid));
                        break;
                }

                if (data1) {
                    vdata = getventilatorData(data1);
                    return res.status(httpStatus.OK).json({ statusCode: 200, req: '', responseContents: vdata });
                }
                else if (data2) {
                    vdata = getabgData(data2);
                    return res.status(httpStatus.OK).json({ statusCode: 200, req: '', responseContents: vdata });
                }
                else if (data3) {
                    vdata = getmonitorData(data3);
                    return res.status(httpStatus.OK).json({ statusCode: 200, req: '', responseContents: vdata });
                }
                else if (data4) {
                    vdata = getinoutData(data4);
                    return res.status(httpStatus.OK).json({ statusCode: 200, req: '', responseContents: vdata });
                }
                else if (data5) {
                    vdata = getbpData(data5);
                    return res.status(httpStatus.OK).json({ statusCode: 200, req: '', responseContents: vdata });
                }
                else if (data6) {
                    vdata = getdiabetesData(data6);
                    return res.status(httpStatus.OK).json({ statusCode: 200, req: '', responseContents: vdata });
                }
                else if (data7) {
                    vdata = getdialysisData(data7);
                    return res.status(httpStatus.OK).json({ statusCode: 200, req: '', responseContents: vdata });
                }
            }
            else {
                return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" });
            }
        } catch (err) {
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ status: "error", msg: errorMsg });
        }
    };

    const _updateCCCbypatientid = async (req, res) => {

        if (Object.keys(req.body).length != 0) {
            try {
                let { user_uuid, critical_care_type } = req.headers;
                let data1 = req.body.headers;
                let data2 = req.body.observed_data;
                //let cdate = moment(new Date()).format('YYYY-MM-DD');
                
                let createdData1, createdData2, createdData3, createdData4, createdData5, createdData6, createdData7;

                if (user_uuid && data1 && data2 && critical_care_type) {

                    switch (critical_care_type) {
                        case "1":
                            // let abc = await updateonCdate(ventilatorTbl, data2[0].uuid);
                            // fetchedDate = moment(abc.dataValues.from_date).format('YYYY-MM-DD');
                            // if (fetchedDate != cdate){ 
                            //      return res.status(400).send({ code: httpStatus[400], message: "update notpossible" });}
                            createdData1 = await Promise.all(updateCCCdata(ventilatorTbl, data1, data2, user_uuid));
                            break;
                        case "2":
                            createdData2 = await Promise.all(updateCCCdata(abgTbl, data1, data2, user_uuid));
                            break;
                        case "3":
                            createdData3 = await Promise.all(updateCCCdata(monitorTbl, data1, data2, user_uuid));
                            break;
                        case "4":
                            createdData4 = await Promise.all(updateCCCdata(in_out_takeTbl, data1, data2, user_uuid));
                            break;
                        case "5":
                            createdData5 = await Promise.all(updateCCCdata(bpTbl, data1, data2, user_uuid));
                            break;
                        case "6":
                            createdData6 = await Promise.all(updateCCCdata(diabetesTbl, data1, data2, user_uuid));
                            break;
                        case "7":
                            createdData7 = await Promise.all(updateCCCdata(dialysisTbl, data1, data2, user_uuid));
                            break;
                    }

                    if (createdData1 || createdData2 || createdData3 || createdData4 || createdData5 || createdData6 || createdData7) {
                        return res.send({ "status": 200, "message": "updated Successfully " });
                    }
                }
                else {
                    return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" });
                }
            } catch (err) {
                const errorMsg = err.errors ? err.errors[0].message : err.message;
                return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ status: "error", msg: errorMsg });
            }
        } else {
            return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" });
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

    const _getCCCcomparedata = async (req, res) => {
        let { user_uuid } = req.headers;
        let { patient_uuid, critical_care_type, from_date, to_date } = req.query;
        let data1, data2, data3, data4, data5, data6, data7, vdata;

        try {
            if (user_uuid && patient_uuid) {

                switch (critical_care_type) {
                    case "1":
                        data1 = await ventilatorTbl.findAll(getCquery(patient_uuid, from_date, to_date));
                        break;
                    case "2":
                        data2 = await abgTbl.findAll(getCquery(patient_uuid, from_date, to_date));
                        break;
                    case "3":
                        data3 = await monitorTbl.findAll(getCquery(patient_uuid, from_date, to_date));
                        break;
                    case "4":
                        data4 = await in_out_takeTbl.findAll(getCquery(patient_uuid, from_date, to_date));
                        break;
                    case "5":
                        data5 = await bpTbl.findAll(getCquery(patient_uuid, from_date, to_date));
                        break;
                    case "6":
                        data6 = await diabetesTbl.findAll(getCquery(patient_uuid, from_date, to_date));
                        break;
                    case "7":
                        data7 = await dialysisTbl.findAll(getCquery(patient_uuid, from_date, to_date));
                        break;
                }

                if (data1) {
                    vdata = getventilatorData(data1);
                    return res.status(httpStatus.OK).json({ statusCode: 200, req: '', responseContents: vdata });
                }
                else if (data2) {
                    vdata = getabgData(data2);
                    return res.status(httpStatus.OK).json({ statusCode: 200, req: '', responseContents: vdata });
                }
                else if (data3) {
                    vdata = getmonitorData(data3);
                    return res.status(httpStatus.OK).json({ statusCode: 200, req: '', responseContents: vdata });
                }
                else if (data4) {
                    vdata = getinoutData(data4);
                    return res.status(httpStatus.OK).json({ statusCode: 200, req: '', responseContents: vdata });
                }
                else if (data5) {
                    vdata = getbpData(data5);
                    return res.status(httpStatus.OK).json({ statusCode: 200, req: '', responseContents: vdata });
                }
                else if (data6) {
                    vdata = getdiabetesData(data6);
                    return res.status(httpStatus.OK).json({ statusCode: 200, req: '', responseContents: vdata });
                }
                else if (data7) {
                    vdata = getdialysisData(data7);
                    return res.status(httpStatus.OK).json({ statusCode: 200, req: '', responseContents: vdata });
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

        try {
            if (user_uuid) {
                const data = await cccTbl.findAll({
                    attributes: ['uuid', 'code', 'name', 'description', 'critical_care_type_uuid'],
                    where: {
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


    return {
        createCCC: _createCCC,
        getCCCbypatientid: _getCCCbypatientid,
        updateCCCbypatientid: _updateCCCbypatientid,
        //deleteVentilatorDetails: _deleteVentilatorDetails,
        getCCCcomparedata: _getCCCcomparedata,
        getcccdetails: _getcccdetails,
    };
};

module.exports = CCchartsController();

async function create_CC(tablename, user_uuid, data1, data2) {

    data2.forEach((item, index) => {
        item.patient_uuid = data1.patient_uuid;
        item.encounter_uuid = data1.encounter_uuid;
        item.facility_uuid = data1.facility_uuid;
        item.comments = data1.comments;
        item.encounter_type_uuid = data1.encounter_type_uuid;
        item.modified_by = 0;
        item.created_date = item.modified_date = new Date();
        item.created_by = user_uuid;
        item.is_active = item.status = 1;
        item.revision = 1;
    });
    const dtls_result = await tablename.bulkCreate(data2, { returning: true });
    return { "Ventilator Data": dtls_result };
}

function updateCCCdata(tablename, data1, data2, user_uuid) {
    let updatePromise = [];

    data2.forEach((item) => {
        item.patient_uuid = data1.patient_uuid;
        item.encounter_uuid = data1.encounter_uuid;
        item.facility_uuid = data1.facility_uuid;
        item.encounter_type_uuid = data1.encounter_type_uuid;
        item.comments = data1.comments;
        item.modified_by = user_uuid;
        item.is_active = item.status = 1;
        item.revision = 1;
        item.created_date = item.modified_date = new Date();
        item.created_by = user_uuid;
        updatePromise = [...updatePromise,
        tablename.update(item, { where: { uuid: item.uuid } }, { returning: true })];
    });
    return updatePromise;
}

function getventilatorData(fetchedData) {
    let vList = []; dList = [];

    if (fetchedData && fetchedData.length > 0) {
        ventilator_details = {
            patient_uuid: fetchedData[0].dataValues.patient_uuid,
            encounter_uuid: fetchedData[0].dataValues.encounter_uuid,

            facility_uuid: fetchedData[0].dataValues.facility_uuid,
            encounter_type_uuid: fetchedData[0].dataValues.encounter_type_uuid,
            comments: fetchedData[0].dataValues.comments,
        };

        vList = fetchedData.map((tD) => {
            return {
                ventilator_date: tD.dataValues.from_date,
                dList: [...dList,
                ...getvdList(fetchedData, tD.patient_uuid, tD.from_date)
                ]
            };
        });
        let uniq = {};
        let fV_list = vList.filter(
            obj => !uniq[obj.ventilator_date] && (uniq[obj.ventilator_date] = true)
        );

        return { "ventilator_details": ventilator_details, "observed_values": fV_list };
    }
    else {
        return {};
    }
}

function getvdList(fetchedData, p_id, from_date) {
    let vd_list = [];
    const filteredData = fetchedData.filter(fD => {
        return (
            fD.dataValues.patient_uuid == p_id &&
            fD.dataValues.from_date == from_date
        );
    });
    if (filteredData && filteredData.length > 0) {
        vd_list = filteredData.map(pV => {
            return {
                ventilator_date: pV.dataValues.from_date,
                ventilator_uuid: pV.dataValues.uuid,
                ventilator_observed_value: pV.dataValues.observed_value,

                ccc_uuid: pV.critical_care_charts.uuid,
                ccc_code: pV.critical_care_charts.code,
                ccc_name: pV.critical_care_charts.name,
                ccc_desc: pV.critical_care_charts.description,

                critical_care_type_uuid: pV.critical_care_charts.critical_care_types.uuid,
                critical_care_type_code: pV.critical_care_charts.critical_care_types.code,
                critical_care_type_name: pV.critical_care_charts.critical_care_types.name,
            };
        });
    }
    return vd_list;
}

function getCCquery(patient_uuid) {

    return {

        order: [['from_date', 'DESC']],
        where: {
            patient_uuid: patient_uuid,
            is_active: 1,
            status: 1
        },

        include: [

            {
                model: cccTbl,
                as: 'critical_care_charts',
                attributes: ['uuid', 'code', 'name', 'description'],
                where: { is_active: 1, status: 1 },
                required: false,
                include: [
                    {
                        model: cctypeTbl,
                        as: 'critical_care_types',
                        attributes: ['uuid', 'code', 'name'],
                        where: { is_active: 1, status: 1 },
                        required: false,
                    },]

            },]

    };
}

function getCquery(patient_uuid, from_date, to_date) {

    return {

        order: [['from_date', 'DESC']],
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
                model: cccTbl,
                as: 'critical_care_charts',
                attributes: ['uuid', 'code', 'name', 'description'],
                where: { is_active: 1, status: 1 },
                required: false,
                include: [
                    {
                        model: cctypeTbl,
                        as: 'critical_care_types',
                        attributes: ['uuid', 'code', 'name'],
                        where: { is_active: 1, status: 1 },
                        required: false,
                    },]

            },]

    };
}

function getabgData(fetchedData) {
    let abgList = [], dList = [];

    if (fetchedData && fetchedData.length > 0) {
        abg_details = {
            patient_uuid: fetchedData[0].dataValues.patient_uuid,
            encounter_uuid: fetchedData[0].dataValues.encounter_uuid,

            facility_uuid: fetchedData[0].dataValues.facility_uuid,
            encounter_type_uuid: fetchedData[0].dataValues.encounter_type_uuid,
            comments: fetchedData[0].dataValues.comments,
        };
        abgList = fetchedData.map((tD) => {
            return {
                abg_date: tD.dataValues.from_date,
                dList: [...dList,
                ...getadList(fetchedData, tD.patient_uuid, tD.from_date)
                ]
            };
        });
        let uniq = {};
        let ab_list = abgList.filter(
            obj => !uniq[obj.abg_date] && (uniq[obj.abg_date] = true)
        );

        return { "abg_details": abg_details, "observed_values": ab_list };
    }
    else {
        return {};
    }
}

function getadList(fetchedData, p_id, from_date) {
    let ad_list = [];
    const filteredData = fetchedData.filter(fD => {
        return (
            fD.dataValues.patient_uuid == p_id &&
            fD.dataValues.from_date == from_date
        );
    });
    if (filteredData && filteredData.length > 0) {
        ad_list = filteredData.map(pV => {
            return {
                abg_date: pV.dataValues.from_date,
                abg_uuid: pV.dataValues.uuid,
                abg_observed_value: pV.dataValues.observed_value,

                ccc_uuid: pV.critical_care_charts.uuid,
                ccc_code: pV.critical_care_charts.code,
                ccc_name: pV.critical_care_charts.name,
                ccc_desc: pV.critical_care_charts.description,

                critical_care_type_uuid: pV.critical_care_charts.critical_care_types.uuid,
                critical_care_type_code: pV.critical_care_charts.critical_care_types.code,
                critical_care_type_name: pV.critical_care_charts.critical_care_types.name,
            };
        });
    }
    return ad_list;
}

function getmonitorData(fetchedData) {
    let mList = [], dList = [];

    if (fetchedData && fetchedData.length > 0) {
        monitor_details = {
            patient_uuid: fetchedData[0].dataValues.patient_uuid,
            encounter_uuid: fetchedData[0].dataValues.encounter_uuid,

            facility_uuid: fetchedData[0].dataValues.facility_uuid,
            encounter_type_uuid: fetchedData[0].dataValues.encounter_type_uuid,
            comments: fetchedData[0].dataValues.comments,
        };

        mList = fetchedData.map((tD) => {
            return {
                monitor_date: tD.dataValues.from_date,
                dList: [...dList,
                ...getmdList(fetchedData, tD.patient_uuid, tD.from_date)
                ]
            };
        });
        let uniq = {};
        let mtr_list = mList.filter(
            obj => !uniq[obj.monitor_date] && (uniq[obj.monitor_date] = true)
        );
        return { "monitor_details": monitor_details, "observed_values": mtr_list };
    }
    else {
        return {};
    }
}

function getmdList(fetchedData, p_id, from_date) {
    let md_list = [];
    const filteredData = fetchedData.filter(fD => {
        return (
            fD.dataValues.patient_uuid == p_id &&
            fD.dataValues.from_date == from_date
        );
    });
    if (filteredData && filteredData.length > 0) {
        md_list = filteredData.map(pV => {
            return {
                monitor_date: pV.dataValues.from_date,
                monitor_uuid: pV.dataValues.uuid,
                monitor_observed_value: pV.dataValues.observed_value,

                ccc_uuid: pV.critical_care_charts.uuid,
                ccc_code: pV.critical_care_charts.code,
                ccc_name: pV.critical_care_charts.name,
                ccc_desc: pV.critical_care_charts.description,

                critical_care_type_uuid: pV.critical_care_charts.critical_care_types.uuid,
                critical_care_type_code: pV.critical_care_charts.critical_care_types.code,
                critical_care_type_name: pV.critical_care_charts.critical_care_types.name,
            };
        });
    }
    return md_list;
}


function getinoutData(fetchedData) {
    let ioList = [], dList = [];

    if (fetchedData && fetchedData.length > 0) {
        in_out_take_details = {
            patient_uuid: fetchedData[0].dataValues.patient_uuid,
            encounter_uuid: fetchedData[0].dataValues.encounter_uuid,
            facility_uuid: fetchedData[0].dataValues.facility_uuid,
            encounter_type_uuid: fetchedData[0].dataValues.encounter_type_uuid,
            comments: fetchedData[0].dataValues.comments,
        };

        ioList = fetchedData.map((tD) => {
            return {
                iot_date: tD.dataValues.from_date,
                dList: [...dList,
                ...getioList(fetchedData, tD.patient_uuid, tD.from_date)
                ]
            };
        });
        let uniq = {};
        let iot_list = ioList.filter(
            obj => !uniq[obj.iot_date] && (uniq[obj.iot_date] = true)
        );
        return { "in_out_take_details": in_out_take_details, "observed_values": iot_list };
    }
    else {
        return {};
    }
}

function getioList(fetchedData, p_id, from_date) {
    let io_list = [];
    const filteredData = fetchedData.filter(fD => {
        return (
            fD.dataValues.patient_uuid == p_id &&
            fD.dataValues.from_date == from_date
        );
    });
    if (filteredData && filteredData.length > 0) {
        io_list = filteredData.map(pV => {
            return {
                iot_date: pV.dataValues.from_date,
                iot_uuid: pV.dataValues.uuid,
                iot_observed_value: pV.dataValues.observed_value,

                ccc_uuid: pV.critical_care_charts.uuid,
                ccc_code: pV.critical_care_charts.code,
                ccc_name: pV.critical_care_charts.name,
                ccc_desc: pV.critical_care_charts.description,

                critical_care_type_uuid: pV.critical_care_charts.critical_care_types.uuid,
                critical_care_type_code: pV.critical_care_charts.critical_care_types.code,
                critical_care_type_name: pV.critical_care_charts.critical_care_types.name,
            };
        });
    }
    return io_list;
}

function getdiabetesData(fetchedData) {
    let dbList = [], dList = [];

    if (fetchedData && fetchedData.length > 0) {
        diabetes_details = {
            patient_uuid: fetchedData[0].dataValues.patient_uuid,
            encounter_uuid: fetchedData[0].dataValues.encounter_uuid,
            facility_uuid: fetchedData[0].dataValues.facility_uuid,
            encounter_type_uuid: fetchedData[0].dataValues.encounter_type_uuid,
            comments: fetchedData[0].dataValues.comments,
        };

        dbList = fetchedData.map((tD) => {
            return {
                db_date: tD.dataValues.from_date,
                dList: [...dList,
                ...getdbList(fetchedData, tD.patient_uuid, tD.from_date)
                ]
            };
        });
        let uniq = {};
        let db_list = dbList.filter(
            obj => !uniq[obj.db_date] && (uniq[obj.db_date] = true)
        );
        return { "diabetes details": diabetes_details, "observed_values": db_list };
    }
    else {
        return {};
    }
}

function getdbList(fetchedData, p_id, from_date) {
    let db_list = [];
    const filteredData = fetchedData.filter(fD => {
        return (
            fD.dataValues.patient_uuid == p_id &&
            fD.dataValues.from_date == from_date
        );
    });
    if (filteredData && filteredData.length > 0) {
        db_list = filteredData.map(pV => {
            return {
                db_date: pV.dataValues.from_date,
                db_uuid: pV.dataValues.uuid,
                db_observed_value: pV.dataValues.observed_value,

                ccc_uuid: pV.critical_care_charts.uuid,
                ccc_code: pV.critical_care_charts.code,
                ccc_name: pV.critical_care_charts.name,
                ccc_desc: pV.critical_care_charts.description,

                critical_care_type_uuid: pV.critical_care_charts.critical_care_types.uuid,
                critical_care_type_code: pV.critical_care_charts.critical_care_types.code,
                critical_care_type_name: pV.critical_care_charts.critical_care_types.name,
            };
        });
    }
    return db_list;
}


function getdialysisData(fetchedData) {
    let dlList = [], dList = [];

    if (fetchedData && fetchedData.length > 0) {
        dialysis_details = {
            patient_uuid: fetchedData[0].dataValues.patient_uuid,
            encounter_uuid: fetchedData[0].dataValues.encounter_uuid,
            facility_uuid: fetchedData[0].dataValues.facility_uuid,
            encounter_type_uuid: fetchedData[0].dataValues.encounter_type_uuid,
            comments: fetchedData[0].dataValues.comments,
        };

        dlList = fetchedData.map((tD) => {
            return {
                dl_date: tD.dataValues.from_date,
                dList: [...dList,
                ...getdlList(fetchedData, tD.patient_uuid, tD.from_date)
                ]
            };
        });
        let uniq = {};
        let dl_list = dlList.filter(
            obj => !uniq[obj.dl_date] && (uniq[obj.dl_date] = true)
        );
        return { "dialysis details": dialysis_details, "observed_values": dl_list };
    }
    else {
        return {};
    }
}

function getdlList(fetchedData, p_id, from_date) {
    let dl_list = [];
    const filteredData = fetchedData.filter(fD => {
        return (
            fD.dataValues.patient_uuid == p_id &&
            fD.dataValues.from_date == from_date
        );
    });
    if (filteredData && filteredData.length > 0) {
        dl_list = filteredData.map(pV => {
            return {
                dl_date: pV.dataValues.from_date,
                dl_uuid: pV.dataValues.uuid,
                dl_observed_value: pV.dataValues.observed_value,

                ccc_uuid: pV.critical_care_charts.uuid,
                ccc_code: pV.critical_care_charts.code,
                ccc_name: pV.critical_care_charts.name,
                ccc_desc: pV.critical_care_charts.description,

                critical_care_type_uuid: pV.critical_care_charts.critical_care_types.uuid,
                critical_care_type_code: pV.critical_care_charts.critical_care_types.code,
                critical_care_type_name: pV.critical_care_charts.critical_care_types.name,
            };
        });
    }
    return dl_list;
}


function getbpData(fetchedData) {
    let bpList = [], dList = [];

    if (fetchedData && fetchedData.length > 0) {
        bp_details = {
            patient_uuid: fetchedData[0].dataValues.patient_uuid,
            encounter_uuid: fetchedData[0].dataValues.encounter_uuid,
            facility_uuid: fetchedData[0].dataValues.facility_uuid,
            encounter_type_uuid: fetchedData[0].dataValues.encounter_type_uuid,
            comments: fetchedData[0].dataValues.comments,
        };

        bpList = fetchedData.map((tD) => {
            return {
                bp_date: tD.dataValues.from_date,
                dList: [...dList,
                ...getbpList(fetchedData, tD.patient_uuid, tD.from_date)
                ]
            };
        });
        let uniq = {};
        let bp_list = bpList.filter(
            obj => !uniq[obj.bp_date] && (uniq[obj.bp_date] = true)
        );
        return { "bp details": bp_details, "observed_values": bp_list };
    }
    else {
        return {};
    }
}

function getbpList(fetchedData, p_id, from_date) {
    let bp_list = [];
    const filteredData = fetchedData.filter(fD => {
        return (
            fD.dataValues.patient_uuid == p_id &&
            fD.dataValues.from_date == from_date
        );
    });
    if (filteredData && filteredData.length > 0) {
        bp_list = filteredData.map(pV => {
            return {
                bp_date: pV.dataValues.from_date,
                bp_uuid: pV.dataValues.uuid,
                bp_observed_value: pV.dataValues.observed_value,

                ccc_uuid: pV.critical_care_charts.uuid,
                ccc_code: pV.critical_care_charts.code,
                ccc_name: pV.critical_care_charts.name,
                ccc_desc: pV.critical_care_charts.description,

                critical_care_type_uuid: pV.critical_care_charts.critical_care_types.uuid,
                critical_care_type_code: pV.critical_care_charts.critical_care_types.code,
                critical_care_type_name: pV.critical_care_charts.critical_care_types.name,
            };
        });
    }
    return bp_list;
}

async function updateonCdate(tname, u_id) {
    //console.log(tname, u_id);
    return tname.findOne({
        where: { uuid: u_id }
    }, { returning: true }
    );
}