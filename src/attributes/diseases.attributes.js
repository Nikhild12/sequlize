// Import EMR Utilities
const emr_utilities = require("../services/utility.service");

const _diseasesAttributes = [
  "uuid",
  "code",
  "name",
  "color",
  "language",
  "display_order",
  "Is_default",
  "is_active",
  "status",
  "created_by",
  "created_date",
  "modified_by",
  "modified_date",
  "revision"
];

const _getModifiedResponse = records => {
  return records.map(r => {
    return {
      disease_id: r.uuid,
      disease_code: r.code,
      disease_name: r.name,
      disease_color: r.color,
      disease_language: r.language,
      diseases_is_default: r.Is_default
    };
  });
};

const _diseasesQuery = (key, value) => {
  if (key.toLowerCase() === "filterbythree") {
    return emr_utilities.getFilterByThreeQueryForCodeAndName(value);
  } else {
    return { uuid: value };
  }
};

module.exports = {
  diseasesAttributes: _diseasesAttributes,
  getModifiedResponse: _getModifiedResponse,
  diseasesQuery: _diseasesQuery
};
