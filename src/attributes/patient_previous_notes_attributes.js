

const _getPreviousPatientOPNotes = record => {

    return record.map((r) => {
        return {
            prvNotes_uuid: r.uuid,
            patient_uuid: r.patient_uuid,
            // facility_uuid: r.facility_uuid,
            // department_uuid: r.department_uuid,
            encounter_uuid: r.encounter_uuid,
            opnotes_uuid: r.profile_uuid,
            created_date: r.created_date,
            notes_created_date: r.profile && r.profile.created_date,
            notes_name: r.profile && r.profile.profile_name,
            notes_code: r.profile && r.profile.profile_code,
            notes_description: r.profile && r.profile.profile_description,
        };
    });
};
module.exports = {
    getPreviousPatientOPNotes: _getPreviousPatientOPNotes
};