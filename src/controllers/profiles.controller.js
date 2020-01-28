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
const profileSectionCategoriesTbl = db.profile_section_categories;
const profileSectionCategoryConceptsTbl = db.profile_section_category_concepts;
const profileSectionCategoryConceptValuesTbl = db.profile_section_category_concept_values;
const ProfilesViewTbl = db.vw_op_notes_details;
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
    let profilesSectionInfoDetails = [];
    //profileSectionDetails
    sectionsDetails.forEach((item, section_idx) => {
      let profilesSectionInfo = item.profilesSectionInfo;
      profilesSectionInfo.forEach((item, idx) => {
        profilesSectionInfoDetails = [...profilesSectionInfoDetails, {
          activity_uuid: item.activity_uuid,
          display_order: item.display_order
        }];
      });
    });

    //profilesSectionCategoryDetails
    let profilesSectionCategoryInfoDetails = [];
    sectionsDetails.forEach((item, section_idx) => {
      let profilesSectionInfo = item.profilesSectionInfo;
      profilesSectionInfo.forEach((caItem, caIdx) => {
        let profilesSectionCategoryInfo = caItem.profilesSectionCategoryInfo;
        profilesSectionCategoryInfo.forEach((item, idx) => {
          profilesSectionCategoryInfoDetails = [...profilesSectionCategoryInfoDetails, {
            display_order: item.display_order,
            category_uuid: profilesSectionCategoryInfo[caIdx].category_uuid
          }];
        });
      })
    });

    //profilesSectionCategoryConceptDetails
    let profilesSectionCategoryConceptInfoDetails = [];
    sectionsDetails.forEach((sItem, section_idx) => {
      let profilesSectionInfo = sItem.profilesSectionInfo;
      profilesSectionInfo.forEach((caItem, caIdx) => {
        let profilesSectionCategoryInfo = caItem.profilesSectionCategoryInfo;
        profilesSectionCategoryInfo.forEach((conItem, conIdx) => {
          let profileSectionCategoryConceptsInfo = conItem.profileSectionCategoryConceptsInfo;
          profileSectionCategoryConceptsInfo.forEach((item, idx) => {
            profilesSectionCategoryConceptInfoDetails = [...profilesSectionCategoryConceptInfoDetails, {
              code: item.code,
              name: item.name,
              description: item.description,
              value_type_uuid: item.value_type_uuid,
              is_multiple: item.is_multiple,
              is_mandatory: item.is_mandatory,
              display_order: item.display_order
            }];
          });
        })
      })
    });

    //profilesSectionCategoryConceptValuesDetails
    let profilesSectionCategoryConceptValuesInfoDetails = [];
    sectionsDetails.forEach((sItem, section_idx) => {
      let profilesSectionInfo = sItem.profilesSectionInfo;
      profilesSectionInfo.forEach((caItem, caIdx) => {
        let profilesSectionCategoryInfo = caItem.profilesSectionCategoryInfo;
        profilesSectionCategoryInfo.forEach((conItem, conIdx) => {
          let profileSectionCategoryConceptsInfo = conItem.profileSectionCategoryConceptsInfo;
          profileSectionCategoryConceptsInfo.forEach((vItem, idx) => {
            let profileSectionCategoryConceptValuesInfo = vItem.profileSectionCategoryConceptValuesInfo;
            profileSectionCategoryConceptValuesInfo.forEach((item, idx) => {
              profilesSectionCategoryConceptValuesInfoDetails = [...profilesSectionCategoryConceptValuesInfoDetails, {
                value_code: item.value_code,
                value_name: item.value_name,
                display_order: item.display_order,
                sectionIdx: section_idx
              }];
            });
          });
        });
      });
    });

    // creating profile 
    if (user_uuid && profiles.profile_code && profiles.profile_name) {
      // if (checkProfiles(req)) {
      //   return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: 'Please send userId and profile details' });
      // }
      try {
        let profileSave = [];
        // const duplicateProfilesRecord = await findDuplicateProfilesByCodeAndName(profiles);
        //   if (duplicateProfilesRecord && duplicateProfilesRecord.length > 0) {
        //        return res.status(400).send({ code: emr_constants.DUPLICATE_ENTRIE, message: getDuplicateMsg(duplicateProfilesRecord) });
        // }
        profiles = emr_utility.createIsActiveAndStatus(profiles, user_uuid);
        //Profiles save
        const createdProfileData = await profilesTbl.create(profiles, { returning: true });

        // Profile and Sections mapping
        profilesSectionInfoDetails.forEach((sItem, sIdx) => {
          sItem.profile_uuid = createdProfileData.uuid;
          sItem.section_uuid = sectionsDetails[sIdx].section_uuid;
          sItem = emr_utility.assignDefaultValuesAndUUIdToObject(sItem, profilesSectionInfoDetails, user_uuid);
        });
        console.log('profilesSectionInfoDetails==', profilesSectionInfoDetails);
        const createdProfileSectionData = await profileSectionsTbl.bulkCreate(profilesSectionInfoDetails, { returning: true });

        // Profile_Section_category mapping
        profilesSectionCategoryInfoDetails.forEach((cItem, cIdx) => {
          cItem.profile_section_uuid = createdProfileSectionData[cIdx].uuid;
          cItem = emr_utility.assignDefaultValuesAndUUIdToObject(cItem, profilesSectionCategoryInfoDetails, user_uuid);
        });
        const createdProfileSectionCategoryData = await profileSectionCategoriesTbl.bulkCreate(profilesSectionCategoryInfoDetails, { returning: true });

        // Profile_Section_category_concepts mapping
        profilesSectionCategoryConceptInfoDetails.forEach((cItem, cIdx) => {
          cItem.profile_section_category_uuid = createdProfileSectionCategoryData[cIdx].uuid;
          cItem = emr_utility.assignDefaultValuesAndUUIdToObject(cItem, profilesSectionCategoryConceptInfoDetails, user_uuid);
        });
        createdProfileSectionCategoryConceptData = await profileSectionCategoryConceptsTbl.bulkCreate(profilesSectionCategoryConceptInfoDetails, { returning: true });

        // Profile_Section_category_concept_Values mapping
        profilesSectionCategoryConceptValuesInfoDetails.forEach((vItem, vIdx) => {

          vItem.profile_section_category_concept_uuid = createdProfileSectionCategoryConceptData[vIdx].uuid;
          vItem = emr_utility.assignDefaultValuesAndUUIdToObject(vItem, profilesSectionCategoryConceptValuesInfoDetails, user_uuid);

        });
        profileSave = [...profileSave, profileSectionCategoryConceptValuesTbl.bulkCreate(profilesSectionCategoryConceptValuesInfoDetails, { returning: true })];

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
      console.log('user_uuid==', user_uuid);
      if (user_uuid) {
        const profilesData = await profilesTbl.findAll();
        console.log('profilesData==', profilesData);
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
    const { p_uuid, p_profile_code, profile_name, department_uuid } = req.query;
    if (user_uuid && p_uuid) {
      try {

        const profileData = await ProfilesViewTbl.findAll({
          where: { p_uuid: p_uuid },
          attributes: { "exclude": ['id', 'createdAt', 'updatedAt'] }
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
    //updateProfiles: _updateProfiles,
    // addProfiles: _addProfiles


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
    !checkprofileSectionCategoryConceptValuesInfo(profileSectionCategoryConceptValuesInfo);;

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
