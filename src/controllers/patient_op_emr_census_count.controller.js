
const db = require("../config/sequelize");
const Sequelize = db.Sequelize;

const rp = require('request-promise');

// Config Import
const config = require("../config/config");

const opEmrCensus_tbl = db.op_emr_census_count;


const patientOPEmrCensusController = () => {
  /* saving op emr census count */
  const addOPEMRCensusCount = async (req, res) => {
    try {

      let bodyPostData = {};
      let opEmrCensusRes = {}
      if (req.body) {
        /**
         * Bind the field values
         */
        bodyPostData = { ...req.body };
        bodyPostData["modified_by"] = bodyPostData.created_by;
        /**
         * Insert the value into op emr census count table
         */
        opEmrCensusRes = await opEmrCensus_tbl.create(bodyPostData, {
          returning: true
        });
      }

      return res.send({
        statusCode: 200,
        responseContent: opEmrCensusRes
      });
    } catch (error) {
      console.log('\n error...', error);
      return res.status(500).send({
        statusCode: 500,
        error
      });
    }
  };

  // --------------------------------------------return----------------------------------
  return {
    addOPEMRCensusCount
  };
};

module.exports = patientOPEmrCensusController();