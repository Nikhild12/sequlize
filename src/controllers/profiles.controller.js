//Package Import
const httpStatus = require("http-status");

//Sequelizer Import
const db = require('../config/sequelize');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const active_boolean = 1;


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
        }];
      });

    });

    //Concepts Details
    let conceptsDetails = [];
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
          }];

        });
      });
    });

    // Category Concept value Details
    let categoryConceptValueDetails = [];
    sections.forEach((item, idx) => {
      if (item && Array.isArray(item.categories)) {
        item.categories.forEach((cItem) => {
          if (cItem && Array.isArray(cItem.concepts)) {
            cItem.concepts.forEach((cnItem, value_idx) => {
              if (cnItem && Array.isArray(cnItem.category_concept_values)) {
                cnItem.category_concept_values.forEach((item, idx) => {
                  categoryConceptValueDetails = [...categoryConceptValueDetails, {
                    value_code: item.value_code,
                    value_name: item.value_name,
                    display_order: item.display_order
                  }];
                });
              }
            });

          }
        });
      }


    });
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

          sections = emr_utility.createIsActiveAndStatus(sections, { returning: true });
          sections.forEach((l) => {
            l = emr_utility.assignDefaultValuesAndUUIdToObject(l, sections, user_uuid);

          });
          // Sections  Save
          let createdSectionData = [];
          createdSectionData = await sectionsTbl.bulkCreate(sections, { returning: true });

          // Profile and Sections mapping
          sections.forEach((item, idx) => {

            item.profile_uuid = createdProfileData.uuid;
            item.section_uuid = createdSectionData[idx].uuid;
            item = emr_utility.assignDefaultValuesAndUUIdToObject(item, sections, user_uuid);
          });
          profileSave = [...profileSave, profileSectionsTbl.bulkCreate(sections, { returning: true })];

          // creating categories
          categoryDetails = emr_utility.createIsActiveAndStatus(categoryDetails, { returning: true });
          // assigning Default Values
          categoryDetails.forEach((c) => {
            c = emr_utility.assignDefaultValuesAndUUIdToObject(c, categoryDetails, user_uuid);

          });
          //categoryDetails save
          let createdCatgoriesData = [];
          createdCatgoriesData = await categoriesTbl.bulkCreate(categoryDetails, { returning: true });

          //Sections and Categories mapping
          const sectionCategoryData = categoryDetails.map((cD, cIdx) => {

            return {
              "section_uuid": createdSectionData[cD.sectionIdx].uuid,
              "category_uuid": createdCatgoriesData[cIdx].uuid,
              "display_order": createdSectionData[cD.sectionIdx].display_order
            };
          });

          sectionCategoryData.forEach((l) => {
            l = emr_utility.assignDefaultValuesAndUUIdToObject(l, sectionCategoryData, user_uuid);

          });

          // sectionCategory Save
          profileSave = [...profileSave, sectionCategoryMapTbl.bulkCreate(sectionCategoryData, categoryDetails, { returning: true })];

          // Concepts
          conceptsDetails = emr_utility.createIsActiveAndStatus(conceptsDetails, { returning: true });

          // assigning defaults values
          conceptsDetails.forEach((co) => {
            co = emr_utility.assignDefaultValuesAndUUIdToObject(co, conceptsDetails, user_uuid);
          });

          let createdConceptsData = [];
          createdConceptsData = await conceptsTbl.bulkCreate(conceptsDetails, { returning: true });

          // Categories and concepts mapping
          const categoryConceptsData = conceptsDetails.map((coD, coIdx) => {


            return {
              "category_uuid": createdCatgoriesData[coD.categoryIdx].uuid,
              "concept_uuid": createdConceptsData[coIdx].uuid,
            };
          });

          categoryConceptsData.forEach((s) => {
            s = emr_utility.assignDefaultValuesAndUUIdToObject(s, categoryConceptsData, user_uuid);

          });

          // profileSave = [...profileSave, categoryConceptsTbl.bulkCreate(categoryConceptsData, conceptsDetails, { returning: true })]
          createdConceptCatgoriesData = await categoryConceptsTbl.bulkCreate(categoryConceptsData, conceptsDetails, { returning: true });

          // CategoriesconceptValues mapping
          // categoryConceptValueDetails = emr_utility.createIsActiveAndStatus(categoryConceptValueDetails, { returning: true });
          categoryConceptValueDetails.forEach((m, idx) => {

            m = emr_utility.assignDefaultValuesAndUUIdToObject(m, createdConceptCatgoriesData, user_uuid);
            m.category_concept_uuid = createdConceptCatgoriesData[idx].uuid;
          });
          // CategoriesconceptValues  Save
          profileSave = [...profileSave, categoryConceptValuesTbl.bulkCreate(categoryConceptValueDetails, { returning: true })];

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


  // Delete Profiles
  const _deleteProfiles = async (req, res) => {
    const { user_uuid } = req.headers;
    const { uuid } = req.body;

    if (uuid && user_uuid) {
      const updatedProfilesData = { status: 0, is_active: 0, modified_by: user_uuid, modified_date: new Date() };
      try {
        const data = await profilesTbl.update(updatedProfilesData, { where: { uuid: uuid } }, { returning: true });
        if (data) {
          return res.status(200).send({ code: httpStatus.OK, message: 'Deleted Successfully' });
        } else {
          return res.status(400).send({ code: httpStatus.OK, message: 'Deleted Fail' });

        }

      }
      catch (ex) {
        console.log('Exception happened', ex);
        return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });

      }
    } else {
      return res.status(400).send({ code: httpStatus.UNAUTHORIZED, message: emr_constants.NO_USER_ID });

    }
  };

  /**
       * Updating Profiles By Id
       * @param {*} req 
       * @param {*} res 
       */

  const _updateProfiles = async (req, res) => {
    const { user_uuid } = req.headers;
    const profilesReqData = req.body;

    const profilesUpdateData = getProfilesUpdateData(user_uuid, profilesReqData);
    const sectionsUpdateData = getSectionsUpdateData(user_uuid, profilesReqData);
    const profileSectionsUpdateData = getProfileSectionsUpdateData(user_uuid, profilesReqData);
    const categoriesUpdateData = getCategoriesUpdateData(user_uuid, profilesReqData);
    const sectionsCategoryUpdateData = getSectionCategoryUpdateData(user_uuid, profilesReqData);
    const conceptsUpdateData = getConceptsUpdateData(user_uuid, profilesReqData);
    const categoryConceptsData = getCategoryConceptsUpdateData(user_uuid, profilesReqData);
    const categoryConceptUpdateData = getCategoryConceptUpdateData(user_uuid, profilesReqData);

    if (uuid && user_uuid && profilesReqData.hasOwnProperty('uuid') && profilesReqData.hasOwnProperty('is_active')) {

      try {
        const updatingRecord = await profilesTbl.findAll({
          where: {
            uuid: profilesReqData.uuid,
            status: emr_constants.IS_ACTIVE
          }
        });

        if (updatingRecord && updatingRecord.length === 0) {
          return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: emr_constants.NO_CONTENT_MESSAGE });
        }

        const updatedProfilesData = await Promise.all([
          profilesTbl.update(profilesUpdateData, { where: { uuid: profilesReqData.uuid } }),
          sectionsTbl.update(sectionsUpdateData, { where: { uuid: sectionsUpdateData.uuid } }),

        ]);


        if (updatedProfilesData) {
          return res.status(200).send({ code: httpStatus.OK, message: "Updated Successfully", requestContent: profilesReqData });
        }

      } catch (ex) {

        console.log(`Exception Happened ${ex}`);
        return res.status(400).send({ code: httpStatus[400], message: ex.message });

      }

    }
  };


  /**
       * Get profiles By Id,name and department
       * @param {*} req 
       * @param {*} res 
       */

  const _getProfileById = async (req, res) => {

    const { user_uuid } = req.headers;
    const { uuid, profile_code, profile_name, department_uuid } = req.body;
    if (user_uuid && uuid) {
      try {

        const profileData = await profilesTbl.findAll({
          attributes: ['uuid', 'profile_code', 'profile_name', 'department_uuid', 'profile_description', 'department_uuid', 'profile_type_uuid'],
          where: { uuid: uuid, is_active: 1, status: 1 },
          include: [
            {
              model: profileSectionsTbl,
              as: 'profile_sections',
              attributes: ['uuid', 'profile_uuid', 'section_uuid'],
              where: { is_active: 1, status: 1 },

              include: [{
                model: sectionsTbl,
                as: 'sections',
                attributes: ['uuid', 'name', 'description', 'sref', 'section_type_uuid', 'section_note_type_uuid', 'display_order'],
                where: { is_active: 1, status: 1 },


                include: [{
                  model: sectionCategoryMapTbl,
                  as: 'section_category_map',
                  attributes: ['uuid', 'section_uuid', 'category_uuid'],
                  where: { is_active: 1, status: 1 },

                  include: [{
                    model: categoriesTbl,
                    as: 'categories',
                    attributes: ['uuid', 'code', 'name', 'category_type_uuid', 'description'],
                    where: { is_active: 1, status: 1 },

                    include: [{
                      model: categoryConceptsTbl,
                      as: 'category_concepts',
                      attributes: ['uuid', 'category_uuid', 'concept_uuid'],
                      where: { is_active: 1, status: 1 },
                      include: [{
                        model: conceptsTbl,
                        as: 'concepts',
                        attributes: ['uuid', 'code', 'name', 'value_type_uuid', 'description', 'is_mandatory', 'display_order', 'is_multiple'],
                        where: { is_active: 1, status: 1 },
                      }],
                      include: [{
                        model: categoryConceptValuesTbl,
                        as: 'category_concept_values',
                        attributes: ['uuid', 'category_concept_uuid', 'value_code', 'value_name'],
                        where: { is_active: 1, status: 1 },
                      }]

                    }]

                  }]

                }]

              }]
            }]
        });

        return res.status(httpStatus.OK).send({ code: httpStatus.OK, message: 'get Success', responseContents: profileData });

      } catch (ex) {

        console.log(`Exception Happened ${ex}`);
        return res.status(400).send({ code: httpStatus[400], message: ex.message });

      }
    } else {
      return res.status(400).send({ code: httpStatus[400], message: "No Request headers or request Found" });
    }

  };

  return {
    createProfileOpNotes: _createProfileOpNotes,
    getAllProfiles: _getAllProfiles,
    deleteProfiles: _deleteProfiles,
    getProfileById: _getProfileById,
    updateProfiles: _updateProfiles


  };

};


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
    !checkConcepts(concepts);

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

function getProfilesUpdateData(user_uuid, profilesReqData) {

  return {
    user_uuid: user_uuid,
    profile_code: profilesReqData.profile_code,
    profile_name: profilesReqData.profile_name,
    profile_description: profilesReqData.profile_description,
    description: profilesReqData.department_id,
    facility_uuid: profilesReqData.facility_uuid,
    profile_type_uuid: profilesReqData.profile_type_uuid,
    modified_by: user_uuid,
    modified_date: new Date(),
    is_active: profilesReqData.is_active,
    status: profilesReqData.status
  };

}

function getSectionsUpdateData(user_uuid, profilesReqData) {

  return {
    user_uuid: user_uuid,
    section_type_uuid: profilesReqData.section_type_uuid,
    section_note_type_uuid: profilesReqData.section_note_type_uuid,
    name: profilesReqData.name,
    description: profilesReqData.description,
    sref: profilesReqData.sref,
    display_order: profilesReqData.display_order,
    modified_by: user_uuid,
    modified_date: new Date(),
    is_active: profilesReqData.is_active,
    status: profilesReqData.status
  };

}


function getCategoriesUpdateData(user_uuid, profilesReqData) {

  return {
    user_uuid: user_uuid,
    code: profilesReqData.code,
    name: profilesReqData.name,
    description: profilesReqData.description,
    category_type_uuid: profilesReqData.category_type_uuid,
    modified_by: user_uuid,
    modified_date: new Date(),
    is_active: profilesReqData.is_active,
    status: profilesReqData.status
  };

}

function getConceptsUpdateData(user_uuid, profilesReqData) {

  return {
    user_uuid: user_uuid,
    code: profilesReqData.code,
    name: profilesReqData.name,
    description: profilesReqData.description,
    value_type_uuid: profilesReqData.value_type_uuid,
    is_mandatory: profilesReqData.is_mandatory,
    display_order: profilesReqData.display_order,
    is_multiple: profilesReqData.is_multiple,
    modified_by: user_uuid,
    modified_date: new Date(),
    is_active: profilesReqData.is_active,
    status: profilesReqData.status
  };

}

function getCategoryConceptsUpdateData(user_uuid, profilesReqData) {

  return {
    user_uuid: user_uuid,
    value_code: profilesReqData.value_code,
    value_name: profilesReqData.value_name,
    category_concept_uuid: profilesReqData.category_concept_uuid,
    display_order: profilesReqData.display_order,
    modified_by: user_uuid,
    modified_date: new Date(),
    is_active: profilesReqData.is_active,
    status: profilesReqData.status
  };

}

function getProfileSectionsUpdateData(user_uuid, profilesReqData) {

  return {
    user_uuid: user_uuid,
    display_order: profilesReqData.display_order,
    section_uuid: profilsection_uuid,
    modified_by: user_uuid,
    modified_date: new Date(),
    is_active: profilesReqData.is_active,
    status: profilesReqData.status
  };

}

function getSectionCategoryUpdateData(user_uuid, profilesReqData) {

  return {
    user_uuid: user_uuid,
    display_order: profilesReqData.display_order,
    section_uuid: profilsection_uuid,
    modified_by: user_uuid,
    modified_date: new Date(),
    is_active: profilesReqData.is_active,
    status: profilesReqData.status
  };

}


function getCategoryConceptUpdateData(user_uuid, profilesReqData) {

  return {
    user_uuid: user_uuid,
    display_order: profilesReqData.display_order,
    section_uuid: profilsection_uuid,
    modified_by: user_uuid,
    modified_date: new Date(),
    is_active: profilesReqData.is_active,
    status: profilesReqData.status
  };

}
