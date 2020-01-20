//Package Import
const httpStatus = require("http-status");

//Sequelizer Import
const db = require('../config/sequelize');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;


//EMR Constants Import
const emr_constants = require('../config/constants');

const emr_utility = require('../services/utility.service');

//Initialize profile opNotes
const profilesTbl = db.profiles;
const profileUsersTbl = db.profile_users;
const profileTypesTbl = db.profile_types;
const sectionTypesTbl = db.section_types;
const sectionNoteTypesTbl = db.section_note_types;
const sectionsTbl = db.sections;
const categoriesTbl = db.categories;
const valueTypesTbl = db.value_types;
const conceptsTbl = db.concepts;
const profileSectionsTbl = db.profile_sections;
const categoryConceptsTbl = db.category_concepts;
const sectionCategoryMapTbl = db.section_category_map;
const categoryTypeMasterTbl = db.category_type_master;
const visitTypeTbl = db.visit_type;
const categoryConceptValuesTbl = db.category_concept_values;


const profilesController = () => {
  /**
   * Creating  profile opNotes
   * @param {*} req 
   * @param {*} res 
   */
  const _createProfileOpNotes = async (req, res) => {
    const { user_uuid } = req.headers;
    let { profiles, sections } = req.body;

    //categoryDetails
    let categoryDetails = [];
    sections.forEach((item, section_idx, display_order) => {
      let categories = item.categories;
      categories.forEach((item, idx) => {
        categoryDetails = [...categoryDetails, {
          code: item.code,
          name: item.name,
          description: item.description,
          category_type_uuid: item.category_type_uuid,
          displayOrder: display_order,
          sectionIdx: section_idx
        }]
      })

    })

    //Concepts Details
    let conceptsDetails = []
    sections.forEach((item, idx) => {
      let categories = item.categories;
      categories.forEach((item, category_idx) => {
        let concepts = item.concepts;
        concepts.forEach((item, idx) => {
          conceptsDetails = [...conceptsDetails, {
            code: item.code,
            name: item.name,
            description: item.description,
            value_type_uuid: item.value_type_uuid,
            is_multiple: item.is_multiple,
            is_mandatory: item.is_mandatory,
            display_order: item.display_order,
            categoryIdx: category_idx
          }]

        })
      })
    })

    // Category Concept value Details
    let categoryConceptValueDetails = []
    sections.forEach((item, idx) => {
      let categories = item.categories;
      categories.forEach((item, category_idx) => {
        let concepts = item.concepts;
        concepts.forEach((item, value_idx) => {
          let categoryConceptValueDetails = item.category_concept_values;
          categoryConceptValueDetails.forEach((item, idx) => {
            categoryConceptValueDetails = [...categoryConceptValueDetails, {
              value_code: item.value_code,
              value_name: item.value_name,
              category_concept_uuid: value_idx,
              display_order: item.display_order
            }]
          })
        })
      })

    })

    // creating profile 
    if (user_uuid && profiles && profiles.profile_code && profiles.profile_name) {

      if (checkProfiles(req)) {
        return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: 'Please send treatment Kit along with One widget details' });
      }
      try {
        let profileSave = [];
        const duplicateProfilesRecord = await findDuplicateProfilesByCodeAndName(profiles);
        //   if (duplicateProfilesRecord && duplicateProfilesRecord.length > 0) {
        //        return res.status(400).send({ code: emr_constants.DUPLICATE_ENTRIE, message: getDuplicateMsg(duplicateProfilesRecord) });
        // }
        profiles = emr_utility.createIsActiveAndStatus(profiles, user_uuid);
        // Profiles save
        const createdProfileData = await profilesTbl.create(profiles, { returning: true });

        //   creating sections 
        if (sections && Array.isArray(sections) && sections.length > 0) {

          sections = emr_utility.createIsActiveAndStatus(sections, { returning: true })
          sections.forEach((l) => {
            l = emr_utility.assignDefaultValuesAndUUIdToObject(l, sections, user_uuid);

          });
          // Sections  Save
          let createdSectionData = []
          createdSectionData = await sectionsTbl.bulkCreate(sections, { returning: true });

          // Profile and Sections mapping
          sections.forEach((item, idx) => {

            item.profile_uuid = createdProfileData.uuid;
            item.section_uuid = createdSectionData[idx].uuid;
            item = emr_utility.assignDefaultValuesAndUUIdToObject(item, sections, user_uuid)
          })
          profileSave = [...profileSave, profileSectionsTbl.bulkCreate(sections, { returning: true })]

          // creating categories
          categoryDetails = emr_utility.createIsActiveAndStatus(categoryDetails, { returning: true })
          // assigning Default Values
          categoryDetails.forEach((c) => {
            c = emr_utility.assignDefaultValuesAndUUIdToObject(c, categoryDetails, user_uuid);

          });
          //categoryDetails save
          let createdCatgoriesData = []
          createdCatgoriesData = await categoriesTbl.bulkCreate(categoryDetails, { returning: true })

          //Sections and Categories mapping
          const sectionCategoryData = categoryDetails.map((cD, cIdx) => {

            return {
              "section_uuid": createdSectionData[cD.sectionIdx].uuid,
              "category_uuid": createdCatgoriesData[cIdx].uuid,
              "display_order": createdSectionData[cD.sectionIdx].display_order
            }
          });

          sectionCategoryData.forEach((l) => {
            l = emr_utility.assignDefaultValuesAndUUIdToObject(l, sectionCategoryData, user_uuid);

          });

          // sectionCategory Save
          profileSave = [...profileSave, sectionCategoryMapTbl.bulkCreate(sectionCategoryData, categoryDetails, { returning: true })]

          // Concepts
          conceptsDetails = emr_utility.createIsActiveAndStatus(conceptsDetails, { returning: true })

          // assigning defaults values
          conceptsDetails.forEach((co) => {
            co = emr_utility.assignDefaultValuesAndUUIdToObject(co, conceptsDetails, user_uuid);
          });

          let createdConceptsData = []
          createdConceptsData = await conceptsTbl.bulkCreate(conceptsDetails, { returning: true })

          // Categories and concepts mapping
          const categoryConceptsData = conceptsDetails.map((coD, coIdx) => {


            return {
              "category_uuid": createdCatgoriesData[coD.categoryIdx].uuid,
              "concept_uuid": createdConceptsData[coIdx].uuid,
            }
          });

          categoryConceptsData.forEach((s) => {
            s = emr_utility.assignDefaultValuesAndUUIdToObject(s, categoryConceptsData, user_uuid);

          });

          // profileSave = [...profileSave, categoryConceptsTbl.bulkCreate(categoryConceptsData, conceptsDetails, { returning: true })]
          createdConceptCatgoriesData = await categoryConceptsTbl.bulkCreate(categoryConceptsData, conceptsDetails, { returning: true })

          // CategoriesconceptValues mapping
          categoryConceptValueDetails = emr_utility.createIsActiveAndStatus(categoryConceptValueDetails, { returning: true })
          categoryConceptValueDetails.forEach((m) => {

            m = emr_utility.assignDefaultValuesAndUUIdToObject(m, categoryConceptValueDetails, user_uuid);

          });
          // CategoriesconceptValues  Save
          profileSave = [...profileSave, categoryConceptValuesTbl.bulkCreate(categoryConceptValueDetails, { returning: true })]

        }
        await Promise.all(profileSave);
        return res.status(200).send({ code: httpStatus.OK, message: emr_constants.PROFILES_SUCCESS, reqContents: req.body });
      } catch (ex) {
        return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex });

      }
    } else {

      return res.status(400).send({ code: httpStatus[400], message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}` });

    }

  };

  // Get All the Profiles
  const _getAllProfiles = async (req, res) => {

    const { user_uuid } = req.headers;

    try {

      if (user_uuid) {
        const profilesData = await profilesTbl.findAll();
        return res.status(200).send({ code: httpStatus.OK, message: emr_constants.FETCHD_PROFILES_SUCCESSFULLY, responseContents: profilesData });
      }
      else {
        return res.status(422).send({ code: httpStatus[400], message: emr_constants.FETCHD_PROFILES_FAIL });
      }
    } catch (ex) {

      console.log(ex.message);
      return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
    }
  };

  return {
    createProfileOpNotes: _createProfileOpNotes,
    getAllProfiles: _getAllProfiles

  };

};


const __createProfileUsers = async (req, res) => {
  const { user_uuid } = req.headers;
  let { categoryConceptValuesData } = req.body;
  if (user_uuid && profiles && profiles.profile_code && profiles.profile_name) {
  }

}

module.exports = profilesController();

async function findDuplicateProfilesByCodeAndName({ profile_code, profile_name }) {
  // checking for Duplicate 
  // before creating profiles 
  return await profilesTbl.findAll({
    attributes: ['profile_code', 'profile_name', 'is_active'],
    where: {
      [Op.or]: [
        { profile_code: profile_code },
        { profile_name: profile_name }
      ]
    }
  });
}

function getDuplicateMsg(record) {
  return record[0].is_active ? emr_constants.DUPLICATE_ACTIVE_MSG : emr_constants.DUPLICATE_IN_ACTIVE_MSG;
}


function checkProfiles(req) {

  const { profiles, sections, categories, concepts } = req.body;

  return !checkSections(sections) &&
    !checkCategories(categories) &&
    !checkConcepts(concepts)

}



function checkSections(sections) {
  return sections && Array.isArray(sections) && sections.length > 0;
}

function checkCategories(categories) {
  return categories && Array.isArray(categories) && categories.length > 0;
}


function checkConcepts(concepts) {
  return concepts && Array.isArray(concepts) && concepts.length > 0;
}

