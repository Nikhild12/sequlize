const httpStatus = require("http-status");

const db = require("../config/sequelize");

var Sequelize = require('sequelize');
var Op = Sequelize.Op;

const moment = require('moment');

const diabetesTbl = db.diabetes_charts;
const cccTbl = db.critical_care_charts;
const cctypeTbl = db.critical_care_types;

const diabeteschartsController = () => {
    /**
    * Returns jwt token if valid username and password is provided
    * @param req
    * @param res
    * @param next
    @returns {}
    */


    const _creatediabetes = async (req, res) => {

        try {

            let { user_uuid } = req.headers;
            let data1 = req.body.headers;
            let data2 = req.body.observed_data;

            if (user_uuid && data1 && data2) {

                const createdData = create_diabetes(user_uuid, data1, data2);

                if (createdData) {
                    res.send({ "status": 200, "diabetes_data": data2, "message": "Inserted Successfully " });
                }
            } else {
                return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" });
            }
        } catch (ex) {
            res.send({ "status": 400, "message": ex.message });
        }
    };

    const _getdiabetesbypatientid = async (req, res) => {

        let { user_uuid } = req.headers;
        let { patient_uuid } = req.query;

        try {
            if (user_uuid && patient_uuid) {
                const {table_name, query} = getdiabetesquery(patient_uuid);
                const data = await table_name.findAll(query);
                if (data) {
                    const adata = getdiabetesData(data);
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

    const _updatediabetesbypatientid = async (req, res) => {

        try {
            // plucking data req body
            let { user_uuid } = req.headers;
            let data1 = req.body.headers;
            let data2 = req.body.observed_data;

            if (user_uuid ) {

                const data = await Promise.all(updatediabetesdata(diabetesTbl, data1, data2, user_uuid));
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

    
    const _getdiabetescomparedata = async (req, res) => {
        let { user_uuid } = req.headers;
        let { patient_uuid, from_date, to_date } = req.query;

        try {
            if (user_uuid && patient_uuid && from_date && to_date) {
        
                const {table_name, query} = getdiabetescomparequery(patient_uuid,from_date,to_date);
                const data = await table_name.findAll(query);
                if (data) {
                    const vdata = getdiabetesData(data);
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
        creatediabetes: _creatediabetes,
        getdiabetesbypatientid: _getdiabetesbypatientid,
        updatediabetesbypatientid: _updatediabetesbypatientid,
        getdiabetescomparedata: _getdiabetescomparedata,
        
    };
};

module.exports = diabeteschartsController();

async function create_diabetes(user_uuid, data1, data2) {

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
    
    const dtls_result = await diabetesTbl.bulkCreate(data2, { returning: true });
    return { "diabetes_Data": dtls_result };
}

function updatediabetesdata(diabetesTbl, data1, data2, user_uuid) {
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
        diabetesTbl.update(item, { where: { patient_uuid: item.patient_uuid, cc_chart_uuid: item.cc_chart_uuid } }, { returning: true })];
    });
    return updatePromise;
}

function getdiabetesData(fetchedData) {
    let diabetesList = [];
  
    if (fetchedData && fetchedData.length > 0) {
      diabetes_details = {
        patient_uuid: fetchedData[0].dataValues.patient_uuid,
        encounter_uuid: fetchedData[0].dataValues.encounter_uuid,
  
        facility_uuid: fetchedData[0].dataValues.facility_uuid,
        encounter_type_uuid: fetchedData[0].dataValues.encounter_type_uuid,
        comments: fetchedData[0].dataValues.comments,
      };
  
      fetchedData.forEach((tD) => {
        diabetesList = [...diabetesList,
        {
          diabetes_uuid: tD.dataValues.uuid,
          diabetes_date: tD.dataValues.from_date,
          
          diabetes_observed_value: tD.dataValues.observed_value,
          
          cc_chart_uuid: tD.critical_care_charts.uuid,
          cc_chart_code: tD.critical_care_charts.code,
          cc_chart_name: tD.critical_care_charts.name,
          cc_chart_desc: tD.critical_care_charts.description,
  
          critical_care_type_uuid : tD.critical_care_charts.critical_care_types.uuid,
          critical_care_type_code : tD.critical_care_charts.critical_care_types.code,
          critical_care_type_name : tD.critical_care_charts.critical_care_types.name,
          }
        ];
      });
      return { "diabetes_details": diabetes_details, "observed_values": diabetesList };
    }
    else {
      return {};
    }
  }

  function getdiabetescomparequery(patient_uuid,from_date,to_date) {
    
        return {
          table_name: diabetesTbl,
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
 
        function getdiabetesquery(patient_uuid) {
    
            return {
              table_name: diabetesTbl,
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
    
  