// Bhaskar H30-46770 - New API for Emr census Count Entry
const db = require("../config/sequelize");

const emrCensus_tbl = db.emr_census_count;

const patientEmrCensusController = () => {
  /* saving op census count */
  const addEMRCensusCount = async (req, res) => {
    try {

      let bodyPostData = {};
      let emrCensusRes = {}
      if (req.body) {
        /**
         * Bind the field values
         */
        bodyPostData = {...req.body};
        bodyPostData["modified_by"] = bodyPostData.created_by;
        /**
         * Insert the value into emr census count table
         */
        emrCensusRes = await emrCensus_tbl.create(bodyPostData, {
          returning: true
        });
      }

      return res.send({
        statusCode: 200,
        responseContent: emrCensusRes
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
    addEMRCensusCount
  };
};

module.exports = patientEmrCensusController();
// Bhaskar H30-46770 - New API for Emr census Count Entry