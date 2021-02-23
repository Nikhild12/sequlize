
const _getSpecialityListAttributes = [
    "ss_uuid",
    "ss_code",
    "ss_name",
    "ss_description",
    "ss_facility_uuid",
    "ss_department_uuid",
    "ss_sketch_name",
    "ss_is_active",
    "ss_status",
    "ss_revision",
    "ss_created_by",
    "ss_created_date",
    "ss_modified_by",
    "ss_modified_date",
    "ssd_uuid",
    "ssd_speciality_sketch_uuid",
    "ssd_sketch_path",
    "ssd_status",
    "ssd_is_active",
    "ssd_created_by",
    "ssd_modified_by",
    "created_user_name",
    "modified_user_name",
    "created_title_name",
    "modified_title_name",
    "d_name"
];

const _getSpecialityListById = (id = 0) => {
    return {
        attributes: _getSpecialityListAttributes,
        where: {
            ss_uuid: id,
            ss_status: 1
        }
    };
};

const _getSpecialityResponse = (record = []) => {
    let response = {};

    const uniqueNo = [...new Set(record.map((r) => Number(r.ss_uuid)))];
    const element = record.find((r) => r.ss_uuid === uniqueNo[0]);

    if (element && element) {
        response = {
            uuid: element.ss_uuid,
            code: element.ss_code,
            name: element.ss_name,
            department_uuid: element.ss_department_uuid,
            description: element.ss_description,
            sketch_name: element.ss_sketch_name,
            status: element.ss_status,
            revision: element.ss_revision,
            is_active: element.ss_is_active,
            created_by: element.ss_created_by,
            modified_by: element.ss_modified_by,
            created_date: element.ss_created_date,
            modified_date: element.ss_modified_date,
            created_user_name: element.created_user_name,
            modified_user_name: element.modified_user_name,
            created_title_name: element.created_title_name,
            modified_title_name: element.modified_title_name,
            department_name: element.d_name,
            speciality_sketch_details: record.map((r) => {
                return {
                    speciality_sketch_uuid: r.ssd_speciality_sketch_uuid,
                    uuid: r.ssd_uuid,
                    sketch_path: r.ssd_sketch_path,
                    status: r.ssd_status,
                    is_active: r.ssd_is_active,
                    created_by: r.ssd_created_by,
                    modified_by: r.ssd_modified_by
                };
            })
        };
    }
    return response;
};

module.exports = {
    getSpecialityListAttributes: _getSpecialityListAttributes,
    getSpecialityListById: _getSpecialityListById,
    getSpecialityResponse: _getSpecialityResponse
};