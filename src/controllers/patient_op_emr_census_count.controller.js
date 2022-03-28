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

  /**
   * Get op department wise patient count
   */
  const getDepartmentWisePatCount = async (req, res) => {
    try {
      /**
         * Request body
         */
      const {
        fromDate,
        toDate,
        facilityUuid,
        departmentUuid //H30-47957-Saju-Get outpatient department wise api issue and add new filter condition
      } = req.body;
      const {
        user_uuid
      } = req.headers;
      let Authorization;
      Authorization = req.headers.Authorization ? req.headers.Authorization : req.headers.authorization
      /**
       * Get department wise count
       */
      const departmentCountDetails = await getDepartmentWiseCountDetails(fromDate, toDate, facilityUuid, departmentUuid);

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
   * Get op session wise patient count
   */
  const getSessionWisePatCount = async (req, res) => {
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
       * Get session wise count
       */
      const sessionCountDetails = await getSessionWiseCountDetails(fromDate, toDate, facilityUuid);

      let finalData = [];
      finalData.push(sessionCountDetails);
      /*
      for (let e of sessionCountDetails) {
        if (e.departmentId) {
          const departmentName = await getDepartments(user_uuid, Authorization, e.departmentId);
          if (departmentName) {
            finalData.push({ ...e, department_name: departmentName });
          }
        } else {
          finalData.push(e);
        }
      }
      */
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

  //H30-47544-Saju-OP Back entry	OP Back entry> Registration date and time mismaches with the day wise patient report
  const getDayWisePatientList = async (req, res) => {
    try {
      /**
         * Request body
         */
      const {
        fromDate,
        toDate,
        department_Id,
        institutioncategory_Id,
        institution_Id,
        institutiontype_Id
      } = req.body;

      /**
       * Get session wise count
       */
      const dayWisePatientDetails = await getDayWisePatientDetails(fromDate, toDate, department_Id, institutioncategory_Id, institution_Id, institutiontype_Id);

      return res.send({
        statusCode: 200,
        responseContent: dayWisePatientDetails
      });

    } catch (error) {
      console.log('\n error...', error);
      return res.status(500).send({
        statusCode: 500,
        error
      });
    }
  }

  const getDayWisePatientCount = async (req, res) => {
    try {
      /**
         * Request body
         */
      const {
        fromDate,
        toDate,
        department_Id,
        institutioncategory_Id,
        institution_Id
      } = req.body;

      /**
       * Get session wise count
       */
      const dayWisePatientCountDetails = await getDayWisePatientCountDetails(fromDate, toDate, department_Id, institutioncategory_Id, institution_Id);

      return res.send({
        statusCode: 200,
        responseContent: dayWisePatientCountDetails
      });

    } catch (error) {
      console.log('\n error...', error);
      return res.status(500).send({
        statusCode: 500,
        error
      });
    }
  }
  //H30-47544-Saju-OP Back entry	OP Back entry> Registration date and time mismaches with the day wise patient report
  // --------------------------------------------return----------------------------------
  return {
    addOPEMRCensusCount,
    getDepartmentWisePatCount,
    getSessionWisePatCount,
    getDayWisePatientList,
    getDayWisePatientCount
  };
};

module.exports = patientOPEmrCensusController();

async function getDepartmentWiseCountDetails(fromDate, toDate, facilityUuid, departmentUuid) {
  /**
   * The below query is used to fetch the department wise patient count details
   */
  let item_details_query = "SELECT SUM(CASE WHEN oecc.is_adult = 1 AND oecc.gender_uuid = 1 AND oecc.encounter_visit_type_uuid = 1 THEN 1 ELSE 0 END) AS new_adult_male," +
    " SUM(CASE WHEN oecc.is_adult = 1 AND oecc.gender_uuid = 2 AND oecc.encounter_visit_type_uuid = 1 THEN 1 ELSE 0 END) AS new_adult_female," +
    " SUM(CASE WHEN oecc.is_adult = 1 AND oecc.gender_uuid = 3 AND oecc.encounter_visit_type_uuid = 1 THEN 1 ELSE 0 END) AS new_adult_transgender," +
    " SUM(CASE WHEN oecc.is_adult = 1 AND oecc.encounter_visit_type_uuid = 1 THEN 1 ELSE 0 END) AS new_adult_total," +
    " SUM(CASE WHEN oecc.is_adult = 0 AND oecc.gender_uuid = 1 AND oecc.encounter_visit_type_uuid = 1 THEN 1 ELSE 0 END) AS new_child_male," +
    " SUM(CASE WHEN oecc.is_adult = 0 AND oecc.gender_uuid = 2 AND oecc.encounter_visit_type_uuid = 1 THEN 1 ELSE 0 END) AS new_child_female," +
    " SUM(CASE WHEN oecc.is_adult = 0 AND oecc.gender_uuid = 3 AND oecc.encounter_visit_type_uuid = 1 THEN 1 ELSE 0 END) AS new_child_transgender," +
    " SUM(CASE WHEN oecc.is_adult = 0 AND oecc.encounter_visit_type_uuid = 1 THEN 1 ELSE 0 END) AS new_child_total," +
    " SUM(CASE WHEN oecc.encounter_visit_type_uuid = 1 THEN 1 ELSE 0 END) AS total_new_patients," +
    " SUM(CASE WHEN oecc.is_adult = 1 AND oecc.gender_uuid = 1 AND oecc.encounter_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS old_adult_male," +
    " SUM(CASE WHEN oecc.is_adult = 1 AND oecc.gender_uuid = 2 AND oecc.encounter_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS old_adult_female," +
    " SUM(CASE WHEN oecc.is_adult = 1 AND oecc.gender_uuid = 3 AND oecc.encounter_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS old_adult_transgender," +
    " SUM(CASE WHEN oecc.is_adult = 1 AND oecc.encounter_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS old_adult_total," +
    " SUM(CASE WHEN oecc.is_adult = 0 AND oecc.gender_uuid = 1 AND oecc.encounter_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS old_child_male," +
    " SUM(CASE WHEN oecc.is_adult = 0 AND oecc.gender_uuid = 2 AND oecc.encounter_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS old_child_female," +
    " SUM(CASE WHEN oecc.is_adult = 0 AND oecc.gender_uuid = 3 AND oecc.encounter_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS old_child_transgender," +
    " SUM(CASE WHEN oecc.is_adult = 0 AND oecc.encounter_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS old_child_total," +
    " SUM(CASE WHEN oecc.encounter_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS total_old_patients," +
    " SUM(CASE WHEN oecc.encounter_visit_type_uuid = 1 THEN 1 ELSE 0 END) + SUM(CASE WHEN oecc.encounter_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS total_patients," +
    " oecc.encounter_department_uuid AS departmentId " +
    " FROM op_emr_census_count AS oecc " +
    " WHERE oecc.encounter_type_uuid = 1 ";

  /**
   * The below conditions are used validate the null values
   */
  if (fromDate && toDate)
    item_details_query = item_details_query + " AND DATE(oecc.encounter_date) BETWEEN '" + fromDate + "' AND '" + toDate + "'";
  if (facilityUuid !== null && facilityUuid > 0)
    item_details_query = item_details_query +
      " AND oecc.facility_uuid = " + facilityUuid;
  if (departmentUuid !== null && departmentUuid > 0)
    item_details_query = item_details_query +
      " AND oecc.encounter_department_uuid = " + departmentUuid;
  item_details_query = item_details_query + " GROUP BY oecc.encounter_department_uuid";

  const item_details = await db.sequelize.query(item_details_query, {
    type: Sequelize.QueryTypes.SELECT
  });
  return item_details;
}

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

async function getSessionWiseCountDetails(fromDate, toDate, facilityUuid) {
  /**
   * The below query is used to fetch the department wise patient count details
   */
  //H30-48484-Saju-OP census report issue fixing
  let item_details_query = "SELECT" +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND UPPER(oecc.visit_type_name) = 'NEW' AND oecc.is_adult = 1 AND oecc.gender_uuid = 1 THEN 1 ELSE 0 END) AS morning_new_adult_male," +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND UPPER(oecc.visit_type_name) = 'NEW' AND oecc.is_adult = 1 AND oecc.gender_uuid = 2 THEN 1 ELSE 0 END) AS morning_new_adult_female, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND UPPER(oecc.visit_type_name) = 'NEW' AND oecc.is_adult = 1 AND oecc.gender_uuid = 3 THEN 1 ELSE 0 END) AS morning_new_adult_tg, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND UPPER(oecc.visit_type_name) = 'NEW' AND oecc.is_adult = 1 THEN 1 ELSE 0 END) AS morning_new_adult_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND UPPER(oecc.visit_type_name) = 'NEW' AND oecc.is_adult = 0 AND oecc.gender_uuid = 1 THEN 1 ELSE 0 END) AS morning_new_child_male, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND UPPER(oecc.visit_type_name) = 'NEW' AND oecc.is_adult = 0 AND oecc.gender_uuid = 2 THEN 1 ELSE 0 END) AS morning_new_child_female, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND UPPER(oecc.visit_type_name) = 'NEW' AND oecc.is_adult = 0 THEN 1 ELSE 0 END)AS morning_new_child_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND UPPER(oecc.visit_type_name) = 'NEW' THEN 1 ELSE 0 END) AS morning_new_total,   " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND UPPER(oecc.visit_type_name) = 'NEW' AND oecc.is_adult = 1 AND oecc.gender_uuid = 1 THEN 1 ELSE 0 END) AS evening_new_adult_male," +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND UPPER(oecc.visit_type_name) = 'NEW' AND oecc.is_adult = 1 AND oecc.gender_uuid = 2 THEN 1 ELSE 0 END) AS evening_new_adult_female," +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND UPPER(oecc.visit_type_name) = 'NEW' AND oecc.is_adult = 1 AND oecc.gender_uuid = 3 THEN 1 ELSE 0 END) AS evening_new_adult_tg, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND UPPER(oecc.visit_type_name) = 'NEW' AND oecc.is_adult = 1 THEN 1 ELSE 0 END) AS evening_new_adult_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND UPPER(oecc.visit_type_name) = 'NEW' AND oecc.is_adult = 0 AND oecc.gender_uuid = 1 THEN 1 ELSE 0 END) AS evening_new_child_male, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND UPPER(oecc.visit_type_name) = 'NEW' AND oecc.is_adult = 0 AND oecc.gender_uuid = 2 THEN 1 ELSE 0 END) AS evening_new_child_female," +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND UPPER(oecc.visit_type_name) = 'NEW' AND oecc.is_adult = 0 THEN 1 ELSE 0 END) AS evening_new_child_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND UPPER(oecc.visit_type_name) = 'NEW' THEN 1 ELSE 0 END) AS evening_new_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND UPPER(oecc.visit_type_name) = 'NEW' AND oecc.is_adult = 1 AND oecc.gender_uuid = 1 THEN 1 ELSE 0 END) AS casualty_new_adult_male, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND UPPER(oecc.visit_type_name) = 'NEW' AND oecc.is_adult = 1 AND oecc.gender_uuid = 2 THEN 1 ELSE 0 END) AS casualty_new_adult_female," +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND UPPER(oecc.visit_type_name) = 'NEW' AND oecc.is_adult = 1 AND oecc.gender_uuid = 3 THEN 1 ELSE 0 END) AS casualty_new_adult_tg, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND UPPER(oecc.visit_type_name) = 'NEW' AND oecc.is_adult = 1 THEN 1 ELSE 0 END) AS casualty_new_adult_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND UPPER(oecc.visit_type_name) = 'NEW' AND oecc.is_adult = 0 AND oecc.gender_uuid = 1 THEN 1 ELSE 0 END) AS casualty_new_child_male, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND UPPER(oecc.visit_type_name) = 'NEW' AND oecc.is_adult = 0 AND oecc.gender_uuid = 2 THEN 1 ELSE 0 END) AS casualty_new_child_female," +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND UPPER(oecc.visit_type_name) = 'NEW' AND oecc.is_adult = 0 THEN 1 ELSE 0 END) AS casualty_new_child_total," +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND UPPER(oecc.visit_type_name) = 'NEW' THEN 1 ELSE 0 END) AS casualty_new_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND UPPER(oecc.visit_type_name) = 'OLD' AND oecc.is_adult = 1 AND oecc.gender_uuid = 1 THEN 1 ELSE 0 END) AS morning_old_adult_male," +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND UPPER(oecc.visit_type_name) = 'OLD' AND oecc.is_adult = 1 AND oecc.gender_uuid = 2 THEN 1 ELSE 0 END) AS morning_old_adult_female," +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND UPPER(oecc.visit_type_name) = 'OLD' AND oecc.is_adult = 1 AND oecc.gender_uuid = 3 THEN 1 ELSE 0 END) AS morning_old_adult_tg, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND UPPER(oecc.visit_type_name) = 'OLD' AND oecc.is_adult = 1 THEN 1 ELSE 0 END) AS morning_old_adult_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND UPPER(oecc.visit_type_name) = 'OLD' AND oecc.is_adult = 0 AND oecc.gender_uuid = 1 THEN 1 ELSE 0 END) AS morning_old_child_male, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND UPPER(oecc.visit_type_name) = 'OLD' AND oecc.is_adult = 0 AND oecc.gender_uuid = 2 THEN 1 ELSE 0 END) AS morning_old_child_female, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND UPPER(oecc.visit_type_name) = 'OLD' AND oecc.is_adult = 0 THEN 1 ELSE 0 END) AS morning_old_child_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND UPPER(oecc.visit_type_name) = 'OLD' THEN 1 ELSE 0 END) AS morning_old_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND UPPER(oecc.visit_type_name) = 'OLD' AND oecc.is_adult = 1 AND oecc.gender_uuid = 1 THEN 1 ELSE 0 END) AS evening_old_adult_male, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND UPPER(oecc.visit_type_name) = 'OLD' AND oecc.is_adult = 1 AND oecc.gender_uuid = 2 THEN 1 ELSE 0 END) AS evening_old_adult_female," +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND UPPER(oecc.visit_type_name) = 'OLD' AND oecc.is_adult = 1 AND oecc.gender_uuid = 3 THEN 1 ELSE 0 END) AS evening_old_adult_tg, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND UPPER(oecc.visit_type_name) = 'OLD' AND oecc.is_adult = 1 THEN 1 ELSE 0 END) AS evening_old_adult_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND UPPER(oecc.visit_type_name) = 'OLD' AND oecc.is_adult = 0 AND oecc.gender_uuid = 1 THEN 1 ELSE 0 END) AS evening_old_child_male, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND UPPER(oecc.visit_type_name) = 'OLD' AND oecc.is_adult = 0 AND oecc.gender_uuid = 2 THEN 1 ELSE 0 END) AS evening_old_child_female, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND UPPER(oecc.visit_type_name) = 'OLD' AND oecc.is_adult = 0 THEN 1 ELSE 0 END) AS evening_old_child_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND UPPER(oecc.visit_type_name) = 'OLD' THEN 1 ELSE 0 END) AS evening_old_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND UPPER(oecc.visit_type_name) = 'OLD' AND oecc.is_adult = 1 AND oecc.gender_uuid = 1 THEN 1 ELSE 0 END) AS casualty_old_adult_male, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND UPPER(oecc.visit_type_name) = 'OLD' AND oecc.is_adult = 1 AND oecc.gender_uuid = 2 THEN 1 ELSE 0 END) AS casualty_old_adult_female," +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND UPPER(oecc.visit_type_name) = 'OLD' AND oecc.is_adult = 1 AND oecc.gender_uuid = 3 THEN 1 ELSE 0 END) AS casualty_old_adult_tg, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND UPPER(oecc.visit_type_name) = 'OLD' AND oecc.is_adult = 1 THEN 1 ELSE 0 END) AS casualty_old_adult_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND UPPER(oecc.visit_type_name) = 'OLD' AND oecc.is_adult = 0 AND oecc.gender_uuid = 1 THEN 1 ELSE 0 END) AS casualty_old_child_male, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND UPPER(oecc.visit_type_name) = 'OLD' AND oecc.is_adult = 0 AND oecc.gender_uuid = 2 THEN 1 ELSE 0 END) AS casualty_old_child_female," +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND UPPER(oecc.visit_type_name) = 'OLD' AND oecc.is_adult = 0 THEN 1 ELSE 0 END) AS casualty_old_child_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND UPPER(oecc.visit_type_name) = 'OLD' THEN 1 ELSE 0 END) AS casualty_old_total" +
    " FROM op_emr_census_count AS oecc " +
    " WHERE DATE(oecc.registration_date) BETWEEN '" + fromDate + "' AND '" + toDate + "' ";

  /**
   * The below conditions are used validate the null values
   */
  if (facilityUuid !== null && facilityUuid > 0)
    item_details_query = item_details_query +
      " AND oecc.facility_uuid = " + facilityUuid;
  //item_details_query = item_details_query + " GROUP BY oecc.encounter_department_uuid";

  const item_details = await db.sequelize.query(item_details_query, {
    type: Sequelize.QueryTypes.SELECT
  });
  return item_details;
}

//H30-47544-Saju-OP Back entry	OP Back entry> Registration date and time mismaches with the day wise patient report
async function getDayWisePatientDetails(fromDate, toDate, department_Id, institutioncategory_Id, institution_Id, institutiontype_Id) {
  /**
   * The below query is used to fetch the day wise patient details
   */
  let item_details_query = "SELECT oecc.facility_name,oecc.facility_type_name,oecc.registration_date,oecc.patient_pin_no,oecc.patient_name,oecc.age," +
    " oecc.period_uuid,oecc.gender_uuid,oecc.visit_type_name,oecc.registered_session_name,oecc.encounter_session_name,oecc.department_name,oecc.mobile " +
    " FROM op_emr_census_count oecc " +
    " WHERE oecc.is_active = 1 ";
  if (department_Id && department_Id.length > 0)
    item_details_query = item_details_query + " AND oecc.department_uuid IN(" + department_Id + ")";
  if (institutioncategory_Id && institutioncategory_Id.length > 0)
    item_details_query = item_details_query + " AND oecc.facility_category_uuid IN (" + institutioncategory_Id + ")";
  if (institution_Id && institution_Id.length > 0)
    item_details_query = item_details_query + " AND oecc.facility_uuid IN (" + institution_Id + ")";
  if (institutiontype_Id && institutiontype_Id.length > 0)
    item_details_query = item_details_query + " AND oecc.facility_type_uuid IN (" + institutiontype_Id + ")";
  if (fromDate && toDate)
    item_details_query = item_details_query + "AND DATE(oecc.registration_date) BETWEEN '" + fromDate + "' AND '" + toDate + "'";

  const item_details = await db.sequelize.query(item_details_query, {
    type: Sequelize.QueryTypes.SELECT
  });
  return item_details;
}

async function getDayWisePatientCountDetails(fromDate, toDate, department_Id, institutioncategory_Id, institution_Id) {
  /**
   * The below query is used to fetch the day wise patient details
   */
  let item_details_query = " SELECT SUM(CASE WHEN oecc.is_adult = 1 THEN 1 ELSE 0 END) AS total_adult, " +
    " SUM(CASE WHEN oecc.is_adult = 0 THEN 1 ELSE 0 END) AS total_child," +
    " SUM(CASE WHEN oecc.is_adult = 1 AND oecc.encounter_visit_type_uuid = 1 THEN 1 ELSE 0 END) AS total_new_adult, " +
    " SUM(CASE WHEN oecc.is_adult = 0 AND oecc.encounter_visit_type_uuid = 1 THEN 1 ELSE 0 END) AS total_new_child," +
    " SUM(CASE WHEN oecc.is_adult = 1 AND oecc.encounter_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS total_old_adult, " +
    " SUM(CASE WHEN oecc.is_adult = 0 AND oecc.encounter_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS total_old_child," +
    " SUM(CASE WHEN oecc.is_adult = 1 AND oecc.gender_uuid = 1 THEN 1 ELSE 0 END) AS adult_total_male,  " +
    " SUM(CASE WHEN oecc.is_adult = 1 AND oecc.gender_uuid = 2 THEN 1 ELSE 0 END) AS adult_total_female,  " +
    " SUM(CASE WHEN oecc.is_adult = 1 AND oecc.gender_uuid = 3 THEN 1 ELSE 0 END) AS adult_total_tg, " +
    " SUM(CASE WHEN oecc.is_adult = 0 AND oecc.gender_uuid = 1 THEN 1 ELSE 0 END) AS child_total_male,  " +
    " SUM(CASE WHEN oecc.is_adult = 0 AND oecc.gender_uuid = 2 THEN 1 ELSE 0 END) AS child_total_female" +
    " FROM op_emr_census_count oecc " +
    " WHERE oecc.is_active = 1 ";
  if (department_Id && department_Id.length > 0)
    item_details_query = item_details_query + " AND oecc.department_uuid IN(" + department_Id + ")";
  if (institutioncategory_Id && institutioncategory_Id.length > 0)
    item_details_query = item_details_query + " AND oecc.facility_category_uuid IN (" + institutioncategory_Id + ")";
  if (institution_Id && institution_Id.length > 0)
    item_details_query = item_details_query + " AND oecc.facility_uuid IN (" + institution_Id + ")";
  if (fromDate && toDate)
    item_details_query = item_details_query + "AND DATE(oecc.registration_date) BETWEEN '" + fromDate + "' AND '" + toDate + "'";

  const item_details = await db.sequelize.query(item_details_query, {
    type: Sequelize.QueryTypes.SELECT
  });
  return item_details;
}
//H30-47544-Saju-OP Back entry	OP Back entry> Registration date and time mismaches with the day wise patient report