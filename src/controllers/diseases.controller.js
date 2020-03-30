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
            responseCode,
            "dis"
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

  const _createDiseases = async (req, res) => {
    const { user_uuid } = req.headers;

    const createDiseases  = req.body;

    if (
      user_uuid &&
      typeof createDiseases === "object" &&
      Object.keys(createDiseases).length > 0
    ) {
      try {
        // assigning default Values
        createDiseases.status = emr_constants.IS_ACTIVE;
        createDiseases.created_by = createDiseases.modified_by = user_uuid;
        createDiseases.created_date = createDiseases.modified_date = new Date();
        createDiseases.revision = emr_constants.IS_ACTIVE;

        // if is_active is not sent
        // setting it to false by default
        if (createDiseases && !createDiseases.is_active) {
          createDiseases.is_active = emr_constants.IS_IN_ACTIVE;
        }

        const createdDiseases = await diseasetbl.create(createDiseases, {
          returning: emr_constants.IS_ACTIVE
        });

        if (createdDiseases) {
          createDiseases.uuid = createdDiseases.uuid;
        }

        return res.status(200).send({
          code: httpStatus.OK,
          message: "Inserted Diseases Successfully",
          responseContents: createDiseases
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
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}`
      });
    }
  };
  return {
    getDiseasesByFilters: _getDiseasesByFilters,
    createDiseases: _createDiseases
  };
};

module.exports = DiseasesController();
