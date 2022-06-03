// H30-50055 ----Day wise Patient List API -Khurshid -- Start
const httpStatus = require("http-status");
const db = require("../config/sequelize");

const Sequelize = require("sequelize");

const dayWisePatientListController = () => {
  /**
   * Returns jwt token if valid username and password is provided
   * @param req
   * @param res
   * @param next
   * @returns {*}
   */

  /*=============== Film Usage Fetch API's================*/

const getdaywisepatientdetails = async (req, res, next) => {
  try {
    const { fromDate, toDate, facility_uuid } = req.body;
    let fetchQuery = "SELECT facility_name, facility_type_uuid, registration_date, patient_pin_no, patient_name,age, gender_uuid, visit_type_name, registered_session_name, department_name, mobile" +
     " From op_emr_census_count oecc " +
     " WHERE  DATE(oecc.registration_date) BETWEEN '" + fromDate + "' AND '" + toDate + "'";

    if(facility_uuid && facility_uuid > 0) {
      fetchQuery = fetchQuery + ` AND oecc.facility_uuid = ${facility_uuid}`
    }
    const item_details = await db.sequelize.query(fetchQuery, {
      type: Sequelize.QueryTypes.SELECT,
    });
    return res.status(httpStatus.OK).json({
      statusCode: 200,
      msg: "GET Day Wise New Patient List Details",
      req: req.body,
      responseContents: item_details,
    });
  } catch (err) {
    const errorMsg = err.errors ? err.errors[0].message : err.message;
    return res.status(500).json({ 
      statusCode: 500,
      status: "error",
      msg: errorMsg });
    }
  };

  // --------------------------------------------return----------------------------------
  return {
    getdaywisepatientdetails,
  };
};

module.exports = dayWisePatientListController();

// H30-50055 ---Day wise Patient List API -Khurshid -- END