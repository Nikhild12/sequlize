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
const visitTypeTbl = db.visit_type;
const profileSectionCategoriesTbl = db.profile_section_categories;
const profileSectionCategoryConceptsTbl = db.profile_section_category_concepts;
const profileSectionCategoryConceptValuesTbl = db.profile_section_category_concept_values;
const ProfilesViewTbl = db.vw_op_notes_details;
const sectionCategoryEntriesTbl = db.section_category_entries;
//const Q = require('q');

const profilesController = () => {
  /**
   * Creating  profile opNotes
   * @param {*} req 
   * @param {*} res 
   */

  const _createProfileOpNotes = async (req, res) => {
    const { user_uuid } = req.headers;
    let { profiles } = req.body;
    let sectionsDetails = profiles.sections;

    // creating profile
    if (user_uuid && profiles.profile_code && profiles.profile_name) {
      try {
        let profileSectionSave = [], CategorySave = [], ConceptsSave = [], conceptValuesSave = [];
        profiles = emr_utility.createIsActiveAndStatus(profiles, user_uuid);
        //Profiles save
        const profileResponse = await profilesTbl.create(profiles, { returning: true });

        // Profile and Sections mapping
        for (let i = 0; i < sectionsDetails.length; i++) {
          const element = sectionsDetails[i];
          profileSectionSave.push({
            profile_uuid: profileResponse.uuid,
            section_uuid: element.section_uuid,
            activity_uuid: element.activity_uuid,
            display_order: element.display_order
          });
        }
        if (profileSectionSave.length > 0) {
          var profileSectionResponse = await profileSectionsTbl.bulkCreate(profileSectionSave);
          for (let i = 0; i < sectionsDetails.length; i++) {
            for (let j = 0; j < sectionsDetails[i].categories.length; j++) {
              const element = sectionsDetails[i].categories[j];
              CategorySave.push({
                profile_section_uuid: profileSectionResponse[i].uuid,
                category_uuid: element.category_uuid,
                display_order: element.display_order
              })
            }
          }
          // profile_ Sections_categories mapping
          if (CategorySave.length > 0) {
            var categoriesResponse = await profileSectionCategoriesTbl.bulkCreate(CategorySave);
            var index = 0;
            for (let i = 0; i < sectionsDetails.length; i++) {
              for (let j = 0; j < sectionsDetails[i].categories.length; j++) {
                index++;
                for (let k = 0; k < sectionsDetails[i].categories[j].concepts.length; k++) {
                  const element = sectionsDetails[i].categories[j].concepts[k];
                  ConceptsSave.push({
                    profile_section_category_uuid: categoriesResponse[index - 1].uuid,
                    code: element.code,
                    name: element.name,
                    description: element.description,
                    value_type_uuid: element.value_type_uuid,
                    is_mandatory: element.is_mandatory,
                    display_order: element.display_order,
                    is_multiple: element.is_multiple
                  })
                }
              }
            }
            // profile_ Sections_categories_concepts mapping
            if (ConceptsSave.length > 0) {
              var conceptResponse = await profileSectionCategoryConceptsTbl.bulkCreate(ConceptsSave);
              var index = 0;
              for (let i = 0; i < sectionsDetails.length; i++) {
                for (let j = 0; j < sectionsDetails[i].categories.length; j++) {
                  for (let k = 0; k < sectionsDetails[i].categories[j].concepts.length; k++) {
                    index++;
                    for (let l = 0; l < sectionsDetails[i].categories[j].concepts[k].conceptvalues.length; l++) {
                      const element = sectionsDetails[i].categories[j].concepts[k].conceptvalues[l];
                      conceptValuesSave.push({
                        profile_section_category_concept_uuid: conceptResponse[index - 1].uuid,
                        value_code: element.value_code,
                        value_name: element.value_name,
                        display_order: element.display_order
                      });
                    }
                  }
                }
              }
              // profile_ Sections_categories_concept_values mapping
              if (conceptValuesSave.length > 0) {
                var conceptValuesResponse = await profileSectionCategoryConceptValuesTbl.bulkCreate(conceptValuesSave);
              }
            }
          }
        }
        return res.status(200).send({
          code: httpStatus.OK, message: emr_constants.PROFILES_SUCCESS, responseContents: {
            profileResponse: profileResponse, profileSectionResponse: profileSectionResponse, categoriesResponse: categoriesResponse,
            conceptResponse: conceptResponse,
            conceptValuesResponse: conceptValuesResponse
          }
        });
      }
      catch (ex) {
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
       * Get profiles By Id,name and department
       * @param {*} req 
       * @param {*} res 
       */
  const _getProfileById = async (req, res) => {

    const { user_uuid } = req.headers;
    const { profile_uuid, p_profile_code, profile_name, department_uuid } = req.query;
    if (user_uuid && profile_uuid) {
      try {

        const profileList = await ProfilesViewTbl.findAll({
          where: { p_uuid: profile_uuid },
          attributes: { "exclude": ['id', 'createdAt', 'updatedAt'] }
        });
        if (profileList) {
          const profileData = getProfileDetailsData(profileList);
          return res.status(httpStatus.OK).send({ code: httpStatus.OK, message: 'profiles Details fetched succesfully', responseContents: profileData });

        }
        else {
          return res.status(400).send({ code: httpStatus[400], message: "No Request headers or request Found" });
        }
      } catch (ex) {
        console.log(`Exception Happened ${ex}`);
        return res.status(400).send({ code: httpStatus[400], message: ex.message });

      }
    }

  };

  /**
      * update profiles
      * @param {*} req 
      * @param {*} res 
      */
  const _updateProfiles = async (req, res) => {
    const { user_uuid } = req.headers;
    const profilesReqData = req.body;
    //const profilesUpdateData = getProfilesUpdateData(user_uuid, profilesReqData);

    if (user_uuid && profilesReqData) {
      try {
        // const updatingRecord = await profilesTbl.update(profilesUpdateData, {
        //   where: {
        //     uuid: profilesUpdateData.uuid,
        //     status: emr_constants.IS_ACTIVE,
        //     is_active: emr_constants.IS_ACTIVE
        //   }
        // });
        //const updatedProfilesData = await Promise.all(getProfilesUpdateData(user_uuid, profilesReqData))
        // if (updatingRecord && updatingRecord.length === 0) {
        //   return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: emr_constants.NO_CONTENT_MESSAGE });
        // }

        // const updatedProfilesData = await Promise.all([
        // profilesTbl.update(profilesUpdateData, { where: { uuid: profilesUpdateData.uuid } }),
        //sectionsTbl.update(sectionsUpdateData, { where: { uuid: sectionsUpdateData.uuid } }),

        //  ]);


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
        * Get All  valueTypes
        * @param {*} req 
        * @param {*} res 
        */
  const _getAllValueTypes = async (req, res) => {

    const { user_uuid } = req.headers;

    try {
      if (user_uuid) {
        const valuesData = await valueTypesTbl.findAll();
        return res.status(200).send({ code: httpStatus.OK, message: emr_constants.FETCHD_PROFILES_SUCCESSFULLY, responseContents: valuesData });
      }
      else {
        return res.status(422).send({ code: httpStatus[400], message: emr_constants.FETCHD_PROFILES_FAIL });
      }
    } catch (ex) {

      console.log(ex.message);
      return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
    }
  };
  /**
         * OPNotes main template save
         * @param {*} req 
         * @param {*} res 
         */
  const _addProfiles = async (req, res) => {

    const { user_uuid } = req.headers;
    let profiles = req.body;

    if (user_uuid) {

      profiles.is_active = profiles.status = true;
      profiles.created_by = profiles.modified_by = user_uuid;
      profiles.created_date = profiles.modified_date = new Date();
      profiles.revision = 1;

      try {
        const profileData = await sectionCategoryEntriesTbl.create(profiles, { returing: true });
        return res.status(200).send({ code: httpStatus.OK, message: 'inserted successfully', reqContents: req.body });

      }
      catch (ex) {
        console.log('Exception happened', ex);
        return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex });
      }
    } else {
      return res.status(400).send({ code: httpStatus.UNAUTHORIZED, message: emr_constants.NO_USER_ID });
    }

  };

  return {
    createProfileOpNotes: _createProfileOpNotes,
    getAllProfiles: _getAllProfiles,
    deleteProfiles: _deleteProfiles,
    getProfileById: _getProfileById,
    //updateProfiles: _updateProfiles,
    addProfiles: _addProfiles,
    getAllValueTypes: _getAllValueTypes



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
  const { profiles, sections, profilesSectionInfo, profilesSectionCategoryInfo, profileSectionCategoryConceptsInfo, profileSectionCategoryConceptValuesInfo } = req.body;
  return !checkSections(sections) &&
    !checkprofilesSectionInfo(profilesSectionInfo) &&
    !checkprofilesSectionCategoryInfo(profilesSectionCategoryInfo) &&
    !checkprofileSectionCategoryConceptsInfo(profileSectionCategoryConceptsInfo) &&
    !checkprofileSectionCategoryConceptValuesInfo(profileSectionCategoryConceptValuesInfo);

}

function checkSections(sections) {
  return sections && Array.isArray(sections) && sections.length > 0;
}

function checkprofilesSectionInfo(profilesSectionInfo) {
  return profilesSectionInfo && Array.isArray(profilesSectionInfo) && profilesSectionInfo.length > 0;
}


function checkprofilesSectionCategoryInfo(profilesSectionCategoryInfo) {
  return profilesSectionCategoryInfo && Array.isArray(profilesSectionCategoryInfo) && profilesSectionCategoryInfo.length > 0;
}

function checkprofileSectionCategoryConceptsInfo(profileSectionCategoryConceptsInfo) {
  return profileSectionCategoryConceptsInfo && Array.isArray(profileSectionCategoryConceptsInfo) && profileSectionCategoryConceptsInfo.length > 0;
}

function checkprofileSectionCategoryConceptValuesInfo(profileSectionCategoryConceptValuesInfo) {
  return profileSectionCategoryConceptValuesInfo && Array.isArray(profileSectionCategoryConceptValuesInfo) && profileSectionCategoryConceptValuesInfo.length > 0;
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

function getProfileDetailsData(profileList) {
  let profiles;
  let sections = [];
  let categoryList = [];
  let conceptsList = [];
  let valueTypesList = [];
  if (profileList.length > 0) {
    profiles = {
      profile_id: profileList[0].dataValues.p_uuid,
      profile_name: profileList[0].dataValues.p_profile_name,
      profile_code: profileList[0].dataValues.p_profile_code,
      profile_description: profileList[0].dataValues.p_profile_description,
      profile_type_uuid: profileList[0].dataValues.p_profile_type_uuid,
      facility_uuid: profileList[0].dataValues.p_facility_uuid,
      department_uuid: profileList[0].dataValues.p_department_uuid,
      status: profileList[0].dataValues.p_status,
      is_active: profileList[0].dataValues.p_is_active
    };

    profileList.forEach((pD) => {
      sections = [...sections,
      {
        section_uuid: pD.s_uuid,
        section_type_uuid: pD.s_section_type_uuid,
        section_note_type_uuid: pD.s_section_note_type_uuid,
        section_name: pD.s_name,
        section_description: pD.s_description,
        section_sref: pD.s_sref,
        section_display_order: pD.s_display_order,
        section_status: pD.s_status,
        section_is_active: pD.s_is_active[0] === 1 ? true : false,
        categoryList: [...categoryList,
        {
          category_code: pD.c_code,
          category_name: pD.c_name,
          category_description: pD.c_description,
          category_type_uuid: pD.c_category_type_uuid,
          category_description: pD.c_description,
          category_status: pD.c_status,
          category_is_active: pD.c_is_active[0] === 1 ? true : false,
          conceptsList: [...conceptsList,
          {
            concept_uuid: pD.pscc_uuid,
            concept_code: pD.pscc_code,
            concept_name: pD.pscc_name,
            pscc_value_type_uuid: pD.pscc_value_type_uuid,
            pscc_profile_section_category_uuid: pD.pscc_profile_section_category_uuid,
            pscc_description: pD.pscc_description,
            pscc_is_mandatory: pD.pscc_is_mandatory,
            pscc_is_multiple: pD.pscc_is_multiple,
            pscc_display_order: pD.pscc_display_order,
            pscc_status: pD.pscc_status,
            pscc_is_active: pD.pscc_is_active[0] === 1 ? true : false,
            valueTypesList: [...valueTypesList,
            {
              valueType_uuid: pD.psccv_uuid,
              concept_code: pD.psccv_profile_section_category_concept_uuid,
              value_code: pD.psccv_value_code,
              value_name: pD.psccv_value_name,
              psccv_display_order: pD.psccv_display_order,
              psccv_status: pD.psccv_status,
              psccv_is_active: pD.psccv_is_active[0] === 1 ? true : false
            }]
          }]
        }]
      }];
    });
    return { "profileDetails": profiles, "sectionList": sections };
  }
  else {
    return {};
  }
}
