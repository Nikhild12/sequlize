const db = require("../config/sequelize");
const Sequelize = db.Sequelize;
const Op = Sequelize.Op; /**H30-49798-OP - EMR Patient Search Response should come with Prescribed Flag - Elumalai Govindan */
const rp = require('request-promise');

// Config Import
const config = require("../config/config");

const opEmrCensus_tbl = db.op_emr_census_count;


const patientOPEmrCensusController = () => {
  /* saving op emr census count */
  const addOPEMRCensusCount = async (req, res) => {
    let checkVisitType = [];
    try {

      let bodyPostData = {};
      let opEmrCensusRes = {}
      if (req.body) {
        /**
         * Bind the field values
         */
        //H30-48737-Saju-Add new logic for new or old visit type in add op emr census count api
        bodyPostData = { ...req.body };
        checkVisitType = await checkNewOrOld(bodyPostData.patient_uuid, bodyPostData.department_uuid, bodyPostData.facility_uuid);
        //H30-48736-Saju-Issue fix
        if (checkVisitType && checkVisitType.length == 0) {
          bodyPostData["visit_type_name"] = 'New';
          bodyPostData["encounter_visit_type_uuid"] = 1;
          bodyPostData["modified_by"] = bodyPostData.created_by;
          /**
           * Insert the value into op emr census count table
           */
          opEmrCensusRes = await opEmrCensus_tbl.create(bodyPostData, {
            returning: true
          });
        }
      }
      return res.send({
        statusCode: 200,
        responseContent: checkVisitType && checkVisitType.length > 0 ? 'Patient already exsit' : opEmrCensusRes
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

      let Authorization;
      Authorization = req.headers.Authorization ? req.headers.Authorization : req.headers.authorization
      /**
       * Get department wise count
       */
      const departmentCountDetails = await getDepartmentWiseCountDetails(fromDate, toDate, facilityUuid, departmentUuid);

      return res.send({
        statusCode: 200,
        responseContent: departmentCountDetails
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

  //H30-49098-Saju-Create new api for get patient total registration count
  const getTotalRegCount = async (req, res) => {
    //H30-50188-Saju-Add date filter and fetch speciality op and clinical op count's
    const { fromdate, todate } = req.headers;
    try {
      const _query = "SELECT COUNT(oecc.uuid) AS reg_tot_count," +
        " COUNT(CASE WHEN registered_session_uuid = 4 AND DATE(oecc.encounter_date) !='0000-00-00' THEN oecc.uuid END ) AS reg_tot_speciality_op," +
        " COUNT(CASE WHEN registered_session_uuid != 4 AND DATE(oecc.encounter_date) !='0000-00-00' THEN oecc.uuid END ) AS reg_tot_clinic_op " +
        " FROM op_emr_census_count AS oecc " +
        " WHERE  oecc.encounter_type_uuid != 2 AND (DATE(oecc.encounter_date) BETWEEN '" + fromdate + "' AND '" + todate + "' " +
        " OR ((DATE(oecc.registration_date) BETWEEN '" + fromdate + "' AND '" + todate + "') AND DATE(oecc.encounter_date) ='0000-00-00'))"; //H30-50096-Saju- fetch data based on encounter date and registered date

      const regCount = await db.sequelize.query(_query, {
        type: Sequelize.QueryTypes.SELECT
      });

      return res.send({
        statusCode: 200,
        responseContent: regCount ? regCount[0] : 0
      });
    }
    catch (err) {
      return res.json({
        statusCode: 500,
        message: err.message,
      });
    }
  };
  //H30-49098-Saju-Create new api for get patient total registration count

  /**H30-49778-Update OP EMR Census Count During Prescribing Doctor - Elumalai Govindan - End */
  const updateOPEMRCensusCount = async (req, res) => {
    try {
      const { encounter_uuid, patient_uuid } = req.body;
      if (encounter_uuid && patient_uuid) {
        const data = await opEmrCensus_tbl.update({
          is_prescribed
            : 1
        }, {
          where: {
            encounter_uuid: encounter_uuid,
            patient_uuid: patient_uuid
          }
        })
        return res.send({
          statusCode: 200,
          message: 'Updated OP EMR Census Count',
          responseContent: data
        });
      } else {
        return res.send({
          statusCode: 200,
          message: 'Not Updated. Kindly provide encounter and patient Id',
          responseContent: []
        });
      }
    } catch (err) {
      return res.json({
        statusCode: 500,
        message: err.message,
        actualMsg: err
      });
    }
  }

  /**H30-49778-Update OP EMR Census Count During Prescribing Doctor - Elumalai Govindan - End */

  /**H30-49798-OP - EMR Patient Search Response should come with Prescribed Flag - Elumalai Govindan - Start*/
  /**
   * 
   * @param {*} req 
   * @param {*} res 
   * @returns Based on the input we are getting cencus details
   * based on the encounter and patient Id's
   */
  const getOPCensusDetails = async (req, res) => {
    try {
      const { encounter_uuids, patient_uuids } = req.body;
      if (encounter_uuids && patient_uuids) {
        const data = await opEmrCensus_tbl.findAll({
          attributes: ['encounter_uuid', 'patient_uuid', 'is_prescribed'],
          where: {
            encounter_uuid: { [Op.in]: encounter_uuids },
            patient_uuid: { [Op.in]: patient_uuids }
          }
        })
        return res.send({
          statusCode: 200,
          message: 'Rerived census details',
          responseContents: data
        });
      } else {
        return res.send({
          statusCode: 200,
          message: 'Not Retrived. Kindly provide encounter and patient Id',
          responseContents: []
        });
      }
    } catch (err) {
      return res.json({
        statusCode: 500,
        message: err.message,
        actualMsg: err
      });
    }
  }
  /**H30-49798-OP - EMR Patient Search Response should come with Prescribed Flag - Elumalai Govindan - End*/

  // H30-50195 - EMR - getSessionreport getSessionWisePatCount need to update API -- jevin -- Start 
    const getSessionWisePatCountDetails = async (req, res) => {
      try {
        const {
          startdate,
          enddate,
          institution_Id,
          is_adult,
          institutioncategory_Id,
          institutiontype_Id,
          department_Id,
          session_Id
        } = req.body;
  
        let Authorization;
        Authorization = req.headers.Authorization ? req.headers.Authorization : req.headers.authorization
        const sessionCountDetails = await getSessionWiseCountDetailsQuery(startdate, enddate, institution_Id,institutioncategory_Id,is_adult,institutiontype_Id,department_Id,session_Id);
  
        let finalData = [];
        finalData.push(sessionCountDetails);
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
    // H30-50195 - EMR - getSessionreport getSessionWisePatCount need to update API -- jevin -- End


  // --------------------------------------------return----------------------------------
  return {
    addOPEMRCensusCount,
    getDepartmentWisePatCount,
    getSessionWisePatCount,
    getDayWisePatientList,
    getDayWisePatientCount,
    getTotalRegCount,
    updateOPEMRCensusCount, /**H30-49778-Update OP EMR Census Count During Prescribing Doctor - Elumalai Govindan */
    getOPCensusDetails, /**H30-49798-OP - EMR Patient Search Response should come with Prescribed Flag - Elumalai Govindan*/
    getSessionWisePatCountDetails
  };
};

module.exports = patientOPEmrCensusController();

async function getDepartmentWiseCountDetails(fromDate, toDate, facilityUuid, departmentUuid) {
  /**
   * The below query is used to fetch the department wise patient count details
   */
  //H30-48566-Saju-Get Department Wise Count Details api issue fix
  let item_details_query = "SELECT SUM(CASE WHEN oecc.is_adult = 1 AND oecc.gender_uuid = 1 AND oecc.encounter_visit_type_uuid != 2 THEN 1 ELSE 0 END) AS new_adult_male," +
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
    " oecc.department_uuid AS departmentId,oecc.department_name AS department_name " +
    " FROM op_emr_census_count AS oecc " +
    " WHERE oecc.encounter_type_uuid != 2 ";

  /**
   * The below conditions are used validate the null values
   */
  if (fromDate && toDate)
    // item_details_query = item_details_query + " AND DATE(oecc.registration_date) BETWEEN '" + fromDate + "' AND '" + toDate + "'";
    item_details_query = item_details_query + " AND DATE(oecc.encounter_date) BETWEEN '" + fromDate + "' AND '" + toDate + "'"; //H30-49952-Saju-Change the filter condition registered date into encountered date
  if (facilityUuid !== null && facilityUuid > 0)
    item_details_query = item_details_query +
      " AND oecc.facility_uuid = " + facilityUuid;
  if (departmentUuid !== null && departmentUuid > 0)
    item_details_query = item_details_query +
      " AND oecc.department_uuid = " + departmentUuid;
  item_details_query = item_details_query + " GROUP BY oecc.department_name";

  const item_details = await db.sequelize.query(item_details_query, {
    type: Sequelize.QueryTypes.SELECT
  });
  return item_details;
}

async function getSessionWiseCountDetails(fromDate, toDate, facilityUuid) {
  /**
   * The below query is used to fetch the department wise patient count details
   */
  //H30-48484-Saju-OP census report issue fixing
  let item_details_query = "SELECT" +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND oecc.encounter_visit_type_uuid != 2 AND oecc.is_adult = 1 AND oecc.gender_uuid = 1 THEN 1 ELSE 0 END) AS morning_new_adult_male," +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND oecc.encounter_visit_type_uuid != 2 AND oecc.is_adult = 1 AND oecc.gender_uuid = 2 THEN 1 ELSE 0 END) AS morning_new_adult_female, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND oecc.encounter_visit_type_uuid != 2 AND oecc.is_adult = 1 AND oecc.gender_uuid = 3 THEN 1 ELSE 0 END) AS morning_new_adult_tg, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND oecc.encounter_visit_type_uuid != 2 AND oecc.is_adult = 1 THEN 1 ELSE 0 END) AS morning_new_adult_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND oecc.encounter_visit_type_uuid != 2 AND oecc.is_adult = 0 AND oecc.gender_uuid = 1 THEN 1 ELSE 0 END) AS morning_new_child_male, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND oecc.encounter_visit_type_uuid != 2 AND oecc.is_adult = 0 AND oecc.gender_uuid = 2 THEN 1 ELSE 0 END) AS morning_new_child_female, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND oecc.encounter_visit_type_uuid != 2 AND oecc.is_adult = 0 THEN 1 ELSE 0 END)AS morning_new_child_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND oecc.encounter_visit_type_uuid != 2 THEN 1 ELSE 0 END) AS morning_new_total,   " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND oecc.encounter_visit_type_uuid != 2 AND oecc.is_adult = 1 AND oecc.gender_uuid = 1 THEN 1 ELSE 0 END) AS evening_new_adult_male," +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND oecc.encounter_visit_type_uuid != 2 AND oecc.is_adult = 1 AND oecc.gender_uuid = 2 THEN 1 ELSE 0 END) AS evening_new_adult_female," +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND oecc.encounter_visit_type_uuid != 2 AND oecc.is_adult = 1 AND oecc.gender_uuid = 3 THEN 1 ELSE 0 END) AS evening_new_adult_tg, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND oecc.encounter_visit_type_uuid != 2 AND oecc.is_adult = 1 THEN 1 ELSE 0 END) AS evening_new_adult_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND oecc.encounter_visit_type_uuid != 2 AND oecc.is_adult = 0 AND oecc.gender_uuid = 1 THEN 1 ELSE 0 END) AS evening_new_child_male, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND oecc.encounter_visit_type_uuid != 2 AND oecc.is_adult = 0 AND oecc.gender_uuid = 2 THEN 1 ELSE 0 END) AS evening_new_child_female," +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND oecc.encounter_visit_type_uuid != 2 AND oecc.is_adult = 0 THEN 1 ELSE 0 END) AS evening_new_child_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND oecc.encounter_visit_type_uuid != 2 THEN 1 ELSE 0 END) AS evening_new_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND oecc.encounter_visit_type_uuid != 2 AND oecc.is_adult = 1 AND oecc.gender_uuid = 1 THEN 1 ELSE 0 END) AS casualty_new_adult_male, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND oecc.encounter_visit_type_uuid != 2 AND oecc.is_adult = 1 AND oecc.gender_uuid = 2 THEN 1 ELSE 0 END) AS casualty_new_adult_female," +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND oecc.encounter_visit_type_uuid != 2 AND oecc.is_adult = 1 AND oecc.gender_uuid = 3 THEN 1 ELSE 0 END) AS casualty_new_adult_tg, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND oecc.encounter_visit_type_uuid != 2 AND oecc.is_adult = 1 THEN 1 ELSE 0 END) AS casualty_new_adult_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND oecc.encounter_visit_type_uuid != 2 AND oecc.is_adult = 0 AND oecc.gender_uuid = 1 THEN 1 ELSE 0 END) AS casualty_new_child_male, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND oecc.encounter_visit_type_uuid != 2 AND oecc.is_adult = 0 AND oecc.gender_uuid = 2 THEN 1 ELSE 0 END) AS casualty_new_child_female," +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND oecc.encounter_visit_type_uuid != 2 AND oecc.is_adult = 0 THEN 1 ELSE 0 END) AS casualty_new_child_total," +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND oecc.encounter_visit_type_uuid != 2 THEN 1 ELSE 0 END) AS casualty_new_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND oecc.encounter_visit_type_uuid = 2 AND oecc.is_adult = 1 AND oecc.gender_uuid = 1 THEN 1 ELSE 0 END) AS morning_old_adult_male," +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND oecc.encounter_visit_type_uuid = 2 AND oecc.is_adult = 1 AND oecc.gender_uuid = 2 THEN 1 ELSE 0 END) AS morning_old_adult_female," +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND oecc.encounter_visit_type_uuid = 2 AND oecc.is_adult = 1 AND oecc.gender_uuid = 3 THEN 1 ELSE 0 END) AS morning_old_adult_tg, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND oecc.encounter_visit_type_uuid = 2 AND oecc.is_adult = 1 THEN 1 ELSE 0 END) AS morning_old_adult_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND oecc.encounter_visit_type_uuid = 2 AND oecc.is_adult = 0 AND oecc.gender_uuid = 1 THEN 1 ELSE 0 END) AS morning_old_child_male, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND oecc.encounter_visit_type_uuid = 2 AND oecc.is_adult = 0 AND oecc.gender_uuid = 2 THEN 1 ELSE 0 END) AS morning_old_child_female, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND oecc.encounter_visit_type_uuid = 2 AND oecc.is_adult = 0 THEN 1 ELSE 0 END) AS morning_old_child_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND oecc.encounter_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS morning_old_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND oecc.encounter_visit_type_uuid = 2 AND oecc.is_adult = 1 AND oecc.gender_uuid = 1 THEN 1 ELSE 0 END) AS evening_old_adult_male, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND oecc.encounter_visit_type_uuid = 2 AND oecc.is_adult = 1 AND oecc.gender_uuid = 2 THEN 1 ELSE 0 END) AS evening_old_adult_female," +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND oecc.encounter_visit_type_uuid = 2 AND oecc.is_adult = 1 AND oecc.gender_uuid = 3 THEN 1 ELSE 0 END) AS evening_old_adult_tg, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND oecc.encounter_visit_type_uuid = 2 AND oecc.is_adult = 1 THEN 1 ELSE 0 END) AS evening_old_adult_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND oecc.encounter_visit_type_uuid = 2 AND oecc.is_adult = 0 AND oecc.gender_uuid = 1 THEN 1 ELSE 0 END) AS evening_old_child_male, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND oecc.encounter_visit_type_uuid = 2 AND oecc.is_adult = 0 AND oecc.gender_uuid = 2 THEN 1 ELSE 0 END) AS evening_old_child_female, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND oecc.encounter_visit_type_uuid = 2 AND oecc.is_adult = 0 THEN 1 ELSE 0 END) AS evening_old_child_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND oecc.encounter_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS evening_old_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND oecc.encounter_visit_type_uuid = 2 AND oecc.is_adult = 1 AND oecc.gender_uuid = 1 THEN 1 ELSE 0 END) AS casualty_old_adult_male, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND oecc.encounter_visit_type_uuid = 2 AND oecc.is_adult = 1 AND oecc.gender_uuid = 2 THEN 1 ELSE 0 END) AS casualty_old_adult_female," +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND oecc.encounter_visit_type_uuid = 2 AND oecc.is_adult = 1 AND oecc.gender_uuid = 3 THEN 1 ELSE 0 END) AS casualty_old_adult_tg, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND oecc.encounter_visit_type_uuid = 2 AND oecc.is_adult = 1 THEN 1 ELSE 0 END) AS casualty_old_adult_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND oecc.encounter_visit_type_uuid = 2 AND oecc.is_adult = 0 AND oecc.gender_uuid = 1 THEN 1 ELSE 0 END) AS casualty_old_child_male, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND oecc.encounter_visit_type_uuid = 2 AND oecc.is_adult = 0 AND oecc.gender_uuid = 2 THEN 1 ELSE 0 END) AS casualty_old_child_female," +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND oecc.encounter_visit_type_uuid = 2 AND oecc.is_adult = 0 THEN 1 ELSE 0 END) AS casualty_old_child_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND oecc.encounter_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS casualty_old_total" +
    " FROM op_emr_census_count AS oecc " +
    " WHERE  oecc.encounter_type_uuid != 2 AND (DATE(oecc.encounter_date) BETWEEN '" + fromDate + "' AND '" + toDate + "' " +
    " OR ((DATE(oecc.registration_date) BETWEEN '" + fromDate + "' AND '" + toDate + "') AND DATE(oecc.encounter_date) ='0000-00-00'))"; //H30-50096-Saju- fetch data based on encounter date and registered date

  /**
   * The below conditions are used validate the null values
   */
  if (facilityUuid !== null && facilityUuid > 0)
    item_details_query = item_details_query +
      " AND oecc.facility_uuid = " + facilityUuid;
  //item_details_query = item_details_query + " GROUP BY oecc.encounter_department_uuid";
  console.log(item_details_query)
  const item_details = await db.sequelize.query(item_details_query, {
    type: Sequelize.QueryTypes.SELECT
  });
  return item_details;
}

// H30-50195 - EMR - getSessionreport getSessionWisePatCount need to update API -- jevin -- Start 
async function getSessionWiseCountDetailsQuery(fromDate, toDate, facilityUuid,institutioncategory_Id,is_adultIds,institutiontype_Id,department_Id,session_Id) {
  /**
   * The below query is used to fetch the department wise patient count details
   */
  //H30-48484-Saju-OP census report issue fixing
  let item_details_query = "SELECT" +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND oecc.encounter_visit_type_uuid != 2 AND oecc.is_adult = 1 AND oecc.gender_uuid = 1 THEN 1 ELSE 0 END) AS morning_new_adult_male," +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND oecc.encounter_visit_type_uuid != 2 AND oecc.is_adult = 1 AND oecc.gender_uuid = 2 THEN 1 ELSE 0 END) AS morning_new_adult_female, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND oecc.encounter_visit_type_uuid != 2 AND oecc.is_adult = 1 AND oecc.gender_uuid = 3 THEN 1 ELSE 0 END) AS morning_new_adult_tg, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND oecc.encounter_visit_type_uuid != 2 AND oecc.is_adult = 1 THEN 1 ELSE 0 END) AS morning_new_adult_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND oecc.encounter_visit_type_uuid != 2 AND oecc.is_adult = 0 AND oecc.gender_uuid = 1 THEN 1 ELSE 0 END) AS morning_new_child_male, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND oecc.encounter_visit_type_uuid != 2 AND oecc.is_adult = 0 AND oecc.gender_uuid = 2 THEN 1 ELSE 0 END) AS morning_new_child_female, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND oecc.encounter_visit_type_uuid != 2 AND oecc.is_adult = 0 THEN 1 ELSE 0 END)AS morning_new_child_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND oecc.encounter_visit_type_uuid != 2 THEN 1 ELSE 0 END) AS morning_new_total,   " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND oecc.encounter_visit_type_uuid != 2 AND oecc.is_adult = 1 AND oecc.gender_uuid = 1 THEN 1 ELSE 0 END) AS evening_new_adult_male," +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND oecc.encounter_visit_type_uuid != 2 AND oecc.is_adult = 1 AND oecc.gender_uuid = 2 THEN 1 ELSE 0 END) AS evening_new_adult_female," +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND oecc.encounter_visit_type_uuid != 2 AND oecc.is_adult = 1 AND oecc.gender_uuid = 3 THEN 1 ELSE 0 END) AS evening_new_adult_tg, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND oecc.encounter_visit_type_uuid != 2 AND oecc.is_adult = 1 THEN 1 ELSE 0 END) AS evening_new_adult_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND oecc.encounter_visit_type_uuid != 2 AND oecc.is_adult = 0 AND oecc.gender_uuid = 1 THEN 1 ELSE 0 END) AS evening_new_child_male, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND oecc.encounter_visit_type_uuid != 2 AND oecc.is_adult = 0 AND oecc.gender_uuid = 2 THEN 1 ELSE 0 END) AS evening_new_child_female," +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND oecc.encounter_visit_type_uuid != 2 AND oecc.is_adult = 0 THEN 1 ELSE 0 END) AS evening_new_child_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND oecc.encounter_visit_type_uuid != 2 THEN 1 ELSE 0 END) AS evening_new_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND oecc.encounter_visit_type_uuid != 2 AND oecc.is_adult = 1 AND oecc.gender_uuid = 1 THEN 1 ELSE 0 END) AS casualty_new_adult_male, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND oecc.encounter_visit_type_uuid != 2 AND oecc.is_adult = 1 AND oecc.gender_uuid = 2 THEN 1 ELSE 0 END) AS casualty_new_adult_female," +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND oecc.encounter_visit_type_uuid != 2 AND oecc.is_adult = 1 AND oecc.gender_uuid = 3 THEN 1 ELSE 0 END) AS casualty_new_adult_tg, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND oecc.encounter_visit_type_uuid != 2 AND oecc.is_adult = 1 THEN 1 ELSE 0 END) AS casualty_new_adult_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND oecc.encounter_visit_type_uuid != 2 AND oecc.is_adult = 0 AND oecc.gender_uuid = 1 THEN 1 ELSE 0 END) AS casualty_new_child_male, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND oecc.encounter_visit_type_uuid != 2 AND oecc.is_adult = 0 AND oecc.gender_uuid = 2 THEN 1 ELSE 0 END) AS casualty_new_child_female," +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND oecc.encounter_visit_type_uuid != 2 AND oecc.is_adult = 0 THEN 1 ELSE 0 END) AS casualty_new_child_total," +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND oecc.encounter_visit_type_uuid != 2 THEN 1 ELSE 0 END) AS casualty_new_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND oecc.encounter_visit_type_uuid = 2 AND oecc.is_adult = 1 AND oecc.gender_uuid = 1 THEN 1 ELSE 0 END) AS morning_old_adult_male," +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND oecc.encounter_visit_type_uuid = 2 AND oecc.is_adult = 1 AND oecc.gender_uuid = 2 THEN 1 ELSE 0 END) AS morning_old_adult_female," +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND oecc.encounter_visit_type_uuid = 2 AND oecc.is_adult = 1 AND oecc.gender_uuid = 3 THEN 1 ELSE 0 END) AS morning_old_adult_tg, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND oecc.encounter_visit_type_uuid = 2 AND oecc.is_adult = 1 THEN 1 ELSE 0 END) AS morning_old_adult_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND oecc.encounter_visit_type_uuid = 2 AND oecc.is_adult = 0 AND oecc.gender_uuid = 1 THEN 1 ELSE 0 END) AS morning_old_child_male, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND oecc.encounter_visit_type_uuid = 2 AND oecc.is_adult = 0 AND oecc.gender_uuid = 2 THEN 1 ELSE 0 END) AS morning_old_child_female, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND oecc.encounter_visit_type_uuid = 2 AND oecc.is_adult = 0 THEN 1 ELSE 0 END) AS morning_old_child_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 1 AND oecc.encounter_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS morning_old_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND oecc.encounter_visit_type_uuid = 2 AND oecc.is_adult = 1 AND oecc.gender_uuid = 1 THEN 1 ELSE 0 END) AS evening_old_adult_male, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND oecc.encounter_visit_type_uuid = 2 AND oecc.is_adult = 1 AND oecc.gender_uuid = 2 THEN 1 ELSE 0 END) AS evening_old_adult_female," +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND oecc.encounter_visit_type_uuid = 2 AND oecc.is_adult = 1 AND oecc.gender_uuid = 3 THEN 1 ELSE 0 END) AS evening_old_adult_tg, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND oecc.encounter_visit_type_uuid = 2 AND oecc.is_adult = 1 THEN 1 ELSE 0 END) AS evening_old_adult_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND oecc.encounter_visit_type_uuid = 2 AND oecc.is_adult = 0 AND oecc.gender_uuid = 1 THEN 1 ELSE 0 END) AS evening_old_child_male, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND oecc.encounter_visit_type_uuid = 2 AND oecc.is_adult = 0 AND oecc.gender_uuid = 2 THEN 1 ELSE 0 END) AS evening_old_child_female, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND oecc.encounter_visit_type_uuid = 2 AND oecc.is_adult = 0 THEN 1 ELSE 0 END) AS evening_old_child_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 2 AND oecc.encounter_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS evening_old_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND oecc.encounter_visit_type_uuid = 2 AND oecc.is_adult = 1 AND oecc.gender_uuid = 1 THEN 1 ELSE 0 END) AS casualty_old_adult_male, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND oecc.encounter_visit_type_uuid = 2 AND oecc.is_adult = 1 AND oecc.gender_uuid = 2 THEN 1 ELSE 0 END) AS casualty_old_adult_female," +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND oecc.encounter_visit_type_uuid = 2 AND oecc.is_adult = 1 AND oecc.gender_uuid = 3 THEN 1 ELSE 0 END) AS casualty_old_adult_tg, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND oecc.encounter_visit_type_uuid = 2 AND oecc.is_adult = 1 THEN 1 ELSE 0 END) AS casualty_old_adult_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND oecc.encounter_visit_type_uuid = 2 AND oecc.is_adult = 0 AND oecc.gender_uuid = 1 THEN 1 ELSE 0 END) AS casualty_old_child_male, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND oecc.encounter_visit_type_uuid = 2 AND oecc.is_adult = 0 AND oecc.gender_uuid = 2 THEN 1 ELSE 0 END) AS casualty_old_child_female," +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND oecc.encounter_visit_type_uuid = 2 AND oecc.is_adult = 0 THEN 1 ELSE 0 END) AS casualty_old_child_total, " +
    " SUM(CASE WHEN oecc.encounter_session_uuid = 3 AND oecc.encounter_visit_type_uuid = 2 THEN 1 ELSE 0 END) AS casualty_old_total" +
    " FROM op_emr_census_count AS oecc " +
    " WHERE  oecc.encounter_type_uuid != 2 AND (DATE(oecc.encounter_date) BETWEEN '" + fromDate + "' AND '" + toDate + "' " +
    " OR ((DATE(oecc.registration_date) BETWEEN '" + fromDate + "' AND '" + toDate + "') AND DATE(oecc.encounter_date) ='0000-00-00'))"; //H30-50096-Saju- fetch data based on encounter date and registered date

  /**
   * The below conditions are used validate the null values
   */
  if (facilityUuid && facilityUuid.length > 0){
    item_details_query = item_details_query +
      " AND oecc.facility_uuid in (" + facilityUuid.toString() +")";
  }
  if(institutioncategory_Id && institutioncategory_Id.length > 0){
    item_details_query = item_details_query +
    " AND oecc.facility_category_uuid in (" + institutioncategory_Id.toString() +")";
  }
  if(is_adultIds && is_adultIds.length  > 0){
    item_details_query = item_details_query +
    " AND oecc.is_adult in (" + is_adultIds.toString() +")";
  }
  if(institutiontype_Id && institutiontype_Id.length > 0){
    item_details_query = item_details_query +
    " AND oecc.facility_type_uuid in (" + institutiontype_Id.toString() +")";
  }
  if(department_Id && department_Id.length){
    item_details_query = item_details_query +
    " AND oecc.department_uuid in (" + department_Id.toString() +")";
  }
  if(session_Id && session_Id.length > 0){
    item_details_query = item_details_query +
    " AND oecc.registered_session_uuid in (" + session_Id.toString() +")";
  }
  console.log(item_details_query)
  const item_details = await db.sequelize.query(item_details_query, {
    type: Sequelize.QueryTypes.SELECT
  });
  return item_details;
}
// H30-50195 - EMR - getSessionreport getSessionWisePatCount need to update API -- jevin -- End 

//H30-47544-Saju-OP Back entry	OP Back entry> Registration date and time mismaches with the day wise patient report
async function getDayWisePatientDetails(fromDate, toDate, department_Id, institutioncategory_Id, institution_Id, institutiontype_Id) {
  /**
   * The below query is used to fetch the day wise patient details
   */
  //Bhaskar - H30-50069 Day Wise Patient Details added Address and Aadhaar Number//
  let item_details_query = "SELECT oecc.facility_name,oecc.facility_type_name,oecc.registration_date,oecc.patient_pin_no,oecc.patient_name,oecc.age," +
    " oecc.period_uuid,oecc.gender_uuid,oecc.visit_type_name,oecc.registered_session_name,oecc.encounter_session_name,oecc.department_name,oecc.mobile, oecc.address, oecc.aadhaar_number " +
    " FROM op_emr_census_count oecc " +
    " WHERE oecc.is_active = 1 ";
  //Bhaskar - H30-50069 Day Wise Patient Details added Address and Aadhaar Number//
  if (department_Id && department_Id.length > 0)
    item_details_query = item_details_query + " AND oecc.department_uuid IN(" + department_Id + ")";
  if (institutioncategory_Id && institutioncategory_Id.length > 0)
    item_details_query = item_details_query + " AND oecc.facility_category_uuid IN (" + institutioncategory_Id + ")";
  if (institution_Id && institution_Id.length > 0)
    item_details_query = item_details_query + " AND oecc.facility_uuid IN (" + institution_Id + ")";
  if (institutiontype_Id && institutiontype_Id.length > 0)
    item_details_query = item_details_query + " AND oecc.facility_type_uuid IN (" + institutiontype_Id + ")";
  if (fromDate && toDate)
    item_details_query = item_details_query + "AND DATE(oecc.encounter_date) BETWEEN '" + fromDate + "' AND '" + toDate + "'";

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
    " SUM(CASE WHEN oecc.is_adult = 1 AND oecc.encounter_visit_type_uuid != 2 THEN 1 ELSE 0 END) AS total_new_adult, " +
    " SUM(CASE WHEN oecc.is_adult = 0 AND oecc.encounter_visit_type_uuid != 2 THEN 1 ELSE 0 END) AS total_new_child," +
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
    item_details_query = item_details_query + "AND DATE(oecc.encounter_date) BETWEEN '" + fromDate + "' AND '" + toDate + "'";

  const item_details = await db.sequelize.query(item_details_query, {
    type: Sequelize.QueryTypes.SELECT
  });
  return item_details;
}
//H30-47544-Saju-OP Back entry	OP Back entry> Registration date and time mismaches with the day wise patient report

async function checkNewOrOld(patient_uuid, department_uuid, facility_uuid) {

  let _query = "SELECT * FROM op_emr_census_count oecc WHERE oecc.patient_uuid =" + patient_uuid
    + " AND department_uuid = " + department_uuid
    + " AND facility_uuid = " + facility_uuid + " LIMIT 1 ";

  const item_details = await db.sequelize.query(_query, {
    type: Sequelize.QueryTypes.SELECT
  });

  return item_details;
}