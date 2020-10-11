//Package Import
const httpStatus = require("http-status");
//Sequelizer Import
const db = require('../config/sequelize');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
//EMR Constants Import
const emr_constants = require('../config/constants');

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
const opProfilesViewTbl = db.vw_op_notes_details;
const sectionCategoryEntriesTbl = db.section_category_entries;
const sectionsTbl = db.sections;
const categoriesTbl = db.categories;
const profilesViewTbl = db.vw_profile;
const profilesTypesTbl = db.profile_types;
const profilesDefaultTbl = db.profiles_default;

const Q = require('q');

const profilesController = () => {
  /**
   * Creating  profile opNotes
   * @param {*} req 
   * @param {*} res 
   */
  const _createProfileOpNotes = async (req, res) => {
    const {
      user_uuid
    } = req.headers;
    let {
      profiles
    } = req.body;
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

        profiles.status = true;
        profiles.created_by = profiles.modified_by = user_uuid;
        profiles.created_date = profiles.modified_date = new Date();
        profiles.revision = 1;

        let profileSectionSave = [],
          CategorySave = [],
          ConceptsSave = [],
          conceptValuesSave = [];
        // profiles = emr_utility.createIsActiveAndStatus(profiles, user_uuid);
        //Profiles save
        const profileResponse = await profilesTbl.create(profiles, {
          returning: true
        });

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
                        display_order: element.display_order,
                        is_defult:element.is_defult
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
          code: httpStatus.OK,
          message: emr_constants.PROFILES_SUCCESS,
          responseContents: {
            profileResponse: profileResponse,
            profileSectionResponse: profileSectionResponse,
            categoriesResponse: categoriesResponse,
            conceptResponse: conceptResponse,
            conceptValuesResponse: conceptValuesResponse
          }
        });
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
    const {
      user_uuid
    } = req.headers;
    const {
      uuid
    } = req.body;

    if (uuid && user_uuid) {
      const updatedProfilesData = {
        status: 0,
        is_active: 0,
        modified_by: user_uuid,
        modified_date: new Date()
      };
      try {
        const data = await profilesTbl.update(updatedProfilesData, {
          where: {
            uuid: uuid
          }
        }, {
          returning: true
        });
        if (data) {
          return res.status(200).send({
            code: httpStatus.OK,
            message: 'Deleted Successfully'
          });
        } else {
          return res.status(400).send({
            code: httpStatus.OK,
            message: 'Deleted Fail'
          });

        }

      } catch (ex) {
        console.log('Exception happened', ex);
        return res.status(400).send({
          code: httpStatus.BAD_REQUEST,
          message: ex.message
        });

      }
    } else {
      return res.status(400).send({
        code: httpStatus.UNAUTHORIZED,
        message: emr_constants.NO_USER_ID
      });

    }
  };

  /**
  * Get profiles By Id,name and department
  @param {} req
  @param {} res
  */
  const _getProfileById = async (req, res) => {

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
      include: [{
        model: profileSectionsTbl,
        as: 'profile_sections',
        attributes: ['uuid', 'profile_uuid', 'section_uuid', 'activity_uuid', 'display_order'],
        where: {
          is_active: 1,
          status: 1
        },
        required: false,
        include: [{
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
          include: [{
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
              is_active: 1,
              status: 1
            },
            required: false,
            include: [{
              model: valueTypesTbl,
              as: 'value_types',
              attributes: ['uuid', 'code', 'name', 'color', 'language', 'display_order', 'Is_default'],
              where: {
                is_active: 1,
                status: 1
              },
              required: false
            },
            // include: [
            {
              model: profileSectionCategoryConceptValuesTbl,
              as: 'profile_section_category_concept_values',
              attributes: ['uuid', 'profile_section_category_concept_uuid', 'value_code', 'value_name','is_defult'],
              where: {
                is_active: 1,
                status: 1
              },
              required: false
            }
            ]
            //],
          }
          ]
        }
        ]
      }]

    };
    let findQuery1 = {
      attributes: ['uuid', 'profile_code', 'profile_name', 'department_uuid', 'profile_description', 'department_uuid', 'profile_type_uuid'],
      where: {
        uuid: profile_uuid,
        is_active: 1,
        status: 1
      },
      include: [{
        model: profileSectionsTbl,
        as: 'profile_sections',
        attributes: ['uuid', 'profile_uuid', 'section_uuid', 'activity_uuid', 'display_order'],
        where: {
          is_active: 1,
          status: 1
        }
      }]

    };
    if (user_uuid && profile_uuid) {
      try {
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
        const doctorResponse = await appMasterData.getDoctorDetails(user_uuid, Authorization, doctorIds);
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
            } = e.dataValues;
            e.dataValues.created_user_name = (newData[created_by] ? newData[created_by] : null);
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
    } else {
      return res.status(400).send({
        code: httpStatus[400],
        message: "No Request headers or request Found"
      });
    }

  };

  /**
   * update profiles
   * @param {*} req 
   * @param {*} res 
   */

  const _updateProfiles = async (req, res) => {
    const {
      user_uuid
    } = req.headers;
    const { profiles, deletedHeadings, deletedSubheadings, deletedFieldInfo } = req.body;
    if (user_uuid) {
      if (profiles) {
        bulkUpdateProfileResponse = await bulkUpdateProfile(req.body);
      }
      if (deletedHeadings && deletedHeadings.length > 0) {
        for (let dh of deletedHeadings) {
          await profileSectionsTbl.update({
            status: 0
          }, {
            where: {
              uuid: dh.profile_sections_uuid
            }
          });
        }
      }
      if (deletedSubheadings && deletedSubheadings.length > 0) {
        for (let dsh of deletedSubheadings) {
          await profileSectionCategoriesTbl.update({
            status: 0
          }, {
            where: {
              uuid: dsh.profile_section_categories_uuid
            }
          });
        }
      }
      if (deletedFieldInfo && deletedFieldInfo.length > 0) {
        for (let dfi of deletedFieldInfo) {
          await profileSectionCategoryConceptsTbl.update({
            status: 0
          }, {
            where: {
              uuid: dfi.profile_section_category_concepts_uuid
            }
          })
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
        console.log('err===', err);
        return res.send({
          status: 'error',
          statusCode: 400,
          msg: 'failed',
          error: err.message
        });
      }
    }
    else {
      return res.send({
        status: 'error',
        statusCode: 400,
        msg: 'Authentication error'
      });
    }
  };

  const bulkUpdateProfile = async (req) => {
    var deferred = new Q.defer();
    var profileData = req;
    var profileDetailsUpdate = [];
    var sectionsResponse = [];
    var categoryResponse = [];
    var conceptsResponse = [];
    var conceptValuesResponse = [];
    var element3 = {};
    var element2 = {};
    for (let i = 0; i < profileData.profiles.sections.length; i++) {
      const element1 = profileData.profiles;
      profileDetailsUpdate.push(await profilesTbl.update({
        profile_type_uuid: element1.profile_type_uuid,
        profile_code: element1.profile_code,
        profile_name: element1.profile_name,
        profile_description: element1.profile_description,
        facility_uuid: element1.facility_uuid,
        department_uuid: element1.department_uuid,
        is_active: element1.is_active
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
        element2 = profileData.profiles.sections[i].categories[j];

        if (element2.profile_section_categories_uuid) {
          profileDetailsUpdate.push(await profileSectionCategoriesTbl.update({
            category_uuid: element2.category_uuid,
            display_order: element2.display_order
          }, {
            where: {
              uuid: element2.profile_section_categories_uuid
            }
          }));
        }
        else if (element.profile_sections_uuid) {
          let elementArrsection = [];
          // elementArr2.push(element);
          var index = 0;
          elementArrsection.push({
            profile_section_uuid: element.profile_sections_uuid,
            category_uuid: element2.category_uuid,
            display_order: element.display_order
          });
          categoryResponse = await profileSectionCategoriesTbl.bulkCreate(elementArrsection);
        } else {
          let elementArr2 = [];
          // elementArr2.push(element);
          var index = 0;
          elementArr2.push({
            profile_section_uuid: sectionsResponse[0].uuid,
            category_uuid: element2.category_uuid,
            display_order: element.display_order
          });
          categoryResponse = await profileSectionCategoriesTbl.bulkCreate(elementArr2);
        }
        for (let k = 0; k < profileData.profiles.sections[i].categories[j].concepts.length; k++) {
          element3 = profileData.profiles.sections[i].categories[j].concepts[k];
          if (element3.profile_section_category_concepts_uuid) {
            profileDetailsUpdate.push(await profileSectionCategoryConceptsTbl.update({
              code: element3.code,
              name: element3.name,
              description: element3.description,
              value_type_uuid: element3.value_type_uuid,
              is_multiple: element3.is_multiple,
              is_mandatory: element3.is_mandatory,
              display_order: element3.display_order
            }, {
              where: {
                uuid: element3.profile_section_category_concepts_uuid
              }
            }));
          }
          else if (element2.profile_section_categories_uuid) {
            let elementArr_2 = [];
            // elementArr1.push(element);
            var index = 0;
            elementArr_2.push({
              profile_section_category_uuid: element2.profile_section_categories_uuid,
              code: element3.code,
              name: element3.name,
              description: element3.description,
              value_type_uuid: element3.value_type_uuid,
              is_mandatory: element3.is_mandatory,
              display_order: element3.display_order,
              is_multiple: element3.is_multiple
            });
            conceptsResponse = await profileSectionCategoryConceptsTbl.bulkCreate(elementArr_2);
          }
          // else if(){

          // }
          else {
            let elementArr1 = [];
            // elementArr1.push(element);
            var index = 0;
            elementArr1.push({
              profile_section_category_uuid: categoryResponse[0].uuid,
              code: element3.code,
              name: element3.name,
              description: element3.description,
              value_type_uuid: element3.value_type_uuid,
              is_mandatory: element3.is_mandatory,
              display_order: element3.display_order,
              is_multiple: element3.is_multiple
            });
            conceptsResponse = await profileSectionCategoryConceptsTbl.bulkCreate(elementArr1);
          }
          for (let l = 0; l < profileData.profiles.sections[i].categories[j].concepts[k].conceptvalues.length; l++) {
            const element4 = profileData.profiles.sections[i].categories[j].concepts[k].conceptvalues[l];

            if (element4.profile_section_category_concept_values_uuid) {
              profileDetailsUpdate.push(await profileSectionCategoryConceptValuesTbl.update({
                value_code: element4.value_code,
                value_name: element4.value_name,
                display_order: element4.display_order,
                is_defult:element4.is_defult
              }, {
                where: {
                  uuid: element4.profile_section_category_concept_values_uuid
                }
              }));
            }
            else if (element3.profile_section_category_concepts_uuid) {
              // console.log("element3.profile_section_category_concepts_uuid",element3.profile_section_category_concepts_uuid)

              let elementArr_3 = [];
              elementArr_3.push({
                profile_section_category_concept_uuid: element2.profile_section_categories_uuid,
                value_code: element4.value_code,
                value_name: element4.value_name,
                display_order: element4.display_order,
                is_defult:element4.is_defult
              });
              conceptValuesResponse = await profileSectionCategoryConceptValuesTbl.bulkCreate(elementArr_3);
            }
            else if (conceptsResponse && (conceptsResponse[0] != undefined)) {
              // console.log("conceptsResponse[0]..",conceptsResponse[0])
              let elementArr = [];
              elementArr.push({
                profile_section_category_concept_uuid: conceptsResponse[0].uuid,
                value_code: element4.value_code,
                value_name: element4.value_name,
                display_order: element4.display_order,
                is_defult:element4.is_defult
              });
              conceptValuesResponse = await profileSectionCategoryConceptValuesTbl.bulkCreate(elementArr);
            }
            // else if (conceptsResponse[0] == undefined) {
            //   let elementArr_1 = [];
            //   elementArr_1.push({
            //     profile_section_category_concept_uuid: conceptsResponse[0].uuid,
            //     value_code: element.value_code,
            //     value_name: element.value_name,
            //     display_order: element.display_order
            //   });
            //   conceptValuesResponse_1= await profileSectionCategoryConceptValuesTbl.bulkCreate(elementArr_1);
            // }
            // else if(!conceptsRespons_1[0] == undefined){
            //   console.log("conceptsResponse[0]_1..",conceptsRespons_1[0])

            //   let elementArray = [];
            //   elementArray.push({
            //     profile_section_category_concept_uuid:conceptsRespons_1[0].uuid,
            //     value_code: element4.value_code,
            //     value_name: element4.value_name,
            //     display_order: element4.display_order
            //   });
            //   conceptValuesResponse = await profileSectionCategoryConceptValuesTbl.bulkCreate(elementArray);
            // }
            // else if(!conceptsResponse[0]==undefined){
            //   let elementArray = [];
            //   elementArray.push({
            //     profile_section_category_concept_uuid:  conceptsResponse[0].uuid,
            //     value_code: element4.value_code,
            //     value_name: element4.value_name,
            //     display_order: element4.display_order
            //   });
            //   conceptValuesResponse = await profileSectionCategoryConceptValuesTbl.bulkCreate(elementArray);
            // }
            else {
              // console.log("else condition..")
              let elementArray = [];
              // let element5=
              console.log("conceptsResponse[0]..", conceptsResponse[0])
              console.log("conceptsResponse[0]..11111", conceptsResponse[0])
              console.log("conceptsResponse[0]..11111cdvwvf", conceptsResponse[0].uuid)

              console.log("else condition. late else.", element4.profile_section_category_concepts_uuid)
              console.log("else condition. late else.", element4)

              elementArray.push({
                profile_section_category_concept_uuid: conceptsResponse[0].uuid,
                value_code: element4.value_code,
                value_name: element4.value_name,
                display_order: element4.display_order,
                is_defult:element4.is_defult
              });
              conceptValuesResponse = await profileSectionCategoryConceptValuesTbl.bulkCreate(elementArray);
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
          where: { is_active: 1, status: 1 },
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
      profile_type_uuid
    } = req.query;

    try {
      if (user_uuid) {
        const result = await profilesDefaultTbl.findOne({
          where: {
            user_uuid: user_uuid,
            profile_type_uuid: profile_type_uuid
          }
        }, {
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
        postData.created_by = postData.user_uuid = user_uuid;
        postData.modified_by = 0;
        //  const checkUserExistsOrNot = await getUserProfiles(user_uuid, postData);
        const checkProfileExistsOrNot = await getProfiles(postData.profile_uuid);
        //   if (checkUserExistsOrNot.status) {
        if (checkProfileExistsOrNot.status) {
          const updateProfileId = await profilesDefaultTbl.update(updateData, {
            where: {
              user_uuid
            }
          });
          if (updateProfileId && updateProfileId[0] != 0) {
            return res.status(200).send({
              statusCode: 200,
              message: " updated successfully"
            });
          } else {
            return res.status(400).send({
              statusCode: 400,
              message: " not updated "
            });
          }
        } else {
          const insertProfile = await profilesDefaultTbl.create(postData, {
            returning: true
          });
          if (insertProfile) {
            return res.status(201).send({
              statusCode: 201,
              message: " inserted successfully "
            });
          } else {
            return res.status(400).send({
              statusCode: 400,
              message: " inserted failed "
            });
          }
        }
      } else {
        return res.status(422).send({
          statusCode: 422,
          req: req.body,
          message: "you are missing 'user_uuid / profile_id'"
        });
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
    getNotesByType: _getNotesByType
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
    attributes: ['profile_code', 'profile_name', 'is_active'],
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

async function getProfiles(profile_uuid) {
  let result = await profilesDefaultTbl.findOne({
    where: {
      profile_uuid: profile_uuid
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