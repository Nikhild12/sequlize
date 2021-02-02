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
const ccc_conceptTbl = db.critical_care_concepts;
const ccc_concept_valuesTbl = db.critical_care_concept_values;
const cctypeTbl = db.critical_care_types;
const value_typeTbl = db.value_types;



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
                let { user_uuid } = req.headers;
                let data1 = req.body.headers;
                let data2 = req.body.observed_data;
                let createdData1, createdData2, createdData3, createdData4, createdData5, createdData6, createdData7;

                const body_header_validation_result = validate.validate(data1, ['patient_uuid', 'encounter_uuid', 'facility_uuid', 'encounter_type_uuid']);
                if (!body_header_validation_result.status) {
                    return res.status(400).send({ code: httpStatus[400], message: body_header_validation_result.errors });
                }

                for (let detail of data2) {
                    let body_details_validation_result = validate.validate(detail, ['cc_chart_uuid', 'cc_concept_uuid', 'from_date']);
                    if (!body_details_validation_result.status) {
                        return res.status(400).send({ code: httpStatus[400], message: body_details_validation_result.errors });
                    }
                }

                if (user_uuid && data1 && data2) {
                    switch (data1.critical_care_type) {
                        case 1:
                            createdData1 = create_CC(ventilatorTbl, user_uuid, data1, data2);
                            break;
                        case 2:
                            createdData2 = create_CC(abgTbl, user_uuid, data1, data2);
                            break;
                        case 3:
                            createdData3 = create_CC(monitorTbl, user_uuid, data1, data2);
                            break;
                        case 4:
                            createdData4 = create_CC(in_out_takeTbl, user_uuid, data1, data2);
                            break;
                        case 5:
                            createdData5 = create_CC(bpTbl, user_uuid, data1, data2);
                            break;
                        case 6:
                            createdData6 = create_CC(diabetesTbl, user_uuid, data1, data2);
                            break;
                        case 7:
                            createdData7 = create_CC(dialysisTbl, user_uuid, data1, data2);
                            break;
                    }
                    if (createdData1) {
                        res.send({ "statusCode": 200, "Ventilator data": data2, "message": "Inserted Successfully " });
                    } else if (createdData2) {
                        res.send({ "statusCode": 200, "abg_data": data2, "message": "Inserted Successfully " });
                    } else if (createdData3) {
                        res.send({ "statusCode": 200, "monitor_data": data2, "message": "Inserted Successfully " });
                    } else if (createdData4) {
                        res.send({ "statusCode": 200, "in_out_take_data": data2, "message": "Inserted Successfully " });
                    } else if (createdData5) {
                        res.send({ "statusCode": 200, "bp_data": data2, "message": "Inserted Successfully " });
                    } else if (createdData6) {
                        res.send({ "statusCode": 200, "diabetes_data": data2, "message": "Inserted Successfully " });
                    } else if (createdData7) {
                        res.send({ "statusCode": 200, "dialysis_data": data2, "message": "Inserted Successfully " });
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
                    if (data1.critical_care_charts !== null) {
                        vdata = getventilatorData(data1);
                        return res.status(httpStatus.OK).json({ statusCode: 200, req: '', responseContents: vdata });
                    } else {
                        return res.status(400).send({ code: httpStatus[400], message: "no data found" });
                    }
                }
                else if (data2) {
                    if (data2.critical_care_charts !== null) {
                        vdata = getabgData(data2);
                        return res.status(httpStatus.OK).json({ statusCode: 200, req: '', responseContents: vdata });
                    } else {
                        return res.status(400).send({ code: httpStatus[400], message: "no data found" });
                    }
                }
                else if (data3) {
                    if (data3.critical_care_charts !== null) {
                        vdata = getmonitorData(data3);
                        return res.status(httpStatus.OK).json({ statusCode: 200, req: '', responseContents: vdata });
                    } else {
                        return res.status(400).send({ code: httpStatus[400], message: "no data found" });
                    }
                }
                else if (data4) {
                    if (data4.critical_care_charts !== null) {
                        vdata = getinoutData(data4);
                        return res.status(httpStatus.OK).json({ statusCode: 200, req: '', responseContents: vdata });
                    } else {
                        return res.status(400).send({ code: httpStatus[400], message: "no data found" });
                    }
                }

                else if (data5) {
                    if (data5.critical_care_charts !== null) {
                        vdata = getbpData(data5);
                        return res.status(httpStatus.OK).json({ statusCode: 200, req: '', responseContents: vdata });
                    } else {
                        return res.status(400).send({ code: httpStatus[400], message: "no data found" });
                    }
                }
                else if (data6) {
                    if (data6.critical_care_charts !== null) {
                        vdata = getdiabetesData(data6);
                        return res.status(httpStatus.OK).json({ statusCode: 200, req: '', responseContents: vdata });
                    } else {
                        return res.status(400).send({ code: httpStatus[400], message: "no data found" });
                    }
                }
                else if (data7) {
                    if (data7.critical_care_charts !== null) {
                        vdata = getdialysisData(data7);
                        return res.status(httpStatus.OK).json({ statusCode: 200, req: '', responseContents: vdata });
                    } else {
                        return res.status(400).send({ code: httpStatus[400], message: "no data found" });
                    }
                }

            }
            else {
                return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" });
            }
        } catch (err) {
            console.log(err)
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ status: "error", msg: errorMsg });
        }


    };

    const _updateCCCbypatientid = async (req, res) => {

        if (Object.keys(req.body).length != 0) {
            try {
                let { user_uuid } = req.headers;
                let data1 = req.body.headers;
                let data2 = req.body.observed_data;
                //let cdate = moment(new Date()).format('YYYY-MM-DD');

                let createdData1, createdData2, createdData3, createdData4, createdData5, createdData6, createdData7;

                if (user_uuid && data1 && data2) {

                    switch (data1.critical_care_type) {
                        case 1:
                            // let abc = await updateonCdate(ventilatorTbl, data2[0].uuid);
                            // fetchedDate = moment(abc.dataValues.from_date).format('YYYY-MM-DD');
                            // if (fetchedDate != cdate){ 
                            //      return res.status(400).send({ code: httpStatus[400], message: "update notpossible" });}
                            createdData1 = await Promise.all(updateCCCdata(ventilatorTbl, data1, data2, user_uuid));
                            break;
                        case 2:
                            createdData2 = await Promise.all(updateCCCdata(abgTbl, data1, data2, user_uuid));
                            break;
                        case 3:
                            createdData3 = await Promise.all(updateCCCdata(monitorTbl, data1, data2, user_uuid));
                            break;
                        case 4:
                            createdData4 = await Promise.all(updateCCCdata(in_out_takeTbl, data1, data2, user_uuid));
                            break;
                        case 5:
                            createdData5 = await Promise.all(updateCCCdata(bpTbl, data1, data2, user_uuid));
                            break;
                        case 6:
                            createdData6 = await Promise.all(updateCCCdata(diabetesTbl, data1, data2, user_uuid));
                            break;
                        case 7:
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
                    if (data1.critical_care_charts !== null) {
                        vdata = getventilatorData(data1);
                        return res.status(httpStatus.OK).json({ statusCode: 200, req: '', responseContents: vdata });
                    } else {
                        return res.status(400).send({ code: httpStatus[400], message: "no data found" });
                    }
                }
                else if (data2) {
                    if (data2.critical_care_charts !== null) {
                        vdata = getabgData(data2);
                        return res.status(httpStatus.OK).json({ statusCode: 200, req: '', responseContents: vdata });
                    } else {
                        return res.status(400).send({ code: httpStatus[400], message: "no data found" });
                    }
                }
                else if (data3) {
                    if (data3.critical_care_charts !== null) {
                        vdata = getmonitorData(data3);
                        return res.status(httpStatus.OK).json({ statusCode: 200, req: '', responseContents: vdata });
                    } else {
                        return res.status(400).send({ code: httpStatus[400], message: "no data found" });
                    }
                }
                else if (data4) {
                    if (data4.critical_care_charts !== null) {
                        vdata = getinoutData(data4);
                        return res.status(httpStatus.OK).json({ statusCode: 200, req: '', responseContents: vdata });
                    } else {
                        return res.status(400).send({ code: httpStatus[400], message: "no data found" });
                    }
                }

                else if (data5) {
                    if (data5.critical_care_charts !== null) {
                        vdata = getbpData(data5);
                        return res.status(httpStatus.OK).json({ statusCode: 200, req: '', responseContents: vdata });
                    } else {
                        return res.status(400).send({ code: httpStatus[400], message: "no data found" });
                    }
                }
                else if (data6) {
                    if (data6.critical_care_charts !== null) {
                        vdata = getdiabetesData(data6);
                        return res.status(httpStatus.OK).json({ statusCode: 200, req: '', responseContents: vdata });
                    } else {
                        return res.status(400).send({ code: httpStatus[400], message: "no data found" });
                    }
                }
                else if (data7) {
                    if (data7.critical_care_charts !== null) {
                        vdata = getdialysisData(data7);
                        return res.status(httpStatus.OK).json({ statusCode: 200, req: '', responseContents: vdata });
                    } else {
                        return res.status(400).send({ code: httpStatus[400], message: "no data found" });
                    }
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
        getCCCcomparedata: _getCCCcomparedata,
        getcccdetails: _getcccdetails,
    };
};

module.exports = CCchartsController();

async function create_CC(tablename, user_uuid, data1, data2) {

    data2.forEach((item, index) => {
        item.critical_care_type = data1.critical_care_type;
        item.patient_uuid = data1.patient_uuid;
        item.encounter_uuid = data1.encounter_uuid;
        item.facility_uuid = data1.facility_uuid;
        item.comments = data1.comments;
        item.observed_value = item.observed_value;
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
                observed_date: tD.dataValues.from_date,
                dList: [...dList,
                ...getvdList(fetchedData, tD.patient_uuid, tD.from_date)
                ]
            };
        });
        let uniq = {};
        let fV_list = vList.filter(
            obj => !uniq[obj.observed_date] && (uniq[obj.observed_date] = true)
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
                observed_date: pV.dataValues.from_date,
                ventilator_uuid: pV.dataValues.uuid,
                observed_value: pV.dataValues.observed_value,

                ccc_uuid: pV.critical_care_charts.uuid,
                ccc_code: pV.critical_care_charts.code,
                ccc_name: pV.critical_care_charts.name,
                ccc_desc: pV.critical_care_charts.description,
                ccc_value_uuid :pV && pV.cc_concept_value_uuid || 0,

                critical_care_type_uuid: pV.critical_care_charts.critical_care_types.uuid,
                critical_care_type_code: pV.critical_care_charts.critical_care_types.code,
                critical_care_type_name: pV.critical_care_charts.critical_care_types.name,

                ccc_value_type_uuid :pV && pV.critical_care_concepts && pV.critical_care_concepts.value_types ? pV.critical_care_concepts.value_types.uuid : 0,
                ccc_value_type_name :pV && pV.critical_care_concepts && pV.critical_care_concepts.value_types ? pV.critical_care_concepts.value_types.name : 0,
                ccc_value_type_code :pV && pV.critical_care_concepts && pV.critical_care_concepts.value_types ? pV.critical_care_concepts.value_types.code : 0,

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
        required: false,
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
                    }]
            },
            {
                model: ccc_conceptTbl,
                as: 'critical_care_concepts',
                attributes: ['uuid', 'concept_code', 'concept_name'],
                where: { is_active: 1, status: 1 },
                required: false,
                include:[
                    {
                        model: value_typeTbl,
                        as:'value_types',
                        where: { is_active: 1, status: 1 },
                        required: false,
                    }
                ]
            },
            {
                model: ccc_concept_valuesTbl,
                as: 'critical_care_concept_values',
                attributes: ['uuid', 'concept_value'],
                where: { is_active: 1, status: 1 },
                required: false,
            }
        ]

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
                observed_date: tD.dataValues.from_date,
                dList: [...dList,
                ...getadList(fetchedData, tD.patient_uuid, tD.from_date)
                ]
            };
        });

        let uniq = {};
        let ab_list = abgList.filter(
            obj => !uniq[obj.observed_date] && (uniq[obj.observed_date] = true)
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
                observed_date: pV.dataValues.from_date,
                abg_uuid: pV.dataValues.uuid,
                observed_value: pV.dataValues.observed_value,

                ccc_uuid: pV.critical_care_charts.uuid,
                ccc_code: pV.critical_care_charts.code,
                ccc_name: pV.critical_care_charts.name,
                ccc_desc: pV.critical_care_charts.description,
                ccc_value_uuid :pV && pV.cc_concept_value_uuid || 0,

                critical_care_type_uuid: pV.critical_care_charts.critical_care_types.uuid,
                critical_care_type_code: pV.critical_care_charts.critical_care_types.code,
                critical_care_type_name: pV.critical_care_charts.critical_care_types.name,

                ccc_value_type_uuid :pV && pV.critical_care_concepts && pV.critical_care_concepts.value_types ? pV.critical_care_concepts.value_types.uuid : 0,
                ccc_value_type_name :pV && pV.critical_care_concepts && pV.critical_care_concepts.value_types ? pV.critical_care_concepts.value_types.name : 0,
                ccc_value_type_code :pV && pV.critical_care_concepts && pV.critical_care_concepts.value_types ? pV.critical_care_concepts.value_types.code : 0,

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
                observed_date: tD.dataValues.from_date,
                dList: [...dList,
                ...getmdList(fetchedData, tD.patient_uuid, tD.from_date)
                ]
            };
        });
        let uniq = {};
        let mtr_list = mList.filter(
            obj => !uniq[obj.observed_date] && (uniq[obj.observed_date] = true)
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
                observed_date: pV.dataValues.from_date,
                monitor_uuid: pV.dataValues.uuid,
                observed_value: pV.dataValues.observed_value,

                ccc_uuid: pV.critical_care_charts ? pV.critical_care_charts.uuid : 0,
                ccc_code: pV.critical_care_charts ? pV.critical_care_charts.code : null,
                ccc_name: pV.critical_care_charts ? pV.critical_care_charts.name : null,
                ccc_desc: pV.critical_care_charts ? pV.critical_care_charts.description : null,

                ccc_concept_uuid :pV && pV.critical_care_concepts ? pV.critical_care_concepts.uuid : 0,
                ccc_concept_name :pV && pV.critical_care_concepts ? pV.critical_care_concepts.concept_name : 0,
                ccc_concept_code :pV && pV.critical_care_concepts ? pV.critical_care_concepts.concept_code : 0,

                ccc_value_type_uuid :pV && pV.critical_care_concepts && pV.critical_care_concepts.value_types ? pV.critical_care_concepts.value_types.uuid : 0,
                ccc_value_type_name :pV && pV.critical_care_concepts && pV.critical_care_concepts.value_types ? pV.critical_care_concepts.value_types.name : 0,
                ccc_value_type_code :pV && pV.critical_care_concepts && pV.critical_care_concepts.value_types ? pV.critical_care_concepts.value_types.code : 0,

                ccc_concept_value_uuid :pV && pV.cc_concept_value_uuid || 0,
                ccc_concept_value_name :pV && pV.critical_care_concept_values ? pV.critical_care_concept_values.concept_value : null,

                critical_care_type_uuid: pV.critical_care_charts ? pV.critical_care_charts.critical_care_types.uuid : 0,
                critical_care_type_code: pV.critical_care_charts ? pV.critical_care_charts.critical_care_types.code : null,
                critical_care_type_name: pV.critical_care_charts ? pV.critical_care_charts.critical_care_types.name : null,
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
                observed_date: tD.dataValues.from_date,
                dList: [...dList,
                ...getioList(fetchedData, tD.patient_uuid, tD.from_date)
                ]
            };
        });
        let uniq = {};
        let iot_list = ioList.filter(
            obj => !uniq[obj.observed_date] && (uniq[obj.observed_date] = true)
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
                observed_date: pV.dataValues.from_date,
                iot_uuid: pV.dataValues.uuid,
                observed_value: pV.dataValues.observed_value,

                ccc_uuid: pV.critical_care_charts.uuid,
                ccc_code: pV.critical_care_charts.code,
                ccc_name: pV.critical_care_charts.name,
                ccc_desc: pV.critical_care_charts.description,
                ccc_value_uuid :pV && pV.cc_concept_value_uuid || 0,

                critical_care_type_uuid: pV.critical_care_charts.critical_care_types.uuid,
                critical_care_type_code: pV.critical_care_charts.critical_care_types.code,
                critical_care_type_name: pV.critical_care_charts.critical_care_types.name,

                ccc_value_type_uuid :pV && pV.critical_care_concepts && pV.critical_care_concepts.value_types ? pV.critical_care_concepts.value_types.uuid : 0,
                ccc_value_type_name :pV && pV.critical_care_concepts && pV.critical_care_concepts.value_types ? pV.critical_care_concepts.value_types.name : 0,
                ccc_value_type_code :pV && pV.critical_care_concepts && pV.critical_care_concepts.value_types ? pV.critical_care_concepts.value_types.code : 0,

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
                observed_date: tD.dataValues.from_date,
                dList: [...dList,
                ...getdbList(fetchedData, tD.patient_uuid, tD.from_date)
                ]
            };
        });
        let uniq = {};
        let db_list = dbList.filter(
            obj => !uniq[obj.observed_date] && (uniq[obj.observed_date] = true)
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
                observed_date: pV.dataValues.from_date,
                db_uuid: pV.dataValues.uuid,
                observed_value: pV.dataValues.observed_value,

                ccc_uuid: pV.critical_care_charts.uuid,
                ccc_code: pV.critical_care_charts.code,
                ccc_name: pV.critical_care_charts.name,
                ccc_desc: pV.critical_care_charts.description,
                ccc_value_uuid :pV && pV.cc_concept_value_uuid || 0,

                critical_care_type_uuid: pV.critical_care_charts.critical_care_types.uuid,
                critical_care_type_code: pV.critical_care_charts.critical_care_types.code,
                critical_care_type_name: pV.critical_care_charts.critical_care_types.name,
                
                ccc_value_type_uuid :pV && pV.critical_care_concepts && pV.critical_care_concepts.value_types ? pV.critical_care_concepts.value_types.uuid : 0,
                ccc_value_type_name :pV && pV.critical_care_concepts && pV.critical_care_concepts.value_types ? pV.critical_care_concepts.value_types.name : 0,
                ccc_value_type_code :pV && pV.critical_care_concepts && pV.critical_care_concepts.value_types ? pV.critical_care_concepts.value_types.code : 0,

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
                observed_date: tD.dataValues.from_date,
                dList: [...dList,
                ...getdlList(fetchedData, tD.patient_uuid, tD.from_date)
                ]
            };
        });
        let uniq = {};
        let dl_list = dlList.filter(
            obj => !uniq[obj.observed_date] && (uniq[obj.observed_date] = true)
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
                observed_date: pV.dataValues.from_date,
                dl_uuid: pV.dataValues.uuid,
                observed_value: pV.dataValues.observed_value,

                ccc_uuid: pV.critical_care_charts.uuid,
                ccc_code: pV.critical_care_charts.code,
                ccc_name: pV.critical_care_charts.name,
                ccc_desc: pV.critical_care_charts.description,
                ccc_value_uuid :pV && pV.cc_concept_value_uuid || 0,

                critical_care_type_uuid: pV.critical_care_charts.critical_care_types.uuid,
                critical_care_type_code: pV.critical_care_charts.critical_care_types.code,
                critical_care_type_name: pV.critical_care_charts.critical_care_types.name,
                ccc_value_type_uuid :pV && pV.critical_care_concepts && pV.critical_care_concepts.value_types ? pV.critical_care_concepts.value_types.uuid : 0,
                ccc_value_type_name :pV && pV.critical_care_concepts && pV.critical_care_concepts.value_types ? pV.critical_care_concepts.value_types.name : 0,
                ccc_value_type_code :pV && pV.critical_care_concepts && pV.critical_care_concepts.value_types ? pV.critical_care_concepts.value_types.code : 0,

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
                observed_date: tD.dataValues.from_date,
                dList: [...dList,
                ...getbpList(fetchedData, tD.patient_uuid, tD.from_date)
                ]
            };
        });
        let uniq = {};
        let bp_list = bpList.filter(
            obj => !uniq[obj.observed_date] && (uniq[obj.observed_date] = true)
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
                observed_date: pV.dataValues.from_date,
                bp_uuid: pV.dataValues.uuid,
                // bp_observed_value: pV.dataValues.observed_value,
                observed_value: pV.dataValues.observed_value,

                ccc_uuid: pV.critical_care_charts.uuid,
                ccc_code: pV.critical_care_charts.code,
                ccc_name: pV.critical_care_charts.name,
                ccc_desc: pV.critical_care_charts.description,
                ccc_value_uuid :pV && pV.cc_concept_value_uuid || 0,

                critical_care_type_uuid: pV.critical_care_charts.critical_care_types.uuid,
                critical_care_type_code: pV.critical_care_charts.critical_care_types.code,
                critical_care_type_name: pV.critical_care_charts.critical_care_types.name,

                ccc_value_type_uuid :pV && pV.critical_care_concepts && pV.critical_care_concepts.value_types ? pV.critical_care_concepts.value_types.uuid : 0,
                ccc_value_type_name :pV && pV.critical_care_concepts && pV.critical_care_concepts.value_types ? pV.critical_care_concepts.value_types.name : 0,
                ccc_value_type_code :pV && pV.critical_care_concepts && pV.critical_care_concepts.value_types ? pV.critical_care_concepts.value_types.code : 0,

            };
        });
    }
    return bp_list;
}

async function updateonCdate(tname, u_id) {
    return tname.findOne({
        where: { uuid: u_id }
    }, { returning: true }
    );
}