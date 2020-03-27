// Import HttpStatus
const httpStatus = require("http-status");

// Import EMR Constants
const emr_constants = require("../config/constants");

// Import EMR Utilities
const emr_utilities = require("../services/utility.service");

// Import Diseases Attributes
const disease_att = require("../attributes/diseases.attributes");

// Sequelizer Import
const sequelizeDb = require("../config/sequelize");

// disease tbl Initialize
const diseasetbl = sequelizeDb.diseases;

const DiseasesController = () => {
  const _getDiseasesByFilters = async (req, res) => {
    const { user_uuid } = req.headers;
    const { searchBy, searchValue } = req.query;

    const isValidSearchBy = searchBy && emr_utilities.isStringValid(searchBy);
    const isValidSearchVal =
      searchValue && emr_utilities.isStringValid(searchValue);

    if (isValidSearchBy && isValidSearchVal && user_uuid) {
      try {
        const filteredDiseasesData = await diseasetbl.findAll({
          attributes: disease_att.dis,
          where: disease_att.diseasesQuery(searchBy, searchValue)
        });

        const responseCode = emr_utilities.getResponseCodeForSuccessRequest(
          filteredDiseasesData
        );
        return res.status(200).send({
          code: responseCode,
          message: emr_utilities.getResponseMessageForSuccessRequest(
            responseCode, 'dis'
          ),
          responseContents: disease_att.getModifiedResponse(
            filteredDiseasesData
          )
        });
      } catch (ex) {
        console.log(ex);

        return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
          code: httpStatus.INTERNAL_SERVER_ERROR,
          message: ex.message
        });
      }
    } else {
      return res.status(400).send({
        code: httpStatus[400],
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`
      });
    }
  };
  return {
    getDiseasesByFilters: _getDiseasesByFilters
  };
};

module.exports = DiseasesController();
