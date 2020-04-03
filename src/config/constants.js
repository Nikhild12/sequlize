module.exports = Object.freeze({
  IS_ACTIVE: 1,
  IS_IN_ACTIVE: 0,
  NO: "No",
  OR: "or",
  FOUND: "Found",
  NO_USER_ID: "User Id",
  NO_REQUEST_BODY: "Request Body",
  NO_REQUEST_PARAM: "Request Param",
  DUPLICATE_ENTRIES: "Duplicate Entries",
  DUPLICATE_ENTRIE: "DUPLICATE ENTRIES",
  DUPLICATE_ENCOUNTER: "Already Encounter Exists For the same Patient",
  NO_RECORD_FOUND: "Sorry! No Record Found",
  EMR_FETCHED_SUCCESSFULLY: "Fetched EMR Workflow Successfully",
  DUPLICATE_RECORD: "Duplicate Record",
  DUPLICATE_DISPLAY_ORDER: "Duplicate Display Order",
  GIVEN_USER_UUID: "for the given user_uuid",
  SEND_PROPER_REQUEST: "Send Proper Request Body",
  I_E_NUMBER_ARRAY: "i.e. number array",
  UPDATE_EMR_HIS_SET_SUC: "Updated EMR History Settings Successfully",
  DUPLICATE_ACTIVE_MSG: "Already item is available in the list",
  DUPLICATE_IN_ACTIVE_MSG:
    "This item is Inactive! Please contact administrator",
  TREATMENT_SUCCESS: "Treatment Kit Successfully Inserted",
  FILTERBYTHREE: "filterbythree",
  FETCHD_TREATMENT_KIT_SUCCESSFULLY: "Fetched Treatment Kit Successfully",
  FETCHED_PREVIOUS_KIT_SUCCESSFULLY:
    "Fetched Previous  Treatment Kit Orders Successfully",
  FETCHED_FAVOURITES_SUCCESSFULLY: "Feteched Favourites Successfully",
  NO_RECORD_FOUND: "No Record Found",
  NO_CONTENT_MESSAGE: "No Content Found or record could be deleted",
  MY_PATIENT_LIST: "My Patient List fetched successfully",
  PROFILES_SUCCESS: "Profile Details Successfully Inserted",
  FETCHD_PROFILES_SUCCESSFULLY: " Fetched Profile Details Successfully",
  FETCHD_PROFILES_FAIL: " No Record Found ",
  PROPER_FAV_ID: "Please provide proper favourite Type Id",
  DELETE_SUCCESSFUL: "Deleted Successfully",
  TREATMENT_REQUIRED: "Please send treatment Kit along with One widget details",
  SURGERY_POSITION: "Surgery Position fetched successfully",
  PROCEDURE_FETCHED: "Procedure Successfully Fetched",
  INSERTED_PATIENT_TREATMENT: "Inserted Patient Treatment Successfully",
  UPDATED_ENC_SUCCESS: "Updated Encounter By Id",
  PLEASE_PROVIDE: "Please Provide",
  VALID_START_DATE: "a valid Start Date time",
  VALID_END_DATE: "a valid End Date time",
  START_DATE: "a Start Date time",
  END_DATE: "a End Date time",
  UPDATED_ENC_DOC_TAT_TIME: "Updated Tat End Time Successfully",
  TREATMENT_DELETE_SUCCESS: "Treatment Kit Deleted Successfully",
  ENCOUNTER_CLOSED_SUCCESS: "Encounter Closed Successfully",
  FAVOURITE_DELETED_SUCCESSFULLY: "Favourite Deleted Successfully",
  LATEST_RECORD_FETECHED_SUCCESSFULLY: "Fetched Latest Record Successfully",
  CHIEF_COMPLIANT: "Fetched Chief Compliant Successfully",
  DISEASES_SUCCESS: "Fetched Diseases Successfully",
  TEMPLATE_DELETED: "Template Deleted Successfully",
  PREVIOUS_PAT_CC_SUCCESS:
    "Fetched Previous Patient Chief Complaints Successfully",
  TEMPLATE_FETCH_SUCCESS: "Template Fetched Successfully",

  GetpleaseProvideMsg: function (columnname) {
    let returnProvideMsg = "Please provide";
    switch (columnname) {
      case "encounter_uuid":
        return `${returnProvideMsg} Encounter Id`;
      case "period_uuid":
        return `${returnProvideMsg} Period Id`;
      case "facility_uuid":
        return `${returnProvideMsg} Facility Id`;
      case "referral_facility_uuid":
        return `${returnProvideMsg} Referral Facility Id`;
      case "department_uuid":
        return `${returnProvideMsg} Department Id`;
      case "referral_deptartment_uuid":
        return `${returnProvideMsg} Referral Department Id`;
      case "transfer_department_uuid":
        return `${returnProvideMsg} Transfer Department Id`;
      case "role_uuid":
        return `${returnProvideMsg} Role Id`;
      case "context_uuid":
        return `${returnProvideMsg} Context Id`;
      case "activity_uuid":
        return `${returnProvideMsg} Activity Id`;
      case "context_activity_map_uuid":
        return `${returnProvideMsg} Context Activity Map Id`;
      case "history_view_order":
        return `${returnProvideMsg} History View Order Id`;
      case "chief_complaint_category_uuid":
        return `${returnProvideMsg} chief complaint category Id`;
      case "treatment_kit_type_uuid":
        return `${returnProvideMsg} Treatment Type Id`;
      case "code":
        return `${returnProvideMsg} Code`;
      case "name":
        return `${returnProvideMsg} Name`;
      case "activefrom":
        return `${returnProvideMsg} Active From`;
      case "test_master_uuid":
        return `${returnProvideMsg} Test Master Id`;
      case "diagnosis_uuid":
        return `${returnProvideMsg}  Diagnosis Id`;
      case "doctor_uuid":
        return `${returnProvideMsg}  Doctor Id`;
      case "encounter_type_uuid":
        return `${returnProvideMsg} Encounter Type Id`;
      case "patient_uuid":
        return `${returnProvideMsg} Patient Id`;
      case "item_master_uuid":
        return `${returnProvideMsg} Item Master Id`;
      case "drug_route_uuid":
        return `${returnProvideMsg} Drug Route Id`;
      case "duration_period_uuid":
        return `${returnProvideMsg} Duration Period Id`;
      case "drug_instruction_uuid":
        return `${returnProvideMsg} Drug Instruction Id`;
      case "consultation_uuid":
        return `${returnProvideMsg} Consultation Id`;
      case "relation_type_uuid":
        return `${returnProvideMsg} Relation Type Id`;
      case "transfer_facility_uuid":
        return `${returnProvideMsg} Transfer Facility Id`;
      case "quantity":
        return `${returnProvideMsg} Drug Quantity`;
      case "admission_status_uuid":
        return `${returnProvideMsg} admission_status_uuid`;
      case "encounter_type_uuid":
        return `${returnProvideMsg} encounter_type_uuid`;
      case "note_type_uuid":
        return `${returnProvideMsg} note_type_uuid`;
      case "category_type_uuid":
        return `${returnProvideMsg} category_type_uuid`;
      case "category_group_uuid":
        return `${returnProvideMsg} category_group_uuid`;
      case "profile_uuid":
        return `${returnProvideMsg} profile_uuid`;
      case "section_uuid":
        return `${returnProvideMsg} section_uuid`;
      case "activity_uuid":
        return `${returnProvideMsg} activity_uuid`;
      case "profile_section_uuid":
        return `${returnProvideMsg} profile_section_uuid`;
      case "category_uuid":
        return `${returnProvideMsg} category_uuid`;
      case "profile_section_category_uuid":
        return `${returnProvideMsg} profile_section_category_uuid`;
      case "value_type_uuid":
        return `${returnProvideMsg} value_type_uuid`;
      case "profile_section_category_concept_uuid":
        return `${returnProvideMsg} profile_section_category_concept_uuid`;
      case "section_type_uuid":
        return `${returnProvideMsg} section_type_uuid`;
      case "section_note_type_uuid":
        return `${returnProvideMsg} section_note_type_uuid`;
      case "display_order":
        return `${returnProvideMsg} display_order`;
      case "schedule_uuid":
        return `${returnProvideMsg} schedule_uuid`;
      case "immunization_uuid":
        return `${returnProvideMsg} immunization_uuid`;
      case "immunization_schedule_flag_uuid":
        return `${returnProvideMsg} immunization_schedule_flag_uuid`;
      case "immunization_route_uuid":
        return `${returnProvideMsg} immunization_route_uuid`;
      case "immunization_dosage_uuid":
        return `${returnProvideMsg} immunization_dosage_uuid`;
      case "route_uuid":
        return `${returnProvideMsg} route_uuid`;
      case "frequency_uuid":
        return `${returnProvideMsg} frequency_uuid`;
      case "duration":
        return `${returnProvideMsg} duration`;
      case "instruction_uuid":
        return `${returnProvideMsg} instruction_uuid`;
      case "schedule_flag_uuid":
        return `${returnProvideMsg} schedule_flag_uuid`;
      case "immunization_name":
        return `${returnProvideMsg} immunization_name`;
      default:
        return `${returnProvideMsg} required Fields`;
    }
  },

  GetMinimumMessage: function (columnname) {
    let lengthMessage = "must be greater than 0";
    switch (columnname) {
      case "encounter_uuid":
        return `Encounter Id ${lengthMessage}`;
      case "doctor_uuid":
        return `Doctor Id ${lengthMessage}`;
      case "encounter_type_uuid":
        return `Encounter Type Id ${lengthMessage}`;
      case "patient_uuid":
        return `Patient Id ${lengthMessage}`;
      case "facility_uuid":
        return `Facility Id ${lengthMessage}`;
      case "referral_facility_uuid":
        return `Referral Facility Id ${lengthMessage}`;
      case "consultation_uuid":
        return `Consultation Id ${lengthMessage}`;
      case "treatment_kit_type_uuid":
        return `Treatment Kit Type Id ${lengthMessage}`;
      case "item_master_uuid":
        return `Item Master Id ${lengthMessage}`;
      case "drug_route_uuid":
        return `Drug Route Id ${lengthMessage}`;
      case "drug_frequency_uuid":
        return `Drug Frequency Id ${lengthMessage}`;
      case "duration_period_uuid":
        return `Drug Period Id ${lengthMessage}`;
      case "drug_instruction_uuid":
        return `Drug Instruction Id ${lengthMessage}`;
      case "quantity":
        return `Drug Quantity ${lengthMessage}`;
      case "role_uuid":
        return `Role Id ${lengthMessage}`;
      case "context_uuid":
        return `Context Id ${lengthMessage} `;
      case "activity_uuid":
        return `Activity Id ${lengthMessage}`;
      case "context_activity_map_uuid":
        return `Context Activity Map Id ${lengthMessage}`;
      case "relation_type_uuid":
        return `Relation Type Id ${lengthMessage}`;

      default:
        return `Value ${lengthMessage}`;
    }
  },

  GetZeroValidationMessage: function (columnname) {
    let validationMessage = "must be greater than or equal to 0";
    switch (columnname) {
      case "encounter_uuid":
        return `Encounter Id ${validationMessage}`;
      case "doctor_uuid":
        return `Doctor Id ${validationMessage}`;
      case "encounter_type_uuid":
        return `Encounter Type Id ${validationMessage}`;
      case "patient_uuid":
        return `Patient Id ${validationMessage}`;
      case "department_uuid":
        return `Department Id ${validationMessage}`;
      case "referral_deptartment_uuid":
        return `Referral Department Id ${validationMessage}`;
      case "transfer_department_uuid":
        return `Transfer Department Id ${validationMessage}`;
      case "consultation_uuid":
        return `Consultation Id ${validationMessage}`;
      case "facility_uuid":
        return `Facility Id ${validationMessage}`;
      case "referral_facility_uuid":
        return `Referral Facility Id ${validationMessage}`;
      case "diagnosis_uuid":
        return `Diagnosis Id ${validationMessage}`;
      case "test_master_uuid":
        return `Test Master Id ${validationMessage}`;
      case "item_master_uuid":
        return `Item Master Id ${validationMessage}`;
      case "drug_route_uuid":
        return `Drug Route Id ${validationMessage}`;
      case "drug_frequency_uuid":
        return `Drug Frequency Id ${validationMessage}`;
      case "duration_period_uuid":
        return `Drug Period Id ${validationMessage}`;
      case "drug_instruction_uuid":
        return `Drug Instruction Id ${validationMessage}`;
      case "quantity":
        return `Drug Quantity ${validationMessage}`;
      case "role_uuid":
        return `Role Id ${validationMessage}`;
      case "context_uuid":
        return `Context Id ${validationMessage} `;
      case "activity_uuid":
        return `Activity Id ${validationMessage}`;
      case "context_activity_map_uuid":
        return `Context Activity Map Id ${validationMessage}`;
      case "transfer_facility_uuid":
        return `Transfer Facility Id ${validationMessage}`;
      case "relation_type_uuid":
        return `Relation Type Id ${validationMessage}`;
      case "admission_status_uuid":
        return `admission status uuid ${validationMessage}`;
      case "category_type_uuid":
        return `category_type_uuid ${validationMessage}`;
      case "category_group_uuid":
        return `category_group_uuid ${validationMessage}`;
      case "profile_uuid":
        return `profile_uuid ${validationMessage}`;
      case "section_uuid":
        return `section_uuid ${validationMessage}`;
      case "activity_uuid":
        return `activity_uuid ${validationMessage}`;
      case "profile_section_category_uuid":
        return `profile_section_category_uuid ${validationMessage}`;
      case "value_type_uuid":
        return `value_type_uuid ${validationMessage}`;
      case "profile_section_category_concept_uuid":
        return `profile_section_category_concept_uuid ${validationMessage}`;
      case "display_order":
        return `display_order ${validationMessage}`;
      default:
        return `Value ${validationMessage}`;
    }
  },
  getEncounterType(id) {
    switch (id) {
      case 1:
        return "OP";
      case 2:
        return "IP";
    }
  }
});
