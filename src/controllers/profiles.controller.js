//Package Import
const httpStatus = require("http-status");
//Sequelizer Import
const db = require('../config/sequelize');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
//EMR Constants Import
const emr_constants = require('../config/constants');
const config = require('../config/config');
const emr_utility = require('../services/utility.service');
const appMasterData = require("../controllers/appMasterData");
// Patient notes
const patNotesAtt = require('../attributes/patient_previous_notes_attributes');

//Initialize profile opNotes
const profilesTbl = db.profiles;
const valueTypesTbl = db.value_types;
const profileSectionsTbl = db.profile_sections;
const profileSectionCategoriesTbl = db.profile_section_categories;
const profileSectionCategoryConceptsTbl = db.profile_section_category_concepts;
const profileSectionCategoryConceptValuesTbl = db.profile_section_category_concept_values;
const profileSectionCategoryConceptValueTermsTbl = db.profile_section_category_concept_value_terms;
const profileTypeTbl = db.profile_types;
const sectionCategoryEntriesTbl = db.section_category_entries;
const sectionsTbl = db.sections;
const categoriesTbl = db.categories;
const profilesViewTbl = db.vw_profile;
const profilesTypesTbl = db.profile_types;
const profilesDefaultTbl = db.profiles_default;
const conceptValueTermsTbl = db.concept_value_terms;
const section_category_entries_tbl = db.section_category_entries;
const {
  APPMASTER_GET_SCREEN_SETTINGS,
  APPMASTER_UPDATE_SCREEN_SETTINGS
} = emr_constants.DEPENDENCY_URLS;

const Q = require('q');

const profilesController = () => {
  /**
   * Creating  profile opNotes
   * @param {*} req 
   * @param {*} res 
   */
  const _createProfileOpNotes = async (req, res) => {
    const {
      user_uuid, authorization
    } = req.headers;
    let {
      profiles
    } = req.body;
    let sectionsDetails = profiles.sections;

    // creating profile
    if (user_uuid && profiles.profile_name) {
      try {
        const duplicateProfileRecord = await findDuplicateProfilesByCodeAndNameForAdd(
          profiles
        );
        if (duplicateProfileRecord && duplicateProfileRecord.length > 0) {
          return res.status(400).send({
            code: emr_constants.DUPLICATE_ENTRIE,
            message: getDuplicateMsg(duplicateProfileRecord)
          });
        }
        profiles.status = true;
        profiles.created_by = profiles.modified_by = user_uuid;
        profiles.created_date = profiles.modified_date = new Date();
        profiles.revision = emr_constants.IS_ACTIVE;
        let options = {
          uri: config.wso2AppUrl + APPMASTER_GET_SCREEN_SETTINGS,
          headers: {
            Authorization: authorization,
            user_uuid: user_uuid
          },
          body: {
            code: 'CLN'
          }
        };
        let profileSectionSave = [], CategorySave = [], profileSectionResponse = [], ConceptsSave = [], conceptValuesSave = [], conceptValueTermSave = [], screenSettings_output, conceptValuesResponse = [], conceptResponse = [], conceptValueTermResponse = [], categoriesResponse = [], replace_value;
        screenSettings_output = await emr_utility.postRequest(options.uri, options.headers, options.body);
        if (screenSettings_output) {
          replace_value = parseInt(screenSettings_output.suffix_current_value) + emr_constants.IS_ACTIVE;
          profiles.profile_code = screenSettings_output.prefix + replace_value;
        }
        const profileResponse = await profilesTbl.create(profiles);
        if (profileResponse) {
          let options_two = {
            uri: config.wso2AppUrl + APPMASTER_UPDATE_SCREEN_SETTINGS,
            headers: {
              Authorization: authorization,
              user_uuid: user_uuid
            },
            body: {
              screenId: screenSettings_output.uuid,
              suffix_current_value: replace_value
            }
          };
          await emr_utility.putRequest(options_two.uri, options_two.headers, options_two.body);
          // Profile and Sections mapping
          for (let i = 0; i < sectionsDetails.length; i++) {
            const element = sectionsDetails[i];
            profileSectionSave.push({
              profile_uuid: profileResponse.uuid,
              section_uuid: element.section_uuid,
              activity_uuid: element.activity_uuid,
              display_order: element.display_order,
              created_by: user_uuid
            });
          }
          if (profileSectionSave.length > 0) {
            profileSectionResponse = await profileSectionsTbl.bulkCreate(profileSectionSave);
            for (let i = 0; i < sectionsDetails.length; i++) {
              if (sectionsDetails[i] && sectionsDetails[i].categories && sectionsDetails[i].categories.length > 0) {
                for (let j = 0; j < sectionsDetails[i].categories.length; j++) {
                  const element = sectionsDetails[i].categories[j];
                  CategorySave.push({
                    profile_section_uuid: profileSectionResponse[i].uuid,
                    category_uuid: element.category_uuid,
                    display_order: element.display_order,
                    created_by: user_uuid
                  });
                }
              }
            }
            // profile_ Sections_categories mapping
            if (CategorySave.length > 0) {
              categoriesResponse = await profileSectionCategoriesTbl.bulkCreate(CategorySave);
              var index = 0;
              for (let i = 0; i < sectionsDetails.length; i++) {
                if (sectionsDetails[i].categories && sectionsDetails[i].categories.length > 0) {
                  for (let j = 0; j < sectionsDetails[i].categories.length; j++) {
                    index++;
                    if (sectionsDetails[i].categories[j].concepts && sectionsDetails[i].categories[j].concepts.length > 0) {
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
                          is_multiple: element.is_multiple,
                          created_by: user_uuid
                        });
                      }
                    }
                  }
                }
              }
              // profile_ Sections_categories_concepts mapping
              if (ConceptsSave.length > 0) {
                conceptResponse = await profileSectionCategoryConceptsTbl.bulkCreate(ConceptsSave);
                var index = 0;
                for (let i = 0; i < sectionsDetails.length; i++) {
                  if (sectionsDetails[i].categories && sectionsDetails[i].categories.length > 0) {
                    for (let j = 0; j < sectionsDetails[i].categories.length; j++) {
                      if (sectionsDetails[i].categories[j].concepts && sectionsDetails[i].categories[j].concepts.length > 0) {
                        for (let k = 0; k < sectionsDetails[i].categories[j].concepts.length; k++) {
                          index++;
                          if (sectionsDetails[i].categories[j].concepts[k].conceptvalues && sectionsDetails[i].categories[j].concepts[k].conceptvalues.length > 0) {
                            for (let l = 0; l < sectionsDetails[i].categories[j].concepts[k].conceptvalues.length; l++) {
                              const element = sectionsDetails[i].categories[j].concepts[k].conceptvalues[l];
                              conceptValuesSave.push({
                                profile_section_category_concept_uuid: conceptResponse[index - 1].uuid,
                                value_code: element.value_code,
                                value_name: element.value_name,
                                display_order: element.display_order,
                                is_defult: element.is_defult,
                                created_by: user_uuid
                              });
                            }
                          }
                        }
                      }
                    }
                  }
                }
                // profile_ Sections_categories_concept_values mapping
                if (conceptValuesSave.length > 0) {
                  conceptValuesResponse = await profileSectionCategoryConceptValuesTbl.bulkCreate(conceptValuesSave);
                  var index = 0;
                  for (let i = 0; i < sectionsDetails.length; i++) {
                    if (sectionsDetails[i].categories && sectionsDetails[i].categories.length > 0) {
                      for (let j = 0; j < sectionsDetails[i].categories.length; j++) {
                        if (sectionsDetails[i].categories[j].concepts && sectionsDetails[i].categories[j].concepts.length > 0) {
                          for (let k = 0; k < sectionsDetails[i].categories[j].concepts.length; k++) {
                            if (sectionsDetails[i].categories[j].concepts[k].conceptvalues && sectionsDetails[i].categories[j].concepts[k].conceptvalues.length > 0) {
                              for (let l = 0; l < sectionsDetails[i].categories[j].concepts[k].conceptvalues.length; l++) {
                                index++;
                                if (sectionsDetails[i].categories[j].concepts[k].conceptvalues[l].concept_value_terms && sectionsDetails[i].categories[j].concepts[k].conceptvalues[l].concept_value_terms.length > 0) {
                                  for (let m = 0; m < sectionsDetails[i].categories[j].concepts[k].conceptvalues[l].concept_value_terms.length; m++) {
                                    const element_term = sectionsDetails[i].categories[j].concepts[k].conceptvalues[l].concept_value_terms[m];
                                    conceptValueTermSave.push({
                                      profile_section_category_concept_values_uuid: conceptValuesResponse[index - 1].uuid,
                                      concept_value_terms_uuid: element_term.concept_value_terms_uuid,
                                      display_order: element_term.display_order,
                                      is_active: element_term.is_active,
                                      is_default: element_term.is_default,
                                      revision: element_term.revision,
                                      created_by: user_uuid
                                    });
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  // profile_ Sections_categories_concept_value_term mapping
                  if (conceptValueTermSave.length > 0) {
                    conceptValueTermResponse = await profileSectionCategoryConceptValueTermsTbl.bulkCreate(conceptValueTermSave);
                  }
                }
              }
            }
          }
          return res.status(200).send({
            code: httpStatus.OK,
            message: emr_constants.PROFILES_SUCCESS,
            responseContents: {
              profileResponse: profileResponse,
              profileSectionResponse: profileSectionResponse,
              categoriesResponse: categoriesResponse,
              conceptResponse: conceptResponse,
              conceptValuesResponse: conceptValuesResponse,
              conceptValueTermResponse: conceptValueTermResponse
            }
          });
        }
      } catch (ex) {
        return res.status(400).send({
          code: httpStatus.BAD_REQUEST,
          message: ex
        });
      }
    } else {
      return res.status(400).send({
        code: httpStatus[400],
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}`
      });
    }
  };

  // Get All the Profiles

  const _getAllProfiles = async (req, res, next) => {
    try {
      const getsearch = req.body;
      const {
        profile_type
      } = req.query;
      const {
        department_uuid
      } = req.query;
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
        where: {
          p_status: 1,
          // p_department_uuid: department_uuid
        },
        // where: { p_is_active: 1, p_status: 1, p_department_uuid: department_uuid },
        order: [
          sortArr
        ],
        // order: [
        //   [sortField, sortOrder],
        // ],
        attributes: {
          "exclude": ['id', 'createdAt', 'updatedAt']
        },

      };
      if (getsearch.department_uuid && /\S/.test(getsearch.department_uuid)) {
        findQuery.where = {
          p_department_uuid: department_uuid

        }
      }

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
      if (getsearch.noteTypeId && /\S/.test(getsearch.noteTypeId)) {
        if (findQuery.where[Op.or]) {
          findQuery.where[Op.and] = [{
            [Op.or]: [Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_profile.p_profile_type_uuid')), getsearch.noteTypeId)]
          }];
        } else {
          findQuery.where[Op.or] = [
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_profile.p_profile_type_uuid')), getsearch.noteTypeId)
          ];
        }
      }
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
        findQuery.where['p_status'] = 1;

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
    try {
      const {
        user_uuid
      } = req.headers;
      const {
        uuid
      } = req.body;

      const updatedProfilesData = {
        status: 0,
        is_active: 0,
        modified_by: user_uuid,
        modified_date: new Date()
      };
      let get_section_category_entries_data = await section_category_entries_tbl.findOne({
        where: {
          profile_uuid: uuid,
          status: 1
        }
      });
      if (get_section_category_entries_data && (get_section_category_entries_data != null || Object.keys(get_section_category_entries_data).length > 1)) {
        throw {
          error_type: "validation",
          errors: "The Profile is already mapped to the Patient"
        }
      }
      const data = await profilesTbl.update(updatedProfilesData, {
        where: {
          uuid: uuid
        }
      });
      if (data[0] == 0) {
        return res.status(400).send({
          code: httpStatus.OK,
          message: 'Not Deleted'
        });
      }
      return res.status(200).send({
        code: httpStatus.OK,
        message: 'Deleted Successfully'
      });

    }
    catch (err) {
      if (typeof err.error_type != 'undefined' && err.error_type == 'validation') {
        return res.status(400).json({ statusCode: 400, Error: err.errors, msg: "Validation error" });
      }
      const errorMsg = err.errors ? err.errors[0].message : err.message;
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({
          statusCode: 500,
          status: "error",
          message: errorMsg
        });
    }
  };

  const _getProfileById = async (req, res) => {
    try {
      const {
        user_uuid
      } = req.headers;
      const Authorization = req.headers.Authorization ? req.headers.Authorization : (req.headers.authorization ? req.headers.authorization : 0);
      const {
        profile_uuid
      } = req.query;
      let findQuery = {
        attributes: ['uuid', 'profile_code', 'profile_name', 'department_uuid', 'profile_description', 'department_uuid', 'profile_type_uuid', 'is_active', 'created_by', 'modified_by', 'created_date', 'modified_date'],
        where: {
          uuid: profile_uuid,
          is_active: 1,
          status: 1
        },
        include: [
          {
            model: profileSectionsTbl,
            as: 'profile_sections',
            attributes: ['uuid', 'profile_uuid', 'section_uuid', 'activity_uuid', 'display_order'],
            where: {
              is_active: 1,
              status: 1
            },
            required: false,
            include: [
              {
                model: sectionsTbl,
                as: 'sections',
                attributes: ['uuid', 'code', 'name', 'description', 'sref', 'section_type_uuid', 'section_note_type_uuid', 'display_order'],
                where: {
                  is_active: 1,
                  status: 1
                },
                required: false
              },
              {
                model: profileSectionCategoriesTbl,
                as: 'profile_section_categories',
                attributes: ['uuid', 'profile_section_uuid', 'category_uuid', 'display_order'],
                where: {
                  is_active: 1,
                  status: 1
                },
                required: false,
                include: [
                  {
                    model: categoriesTbl,
                    as: 'categories',
                    attributes: ['uuid', 'code', 'name', 'category_type_uuid', 'category_group_uuid', 'description'],
                    where: {
                      is_active: 1,
                      status: 1
                    },
                    required: false
                  },
                  {
                    model: profileSectionCategoryConceptsTbl,
                    as: 'profile_section_category_concepts',
                    attributes: ['uuid', 'code', 'name', 'profile_section_category_uuid', 'value_type_uuid', 'description', 'is_mandatory', 'display_order', 'is_multiple'],
                    where: {
                      is_active: 1
                    },
                    required: false,
                    include: [
                      {
                        model: valueTypesTbl,
                        as: 'value_types',
                        attributes: ['uuid', 'code', 'name', 'color', 'language', 'display_order', 'Is_default'],
                        where: {
                          is_active: 1,
                          status: 1
                        },
                        required: false
                      },
                      {
                        model: profileSectionCategoryConceptValuesTbl,
                        as: 'profile_section_category_concept_values',
                        attributes: ['uuid', 'profile_section_category_concept_uuid', 'value_code', 'value_name', 'is_defult', 'display_order'],
                        where: {
                          is_active: 1,
                          status: 1
                        },
                        required: false,
                        include: [
                          {
                            model: profileSectionCategoryConceptValueTermsTbl,
                            as: "profile_section_category_concept_value_terms",
                            attributes: ['uuid', 'profile_section_category_concept_values_uuid', 'concept_value_terms_uuid', 'display_order', 'is_default', 'is_active'],
                            required: false,
                            include: [
                              { model: conceptValueTermsTbl, required: false, attributes: ['uuid', 'code', 'name'] }
                            ]
                          }
                        ]
                      }]
                  }]
              }]
          },
          {
            model: profileTypeTbl,
            required: false,
            attributes: ['uuid', 'code', 'name'],
          }
        ],
        order: [
          [profileSectionsTbl, profileSectionCategoriesTbl, profileSectionCategoryConceptsTbl, 'uuid', 'ASC']
        ]
      };
      const profileData = await profilesTbl.findAll(findQuery);
      /**Get department name */
      let departmentIds = [...new Set(profileData.map(e => e.department_uuid))];
      const departmentsResponse = await appMasterData.getDepartments(user_uuid, Authorization, departmentIds);
      if (departmentsResponse) {
        let data = [];
        const resData = departmentsResponse.responseContent.rows;
        resData.forEach(e => {
          data[e.uuid] = e.name;
          data[e.name] = e.code;
        });
        profileData.forEach(e => {
          const department_uuid = e.dataValues.department_uuid;
          e.dataValues.department_name = (data[department_uuid] ? data[department_uuid] : null);
        });
      }
      /**Get user name */
      let doctorIds = [...new Set(profileData.map(e => e.created_by))];
      let modifiedIds = [...new Set(profileData.map(e => e.modified_by))];
      let userIds = [...doctorIds, ...modifiedIds];
      const doctorResponse = await appMasterData.getDoctorDetails(user_uuid, Authorization, userIds);
      if (doctorResponse && doctorResponse.responseContents) {
        let newData = [];
        const resData = doctorResponse.responseContents;
        resData.forEach(e => {
          let last_name = (e.last_name ? e.last_name : '');
          newData[e.uuid] = e.first_name + '' + last_name;
        });
        profileData.forEach(e => {
          const {
            created_by,
            modified_by,
          } = e.dataValues;
          e.dataValues.created_user_name = (newData[created_by] ? newData[created_by] : null);
          e.dataValues.modified_user_name = (newData[modified_by] ? newData[modified_by] : null);
        });
      }
      // if (profileData[0].profile_sections[0].activity_uuid > 0) {
      // if (profileData.length == 0) {
      //   const profileData1 = await profilesTbl.findAll(findQuery1);
      //   return res.status(httpStatus.OK).send({ code: httpStatus.OK, message: 'get Success', responseContents: profileData1 });
      // }
      //else {
      return res.status(httpStatus.OK).send({
        code: httpStatus.OK,
        message: 'get Success',
        responseContents: profileData
      });
      //   }
    } catch (ex) {
      console.log(`Exception Happened ${ex}`);
      return res.status(400).send({
        code: httpStatus[400],
        message: ex.message
      });

    }
  };
  const _updateProfiles = async (req, res) => {
    const {
      user_uuid
    } = req.headers;
    const {
      profiles,
      deletedHeadings,
      deletedSubheadings,
      deletedFieldInfo,
      deletedTerms,
      deletedConceptTermValues
    } = req.body;
    let duplicateCount = 0;
    let duplicateConceptCount = 0;
    let duplicateConceptValuesCount = 0;
    let profileConcepts = [];
    let profileConceptValues = [];
    if (user_uuid) {
      const duplicateProfileRecord = await findDuplicateProfilesByCodeAndNameForUpdate(
        profiles
      );
      if (duplicateProfileRecord && duplicateProfileRecord.length > 0) {
        return res.status(400).send({
          statusCode: 400,
          code: emr_constants.DUPLICATE_ENTRIE,
          message: getDuplicateMsg(duplicateProfileRecord)
        });
      }
      if (profiles) {
        bulkUpdateProfileResponse = await bulkUpdateProfile(req.body, user_uuid);
      }
      if (deletedHeadings && deletedHeadings.length > 0) {
        for (let dh of deletedHeadings) {
          if (dh.profile_sections_uuid) {
            await profileSectionsTbl.update({
              status: 0,
              modified_by: user_uuid
            }, {
              where: {
                uuid: dh.profile_sections_uuid
              }
            });
          }
        }
      }
      if (deletedSubheadings && deletedSubheadings.length > 0) {
        for (let dsh of deletedSubheadings) {
          if (dsh.profile_section_categories_uuid) {
            await profileSectionCategoriesTbl.update({
              status: 0,
              modified_by: user_uuid
            }, {
              where: {
                uuid: dsh.profile_section_categories_uuid
              }
            });
          }
        }
      }
      // Delete profile Section Category Concepts
      if (deletedFieldInfo && deletedFieldInfo.length > 0) {
        for (let dfi of deletedFieldInfo) {
          if (dfi.profile_section_category_concepts_uuid) {
            await profileSectionCategoryConceptsTbl.update({
              status: 0,
              modified_by: user_uuid
            }, {
              where: {
                uuid: dfi.profile_section_category_concepts_uuid
              }
            });
          }
        }
      }
      // Delete profile Section Category Concepts values
      if (deletedTerms && deletedTerms.length > 0) {
        for (let dtk of deletedTerms) {
          if (dtk.profile_section_category_concept_values_uuid) {
            await profileSectionCategoryConceptValuesTbl.update({
              status: 0,
              modified_by: user_uuid
            }, {
              where: {
                uuid: dtk.profile_section_category_concept_values_uuid
              }
            });
          }
        }
      }
      // Delete profile Section Category Concepts value term
      if (deletedConceptTermValues && deletedConceptTermValues.length > 0) {
        for (let dctv of deletedConceptTermValues) {
          if (dctv.profile_section_category_concept_value_terms_uuid) {
            await profileSectionCategoryConceptValueTermsTbl.update({
              status: 0,
              modified_by: user_uuid
            }, {
              where: {
                uuid: dctv.profile_section_category_concept_value_terms_uuid
              }
            });
          }
        }
      }
      try {
        return res.send({
          status: 'success',
          statusCode: 200,
          msg: 'success',
          responseContents: bulkUpdateProfileResponse
        });
      } catch (err) {
        return res.send({
          status: 'error',
          statusCode: 400,
          msg: 'failed',
          error: err.message
        });
      }
    } else {
      return res.send({
        status: 'error',
        statusCode: 400,
        msg: 'Authentication error'
      });
    }
  };

  const bulkUpdateProfile = async (req, user_uuid) => {
    var deferred = new Q.defer();
    var profileData = req;
    var profileDetailsUpdate = [];
    var sectionsResponse = [];
    var categoryResponse = [];
    var conceptsResponse = [];
    var conceptValuesResponse = [];
    var conceptValueTermsResponse = [];
    var element3 = {};
    var element2 = {};
    for (let i = 0; i < profileData.profiles.sections.length; i++) {
      const element1 = profileData.profiles;
      profileDetailsUpdate.push(await profilesTbl.update({
        profile_type_uuid: element1.profile_type_uuid,
        // profile_code: element1.profile_code,
        profile_name: element1.profile_name,
        profile_description: element1.profile_description,
        facility_uuid: element1.facility_uuid,
        department_uuid: element1.department_uuid,
        is_active: element1.is_active,
        modified_by: user_uuid
      }, {
        where: {
          uuid: element1.profile_uuid
        }
      }));

      const element = profileData.profiles.sections[i];
      if (element.profile_sections_uuid) {
        profileDetailsUpdate.push(await profileSectionsTbl.update({
          section_uuid: element.section_uuid,
          activity_uuid: element.activity_uuid,
          display_order: element.display_order,
          modified_by: user_uuid
        }, {
          where: {
            uuid: element.profile_sections_uuid
          }
        }));
      } else {
        let elementArr3 = [];
        elementArr3.push({
          profile_uuid: profileData.profiles.profile_uuid,
          section_uuid: element.section_uuid,
          activity_uuid: element.activity_uuid,
          display_order: element.display_order,
          created_by: user_uuid
        });
        sectionsResponse = await profileSectionsTbl.bulkCreate(elementArr3);
      }
      if (profileData.profiles.sections[i].categories && profileData.profiles.sections[i].categories.length > 0) {
        for (let j = 0; j < profileData.profiles.sections[i].categories.length; j++) {
          element2 = profileData.profiles.sections[i].categories[j];
          if (element2.profile_section_categories_uuid) {
            profileDetailsUpdate.push(await profileSectionCategoriesTbl.update({
              category_uuid: element2.category_uuid,
              display_order: element2.display_order,
              modified_by: user_uuid
            }, {
              where: {
                uuid: element2.profile_section_categories_uuid
              }
            }));
          }
          else if (element.profile_sections_uuid) {
            let elementArrsection = [];
            var index = 0;
            elementArrsection.push({
              profile_section_uuid: element.profile_sections_uuid,
              category_uuid: element2.category_uuid,
              display_order: element2.display_order,
              created_by: user_uuid
            });
            categoryResponse = await profileSectionCategoriesTbl.bulkCreate(elementArrsection);
          }
          else {
            let elementArr2 = [];
            // elementArr2.push(element);
            var index = 0;
            elementArr2.push({
              profile_section_uuid: sectionsResponse[0].uuid,
              category_uuid: element2.category_uuid,
              display_order: element2.display_order,
              created_by: user_uuid
            });
            categoryResponse = await profileSectionCategoriesTbl.bulkCreate(elementArr2);
          }
          if (profileData.profiles.sections[i].categories[j].concepts && profileData.profiles.sections[i].categories[j].concepts.length > 0) {
            for (let k = 0; k < profileData.profiles.sections[i].categories[j].concepts.length; k++) {
              element3 = profileData.profiles.sections[i].categories[j].concepts[k];
              if (element3.profile_section_category_concepts_uuid) {
                // let getDuplication = await conceptDuplicationByCodeAndName(element3, element3.profile_section_category_concepts_uuid);
                // if (getDuplication) {
                //   return res.status(400).send({
                //     statusCode: 400,
                //     code: emr_constants.DUPLICATE_ENTRIE,
                //     message: "concept already exists"
                //   });
                // }
                profileDetailsUpdate.push(await profileSectionCategoryConceptsTbl.update({
                  code: element3.code,
                  name: element3.name,
                  description: element3.description,
                  value_type_uuid: element3.value_type_uuid,
                  is_multiple: element3.is_multiple,
                  is_mandatory: element3.is_mandatory,
                  display_order: element3.display_order,
                  modified_by: user_uuid
                }, {
                  where: {
                    uuid: element3.profile_section_category_concepts_uuid
                  }
                }));

              }
              else if (element2.profile_section_categories_uuid) {
                let elementArr_2 = [];
                var index = 0;
                elementArr_2.push({
                  profile_section_category_uuid: element2.profile_section_categories_uuid,
                  code: element3.code,
                  name: element3.name,
                  description: element3.description,
                  value_type_uuid: element3.value_type_uuid,
                  is_mandatory: element3.is_mandatory,
                  display_order: element3.display_order,
                  is_multiple: element3.is_multiple,
                  created_by: user_uuid
                });
                conceptsResponse = await profileSectionCategoryConceptsTbl.bulkCreate(elementArr_2);
              }
              else {
                let elementArr1 = [];
                var index = 0;
                elementArr1.push({
                  profile_section_category_uuid: categoryResponse[0].uuid,
                  code: element3.code,
                  name: element3.name,
                  description: element3.description,
                  value_type_uuid: element3.value_type_uuid,
                  is_mandatory: element3.is_mandatory,
                  display_order: element3.display_order,
                  is_multiple: element3.is_multiple,
                  created_by: user_uuid
                });
                conceptsResponse = await profileSectionCategoryConceptsTbl.bulkCreate(elementArr1);
              }
              if (profileData.profiles.sections[i].categories[j].concepts[k].conceptvalues && profileData.profiles.sections[i].categories[j].concepts[k].conceptvalues.length > 0) {
                for (let l = 0; l < profileData.profiles.sections[i].categories[j].concepts[k].conceptvalues.length; l++) {
                  const element4 = profileData.profiles.sections[i].categories[j].concepts[k].conceptvalues[l];
                  if (element4.profile_section_category_concept_values_uuid) {
                    profileDetailsUpdate.push(await profileSectionCategoryConceptValuesTbl.update({
                      value_code: element4.value_code,
                      value_name: element4.value_name,
                      display_order: element4.display_order,
                      is_defult: element4.is_defult,
                      modified_by: user_uuid
                    }, {
                      where: {
                        uuid: element4.profile_section_category_concept_values_uuid
                      }
                    }));
                  }
                  else if (element3.profile_section_category_concepts_uuid) {
                    let elementArr_3 = [];
                    elementArr_3.push({
                      profile_section_category_concept_uuid: element3.profile_section_category_concepts_uuid,
                      value_code: element4.value_code,
                      value_name: element4.value_name,
                      display_order: element4.display_order,
                      is_defult: element4.is_defult,
                      created_by: user_uuid
                    });
                    conceptValuesResponse = await profileSectionCategoryConceptValuesTbl.bulkCreate(elementArr_3);
                  }
                  else if (conceptsResponse && (conceptsResponse[0] != undefined)) {
                    let elementArr = [];
                    elementArr.push({
                      profile_section_category_concept_uuid: conceptsResponse[0].uuid,
                      value_code: element4.value_code,
                      value_name: element4.value_name,
                      display_order: element4.display_order,
                      is_defult: element4.is_defult,
                      created_by: user_uuid
                    });
                    conceptValuesResponse = await profileSectionCategoryConceptValuesTbl.bulkCreate(elementArr);
                  }
                  else {
                    let elementArray = [];
                    elementArray.push({
                      profile_section_category_concept_uuid: conceptsResponse[0].uuid,
                      value_code: element4.value_code,
                      value_name: element4.value_name,
                      display_order: element4.display_order,
                      is_defult: element4.is_defult,
                      created_by: user_uuid
                    });
                    conceptValuesResponse = await profileSectionCategoryConceptValuesTbl.bulkCreate(elementArray);
                  }
                  if (profileData.profiles.sections[i].categories[j].concepts[k].conceptvalues[l].concept_value_terms && profileData.profiles.sections[i].categories[j].concepts[k].conceptvalues[l].concept_value_terms.length > 0) {
                    for (let m = 0; m < profileData.profiles.sections[i].categories[j].concepts[k].conceptvalues[l].concept_value_terms.length; m++) {
                      const element5 = profileData.profiles.sections[i].categories[j].concepts[k].conceptvalues[l].concept_value_terms[m];
                      if (element5.profile_section_category_concept_value_terms_uuid) {
                        profileDetailsUpdate.push(await profileSectionCategoryConceptValueTermsTbl.update({
                          profile_section_category_concept_values_uuid: element5.profile_section_category_concept_values_uuid,
                          concept_value_terms_uuid: element5.concept_value_terms_uuid,
                          display_order: element5.display_order,
                          is_default: element5.is_default,
                          is_active: element5.is_active,
                          revision: element5.revision,
                          modified_by: user_uuid
                        }, {
                          where: {
                            uuid: element5.profile_section_category_concept_value_terms_uuid
                          }
                        }));
                      }
                      else if (element4.profile_section_category_concept_values_uuid) {
                        let conceptValueTermSave = [];
                        conceptValueTermSave.push({
                          profile_section_category_concept_values_uuid: element4.profile_section_category_concept_values_uuid,
                          concept_value_terms_uuid: element5.concept_value_terms_uuid,
                          display_order: element5.display_order,
                          is_active: element5.is_active,
                          is_default: element5.is_default,
                          revision: element5.revision,
                          created_by: user_uuid
                        });
                        conceptValueTermsResponse = await profileSectionCategoryConceptValueTermsTbl.bulkCreate(conceptValueTermSave);
                      }
                      else if (conceptValuesResponse && (conceptValuesResponse[0] != undefined)) {
                        let elementArr_term = [];
                        elementArr_term.push({
                          profile_section_category_concept_values_uuid: conceptValuesResponse[0].uuid,
                          concept_value_terms_uuid: element5.concept_value_terms_uuid,
                          display_order: element5.display_order,
                          is_active: element5.is_active,
                          is_default: element5.is_default,
                          revision: element5.revision,
                          created_by: user_uuid
                        });
                        conceptValueTermsResponse = await profileSectionCategoryConceptValueTermsTbl.bulkCreate(elementArr_term);
                      }
                      // else {
                      //   let elementArr_term2 = [];
                      //   elementArr_term2.push({
                      //     profile_section_category_concept_values_uuid: conceptValuesResponse[0].uuid,
                      //     concept_value_terms_uuid: element5.concept_value_terms_uuid,
                      //     display_order: element5.display_order,
                      //     is_active: element5.is_active,
                      //     is_default: element5.is_default,
                      //     revision: element5.revision,
                      //     created_by: user_uuid
                      //   });
                      //   conceptValueTermsResponse = await profileSectionCategoryConceptValueTermsTbl.bulkCreate(elementArr_term2);
                      // }
                    }
                  }
                }
              }
            }
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
          deferred.resolve({
            status: 'success',
            statusCode: 200,
            msg: 'Updated successfully.',
            responseContents: response
          });
        } else {
          deferred.resolve({
            status: 'error',
            statusCode: 400,
            msg: 'Not Updated.',
            responseContents: responseMsg
          });
        }
      }
    }
    return deferred.promise;
  };

  const bulkUpdateProfiles1 = async (req) => {
    var deferred = new Q.defer();
    var profileData = req;
    var profileDetailsUpdate = [];
    var sectionsResponse = [];
    var categoryResponse = [];
    var conceptsResponse = [];
    for (let i = 0; i < profileData.profiles.sections.length; i++) {
      const element1 = profileData.profiles;
      profileDetailsUpdate.push(await profilesTbl.update({
        profile_type_uuid: element1.profile_type_uuid,
        profile_code: element1.profile_code,
        profile_name: element1.profile_name,
        profile_description: element1.profile_description,
        facility_uuid: element1.facility_uuid,
        department_uuid: element1.department_uuid
      }, {
        where: {
          uuid: element1.profile_uuid
        }
      }));

      const element = profileData.profiles.sections[i];
      if (element.profile_sections_uuid) {
        profileDetailsUpdate.push(await profileSectionsTbl.update({
          section_uuid: element.section_uuid,
          activity_uuid: element.activity_uuid,
          display_order: element.display_order
        }, {
          where: {
            uuid: element.profile_sections_uuid
          }
        }));
      } else {
        let elementArr3 = [];
        // elementArr3.push(element);
        elementArr3.push({
          profile_uuid: profileData.profiles.profile_uuid,
          section_uuid: element.section_uuid,
          activity_uuid: element.activity_uuid,
          display_order: element.display_order
        });
        sectionsResponse = await profileSectionsTbl.bulkCreate(elementArr3);
      }
      for (let j = 0; j < profileData.profiles.sections[i].categories.length; j++) {
        const element = profileData.profiles.sections[i].categories[j];
        if (element.profile_section_categories_uuid) {
          profileDetailsUpdate.push(await profileSectionCategoriesTbl.update({
            category_uuid: element.category_uuid,
            display_order: element.display_order
          }, {
            where: {
              uuid: element.profile_section_categories_uuid
            }
          }));
        } else {
          let elementArr2 = [];
          // elementArr2.push(element);
          elementArr2.push({
            profile_section_uuid: sectionsResponse[0].uuid,
            category_uuid: element.category_uuid,
            display_order: element.display_order
          });
          categoryResponse = await profileSectionCategoriesTbl.bulkCreate(elementArr2);
        }
        for (let k = 0; k < profileData.profiles.sections[i].categories[j].concepts.length; k++) {
          const element = profileData.profiles.sections[i].categories[j].concepts[k];
          if (element.profile_section_category_concepts_uuid) {
            profileDetailsUpdate.push(await profileSectionCategoryConceptsTbl.update({
              code: element.code,
              name: element.name,
              description: element.description,
              value_type_uuid: element.value_type_uuid,
              is_multiple: element.is_multiple,
              is_mandatory: element.is_mandatory,
              display_order: element.display_order
            }, {
              where: {
                uuid: element.profile_section_category_concepts_uuid
              }
            }));
          } else {
            let elementArr1 = [];
            // elementArr1.push(element);
            var index = 0;
            elementArr1.push({
              profile_section_category_uuid: categoryResponse[0].uuid,
              code: element.code,
              name: element.name,
              description: element.description,
              value_type_uuid: element.value_type_uuid,
              is_mandatory: element.is_mandatory,
              display_order: element.display_order,
              is_multiple: element.is_multiple
            });
            conceptsResponse = await profileSectionCategoryConceptsTbl.bulkCreate(elementArr1);
          }
          for (let l = 0; l < profileData.profiles.sections[i].categories[j].concepts[k].conceptvalues.length; l++) {
            const element = profileData.profiles.sections[i].categories[j].concepts[k].conceptvalues[l];
            if (element.profile_section_category_concept_values_uuid) {
              profileDetailsUpdate.push(await profileSectionCategoryConceptValuesTbl.update({
                value_code: element.value_code,
                value_name: element.value_name,
                display_order: element.display_order
              }, {
                where: {
                  uuid: element.profile_section_category_concept_values_uuid
                }
              }));
            } else {
              let elementArr = [];
              // elementArr.push(element);
              elementArr.push({
                profile_section_category_concept_uuid: conceptsResponse[0].uuid,
                value_code: element.value_code,
                value_name: element.value_name,
                display_order: element.display_order
              });
              var conceptValuesResponse = await profileSectionCategoryConceptValuesTbl.bulkCreate(elementArr);
            }
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
          deferred.resolve({
            status: 'success',
            statusCode: 200,
            msg: 'Updated successfully.',
            responseContents: response
          });
        } else {
          deferred.resolve({
            status: 'error',
            statusCode: 400,
            msg: 'Not Updated.',
            responseContents: responseMsg
          });
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
    const {
      user_uuid
    } = req.headers;
    try {
      if (user_uuid) {
        let findquery = {
          where: {
            is_active: 1,
            status: 1
          }
        };
        const typesData = await valueTypesTbl.findAll(findquery);
        return res.status(200).send({
          code: httpStatus.OK,
          message: emr_constants.FETCHD_PROFILES_SUCCESSFULLY,
          responseContents: typesData
        });
      } else {
        return res.status(422).send({
          code: httpStatus[400],
          message: emr_constants.FETCHD_PROFILES_FAIL
        });
      }
    } catch (ex) {

      console.log(ex.message);
      return res.status(400).send({
        code: httpStatus.BAD_REQUEST,
        message: ex.message
      });
    }
  };

  /**
   * Get All notes types
   * @param {*} req 
   * @param {*} res 
   */
  const _getAllProfileNotesTypes = async (req, res) => {

    const {
      user_uuid
    } = req.headers;
    const {
      search
    } = req.body;
    try {
      if (user_uuid) {
        let findquery = {
          where: {
            is_active: 1,
            status: 1
          },
        }
        if (search && /\S/.test(search)) {
          findquery.where[Op.or] = [
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('profile_types.code')), 'LIKE', '%' + search.toLowerCase() + '%'),
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('profile_types.name')), 'LIKE', '%' + search.toLowerCase() + '%'),

          ];
        }
        const typesData = await profilesTypesTbl.findAll(findquery);
        return res.status(200).send({
          code: httpStatus.OK,
          message: emr_constants.FETCHD_PROFILES_SUCCESSFULLY,
          responseContents: typesData
        });
      } else {
        return res.status(422).send({
          code: httpStatus[400],
          message: emr_constants.FETCHD_PROFILES_FAIL
        });
      }
    } catch (ex) {

      console.log(ex.message);
      return res.status(400).send({
        code: httpStatus.BAD_REQUEST,
        message: ex.message
      });
    }
  };

  /**
   * Get profile default data
   * @param {*} req 
   * @param {*} res 
   */
  const _getDefaultProfiles = async (req, res) => {
    const {
      user_uuid
    } = req.headers;
    const {
      profile_type_uuid,
      user_uuid: user_uuid1,
      facility_uuid,
      department_uuid,
      profile_uuid
    } = req.query;
    let whereCond = {
      where: {
        profile_type_uuid: profile_type_uuid,
        // profile_uuid: profile_uuid,
        is_active: emr_constants.IS_ACTIVE,
        status: emr_constants.IS_ACTIVE
      }
    };
    if (user_uuid1 && /\S/.test(user_uuid1)) {
      Object.assign(whereCond.where, {
        user_uuid: user_uuid1
      });
    }
    if (profile_uuid && /\S/.test(profile_uuid)) {
      Object.assign(whereCond.where, {
        profile_uuid: profile_uuid
      });
    }
    if (facility_uuid && /\S/.test(facility_uuid)) {
      Object.assign(whereCond.where, {
        facility_uuid: facility_uuid
      });
    }
    if (department_uuid && /\S/.test(department_uuid)) {
      Object.assign(whereCond.where, {
        department_uuid: department_uuid
      });
    }
    try {
      if (user_uuid) {
        const result = await profilesDefaultTbl.findOne(whereCond, {
          returning: true
        });
        // if (result != null && IsObjectEmpty(result)) {
        if (result != null) {

          return res.status(200).send({
            statusCode: 200,
            message: emr_constants.FETCHED_SUCCESSFULLY,
            responseContent: result
          });
        } else {
          return res.status(200).send({
            statusCode: 200,
            message: "No record found "
          });
        }
      } else {
        return res.status(422).send({
          statusCode: 422,
          req: req.body,
          message: "user_uuid required"
        });
      }
    } catch (ex) {
      return res.status(500).send({
        code: httpStatus.BAD_REQUEST,
        message: ex.message
      });
    }
  };

  const _setDefaultProfiles = async (req, res) => {
    try {
      const {
        user_uuid
      } = req.headers;
      let postData = req.body;
      let whereCond = {
        where: {
          user_uuid: postData.user_uuid,
          department_uuid: postData.department_uuid,
          facility_uuid: postData.facility_uuid,
          profile_type_uuid: postData.profile_type_uuid,
          is_active: emr_constants.IS_ACTIVE,
          status: emr_constants.IS_ACTIVE
        }
      };
      // if (profile_uuid && profile_type_uuid) {
      //   return res.status(400).send({ statusCode: 400, message: "please set either profile or profileTypes" });
      // }
      if (postData.profile_uuid && postData.profile_type_uuid && user_uuid) {
        let updateData = {},
          type = "";
        updateData = {
          profile_uuid: postData.profile_uuid,
          profile_type_uuid: postData.profile_type_uuid,
          modified_by: user_uuid
        };
        postData.created_by = user_uuid;
        postData.modified_by = 0;
        if (postData.is_default) {
          const checkProfileExistsOrNot = await getProfiles(whereCond);
          if (checkProfileExistsOrNot.status) {
            const proData = await profilesDefaultTbl.findOne({
              where: {
                profile_uuid: postData.profile_uuid,
                user_uuid: postData.user_uuid,
                department_uuid: postData.department_uuid,
                facility_uuid: postData.facility_uuid,
                profile_type_uuid: postData.profile_type_uuid,
                status: emr_constants.IS_ACTIVE,
                is_active: emr_constants.IS_ACTIVE
              },
              attributes: ['is_active']
            });
            if (proData) {
              return res.status(400).send({
                code: emr_constants.DUPLICATE_ENTRIE,
                message: getDuplicateMsg([proData])
              });
            } else {
              const updateRes = await profilesDefaultTbl.update({
                is_active: emr_constants.IS_IN_ACTIVE,
                status: emr_constants.IS_IN_ACTIVE
              }, whereCond);
              const insertResult = await insertProfiles(postData);
              return res.send({
                statusCode: insertResult.statusCode,
                message: insertResult.message
              });
            }
          } else {
            const insertResult = await insertProfiles(postData);
            return res.send({
              statusCode: insertResult.statusCode,
              message: insertResult.message
            });
          }
        } else {
          const checkProfileExistsOrNot = await profilesDefaultTbl.update({
            is_active: emr_constants.IS_IN_ACTIVE,
            status: emr_constants.IS_IN_ACTIVE
          }, whereCond);
          if (checkProfileExistsOrNot) {
            return res.status(200).send({
              statusCode: 200,
              message: "In active record successfully"
            });
          } else {
            return res.status(200).send({
              statusCode: 400,
              message: "Failed to In active record"
            });
          }

        }
        //  const checkUserExistsOrNot = await getUserProfiles(user_uuid, postData);
        //   const checkProfileExistsOrNot = await getProfiles(postData);
        //   //   if (checkUserExistsOrNot.status) {
        //   if (checkProfileExistsOrNot.status) {
        //     const updateProfileId = await profilesDefaultTbl.update(updateData, {
        //       where: {
        //         user_uuid
        //       }
        //     });
        //     if (updateProfileId && updateProfileId[0] != 0) {
        //       return res.status(200).send({
        //         statusCode: 200,
        //         message: " updated successfully"
        //       });
        //     } else {
        //       return res.status(400).send({
        //         statusCode: 400,
        //         message: " not updated "
        //       });
        //     }
        //   } else {
        //     const insertProfile = await profilesDefaultTbl.create(postData, {
        //       returning: true
        //     });
        //     if (insertProfile) {
        //       return res.status(201).send({
        //         statusCode: 201,
        //         message: " inserted successfully "
        //       });
        //     } else {
        //       return res.status(400).send({
        //         statusCode: 400,
        //         message: " inserted failed "
        //       });
        //     }
        //   }
        // } else {
        //   return res.status(422).send({
        //     statusCode: 422,
        //     req: req.body,
        //     message: "you are missing 'user_uuid / profile_id'"
        //   });
      }

    } catch (ex) {
      console.log('ex===', ex);
      return res.status(500).send({
        code: httpStatus.BAD_REQUEST,
        message: ex.message
      });
    }
  };

  const _getNotesByType = async (req, res) => {

    const {
      user_uuid
    } = req.headers;
    const {
      profile_type_uuid
    } = req.query;
    const {
      department_uuid
    } = req.query;
    try {
      if (user_uuid) {
        const typesData = await profilesTbl.findAll({
          where: {
            is_active: 1,
            status: 1,
            profile_type_uuid: profile_type_uuid,
            department_uuid: department_uuid
          },
        }, {
          returning: true
        });
        return res.status(200).send({
          code: httpStatus.OK,
          message: emr_constants.FETCHD_PROFILES_SUCCESSFULLY,
          responseContents: typesData
        });
      } else {
        return res.status(422).send({
          code: httpStatus[400],
          message: emr_constants.FETCHD_PROFILES_FAIL
        });
      }
    } catch (ex) {

      console.log(ex);
      return res.status(400).send({
        code: httpStatus.BAD_REQUEST,
        message: ex.message
      });
    }
  };

  const _getProfileSectionsByProfileId = async (req, res) => {
    try {
      const {
        user_uuid
      } = req.headers;
      const Authorization = req.headers.Authorization ? req.headers.Authorization : (req.headers.authorization ? req.headers.authorization : 0);
      const {
        profile_uuid
      } = req.query;
      let findQuery = {
        attributes: ['uuid', 'profile_code', 'profile_name', 'department_uuid', 'profile_description', 'department_uuid', 'profile_type_uuid', 'is_active', 'created_by', 'modified_by', 'created_date', 'modified_date'],
        where: {
          uuid: profile_uuid,
          is_active: 1,
          status: 1
        },
        include: [
          {
            model: profileSectionsTbl,
            as: 'profile_sections',
            attributes: ['uuid', 'profile_uuid', 'section_uuid', 'activity_uuid', 'display_order'],
            where: {
              is_active: 1,
              status: 1
            },
            required: false,
            include: [
              {
                model: sectionsTbl,
                as: 'sections',
                attributes: ['uuid', 'code', 'name', 'description', 'sref', 'section_type_uuid', 'section_note_type_uuid', 'display_order'],
                where: {
                  is_active: 1,
                  status: 1
                },
                required: false
              }
            ]
          },
          {
            model: profileTypeTbl,
            required: false,
            attributes: ['uuid', 'code', 'name'],
          }
        ]
      };
      const profileData = await profilesTbl.findAll(findQuery);
      /**Get department name */
      let departmentIds = [...new Set(profileData.map(e => e.department_uuid))];
      const departmentsResponse = await appMasterData.getDepartments(user_uuid, Authorization, departmentIds);
      if (departmentsResponse) {
        let data = [];
        const resData = departmentsResponse.responseContent.rows;
        resData.forEach(e => {
          data[e.uuid] = e.name;
          data[e.name] = e.code;
        });
        profileData.forEach(e => {
          const department_uuid = e.dataValues.department_uuid;
          e.dataValues.department_name = (data[department_uuid] ? data[department_uuid] : null);
        });
      }
      /**Get user name */
      let doctorIds = [...new Set(profileData.map(e => e.created_by))];
      let modifiedIds = [...new Set(profileData.map(e => e.modified_by))];
      let userIds = [...doctorIds, ...modifiedIds];
      const doctorResponse = await appMasterData.getDoctorDetails(user_uuid, Authorization, userIds);
      if (doctorResponse && doctorResponse.responseContents) {
        let newData = [];
        const resData = doctorResponse.responseContents;
        resData.forEach(e => {
          let last_name = (e.last_name ? e.last_name : '');
          newData[e.uuid] = e.first_name + '' + last_name;
        });
        profileData.forEach(e => {
          const {
            created_by,
            modified_by,
          } = e.dataValues;
          e.dataValues.created_user_name = (newData[created_by] ? newData[created_by] : null);
          e.dataValues.modified_user_name = (newData[modified_by] ? newData[modified_by] : null);
        });
      }
      return res.status(httpStatus.OK).send({
        code: httpStatus.OK,
        message: 'get Success',
        responseContents: profileData
      });
    }
    catch (err) {
      if (typeof err.error_type != 'undefined' && err.error_type == 'validation') {
        return res.status(400).json({ statusCode: 400, Error: err.errors, msg: "Validation error" });
      }
      const errorMsg = err.errors ? err.errors[0].message : err.message;
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({
          statusCode: 500,
          status: "error",
          msg: errorMsg
        });
    }
  }
  const _getProfileSectionsCategoriesByProfileSectionId = async (req, res) => {
    try {
      const {
        user_uuid
      } = req.headers;
      const Authorization = req.headers.Authorization ? req.headers.Authorization : (req.headers.authorization ? req.headers.authorization : 0);
      const {
        profile_section_uuid
      } = req.query;

      let findQuery = {
        attributes: ['uuid', 'profile_section_uuid', 'category_uuid', 'display_order'],
        where: {
          profile_section_uuid: profile_section_uuid,
          is_active: 1,
          status: 1
        },
        include: [
          {
            model: categoriesTbl,
            as: 'categories',
            attributes: ['uuid', 'code', 'name', 'category_type_uuid', 'category_group_uuid', 'description'],
            where: {
              is_active: 1,
              status: 1
            },
            required: false
          },
          {
            model: profileSectionCategoryConceptsTbl,
            as: 'profile_section_category_concepts',
            attributes: ['uuid', 'code', 'name', 'profile_section_category_uuid', 'value_type_uuid', 'description', 'is_mandatory', 'display_order', 'is_multiple'],
            where: {
              is_active: 1
            },
            required: false,
            include: [
              {
                model: valueTypesTbl,
                as: 'value_types',
                attributes: ['uuid', 'code', 'name', 'color', 'language', 'display_order', 'Is_default'],
                where: {
                  is_active: 1,
                  status: 1
                },
                required: false
              },
              {
                model: profileSectionCategoryConceptValuesTbl,
                as: 'profile_section_category_concept_values',
                attributes: ['uuid', 'profile_section_category_concept_uuid', 'value_code', 'value_name', 'is_defult', 'display_order'],
                where: {
                  is_active: 1,
                  status: 1
                },
                required: false,
                include: [
                  {
                    model: profileSectionCategoryConceptValueTermsTbl,
                    as: "profile_section_category_concept_value_terms",
                    attributes: ['uuid', 'profile_section_category_concept_values_uuid', 'concept_value_terms_uuid', 'display_order', 'is_default', 'is_active'],
                    required: false,
                    include: [
                      { model: conceptValueTermsTbl, required: false, attributes: ['uuid', 'code', 'name'] }
                    ]
                  }
                ]
              }]
          }],
        order: [
          [profileSectionCategoryConceptsTbl, 'uuid', 'ASC']
        ]
      };

      const profileSectionCategoriesData = await profileSectionCategoriesTbl.findAll(findQuery);
      return res.status(httpStatus.OK).send({
        code: httpStatus.OK,
        message: 'get Success',
        responseContents: profileSectionCategoriesData
      });
    }
    catch (err) {
      if (typeof err.error_type != 'undefined' && err.error_type == 'validation') {
        return res.status(400).json({ statusCode: 400, Error: err.errors, msg: "Validation error" });
      }
      const errorMsg = err.errors ? err.errors[0].message : err.message;
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({
          statusCode: 500,
          status: "error",
          msg: errorMsg
        });
    }
  }
  return {
    createProfileOpNotes: _createProfileOpNotes,
    getAllProfiles: _getAllProfiles,
    deleteProfiles: _deleteProfiles,
    getProfileById: _getProfileById,
    updateProfiles: _updateProfiles,
    getAllValueTypes: _getAllValueTypes,
    getAllProfileNotesTypes: _getAllProfileNotesTypes,
    getDefaultProfiles: _getDefaultProfiles,
    setDefaultProfiles: _setDefaultProfiles,
    getNotesByType: _getNotesByType,
    getProfileSectionsByProfileId: _getProfileSectionsByProfileId,
    getProfileSectionsCategoriesByProfileSectionId: _getProfileSectionsCategoriesByProfileSectionId
  };
};

module.exports = profilesController();

async function findDuplicateProfilesByCodeAndName({
  profile_code,
  profile_name
}) {
  // checking for Duplicate 
  // before creating profiles 
  return await profilesTbl.findAll({
    attributes: ['uuid', 'profile_code', 'profile_name', 'is_active'],
    where: {
      [Op.or]: [{
        profile_code: profile_code
      },
      {
        profile_name: profile_name
      }
      ]
    }
  });
}

async function findDuplicateConValueByCodeAndName(profileData) {
  // checking for Duplicate 
  // before creating profiles 
  let profilesReq = profileData.profiles;
  let ValuesInfoDetails = [];
  let proSec = profilesReq.sections;
  proSec.forEach((sItem, section_idx) => {
    let categories = sItem.categories;
    categories.forEach((caItem, caIdx) => {
      let concepts = caItem.concepts;
      concepts.forEach((item, idx) => {
        let conceptvalues = item.conceptvalues;
        conceptvalues.forEach((item, idx) => {
          ValuesInfoDetails = [...ValuesInfoDetails, {
            value_code: item.value_code,
            value_name: item.value_name,
            display_order: item.display_order
          }];
        });
      });
    });
  });
  return await profileSectionCategoryConceptValuesTbl.findAll({
    attributes: ['value_code', 'value_name', 'is_active'],
    where: {
      [Op.or]: [{
        value_code: ValuesInfoDetails[0].value_code
      },
      {
        value_name: ValuesInfoDetails[0].value_name
      }
      ]
    }
  });
}

function getDuplicateMsg(record) {
  return record[0].is_active ? emr_constants.DUPLICATE_ACTIVE_MSG : emr_constants.DUPLICATE_IN_ACTIVE_MSG;
}


function checkProfiles(req) {
  const {
    profiles,
    sections,
    profilesSectionInfo,
    profilesSectionCategoryInfo,
    profileSectionCategoryConceptsInfo,
    profileSectionCategoryConceptValuesInfo
  } = req.body;
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


async function findDuplicateProfileByCodeAndName({
  profile_code,
  profile_name
}) {
  // checking for Duplicate
  // before creating profile
  return await profilesTbl.findAll({
    attributes: ["profile_code", "profile_name", "is_active"],
    where: {
      [Op.or]: [{
        profile_code: profile_code
      }, {
        profile_name: profile_name
      }]
    }
  });
}

async function findDuplicateProfilesByCodeAndNameForAdd({
  profile_name
}) {
  let duplicate = await profilesTbl.findAll({
    attributes: ['uuid', 'profile_code', 'profile_name', 'is_active'],
    where: {
      profile_name: profile_name,
      status: 1,
      is_active: 1
    }
  });
  return duplicate;
}
async function findDuplicateProfilesByCodeAndNameForUpdate({
  profile_name,
  profile_uuid
}) {
  // checking for Duplicate 
  // before creating profiles 
  return await profilesTbl.findAll({
    attributes: ['uuid', 'profile_code', 'profile_name', 'is_active'],
    where: {
      profile_name: profile_name,
      uuid: {
        [Op.notIn]: [profile_uuid]
      },
      status: 1,
      is_active: 1
    }
  });
}

function getDuplicateMsgs(record) {
  return record[0].is_active ?
    emr_constants.DUPLICATE_ACTIVE_MSG :
    emr_constants.DUPLICATE_IN_ACTIVE_MSG;
}
const nameExists = (value_name) => {
  if (value_name !== undefined) {
    return new Promise((resolve, reject) => {
      let value = profileSectionCategoryConceptValuesTbl.findAll({
        order: [
          ['created_date', 'DESC']
        ],
        attributes: ["value_name", "is_active", "status"],
        where: {
          value_name: value_name
        }
      });
      if (value) {
        resolve(value);
        return value;
      } else {
        reject({
          message: "name does not existed"
        });
      }
    });
  }
};
async function getUserProfiles(user_uuid) {
  let result = await profilesDefaultTbl.findOne({
    where: {
      user_uuid: user_uuid
    }
  }, {
    returning: true
  });
  if (result) {
    //if (result && IsObjectEmpty(result)) {
    return {
      status: true,
      details: result
    };
  } else {
    return {
      status: false,
      details: {}
    };
  }
}
async function getProfiles(data) {
  let result = await profilesDefaultTbl.findOne(data, {
    returning: true
  });
  if (result) {
    //if (result && IsObjectEmpty(result)) {
    return {
      status: true,
      details: result
    };
  } else {
    return {
      status: false,
      details: {}
    };
  }
}
async function insertProfiles(postData) {
  let whereCond = {
    where: {
      profile_uuid: postData.profile_uuid,
      user_uuid: postData.user_uuid,
      department_uuid: postData.department_uuid,
      facility_uuid: postData.facility_uuid,
      profile_type_uuid: postData.profile_type_uuid
    }
  };
  const getProfile = await profilesDefaultTbl.findOne(whereCond);
  if (getProfile) {
    const insertProfile = await profilesDefaultTbl.update({
      status: emr_constants.IS_ACTIVE,
      is_active: emr_constants.IS_ACTIVE
    }, {
      where: {
        profile_uuid: postData.profile_uuid
      }
    });
    if (insertProfile) {
      return {
        statusCode: 200,
        message: "Updated successfully "
      };
    } else {
      return {
        statusCode: 400,
        message: "Failed to update"
      };
    }
  } else {
    const insertProfile = await profilesDefaultTbl.create(postData, {
      returning: true
    });
    if (insertProfile) {
      return {
        statusCode: 200,
        message: "Inserted successfully "
      };
    } else {
      return {
        statusCode: 400,
        message: "Failed to insert"
      };
    }
  }
}
async function conceptDuplicationByCodeAndName(conceptObj, uuid) {
  let duplicationData = [];
  let conceptValuesArray = [];
  const result = await profileSectionCategoryConceptsTbl.findOne({
    where: {
      [Op.or]: [{
        code: conceptObj.code
      },
      {
        name: conceptObj.name
      }
      ],
      value_type_uuid: conceptObj.value_type_uuid,
      uuid: {
        [Op.notIn]: [uuid]
      }
    }
  });
  if (result) return true;
  else
    return false;
}
async function conceptValuesDuplicationByCodeAndName(conceptValuesObj, uuid) {
  let duplicationData = [];
  let findQuery = {};
  const result = await profileSectionCategoryConceptValuesTbl.findOne({
    where: {
      [Op.or]: [{
        value_code: conceptValuesObj.value_code
      },
      {
        value_name: conceptValuesObj.value_name
      }
      ],
      profile_section_category_concept_uuid: uuid,
      uuid: {
        [Op.notIn]: [e.profile_section_category_concept_values_uuid]
      }
    }
  });
  if (result) return true;
  else
    return false;
}
async function conceptDuplicationByCodeAndName1(conceptArray) {
  let duplicationData = [];
  let conceptValuesArray = [];
  for (let e of conceptArray) {
    if (e.conceptvalues && e.conceptvalues.length > 0) {
      for (ecv of e.conceptvalues) {
        ecv.profile_section_category_concept_uuid = e.profile_section_category_concepts_uuid;
        conceptValuesArray.push(ecv);
      }
    }
    duplicationData.push(await profileSectionCategoryConceptsTbl.findOne({
      where: {
        [Op.or]: [{
          code: e.code
        },
        {
          name: e.name
        }
        ],
        value_type_uuid: e.value_type_uuid,
        uuid: {
          [Op.notIn]: [e.profile_section_category_concepts_uuid]
        }
      }
    }));
  }

  var duplicationWithOutNull = duplicationData.filter((el) => {
    return el != null;
  });
  let getConceptValuesDuplication = await conceptValuesDuplicationByCodeAndName(conceptValuesArray);
  return {
    duplicateConcepts: duplicationWithOutNull,
    duplicateConceptValues: getConceptValuesDuplication,
  };
}
async function conceptValuesDuplicationByCodeAndName1(conceptValuesArray, profileSectionCategoryConceptUuid) {
  let duplicationData = [];
  let findQuery = {};
  for (let e of conceptValuesArray) {
    if (e.value_code && e.value_name) {
      duplicationData.push(await profileSectionCategoryConceptValuesTbl.findOne({
        where: {
          [Op.or]: [{
            value_code: e.value_code
          },
          {
            value_name: e.value_name
          }
          ],
          profile_section_category_concept_uuid: e.profile_section_category_concept_uuid,
          uuid: {
            [Op.notIn]: [e.profile_section_category_concept_values_uuid]
          }
        }
      }));
    }
  }
  return duplicationData.filter((el) => {
    return el != null;
  });
}
async function addConceptDuplicationByCodeAndName(conceptArray) {
  let duplicationData = [];
  let conceptValuesArray = [];
  for (let e of conceptArray) {
    if (e.conceptvalues && e.conceptvalues.length > 0) {
      for (ecv of e.conceptvalues) {
        conceptValuesArray.push(ecv);
      }
    }
    duplicationData.push(await profileSectionCategoryConceptsTbl.findOne({
      where: {
        [Op.or]: [{
          code: e.code
        },
        {
          name: e.name
        }
        ],
        value_type_uuid: e.value_type_uuid
      }
    }))
  }

  var duplicationWithOutNull = duplicationData.filter((el) => {
    return el != null;
  });
  let getConceptValuesDuplication = await addConceptValuesDuplicationByCodeAndName(conceptValuesArray);
  return {
    duplicateConcepts: duplicationWithOutNull,
    duplicateConceptValues: getConceptValuesDuplication,
  };
}
async function addConceptValuesDuplicationByCodeAndName(conceptValuesArray) {
  let duplicationData = [];
  for (let e of conceptValuesArray) {
    if (e.value_code && e.value_name) {
      duplicationData.push(await profileSectionCategoryConceptValuesTbl.findOne({
        where: {
          [Op.or]: [{
            value_code: e.value_code
          },
          {
            value_name: e.value_name
          }
          ]
        }
      }));
    }
  }
  return duplicationData.filter((el) => {
    return el != null;
  });
}