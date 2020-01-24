const httpStatus = require("http-status");

const db = require("../config/sequelize");

var Sequelize = require('sequelize');
var Op = Sequelize.Op;

const moment = require('moment');

const in_out_takeTbl = db.in_out_take_charts;
const cccTbl = db.critical_care_charts;
const cctypeTbl = db.critical_care_types;

const in_out_takechartsController = () => {
    /**
    * Returns jwt token if valid username and password is provided
    * @param req
    * @param res
    * @param next
    @returns {}
    */


    const _createin_out_take = async (req, res) => {

        try {

            let { user_uuid } = req.headers;
            let data1 = req.body.headers;
            let data2 = req.body.observed_data;

            if (user_uuid && data1 && data2) {

                const createdData = create_in_out_take(user_uuid, data1, data2);

                if (createdData) {
                    res.send({ "status": 200, "in_out_take_data": data2, "message": "Inserted Successfully " });
                }
            } else {
                return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" });
            }
        } catch (ex) {
            res.send({ "status": 400, "message": ex.message });
        }
    };

    const _getin_out_takebypatientid = async (req, res) => {

        let { user_uuid } = req.headers;
        let { patient_uuid } = req.query;

        try {
            if (user_uuid && patient_uuid) {
                const {table_name, query} = getin_out_takequery(patient_uuid);
                const data = await table_name.findAll(query);
                if (data) {
                    const adata = getin_out_takeData(data);
                    return res
                        .status(httpStatus.OK)
                        .json({ statusCode: 200, req: '', responseContents: adata });
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

    const _updatein_out_takebypatientid = async (req, res) => {

        try {
            // plucking data req body
            let { user_uuid } = req.headers;
            let data1 = req.body.headers;
            let data2 = req.body.observed_data;

            if (user_uuid ) {

                const data = await Promise.all(updatein_out_takedata(in_out_takeTbl, data1, data2, user_uuid));
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

    
    const _getin_out_takecomparedata = async (req, res) => {
        let { user_uuid } = req.headers;
        let { patient_uuid, from_date, to_date } = req.query;

        try {
            if (user_uuid && patient_uuid && from_date && to_date) {
        
                const {table_name, query} = getin_out_takecomparequery(patient_uuid,from_date,to_date);
                const data = await table_name.findAll(query);
                if (data) {
                    const vdata = getin_out_takeData(data);
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

return {
        createin_out_take: _createin_out_take,
        getin_out_takebypatientid: _getin_out_takebypatientid,
        updatein_out_takebypatientid: _updatein_out_takebypatientid,
        getin_out_takecomparedata: _getin_out_takecomparedata,
        
    };
};

module.exports = in_out_takechartsController();

async function create_in_out_take(user_uuid, data1, data2) {

    data2.forEach((item, index) => {
        item.patient_uuid = data1.patient_uuid;
        item.encounter_uuid = data1.encounter_uuid;
        item.facility_uuid = data1.facility_uuid;
        item.encounter_type_uuid = data1.encounter_type_uuid;
        item.comments = data1.comments;
        item.modified_by = 0;
        item.is_active = item.status = 1;
        item.revision = 1;
        item.created_date = item.modified_date = new Date();
        item.created_by = user_uuid;
    });
    
    const dtls_result = await in_out_takeTbl.bulkCreate(data2, { returning: true });
    return { "in_out_take_Data": dtls_result };
}

function updatein_out_takedata(in_out_takeTbl, data1, data2, user_uuid) {
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
        in_out_takeTbl.update(item, { where: { patient_uuid: item.patient_uuid, ccc_uuid: item.ccc_uuid } }, { returning: true })];
    });
    return updatePromise;
}

function getin_out_takeData(fetchedData) {
    let in_out_takeList = [];
  
    if (fetchedData && fetchedData.length > 0) {
      in_out_take_details = {
        patient_uuid: fetchedData[0].dataValues.patient_uuid,
        encounter_uuid: fetchedData[0].dataValues.encounter_uuid,
  
        facility_uuid: fetchedData[0].dataValues.facility_uuid,
        encounter_type_uuid: fetchedData[0].dataValues.encounter_type_uuid,
        comments: fetchedData[0].dataValues.comments,
      };
  
      fetchedData.forEach((tD) => {
        in_out_takeList = [...in_out_takeList,
        {
          in_out_take_uuid: tD.dataValues.uuid,
          in_out_take_date: tD.dataValues.from_date,
          in_out_take_observed_value: tD.dataValues.observed_value,
          
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
      return { "in_out_take_details": in_out_take_details, "observed_values": in_out_takeList };
    }
    else {
      return {};
    }
  }

  function getin_out_takecomparequery(patient_uuid,from_date,to_date) {
    
        return {
          table_name: in_out_takeTbl,
          query: {
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

                            include: [
                                {
                                    model: cctypeTbl,
                                    as: 'critical_care_types',
                                    attributes: ['uuid', 'code', 'name'],
                                    where: { is_active: 1, status: 1 },
                                },]

                        },]
                }

          };
        }
 
        function getin_out_takequery(patient_uuid) {
    
            return {
              table_name: in_out_takeTbl,
              query: {
                        order: [['from_date', 'DESC']],
                        where: {
                            patient_uuid: patient_uuid,
                            is_active: 1,
                            status: 1,
                            },
                        include: [
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
                    }
    
              };
            }
    
  