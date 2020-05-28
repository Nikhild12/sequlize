const httpStatus = require("http-status");
const _ = require("lodash");
var Sequelize = require('sequelize');
var Op = Sequelize.Op;


Date.prototype.addHours = function (h) {
    this.setHours(this.getHours() + h);
    return this;
};

module.exports = {

    
    checkExistsUpdate: async function (data, tablename, modelname) {
        try {
            var sc = 0;
            var nm = 0;
            var regionalnameflag = 0;
            let findQuery = { where: { [Op.or]: [] } };
            
            if (data.code && data.code !== null && data.code !== '') {
                findQuery.where[Op.or].push({ [Op.or]: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(modelname + '.code')), data.code.toLowerCase()) });
            }
            if (data.office_name && data.office_name !== null && data.office_name !== '') {
                findQuery.where[Op.or].push({ [Op.or]: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(modelname + '.office_name')), data.office_name.toLowerCase()) })

            }  
            if (data.name && data.name !== null && data.name !== '') {
                findQuery.where[Op.or].push({ [Op.or]: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(modelname + '.name')), data.name.toLowerCase()) })

            }  
            if (data.spl_clinic_name && data.spl_clinic_name !== null && data.spl_clinic_name !== '') {
                findQuery.where[Op.or].push({ [Op.or]: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(modelname + '.spl_clinic_name')), data.spl_clinic_name.toLowerCase()) })

            }
            if (data.spl_clinic_code && data.spl_clinic_code !== null && data.spl_clinic_code !== '') {
                findQuery.where[Op.or].push({ [Op.or]: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(modelname + '.spl_clinic_code')), data.spl_clinic_code.toLowerCase()) })

            }
            if (data.regional_name && data.regional_name !== null && data.regional_name !== '') {
                regionalnameflag = 1;
                findQuery.where[Op.or].push({ [Op.or]: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(modelname + '.regional_name')), data.regional_name.toLowerCase()) })
            }

            if (data.short_code && data.short_code !== null && data.short_code !== '') {
                sc = 1;
                findQuery.where[Op.or].push({ [Op.or]: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(modelname + '.short_code')), data.short_code.toLowerCase()) })
            }


            if (data.is_default == true || data.is_default == 1) {
                const checkdefault = await tablename.findAndCountAll({ where: { is_default: true } });
                if (checkdefault.count == 0) {}
                else if (checkdefault.rows[0].dataValues.uuid != data.Id) {
                    return { errorCode: "ERR1006", msg: "Default not allowed" };
                }
            }
            const checkduplicates = await tablename.findAndCountAll(findQuery);
            if (checkduplicates.count == 0) {
                return { "count": 0 };
            }

            else if (checkduplicates.count > 0 ) {

                for (i = 0; i < checkduplicates.count; i++) {
                    if (data.code && checkduplicates.rows[i].dataValues.code.toLowerCase() == data.code.toLowerCase() && checkduplicates.rows[i].dataValues.uuid != data.Id) {
                        return { errorCode: "ERR1001", msg: "code already exists" };
                    }
                    else if (data.name && checkduplicates.rows[i].dataValues.name.toLowerCase() == data.name.toLowerCase() && checkduplicates.rows[i].dataValues.uuid != data.Id) {
                        return { errorCode: "ERR1002", msg: "name already exists" };
                    }
                    else if (data.office_name && checkduplicates.rows[0].dataValues.office_name.toLowerCase() == data.office_name.toLowerCase()&& checkduplicates.rows[i].dataValues.uuid != data.Id) {
                        return { errorCode: "ERR1008", msg: "office_name already exists" };
                    } 
                    else if (data.regional_name && regionalnameflag == 1 && checkduplicates.rows[i].dataValues.regional_name.toLowerCase() == data.regional_name.toLowerCase() && checkduplicates.rows[i].dataValues.uuid != data.Id) {
                        return { errorCode: "ERR1003", msg: "Regional_name already exists" };
                    }
                    else if (data.short_code && sc == 1 && checkduplicates.rows[i].dataValues.short_code.toLowerCase() == data.short_code.toLowerCase() && checkduplicates.rows[i].dataValues.uuid != data.Id) {
                        return { errorCode: "ERR1004", msg: "short_code already exists" };
                    }
                    else if (data.spl_clinic_name && checkduplicates.rows[0].dataValues.spl_clinic_name.toLowerCase() == data.spl_clinic_name.toLowerCase() && checkduplicates.rows[i].dataValues.uuid != data.Id) {
                        return { errorCode: "ERR1006", msg: "spl_clinic_name already exists" };
                    } 
                    else if (data.spl_clinic_code && checkduplicates.rows[0].dataValues.spl_clinic_code.toLowerCase() == data.spl_clinic_code.toLowerCase()&& checkduplicates.rows[i].dataValues.uuid != data.Id) {
                        return { errorCode: "ERR1007", msg: "spl_clinic_code already exists" };
                    }
                }
                return { "count": 0 };
            }
            else {
                return { errorCode: "ERR1005", msg: "some thing went wrong in checking duplicates" };
            }

        } catch (err) {
            console.log(err)
            return { errorCode: "ERR1005", msg: "some thing went wrong in checking duplicates", err: err }

        }
    },
    checkExistsCreate: async function (data, tablename, modelname) {
        try {

            var sc = 0;
            var regionalnameflag = 0;
            let findQuery = { where: { [Op.or]: [] } };

            if (data.code && data.code !== null && data.code !== '') {
                findQuery.where[Op.or].push({ [Op.or]: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(modelname + '.code')), data.code.toLowerCase()) });
            }
            if (data.name && data.name !== null && data.name !== '') {
                findQuery.where[Op.or].push({ [Op.or]: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(modelname + '.name')), data.name.toLowerCase()) });
            }
            if (data.office_name && data.office_name !== null && data.office_name !== '') {
                findQuery.where[Op.or].push({ [Op.or]: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(modelname + '.office_name')), data.office_name.toLowerCase()) });
            }

            if (data.spl_clinic_name && data.spl_clinic_name !== null && data.spl_clinic_name !== '') {
                findQuery.where[Op.or].push({ [Op.or]: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(modelname + '.spl_clinic_name')), data.spl_clinic_name.toLowerCase()) });

            }
            if (data.spl_clinic_code && data.spl_clinic_code !== null && data.spl_clinic_code !== '') {
                findQuery.where[Op.or].push({ [Op.or]: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(modelname + '.spl_clinic_code')), data.spl_clinic_code.toLowerCase()) });
            }
            if (data.regional_name && data.regional_name !== null && data.regional_name !== '') {
                regionalnameflag = 1;
                findQuery.where[Op.or].push({ [Op.or]: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(modelname + '.regional_name')), data.regional_name.toLowerCase()) });
            }
            if (data.short_code && data.short_code !== null && data.short_code !== '') {
                sc = 1;
                findQuery.where[Op.or].push({ [Op.or]: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(modelname + '.short_code')), data.short_code.toLowerCase()) });
            }

            if (data.is_default == true || data.is_default == 1) {
                const checkdefault = await tablename.findAndCountAll({ where: { is_default: 1, is_active: 1, status: 1 } });
                if (checkdefault.count > 0) {
                    return { errorCode: "ERR1006", msg: "Default not allowed" };
                }
            }
            const checkduplicates = await tablename.findAndCountAll(findQuery);
            console.log(checkduplicates);
            
            if (checkduplicates.count == 0) {
                return { "count": 0 };
            }
            else if (checkduplicates.count > 0) {

                if (data.code && checkduplicates.rows[0].dataValues.code.toLowerCase() == data.code.toLowerCase()) {
                    return { errorCode: "ERR1001", msg: "code already exists" };
                }
                else if (data.name && checkduplicates.rows[0].dataValues.name.toLowerCase() == data.name.toLowerCase()) {
                    return { errorCode: "ERR1002", msg: "name already exists" };
                }
                else if (data.regional_name && checkduplicates.rows[0].dataValues.regional_name.toLowerCase() == data.regional_name.toLowerCase() && regionalnameflag == 1) {
                    return { errorCode: "ERR1003", msg: "Regional_name already exists" };

                }
                else if (data.short_code && checkduplicates.rows[0].dataValues.short_code.toLowerCase() == data.short_code.toLowerCase() && sc == 1) {
                    return { errorCode: "ERR1004", msg: "short_code already exists" };
                }
                else if (data.office_name && checkduplicates.rows[0].dataValues.office_name.toLowerCase() == data.office_name.toLowerCase()) {
                    return { errorCode: "ERR1008", msg: "office_name already exists" };
                } 
                else if (data.spl_clinic_name && checkduplicates.rows[0].dataValues.spl_clinic_name.toLowerCase() == data.spl_clinic_name.toLowerCase()) {
                    return { errorCode: "ERR1006", msg: "spl_clinic_name already exists" };
                } 
                else if (data.spl_clinic_code && checkduplicates.rows[0].dataValues.spl_clinic_code.toLowerCase() == data.spl_clinic_code.toLowerCase()) {
                    return { errorCode: "ERR1007", msg: "spl_clinic_code already exists" };
                }
                else {
                    return { errorCode: "ERR1005", msg: "some thing went wrong in checking duplicates" };
                }

            }
            else {
                return { errorCode: "ERR1005", msg: "some thing went wrong in checking duplicates" }
            }

        } catch (err) {
            console.log(err);
            return { errorCode: "ERR1005", msg: "some thing went wrong in checking duplicates", err: err }
        }
    },
  
    checkRefGroupExistsCreate: async function (data, tablename, modelname) {
        try {
            let findQuery = {
                where: {
                    [Op.or]: []
                }
            }
            if (data.sufix) {
                const lastRecord = await tablename.findAndCountAll({
                    order: [
                        ['uuid', 'DESC']
                    ]
                });
                let id_value = lastRecord.count==0 ? 0:lastRecord.rows[0].dataValues.uuid;
                let tot_value = parseInt(data.sufix) + parseInt(id_value) + 1;
                data.code = data.code + tot_value;
            }
            findQuery.where[Op.or].push({
                [Op.or]: [
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(modelname + '.code')), data.code.toLowerCase()),
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(modelname + '.name')), data.name.toLowerCase()),

                ],
            })
            if (data.is_default == true || data.is_default == 1) {
                const checkdefault = await tablename.findAndCountAll({
                    where: {
                        is_default: 1,
                        is_active: 1,
                        status: 1
                    }
                });
                if (checkdefault.count > 0) {
                    return {
                        errorCode: "ERR1003",
                        msg: "Default already selected"
                    }
                }
            }
            if (data.display_order && data.display_order !== null && data.display_order !== '') {
                const checkdisplay_order = await tablename.findAndCountAll({
                    where: {
                        display_order: data.display_order,
                        status: 1
                    }
                });
                if (checkdisplay_order.count > 0) {
                    return {
                        errorCode: "ERR1004",
                        msg: "Display order already exist"
                    }
                }
            }
            const checkduplicates = await tablename.findAndCountAll(findQuery);
            if (checkduplicates.count == 0) {
                return {
                    "count": 0
                };
            } else if (checkduplicates.count > 0) {

                if (data.code && checkduplicates.rows[0].dataValues.code.toLowerCase() == data.code.toLowerCase()) {
                    return {
                        errorCode: "ERR1001",
                        msg: "code already exists"
                    }
                } else if (data.name && checkduplicates.rows[0].dataValues.name.toLowerCase() == data.name.toLowerCase()) {
                    return {
                        errorCode: "ERR1002",
                        msg: "name already exists"
                    }
                } else {
                    return {
                        errorCode: "ERR1005",
                        msg: "some thing went wrong in checking duplicates"
                    }
                }

            } else {
                return {
                    errorCode: "ERR1005",
                    msg: "some thing went wrong in checking duplicates"
                }
            }

        } catch (err) {
            return {
                errorCode: "ERR1005",
                msg: "some thing went wrong in checking duplicates",
                err: err
            }
        }
    },
    checkRefGroupExistsUpdate: async function (data, tablename, modelname) {
        try {
            let findQuery = {
                where: {
                    [Op.or]: [
                        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(modelname + '.code')), data.code.toLowerCase()),
                        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(modelname + '.name')), data.name.toLowerCase()),
                    ],
                    uuid: {
                        [Op.ne]: data.Id
                    }
                }
            }
            if (data.is_default == true || data.is_default == 1) {
                const checkdefault = await tablename.findAndCountAll({
                    where: {
                        is_default: 1,
                        is_active: 1,
                        status: 1,
                        uuid: {
                            [Op.ne]: data.Id
                        }
                    }
                });
                if (checkdefault.count == 0) {} else if (checkdefault.rows[0].dataValues.uuid != data.Id) {
                    return {
                        errorCode: "ERR1003",
                        msg: "Default already selected"
                    }
                }
            }
            if (data.display_order && data.display_order !== null && data.display_order !== '') {
                const checkdisplay_order = await tablename.findAndCountAll({
                    where: {
                        display_order: data.display_order,
                        status: 1,
                        uuid: {
                            [Op.ne]: data.Id
                        }
                    }
                });
                if (checkdisplay_order.count > 0) {
                    return {
                        errorCode: "ERR1004",
                        msg: "Display order already exist"
                    }
                }
            }
            const checkduplicates = await tablename.findAndCountAll(findQuery);
            if (checkduplicates.count == 0) {
                return {
                    "count": 0
                };
            } else if (checkduplicates.count > 0) {

                for (i = 0; i < checkduplicates.count; i++) {
                    if (data.code && checkduplicates.rows[i].dataValues.code.toLowerCase() == data.code.toLowerCase() && checkduplicates.rows[i].dataValues.uuid != data.Id) {
                        return {
                            errorCode: "ERR1001",
                            msg: "code already exists"
                        }
                    } else if (data.name && checkduplicates.rows[i].dataValues.name.toLowerCase() == data.name.toLowerCase() && checkduplicates.rows[i].dataValues.uuid != data.Id) {
                        return {
                            errorCode: "ERR1002",
                            msg: "name already exists"
                        }
                    }
                }
                return {
                    "count": 0
                };
            } else {
                return {
                    errorCode: "ERR1005",
                    msg: "some thing went wrong in checking duplicates"
                }
            }

        } catch (err) {
            console.log(err)
            return {
                errorCode: "ERR1005",
                msg: "some thing went wrong in checking duplicates",
                err: err
            }

        }
    }

}