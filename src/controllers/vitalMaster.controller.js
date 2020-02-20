const httpStatus = require("http-status");
const sequelize = require('sequelize');
const Op = sequelize.Op;
const emr_const = require('../config/constants');
const db = require("../config/sequelize");

const clinical_const = require('../config/constants');
//import tables
const vitalmstrTbl = db.vital_masters;
const vitalTypeTbl = db.vital_type;
const vitalValueTypeTbl = db.vital_value_type;


const vitalmstrController = () => {
	/**
	 * Returns jwt token if valid username and password is provided
	 * @param req
	 * @param res
	 * @param next
	 * @returns {*}
	 */

 

  const _createVital = async (req, res) => {
    const { user_uuid } = req.headers;
    const vitalsMasterData = req.body;

    if(user_uuid && vitalsMasterData){
      

          vitalsMasterData.code = vitalsMasterData & vitalsMasterData.code ? vitalsMasterData.code : vitalsMasterData.name;
        vitalsMasterData.description = vitalsMasterData & vitalsMasterData.description ? vitalsMasterData.description : vitalsMasterData.name;
        vitalsMasterData.is_active = vitalsMasterData.status = emr_const.IS_ACTIVE;
        vitalsMasterData.created_by = vitalsMasterData.modified_by = user_uuid;
        vitalsMasterData.created_date = vitalsMasterData.modified_date = new Date();
        vitalsMasterData.revision = 1;
        try {
            const vitalsCreatedData = await vitalmstrTbl.create(vitalsMasterData, { returning: true });

            if (vitalsCreatedData) {
                vitalsMasterData.uuid = vitalsCreatedData.uuid;
                return res.status(200).send({  statusCode: 200, message: "Inserted Chief Complaints Successfully", responseContents: vitalsMasterData });
            }
        } catch (ex) {
            console.log(ex.message);
            return res.status(400).send({ statusCode: 400, message: ex.message });
        }
    }else {
        return res.status(400).send({ statusCode: 400, message: 'No Headers Found' });
    }
   



};

  //function for getting default vitals
  const _getVitals = async (req, res) => {
    try {
      const result = await vitalmstrTbl.findAll(getdefaultVitalsQuery(), { returning: true });
      if (result) {
        return res.status(200).send({ statusCode: httpStatus.OK, message: "Fetched Vital Master details Successfully", responseContents: { getVitals: result } });
      }
    }
    catch (ex) {
      return res.status(400).send({ statusCode: httpStatus.BAD_REQUEST, message: ex.message });
    }
  };
  //function for getting all vitals
  const _getALLVitals = async (req, res) => {
    let query = {
      where: { is_active: 1, status: 1 },
      // include:[{
      //   model:vitalTypeTbl, 
      //   as:'vital_type',    
      //   where:{
      //     is_active:1,
      //     status:1
      //   }
      // }] 
    };
    try {
      const result = await vitalmstrTbl.findAll(query, { returning: true });
      if (result) {
        return res.status(200).send({ statusCode: httpStatus.OK, message: "Fetched Vital Master details Successfully", responseContents: { getVitals: result } });
      }
    }
    catch (ex) {
      return res.status(400).send({ statusCode: httpStatus.BAD_REQUEST, message: ex.message });
    }
  };
  const _getALLVitalsmaster = async (req, res) => {
    let getsearch = req.body;

    let pageNo = 0;
    const itemsPerPage = getsearch.paginationSize ? getsearch.paginationSize : 10;
    let sortField = 'created_date';
    let sortOrder = 'DESC';

    if (getsearch.pageNo) {
        let temp = parseInt(getsearch.pageNo);


        if (temp && (temp != NaN)) {
            pageNo = temp;
        }
    }

    const offset = pageNo * itemsPerPage;


    if (getsearch.sortField) {

        sortField = getsearch.sortField;
    }

    if (getsearch.sortOrder && ((getsearch.sortOrder == 'ASC') || (getsearch.sortOrder == 'DESC'))) {

        sortOrder = getsearch.sortOrder;
    }
    let findQuery = {
        offset: offset,
        limit: itemsPerPage,
        order: [
            [sortField, sortOrder],
        ],
        where:{is_active: 1}
    };

    if (getsearch.search && /\S/.test(getsearch.search)) {

        findQuery.where = {
            [Op.or]: [{
                allergey_code: {
                        [Op.like]: '%' + getsearch.search + '%',
                    },


                }, {
                    allergy_name: {
                        [Op.like]: '%' + getsearch.search + '%',
                    },
                }

            ]
        };
    }
   
    try {
      const result = await vitalmstrTbl.findAndCountAll(findQuery, { returning: true });
      if (result) {
        return res.status(200).send({ statusCode: 200, message: "Fetched Vital Master details Successfully", responseContents:  (result.rows ? result.rows : []),
        totalRecords: (result.count ? result.count : 0),  });
      }
    }
    catch (ex) {
      return res.status(400).send({ statusCode: httpStatus.BAD_REQUEST, message: ex.message });
    }
  };
  const _getVitalByID = async (req, res, next) => {  
    const postData = req.body;
    try {

      const page = postData.page ? postData.page : 1;
      const itemsPerPage = postData.limit ? postData.limit : 10;
      const offset = (page - 1) * itemsPerPage;
      await vitalmstrTbl.findOne({
              where: {
                  uuid: postData.Vital_id
              },
              offset: offset,
              limit: itemsPerPage
          })
          .then((data) => {
              return res
                  .status(httpStatus.OK)
                  .json({
                      statusCode: 200,
                      req: '',
                      responseContents: data
                  });
          });

  } catch (err) {
      const errorMsg = err.errors ? err.errors[0].message : err.message;
      return res
          .status(httpStatus.INTERNAL_SERVER_ERROR)
          .json({
              status: "error",
              msg: errorMsg
          });
     };
    };
  const _updatevitalsById = async (req, res, next) => {
    const postData = req.body;
    postData.modified_by = req.headers.user_uuid;
    await vitalmstrTbl.update(
        postData, {
            where: {
                uuid: postData.vitals_id
            }
        }
    ).then((data) => {
        res.send({
            code: 200,
            msg: "Updated Successfully",
            req: postData,
            responseContents: data
        });
    });
    
};
const _deletevitals = async (req, res) => {

  // plucking data req body
  const { vitals_id } = req.body;
  const { user_uuid } = req.headers; 

  if (vitals_id) {
      const updatedvitalsData = { status: 0, modified_by: user_uuid, modified_date: new Date() };
      try {

          const updateddiagnosissAsync = await Promise.all(
              [
                  vitalmstrTbl.update(updatedvitalsData, { where: { uuid: vitals_id } })
                 
              ]
          );

          if (updateddiagnosissAsync) {
              return res.status(200).send({ code: 200, message: "Deleted Successfully" });
          }

      } catch (ex) {
          return res.status(400).send({ code: 400, message: ex.message });
      }

  } else {
      return res.status(400).send({ code: 400, message: "No Request Body Found" });
  }

};
  return {
    createVital: _createVital,
    getVitals: _getVitals,
    getAllVitals: _getALLVitals,
    getVitalByID: _getVitalByID,
    getALLVitalsmaster:_getALLVitalsmaster,
    updatevitalsById:_updatevitalsById,
    deletevitals:_deletevitals
  };
};

module.exports = vitalmstrController();

function getdefaultVitalsQuery(vital_uuid) {
  let q = {
    where: { is_default: clinical_const.IS_ACTIVE, is_active: clinical_const.IS_ACTIVE, status: clinical_const.IS_ACTIVE },
    include: [
      {
        model: vitalValueTypeTbl,
        as: 'vital_value_type',
        where: {
          is_active: clinical_const.IS_ACTIVE,
          status: clinical_const.IS_ACTIVE
        }
      },
      {
        model: vitalTypeTbl,
        as: 'vital_type',
        where: {
          is_active: clinical_const.IS_ACTIVE,
          status: clinical_const.IS_ACTIVE
        }
      }
    ]
  };

  if (vital_uuid) {
    q.where.uuid = vital_uuid;
  }
  return q;
}


