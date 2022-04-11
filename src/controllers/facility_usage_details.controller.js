// ---- Khurshid ------- H30-48834- -- Facility  Usage Details API
const httpStatus = require("http-status");
const db = require("../config/sequelize");

const Sequelize = require("sequelize");

const facilityUsageDetailsController = () => {
  /**
   * Returns jwt token if valid username and password is provided
   * @param req
   * @param res
   * @param next
   * @returns {*}
   */

  /*=============== Film Usage Fetch API's================*/

  const getfacilityusagedetails = async (req, res, next) => {
    try {
      const { fromDate, toDate, facility_uuid } = req.body;



let fetchQuery = "SELECT SUM(CASE WHEN oecc.is_adult = 1 AND oecc.gender_uuid = 1 AND oecc.encounter_visit_type_uuid != 2 THEN 1 ELSE 0 END) AS new_adult_male," + 
" SUM(CASE WHEN oecc.is_adult = 1 AND oecc.gender_uuid = 2 AND oecc.encounter_visit_type_uuid != 2 THEN 1 ELSE 0 END) AS new_adult_female," +
" SUM(CASE WHEN oecc.is_adult = 1 AND oecc.gender_uuid = 3 AND oecc.encounter_visit_type_uuid != 2 THEN 1 ELSE 0 END) AS new_adult_transgender," + 
" SUM(CASE WHEN oecc.is_adult = 1 AND oecc.encounter_visit_type_uuid != 2 THEN 1 ELSE 0 END) AS new_adult_total," + 
" SUM(CASE WHEN oecc.is_adult = 0 AND oecc.gender_uuid = 1 AND oecc.encounter_visit_type_uuid != 2 THEN 1 ELSE 0 END) AS new_child_male," + 
" SUM(CASE WHEN oecc.is_adult = 0 AND oecc.gender_uuid = 2 AND oecc.encounter_visit_type_uuid != 2 THEN 1 ELSE 0 END) AS new_child_female," + 
" SUM(CASE WHEN oecc.is_adult = 0 AND oecc.gender_uuid = 3 AND oecc.encounter_visit_type_uuid != 2 THEN 1 ELSE 0 END) AS new_child_transgender," + 
" SUM(CASE WHEN oecc.is_adult = 0 AND oecc.encounter_visit_type_uuid != 2 THEN 1 ELSE 0 END) AS new_child_total," + 
" SUM(CASE WHEN oecc.encounter_visit_type_uuid != 2 THEN 1 ELSE 0 END) AS total_new_patients," + 
" SUM(CASE WHEN oecc.is_adult = 1 AND oecc.gender_uuid = 1 AND oecc.encounter_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS old_adult_male," + 
" SUM(CASE WHEN oecc.is_adult = 1 AND oecc.gender_uuid = 2 AND oecc.encounter_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS old_adult_female," + 
" SUM(CASE WHEN oecc.is_adult = 1 AND oecc.gender_uuid = 3 AND oecc.encounter_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS old_adult_transgender," + 
" SUM(CASE WHEN oecc.is_adult = 1 AND oecc.encounter_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS old_adult_total," + 
" SUM(CASE WHEN oecc.is_adult = 0 AND oecc.gender_uuid = 1 AND oecc.encounter_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS old_child_male," + 
" SUM(CASE WHEN oecc.is_adult = 0 AND oecc.gender_uuid = 2 AND oecc.encounter_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS old_child_female," + 
" SUM(CASE WHEN oecc.is_adult = 0 AND oecc.gender_uuid = 3 AND oecc.encounter_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS old_child_transgender," + 
" SUM(CASE WHEN oecc.is_adult = 0 AND oecc.encounter_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS old_child_total," + 
" SUM(CASE WHEN oecc.encounter_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS total_old_patients," + 
" SUM(CASE WHEN oecc.encounter_visit_type_uuid != 2 THEN 1 ELSE 0 END) + SUM(CASE WHEN oecc.encounter_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS total_patients," + 
" oecc.facility_uuid AS facility_uuid,oecc.facility_name AS facility_name" +  
" FROM op_emr_census_count AS oecc" + 
" WHERE oecc.encounter_type_uuid != 2  AND DATE(oecc.registration_date) BETWEEN '" + fromDate + "' AND '" + toDate + "'" +
" AND oecc.facility_uuid IN(facility_uuid)"  +
" GROUP BY oecc.facility_uuid";

      const item_details = await db.sequelize.query(fetchQuery, {
        type: Sequelize.QueryTypes.SELECT,
      });
      return res.status(httpStatus.OK).json({
        statusCode: 200,
        msg: "GET Facility Usage Details By fromDate to toDate",
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
    getfacilityusagedetails,
  };
};

module.exports = facilityUsageDetailsController();

// ---- Khurshid ------- H30-48834- -- Facility Usage details API
