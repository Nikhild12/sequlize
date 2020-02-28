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
const valueTypesTbl = db.value_types;
const profileSectionsTbl = db.profile_sections;
const profileSectionCategoriesTbl = db.profile_section_categories;
const profileSectionCategoryConceptsTbl = db.profile_section_category_concepts;
const profileSectionCategoryConceptValuesTbl = db.profile_section_category_concept_values;
const opProfilesViewTbl = db.vw_op_notes_details;
const sectionCategoryEntriesTbl = db.section_category_entries;
const sectionsTbl = db.sections;
const categoriesTbl = db.categories;
const profilesViewTbl = db.vw_profile;
const Q = require('q');

let page_no = 0;
let sort_order = "DESC";
let sort_field = "p_uuid";
let page_size = 10;
let offset;

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
              });
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
                  });
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

  const _getAllProfiles = async (req, res, next) => {
    try {
      const postData = req.body;
      let pageNo = 0;
      const itemsPerPage = postData.paginationSize ? postData.paginationSize : 10;
      let sortArr = ['p_uuid', 'DESC'];


      if (postData.pageNo) {
        let temp = parseInt(postData.pageNo);
        if (temp && (temp != NaN)) {
          pageNo = temp;
        }
      }
      const offset = pageNo * itemsPerPage;
      let fieldSplitArr = [];
      if (postData.sortField) {
        fieldSplitArr = postData.sortField.split('.');
        if (fieldSplitArr.length == 1) {
          sortArr[0] = postData.sortField;
        } else {
          for (let idx = 0; idx < fieldSplitArr.length; idx++) {
            const element = fieldSplitArr[idx];
            fieldSplitArr[idx] = element.replace(/\[\/?.+?\]/ig, '');
          }
          sortArr = fieldSplitArr;
        }
      }
      if (postData.sortOrder && ((postData.sortOrder.toLowerCase() == 'asc') || (postData.sortOrder.toLowerCase() == 'desc'))) {
        if ((fieldSplitArr.length == 1) || (fieldSplitArr.length == 0)) {
          sortArr[1] = postData.sortOrder;
        } else {
          sortArr.push(postData.sortOrder);
        }
      }
      let findQuery = {
        subQuery: false,
        offset: offset,
        limit: postData.paginationSize,
        order: [
          sortArr
        ],
        attributes: { "exclude": ['id', 'createdAt', 'updatedAt'] },
        where: {
          // p_status: 1,
        }
      };

      if (postData.search && /\S/.test(postData.search)) {
        findQuery.where[Op.or] = [
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('p_profile_name')), 'LIKE', '%' + postData.search.toLowerCase() + '%'),
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('p_profile_code')), 'LIKE', '%' + postData.search.toLowerCase() + '%'),

        ];
      }
      console.log('postData.codename==', postData.codename);
      if (postData.codename && /\S/.test(postData.codename)) {
        if (findQuery.where[Op.or]) {
          findQuery.where[Op.and] = [{
            [Op.or]: [
              Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('p_profile_code')), 'LIKE', '%' + postData.codename.toLowerCase()),
              Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('p_profile_name')), 'LIKE', '%' + postData.codename.toLowerCase()),
            ]
          }];
        } else {
          findQuery.where[Op.or] = [
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('p_profile_code')), 'LIKE', '%' + postData.codename.toLowerCase()),
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('p_profile_name')), 'LIKE', '%' + postData.codename.toLowerCase()),
          ];
        }
      }

      if (postData.departmentId && /\S/.test(postData.departmentId)) {
        // findQuery.where['p_department_uuid'] = postData.departmentId;      
        findQuery.where =
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('p_department_uuid')), 'LIKE', '%' + postData.departmentId);

      }
      if (postData.hasOwnProperty('status') && /\S/.test(postData.status)) {
        //findQuery.where['p_is_active'] = postData.status;
        findQuery.where = { p_is_active: postData.status };
      }
      await profilesViewTbl.findAndCountAll(findQuery)
        .then((data) => {
          return res
            .status(httpStatus.OK)
            .json({
              statusCode: 200,
              message: "Get Details Fetched successfully",
              req: '',
              responseContents: data.rows,
              totalRecords: data.count
            });
        })
        .catch(err => {
          return res
            .status(409)
            .json({
              statusCode: 409,
              error: err
            });
        });
    } catch (err) {
      const errorMsg = err.errors ? err.errors[0].message : err.message;
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({
          status: "error",
          msg: errorMsg
        });
    }
  };

  const _getAllProfiles_old = async (req, res) => {

    const { user_uuid } = req.headers;

    try {
      // let paginationSize = req.query.paginationSize;
      let { paginationSize, pageNo, sortField, sortOrder, departmentId, status, searchKey } = req.body;
      // pageNo = 0;
      if (paginationSize) {
        let records = parseInt(paginationSize);
        if (records && (records != NaN)) {
          paginationSize = records;
        }
      }
      let itemsPerPage = paginationSize ? paginationSize : 10;
      // let sortField = 'uuid';
      //let sortOrder = 'DESC';

      if (pageNo) {
        let temp = parseInt(pageNo);
        if (temp && (temp != NaN)) {
          pageNo = temp;
        }
        console.log('pageNo===', pageNo);
      }
      pageNo = pageNo ? pageNo : 0;
      const offset = pageNo * itemsPerPage;

      console.log('offset===', offset);
      if (sortField) {

        sortField = sortField;
      }

      if (sortOrder && ((sortOrder == 'ASC') || (sortOrder == 'DESC'))) {

        sortOrder = sortOrder;
      }

      let findQuery = {
        offset: offset,
        limit: itemsPerPage,
        order: [
          [sortField, sortOrder],
        ],
        where: { p_is_active: 1 }
      };

      if (sortField && /\S/.test(sortField)) {

        findQuery.where = {
          [Op.or]: [{
            profile_code: {
              [Op.like]: '%' + sortField + '%',
            },


          }, {
            profile_name: {
              [Op.like]: '%' + sortField + '%',
            },
          }

          ]
        };
      }

      if (typeof departmentId == 'string') {
        findQuery.where['d_uuid'] = parseInt(departmentId);
      }

      if (typeof status == 'boolean') {
        findQuery.where['p_status'] = status;
      }
      if (searchKey && /\S/.test(searchKey)) {
        Object.assign(findQuery.where, {
          [Op.or]: [
            {
              p_profile_code: {
                [Op.like]: '%' + searchKey + '%',
              }
            },
            {
              p_profile_name: {
                [Op.like]: '%' + searchKey + '%',
              }

            },
            {
              d_name: {
                [Op.like]: '%' + searchKey + '%',
              }
            },
            {
              p_status: {
                [Op.eq]: searchKey,
              }
            }

          ]
        });
      }


      if (user_uuid) {
        const profileData = await profilesViewTbl.findAndCountAll({ attributes: { "exclude": ['id', 'createdAt', 'updatedAt'] } }, findQuery,
        );
        if (profileData) {
          return res.status(200).send({ code: httpStatus.OK, message: 'Fetched profile Details successfully', count: profileData.count, responseContents: profileData.rows });
        }
      }
      else {
        return res.status(422).send({ code: httpStatus[400], message: emr_constants.NO_RECORD_FOUND });
      }
    } catch (ex) {

      console.log(ex.message);
      return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
    }
  };

  // delete profile details
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
  @param {} req
  @param {} res
  */
  const _getProfileById = async (req, res) => {

    const { user_uuid } = req.headers;
    const { profile_uuid } = req.query;
    if (user_uuid && profile_uuid) {
      try {
        const profileData = await profilesTbl.findAll({
          attributes: ['uuid', 'profile_code', 'profile_name', 'department_uuid', 'profile_description', 'department_uuid', 'profile_type_uuid'],
          where: { uuid: profile_uuid, is_active: 1, status: 1 },
          include: [
            {
              model: profileSectionsTbl,
              as: 'profile_sections',
              attributes: ['uuid', 'profile_uuid', 'section_uuid', 'activity_uuid', 'display_order'],
              where: { is_active: 1, status: 1 },
              include: [{
                model: sectionsTbl,
                as: 'sections',
                attributes: ['uuid', 'code', 'name', 'description', 'sref', 'section_type_uuid', 'section_note_type_uuid', 'display_order'],
                where: { is_active: 1, status: 1 },
              },
              {
                model: profileSectionCategoriesTbl,
                as: 'profile_section_categories',
                attributes: ['uuid', 'profile_section_uuid', 'category_uuid', 'display_order'],
                where: { is_active: 1, status: 1 },
                include: [{
                  model: categoriesTbl,
                  as: 'categories',
                  attributes: ['uuid', 'code', 'name', 'category_type_uuid', 'category_group_uuid', 'description'],
                  where: { is_active: 1, status: 1 },

                },
                {
                  model: profileSectionCategoryConceptsTbl,
                  as: 'profile_section_category_concepts',
                  attributes: ['uuid', 'code', 'name', 'profile_section_category_uuid', 'value_type_uuid', 'description', 'is_mandatory', 'display_order', 'is_multiple'],
                  where: { is_active: 1, status: 1 },
                  include: [{
                    model: profileSectionCategoryConceptValuesTbl,
                    as: 'profile_section_category_concept_values',
                    attributes: ['uuid', 'profile_section_category_concept_uuid', 'value_code', 'value_name'],
                    where: { is_active: 1, status: 1 },
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


  /**
      * update profiles
      * @param {*} req 
      * @param {*} res 
      */

  const _updateProfiles = async (req, res) => {
    const { user_uuid } = req.headers;
    const { profiles } = req.body;
    if (user_uuid && profiles) {
      try {
        let bulkUpdateProfileResponse = await bulkUpdateProfile(req.body);
        return res.send({ status: 'success', statusCode: 200, msg: 'success', responseContents: bulkUpdateProfileResponse });
      } catch (err) {
        return res.send({ status: 'error', statusCode: 400, msg: 'failed', error: err.message });
      }
    } else {
      return res.send({ status: 'error', statusCode: 400, msg: 'Authentication error or profile detail should not be empty' });
    }
  };

  const bulkUpdateProfile = async (req) => {
    var deferred = new Q.defer();
    var profileData = req;
    var profileDetailsUpdate = [];
    for (let i = 0; i < profileData.profiles.sections.length; i++) {
      const element = profileData.profiles.sections[i];
      profileDetailsUpdate.push(await profileSectionsTbl.update({ section_uuid: element.section_uuid, activity_uuid: element.activity_uuid, display_order: element.display_order }, { where: { uuid: element.profile_sections_uuid } }));

      for (let j = 0; j < profileData.profiles.sections[i].categories.length; j++) {
        const element = profileData.profiles.sections[i].categories[j];
        profileDetailsUpdate.push(await profileSectionCategoriesTbl.update({ category_uuid: element.category_uuid, display_order: element.display_order }, { where: { uuid: element.profile_section_categories_uuid } }));

        for (let k = 0; k < profileData.profiles.sections[i].categories[j].concepts.length; k++) {
          const element = profileData.profiles.sections[i].categories[j].concepts[k];
          profileDetailsUpdate.push(await profileSectionCategoryConceptsTbl.update({ code: element.code, name: element.name, description: element.description, value_type_bulkUpdateProfileuuid: element.value_type_uuid, is_multiple: element.is_multiple, is_mandatory: element.is_mandatory, display_order: element.display_order }, { where: { uuid: element.profile_section_category_concepts_uuid } }));

          for (let l = 0; l < profileData.profiles.sections[i].categories[j].concepts[k].conceptvalues.length; l++) {
            const element = profileData.profiles.sections[i].categories[j].concepts[k].conceptvalues[l];
            profileDetailsUpdate.push(await profileSectionCategoryConceptValuesTbl.update({ value_code: element.value_code, value_name: element.value_name, display_order: element.display_order }, { where: { uuid: element.profile_section_category_concept_values_uuid } }));
          }
        }
      }
    }
    if (profileDetailsUpdate.length > 0) {
      var response = await Q.allSettled(profileDetailsUpdate);
      if (response.length > 0) {
        var responseMsg = [];
        for (let i = 0; i < response.length; i++) {
          const element = response[i];
          if (element.state == "rejected") {
            responseMsg.push(element.reason);
          }
        }

        if (responseMsg.length == 0) {
          deferred.resolve({ status: 'success', statusCode: 200, msg: 'Updated successfully.', responseContents: response });
        } else {
          deferred.resolve({ status: 'error', statusCode: 400, msg: 'Not Updated.', responseContents: responseMsg });
        }
      }
    }
    return deferred.promise;
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
        const profileData = await sectionCategoryEntriesTbl.bulkCreate(profiles, { returing: true });
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
    updateProfiles: _updateProfiles,
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

