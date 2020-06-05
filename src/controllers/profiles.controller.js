//Package Import
const httpStatus = require("http-status");
//Sequelizer Import
const db = require('../config/sequelize');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
//EMR Constants Import
const emr_constants = require('../config/constants');

const emr_utility = require('../services/utility.service');

// Patient notes
const patNotesAtt = require('../attributes/patient_previous_notes_attributes');

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
const profilesTypesTbl = db.profile_types;

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




  const _createProfileOpNotes_old = async (req, res) => {
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

  const _createProfileOpNotes = async (req, res) => {
    const { user_uuid } = req.headers;
    let { profiles } = req.body;
    let sectionsDetails = profiles.sections;

    // creating profile
    if (user_uuid && profiles.profile_code && profiles.profile_name) {
      try {

        const duplicateProfileRecord = await findDuplicateProfilesByCodeAndName(
          profiles
        );
        if (duplicateProfileRecord && duplicateProfileRecord.length > 0) {
          return res.status(400).send({
            code: emr_constants.DUPLICATE_ENTRIE,
            message: getDuplicateMsg(duplicateProfileRecord)
          });
        }
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
      const getsearch = req.body;
      const { profile_type } = req.query;
      let pageNo = 0;
      const itemsPerPage = getsearch.paginationSize ? getsearch.paginationSize : 10;
      // let sortArr = ['p_created_date', 'DESC'];

      let sortField = 'p_created_date';
      let sortOrder = 'DESC';
      let sortArr = [sortField, sortOrder];
      if (getsearch.pageNo) {
        let temp = parseInt(getsearch.pageNo);
        if (temp && (temp != NaN)) {
          pageNo = temp;
        }
      }
      const offset = pageNo * itemsPerPage;
      let fieldSplitArr = [];
      if (getsearch.sortField) {
        if (getsearch.sortField == 'p_created_date') {
          getsearch.sortField = 'p_created_date';
        }
        fieldSplitArr = getsearch.sortField.split('.');
        if (fieldSplitArr.length == 1) {
          sortArr[0] = getsearch.sortField;
        } else {
          for (let idx = 0; idx < fieldSplitArr.length; idx++) {
            const element = fieldSplitArr[idx];
            fieldSplitArr[idx] = element.replace(/\[\/?.+?\]/ig, '');
          }
          sortArr = fieldSplitArr;
        }
      }
      if (getsearch.sortOrder && ((getsearch.sortOrder.toLowerCase() == 'asc') || (getsearch.sortOrder.toLowerCase() == 'desc'))) {
        if ((fieldSplitArr.length == 1) || (fieldSplitArr.length == 0)) {
          sortArr[1] = getsearch.sortOrder;
        } else {
          sortArr.push(getsearch.sortOrder);
        }
      }
      let findQuery = {
        subQuery: false,
        offset: offset,
        limit: itemsPerPage,
        where: { p_is_active: 1, p_status: 1, p_profile_type_uuid: profile_type },
        order: [
          sortArr
        ],
        // order: [
        //   [sortField, sortOrder],
        // ],
        attributes: { "exclude": ['id', 'createdAt', 'updatedAt'] },

      };

      console.log('findQuery===', findQuery);
      if (getsearch.search && /\S/.test(getsearch.search)) {
        findQuery.where[Op.or] = [
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_profile.p_profile_name')), 'LIKE', '%' + getsearch.search.toLowerCase() + '%'),
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_profile.p_profile_code')), 'LIKE', '%' + getsearch.search.toLowerCase() + '%'),

        ];
      }
      if (req.body.codename && /\S/.test(req.body.codename)) {
        if (findQuery.where[Op.or]) {
          findQuery.where[Op.and] = [{
            [Op.or]: [
              Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('p_profile_code')), 'LIKE', '%' + req.body.codename.toLowerCase() + '%'),
              Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('p_profile_name')), 'LIKE', '%' + req.body.codename.toLowerCase() + '%'),
            ]
          }];
        } else {
          findQuery.where[Op.or] = [
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('p_profile_code')), 'LIKE', '%' + req.body.codename.toLowerCase() + '%'),
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('p_profile_name')), 'LIKE', '%' + req.body.codename.toLowerCase() + '%'),
          ];
        }
      }
      // if (getsearch.codename && /\S/.test(getsearch.codename)) {
      //   Object.assign(findQuery.where, {
      //     [Op.or]: [
      //             Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('p_profile_code')), getsearch.codename.toLowerCase()),
      //             Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('p_profile_name')), getsearch.codename.toLowerCase())
      //           ]
      //   })
      //   // if (findQuery.where[Op.or]) {
      //   //   findQuery.where[Op.and] = [{
      //   //     [Op.or]: [
      //   //       Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('p_profile_code')), getsearch.codename.toLowerCase()),
      //   //       Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('p_profile_name')), getsearch.codename.toLowerCase())

      //   //     ]
      //   //   }];
      //   // } else {
      //   //   findQuery.where[Op.or] = [
      //   //     Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('p_profile_code')), getsearch.codename.toLowerCase()),
      //   //     Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('p_profile_name')), getsearch.codename.toLowerCase())

      //   //   ];
      //   // }
      // }
      if (getsearch.departmentId && /\S/.test(getsearch.departmentId)) {
        if (findQuery.where[Op.or]) {
          findQuery.where[Op.and] = [{
            [Op.or]: [Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_profile.p_department_uuid')), getsearch.departmentId)]
          }];
        } else {
          findQuery.where[Op.or] = [
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_profile.p_department_uuid')), getsearch.departmentId)
          ];
        }
      }

      if (getsearch.hasOwnProperty('status') && /\S/.test(getsearch.status)) {
        findQuery.where['p_is_active'] = getsearch.status;
        findQuery.where['p_status'] = getsearch.status;

      }
      console.log(">>>>>", JSON.stringify(findQuery));


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
    let findQuery = {
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
                model: valueTypesTbl,
                as: 'value_types',
                attributes: ['uuid', 'code', 'name', 'color', 'language', 'display_order', 'Is_default'],
                where: { is_active: 1, status: 1 },
              },
              // include: [
              {
                model: profileSectionCategoryConceptValuesTbl,
                as: 'profile_section_category_concept_values',
                attributes: ['uuid', 'profile_section_category_concept_uuid', 'value_code', 'value_name'],
                where: { is_active: 1, status: 1 },
              }]
              //],
            }]
          }]
        }]

    };
    let findQuery1 = {
      attributes: ['uuid', 'profile_code', 'profile_name', 'department_uuid', 'profile_description', 'department_uuid', 'profile_type_uuid'],
      where: { uuid: profile_uuid, is_active: 1, status: 1 },
      include: [
        {
          model: profileSectionsTbl,
          as: 'profile_sections',
          attributes: ['uuid', 'profile_uuid', 'section_uuid', 'activity_uuid', 'display_order'],
          where: { is_active: 1, status: 1 }
        }]

    };
    if (user_uuid && profile_uuid) {
      try {
        const profileData = await profilesTbl.findAll(findQuery);
        // if (profileData[0].profile_sections[0].activity_uuid > 0) {
        if (profileData.length == 0) {
          const profileData1 = await profilesTbl.findAll(findQuery1);
          return res.status(httpStatus.OK).send({ code: httpStatus.OK, message: 'get Success', responseContents: profileData1 });
        }
        else {
          return res.status(httpStatus.OK).send({ code: httpStatus.OK, message: 'get Success', responseContents: profileData });
        }
      } catch (ex) {

        console.log(`Exception Happened ${ex}`);
        return res.status(400).send({ code: httpStatus[400], message: ex.message });

      }
    } else {
      return res.status(400).send({ code: httpStatus[400], message: "No Request headers or request Found" });
    }

  };

  const _getProfileById1 = async (req, res) => {

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
                    model: valueTypesTbl,
                    as: 'value_types',
                    attributes: ['uuid', 'code', 'name', 'color', 'language', 'display_order', 'Is_default'],
                    where: { is_active: 1, status: 1 },
                  },
                  // include: [
                  {
                    model: profileSectionCategoryConceptValuesTbl,
                    as: 'profile_section_category_concept_values',
                    attributes: ['uuid', 'profile_section_category_concept_uuid', 'value_code', 'value_name'],
                    where: { is_active: 1, status: 1 },
                  }]
                  //],
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
      const element1 = profileData.profiles;
      profileDetailsUpdate.push(await profilesTbl.update({ profile_type_uuid: element1.profile_type_uuid, profile_code: element1.profile_code, profile_name: element1.profile_name, profile_description: element1.profile_description, facility_uuid: element1.facility_uuid, department_uuid: element1.department_uuid }, { where: { uuid: element1.profile_uuid } }));

      const element = profileData.profiles.sections[i];
      profileDetailsUpdate.push(await profileSectionsTbl.update({ section_uuid: element.section_uuid, activity_uuid: element.activity_uuid, display_order: element.display_order }, { where: { uuid: element.profile_sections_uuid } }));

      for (let j = 0; j < profileData.profiles.sections[i].categories.length; j++) {
        const element = profileData.profiles.sections[i].categories[j];
        profileDetailsUpdate.push(await profileSectionCategoriesTbl.update({ category_uuid: element.category_uuid, display_order: element.display_order }, { where: { uuid: element.profile_section_categories_uuid } }));

        for (let k = 0; k < profileData.profiles.sections[i].categories[j].concepts.length; k++) {
          const element = profileData.profiles.sections[i].categories[j].concepts[k];
          profileDetailsUpdate.push(await profileSectionCategoryConceptsTbl.update({ code: element.code, name: element.name, description: element.description, value_type_uuid: element.value_type_uuid, is_multiple: element.is_multiple, is_mandatory: element.is_mandatory, display_order: element.display_order }, { where: { uuid: element.profile_section_category_concepts_uuid } }));

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

  const bulkUpdateProfile1 = async (req) => {
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
        const typesData = await valueTypesTbl.findAll();
        return res.status(200).send({ code: httpStatus.OK, message: emr_constants.FETCHD_PROFILES_SUCCESSFULLY, responseContents: typesData });
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

  /**
       * Get All  valueTypes
       * @param {*} req 
       * @param {*} res 
       */
  const _getAllProfileNotesTypes = async (req, res) => {

    const { user_uuid } = req.headers;

    try {
      if (user_uuid) {
        const typesData = await profilesTypesTbl.findAll();
        return res.status(200).send({ code: httpStatus.OK, message: emr_constants.FETCHD_PROFILES_SUCCESSFULLY, responseContents: typesData });
      }
      else {
        return res.status(422).send({ code: httpStatus[400], message: emr_constants.FETCHD_PROFILES_FAIL });
      }
    } catch (ex) {

      console.log(ex.message);
      return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
    }
  };

  const _getPreviousPatientOPNotes = async (req, res) => {
    const { user_uuid } = req.headers;
    const { patient_uuid } = req.query;

    if (user_uuid && patient_uuid > 0) {
      try {

        const getOPNotesByPId = await sectionCategoryEntriesTbl.findAll({
          where: { patient_uuid, is_active: emr_constants.IS_ACTIVE, status: emr_constants.IS_ACTIVE },
          order: [["uuid", "desc"]],
          limit: 5,
          attributes: ['uuid', 'patient_uuid', 'encounter_uuid', 'encounter_type_uuid', 'encounter_doctor_uuid', 'consultation_uuid', 'profile_uuid', 'is_active', 'status', 'created_date', 'modified_by', 'created_by', 'modified_date'],
          include: [{
            model: profilesTbl,
            attributes: ['uuid', 'profile_code', 'profile_name', 'profile_description', 'facility_uuid', 'department_uuid', 'created_date']
          }]
        });
        // Code and Message for Response
        const code = emr_utility.getResponseCodeForSuccessRequest(getOPNotesByPId);
        const message = emr_utility.getResponseMessageForSuccessRequest(code, 'ppnd');
        const notesResponse = patNotesAtt.getPreviousPatientOPNotes(getOPNotesByPId);
        return res.status(200).send({ code: code, message, responseContents: notesResponse });


      } catch (error) {
        console.log('Exception happened', ex);
        return res.status(500).send({ code: httpStatus.INTERNAL_SERVER_ERROR, message: ex });
      }
    } else {
      return res.status(400).send({
        code: httpStatus[400], message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`
      });
    }
  };
  return {
    createProfileOpNotes: _createProfileOpNotes,
    getAllProfiles: _getAllProfiles,
    deleteProfiles: _deleteProfiles,
    getProfileById: _getProfileById,
    updateProfiles: _updateProfiles,
    addProfiles: _addProfiles,
    getAllValueTypes: _getAllValueTypes,
    getAllProfileNotesTypes: _getAllProfileNotesTypes,
    getPreviousPatientOPNotes: _getPreviousPatientOPNotes
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


async function findDuplicateProfileByCodeAndName({ profile_code, profile_name }) {
  // checking for Duplicate
  // before creating profile
  return await profilesTbl.findAll({
    attributes: ["profile_code", "profile_name", "is_active"],
    where: {
      [Op.or]: [{ profile_code: profile_code }, { profile_name: profile_name }]
    }
  });
}

function getDuplicateMsg(record) {
  return record[0].is_active
    ? emr_constants.DUPLICATE_ACTIVE_MSG
    : emr_constants.DUPLICATE_IN_ACTIVE_MSG;
}
