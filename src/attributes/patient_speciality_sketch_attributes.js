

const _getPatientSpecialitySketchResponse = record => {

    return record.map((r) => {
        return {
            pss_uuid: r.uuid,
            patient_uuid: r.patient_uuid,
            facility_uuid: r.facility_uuid,
            department_uuid: r.department_uuid,
            encounter_uuid: r.encounter_uuid,
            speciality_sketch_uuid: r.speciality_sketch_uuid,
            comments: r.comments, // 34436 added comments field -by Manikanta
            sketch_path: r.sketch_path,
            created_date: r.created_date,
            sketch_name: r.speciality_sketch && r.speciality_sketch.name,
            sketch_code: r.speciality_sketch && r.speciality_sketch.code,
            sketch_description: r.speciality_sketch && r.speciality_sketch.description,
        };
    });
};
module.exports = {
    getPatientSpecialitySketchResponse: _getPatientSpecialitySketchResponse
};