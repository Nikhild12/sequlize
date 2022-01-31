// Bhaskar H30-46770 - New API for Emr census Count Entry
const db = require("../config/sequelize");
const Sequelize = db.Sequelize;

const rp = require('request-promise');


// Config Import
const config = require("../config/config");

const emrCensus_tbl = db.emr_census_count;

async function getDepartmentCountDetails(fromDate, toDate, facilityUuid) {
  /**
   * The below query is used to fetch the department wise patient count details
   */
  let item_details_query = "SELECT SUM(CASE WHEN ecc.is_adult = 1 AND ecc.gender_uuid = 1 AND ecc.encounter_visit_type_uuid = 1 THEN 1 ELSE 0 END) AS new_adult_male," +
    " SUM(CASE WHEN ecc.is_adult = 1 AND ecc.gender_uuid = 2 AND ecc.encounter_visit_type_uuid = 1 THEN 1 ELSE 0 END) AS new_adult_female," +
    " SUM(CASE WHEN ecc.is_adult = 1 AND ecc.gender_uuid = 3 AND ecc.encounter_visit_type_uuid = 1 THEN 1 ELSE 0 END) AS new_adult_transgender," +
    " SUM(CASE WHEN ecc.is_adult = 1 AND ecc.encounter_visit_type_uuid = 1 THEN 1 ELSE 0 END) AS new_adult_total," +
    " SUM(CASE WHEN ecc.is_adult = 0 AND ecc.gender_uuid = 1 AND ecc.encounter_visit_type_uuid = 1 THEN 1 ELSE 0 END) AS new_child_male," +
    " SUM(CASE WHEN ecc.is_adult = 0 AND ecc.gender_uuid = 2 AND ecc.encounter_visit_type_uuid = 1 THEN 1 ELSE 0 END) AS new_child_female," +
    " SUM(CASE WHEN ecc.is_adult = 0 AND ecc.gender_uuid = 3 AND ecc.encounter_visit_type_uuid = 1 THEN 1 ELSE 0 END) AS new_child_transgender," +
    " SUM(CASE WHEN ecc.is_adult = 0 AND ecc.encounter_visit_type_uuid = 1 THEN 1 ELSE 0 END) AS new_child_total," +
    " SUM(CASE WHEN ecc.encounter_visit_type_uuid = 1 THEN 1 ELSE 0 END) AS total_new_patients," +
    " SUM(CASE WHEN ecc.is_adult = 1 AND ecc.gender_uuid = 1 AND ecc.encounter_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS old_adult_male," +
    " SUM(CASE WHEN ecc.is_adult = 1 AND ecc.gender_uuid = 2 AND ecc.encounter_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS old_adult_female," +
    " SUM(CASE WHEN ecc.is_adult = 1 AND ecc.gender_uuid = 3 AND ecc.encounter_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS old_adult_transgender," +
    " SUM(CASE WHEN ecc.is_adult = 1 AND ecc.encounter_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS old_adult_total," +
    " SUM(CASE WHEN ecc.is_adult = 0 AND ecc.gender_uuid = 1 AND ecc.encounter_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS old_child_male," +
    " SUM(CASE WHEN ecc.is_adult = 0 AND ecc.gender_uuid = 2 AND ecc.encounter_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS old_child_female," +
    " SUM(CASE WHEN ecc.is_adult = 0 AND ecc.gender_uuid = 3 AND ecc.encounter_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS old_child_transgender," +
    " SUM(CASE WHEN ecc.is_adult = 0 AND ecc.encounter_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS old_child_total," +
    " SUM(CASE WHEN ecc.encounter_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS total_old_patients," +
    " SUM(CASE WHEN ecc.encounter_visit_type_uuid = 1 THEN 1 ELSE 0 END) + SUM(CASE WHEN ecc.encounter_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS total_patients," +
    " ecc.encounter_department_uuid AS departmentId " +
    " FROM emr_census_count AS ecc " +
    " WHERE ecc.encounter_date BETWEEN '" + fromDate + "' AND '" + toDate + "' AND ecc.encounter_type_uuid = 1 ";

  /**
   * The below conditions are used validate the null values
   */
  if (facilityUuid !== null && facilityUuid > 0)
    item_details_query = item_details_query +
      " AND ecc.facility_uuid = " + facilityUuid;
  item_details_query = item_details_query + " GROUP BY ecc.encounter_department_uuid";

  const item_details = await db.sequelize.query(item_details_query, {
    type: Sequelize.QueryTypes.SELECT
  });
  return item_details;
}

async function getDoctorWiseCountDetails(fromDate, toDate, facilityUuid) {
  /**
   * The below query is used to fetch the department wise patient count details
   */
  let item_details_query = "SELECT SUM(CASE WHEN e.is_adult = 1 AND e.gender_uuid = 1 AND ed.dept_visit_type_uuid = 1 THEN 1 ELSE 0 END) AS new_adult_male," +
    " SUM(CASE WHEN e.is_adult = 1 AND e.gender_uuid = 2 AND ed.dept_visit_type_uuid = 1 THEN 1 ELSE 0 END) AS new_adult_female," +
    " SUM(CASE WHEN e.is_adult = 1 AND e.gender_uuid = 3 AND ed.dept_visit_type_uuid = 1 THEN 1 ELSE 0 END) AS new_adult_transgender," +
    " SUM(CASE WHEN e.is_adult = 1 AND ed.dept_visit_type_uuid = 1 THEN 1 ELSE 0 END) AS new_adult_total," +
    " SUM(CASE WHEN e.is_adult = 0 AND e.gender_uuid = 1 AND ed.dept_visit_type_uuid = 1 THEN 1 ELSE 0 END) AS new_child_male," +
    " SUM(CASE WHEN e.is_adult = 0 AND e.gender_uuid = 2 AND ed.dept_visit_type_uuid = 1 THEN 1 ELSE 0 END) AS new_child_female," +
    " SUM(CASE WHEN e.is_adult = 0 AND e.gender_uuid = 3 AND ed.dept_visit_type_uuid = 1 THEN 1 ELSE 0 END) AS new_child_transgender," +
    " SUM(CASE WHEN e.is_adult = 0 AND ed.dept_visit_type_uuid = 1 THEN 1 ELSE 0 END) AS new_child_total," +
    " SUM(CASE WHEN ed.dept_visit_type_uuid = 1 THEN 1 ELSE 0 END) AS total_new_patients," +
    " SUM(CASE WHEN e.is_adult = 1 AND e.gender_uuid = 1 AND ed.dept_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS old_adult_male," +
    " SUM(CASE WHEN e.is_adult = 1 AND e.gender_uuid = 2 AND ed.dept_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS old_adult_female," +
    " SUM(CASE WHEN e.is_adult = 1 AND e.gender_uuid = 3 AND ed.dept_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS old_adult_transgender," +
    " SUM(CASE WHEN e.is_adult = 1 AND ed.dept_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS old_adult_total," +
    " SUM(CASE WHEN e.is_adult = 0 AND e.gender_uuid = 1 AND ed.dept_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS old_child_male," +
    " SUM(CASE WHEN e.is_adult = 0 AND e.gender_uuid = 2 AND ed.dept_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS old_child_female," +
    " SUM(CASE WHEN e.is_adult = 0 AND e.gender_uuid = 3 AND ed.dept_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS old_child_transgender," +
    " SUM(CASE WHEN e.is_adult = 0 AND ed.dept_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS old_child_total," +
    " SUM(CASE WHEN ed.dept_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS total_old_patients," +
    " SUM(CASE WHEN ed.dept_visit_type_uuid = 1 THEN 1 ELSE 0 END) + SUM(CASE WHEN ed.dept_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS total_patients," +
    " ed.doctor_uuid AS doctorId " +
    " FROM encounter_doctors AS ed, encounter AS e " +
    " WHERE ed.encounter_uuid = e.uuid AND ed.consultation_start_date BETWEEN '" + fromDate + "' AND '" + toDate + "' AND e.encounter_type_uuid = 1 ";

  /**
   * The below conditions are used validate the null values
   */
  if (facilityUuid !== null && facilityUuid > 0)
    item_details_query = item_details_query +
      " AND e.facility_uuid = " + facilityUuid;
  item_details_query = item_details_query + " GROUP BY ed.doctor_uuid";

  const item_details = await db.sequelize.query(item_details_query, {
    type: Sequelize.QueryTypes.SELECT
  });
  return item_details;
}

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
        bodyPostData = { ...req.body };
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

  /**
   * Get op department wise patient count
   */
  const getOPDepartmentWisePatCount = async (req, res) => {
    try {
      /**
         * Request body
         */
      const {
        fromDate,
        toDate,
        facilityUuid
      } = req.body;
      const {
        user_uuid
      } = req.headers;
      let Authorization;
      Authorization = req.headers.Authorization ? req.headers.Authorization : req.headers.authorization
      /**
       * Get department wise count
       */
      const departmentCountDetails = await getDepartmentCountDetails(fromDate, toDate, facilityUuid);

      let finalData = [];
      for (let e of departmentCountDetails) {
        if (e.departmentId) {
          /**
           * Get department name using department id
           * This call the App master service and fetch the department name
           */
          const departmentName = await getDepartments(user_uuid, Authorization, e.departmentId);
          if (departmentName) {
            /**
             * Create new object and push into the final array
             */
            finalData.push({ ...e, department_name: departmentName });
          }
        } else {
          /**
             * false return exsiting object
             */
          finalData.push(e);
        }
      }

      return res.send({
        statusCode: 200,
        responseContent: finalData
      });

    } catch (error) {
      console.log('\n error...', error);
      return res.status(500).send({
        statusCode: 500,
        error
      });
    }
  }


  /**
   * Get op doctor wise patient count
   */
  const getDoctorWisePatCount = async (req, res) => {
    try {
      /**
         * Request body
         */
      const {
        fromDate,
        toDate,
        facilityUuid
      } = req.body;
      const {
        user_uuid
      } = req.headers;
      let Authorization;
      Authorization = req.headers.Authorization ? req.headers.Authorization : req.headers.authorization
      /**
       * Get doctor wise count
       */
      const doctorCountDetails = await getDoctorWiseCountDetails(fromDate, toDate, facilityUuid);

      let finalData = [];
      for (let e of doctorCountDetails) {
        if (e.doctorId) {
          /**
           * Get doctor name using doctor id
           * This call the App master service and fetch the doctor name
           */
          const doctorObj = await getDoctorDetails(user_uuid, Authorization, e.doctorId);
          if (doctorObj) {
            /**
             * Create new object and push into the final array
             */
            const doctorName = doctorObj.responseContents[0].first_name;
            const departmentId = doctorObj.responseContents[0].department.uuid;
            const departmentName = doctorObj.responseContents[0].department.name;
            finalData.push({ ...e, doctor_name: doctorName, department_id: departmentId, department_name: departmentName });
          }
        } else {
          /**
             * false return exsiting object
             */
          finalData.push(e);
        }
      }

      return res.send({
        statusCode: 200,
        responseContent: finalData
      });

    } catch (error) {
      console.log('\n error...', error);
      return res.status(500).send({
        statusCode: 500,
        error
      });
    }
  }

  // --------------------------------------------return----------------------------------
  return {
    addEMRCensusCount,
    getOPDepartmentWisePatCount,
    getDoctorWisePatCount
  };
};

module.exports = patientEmrCensusController();
// Bhaskar H30-46770 - New API for Emr census Count Entry

/**
 * This methos is used to call app manager service
 * @param {*} user_uuid 
 * @param {*} Authorization 
 * @param {*} departmentIds 
 * @returns 
 */
async function getDepartments(user_uuid, Authorization, departmentIds) {
  // const url = 'https://qahmisgateway.oasyshealth.co/DEVAppmaster/v1/api/department/getSpecificDepartmentsByIds';
  const url = config.wso2AppUrl + 'department/getSpecificDepartmentsByIds';

  let options = {
    uri: url,
    method: 'POST',
    headers: {
      Authorization: Authorization,
      user_uuid: user_uuid,
      'Content-Type': 'application/json'
    },
    body: {
      "uuid": [departmentIds]
    },
    json: true
  };
  const departmentData = await rp(options);
  if (departmentData) {
    return departmentData.responseContent.rows[0].name;
  }
}

async function getDoctorDetails(user_uuid, Authorization, doctorIds) {
  // const url = 'https://qahmisgateway.oasyshealth.co/DEVAppmaster/v1/api/userProfile/getSpecificUsersByIds';
  const url = config.wso2AppUrl + 'userProfile/getSpecificUsersByIds';
  let options = {
    uri: url,
    method: 'POST',
    headers: {
      Authorization: Authorization,
      user_uuid: user_uuid,
      'Content-Type': 'application/json'
    },
    body: {
      "uuid": [doctorIds]
    },
    json: true
  };
  const doctorData = await rp(options);
  if (doctorData) {
    return doctorData;
  }
}