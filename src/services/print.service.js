const fs = require('fs');
//const bwipjs = require('bwip-js');
const handlebars = require('handlebars');
const htmlPdf = require('html-pdf');
const existsSync = require('fs').existsSync;
const readFileSync = require('fs').readFileSync;
const resolve = require('path').resolve;
const moment = require('moment');

const printService = () => {

    const compile = (template, data, compileOptions = '') => {
        if (compileOptions) {
            return handlebars.compile(template, compileOptions)(data);
        }
        return handlebars.compile(template)(data);
    };
   
    const register = (key, fn, inverse = false) => {
        return handlebars.registerHelper(key, fn, inverse);
    };

    const unRegister = (key) => {
        return handlebars.registerHelper(key);
    };

    const renderTemplate = (path, templateValues, encoding = 'utf-8') => {
        handlebars.registerPartial('facility_header', getFile(__dirname + '/../assets/templates/headers/facility_header.hbs', 'utf-8'));
        handlebars.registerPartial('nd_facility_header', getFile(__dirname + '/../assets/templates/headers/nd_facility_header.hbs', 'utf-8'));

        const renderedTemplate = handlebars.compile(getFile(path, encoding));
        return renderedTemplate(templateValues);
    };



    const getFile = (filePath, encoding = null) => {
        return fs.readFileSync(filePath, encoding);
    };

    const createPdf = (template, options) => {
        return new Promise((resolve, reject) => {
            htmlPdf.create(template, options).toBuffer((err, bufferRes) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(bufferRes);
                }
            });
        });
    };

    return {
        register,
        compile,
        unRegister,
        createPdf,
        renderTemplate,
        getFile
    };
};
printService().register('convertDate', (date) => {
    let retdate = '';
    if (date !== null) {
        retdate = moment(date).format("DD-MMM-YYYY HH:mm");
    }
    return retdate;
});
printService().register('strtodate', (date) => {
    let retdate = '';
    if (date !== null) {
        try {
            let dobdt = moment(date).toDate();
            retdate = moment(dobdt).format('DD/MM/YYYY');
        } catch (e) {
            console.log(e);
        }
    }
    return retdate;
});

printService().register('dateformat', (date) => {
    let retdate = '';
    if (date !== null) {
        retdate = date.toLocaleDateString();
        retdate = moment(retdate).format('DD/MM/YYYY');
    }
    return retdate;
});
printService().register('json', (context) => {
    return JSON.stringify(context);
});
printService().register('expdateformat', (date) => {
    let retdate = '';
    if (date !== null) {
        retdate = date.toLocaleDateString();
        retdate = moment(retdate).format('MM/YYYY');
    }
    return retdate;
});

printService().register('datetimeformat', (date) => {
    let retdatetime = '';
    if (date !== null) {
        retdatetime = date.toLocaleDateString() + ' ' + date.getHours() + ':' + date.getMinutes();
        retdatetime = moment(retdatetime).format('DD/MM/YYYY HH:mm');
    }
    return retdatetime;
});

printService().register('age', (data) => {
    let result = '';
    if (data.data && data.data.root && data.data.root.hasOwnProperty('age')) {
        let diffDuration = moment.duration(moment().diff(data.age));
        let years = diffDuration.years();
        let months = diffDuration.months();
        let days = diffDuration.days();
        if (years > 0) {
            result = diffDuration.years() + 'Y ';
        }
        if (months > 0) {
            result += diffDuration.months() + 'M ';
        }
        if (days > 0) {
            result += diffDuration.days() + 'D ';
        }
    }
    return result;
});

printService().register('ageonlyyear', (date) => {
    let diffDuration = moment.duration(moment().diff(date));
    let result = '';
    let years = diffDuration.years();
    if (years > 0) {
        result = moment().diff(date, 'years') + 'Y ';
    }
    return result;
});

printService().register('specifiedage', (date) => {
    let diffDuration = moment.duration(moment().diff(date));
    let result = '';
    let years = diffDuration.years();
    let months = diffDuration.months();
    let days = diffDuration.days();
    if (years > 0) {
        result = diffDuration.years() + 'Y ';
    } else if (years === 0) {
        if (months > 0) {
            result += diffDuration.months() + 'M ';
        }
        if (days > 0) {
            result += diffDuration.days() + 'D ';
        }
    }
    return result;
});

printService().register('now', () => {
    let retdatetime = '';
    let date = new Date();
    retdatetime = date.toLocaleDateString() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
    retdatetime = moment(retdatetime).format('DD/MM/YYYY HH:mm:ss');
    return retdatetime;
});

printService().register('include', (...param) => {
    let path = param[0];
    let fullPath = resolve(__dirname, '..' + path);
    if (existsSync(fullPath) || existsSync(path)) {
        let response;
        let type = param[1];
        switch (type) {
            case 'fullpath-img':
                response = 'data:image/png;base64,' + readFileSync(path, 'base64');
                break;
            case 'img':
                response = 'data:image/png;base64,' + readFileSync(fullPath, 'base64');
                break;
            case 'tpl':
                let tpl = readFileSync(fullPath, 'utf-8');
                let opt = param[param.length - 1];
                response = Template.Compile(tpl, opt.data.root);
                break;
            default:
                response = readFileSync(fullPath, 'utf-8');
                break;
        }
        return response;
    }
});

printService().register('includestring', (...param) => {
    let tmplString = param[0];
    let opt = param[param.length - 1];
    let response = Template.Compile(tmplString, opt.data.root);
    return response;
});

/**
printService().register('date', (...params) => {
    let date = params[0];
    let method = params[1];
    let last = params.length - 3;
    let input = _.chain(params).drop(2).take(last > 0 ? last : 0).value();
    let result = moment(date)[method](input);
    return result;
});*/

printService().register('inc', (...param) => {
    return parseInt(param[0]) + 1;
});

printService().register('json', (context) => {
    return JSON.stringify(context);
});

printService().register('check', (val) => {
    return val;
});

printService().register('notAvailable', (val) => {
    let value = (val != "") ? val : "N/A";
    return value;
});
    
printService().register('nameFormat',(performed_by_title,performed_by_first_name,performed_by_last_name)=>{
    return performed_by_title+'.'+performed_by_first_name+' '+performed_by_last_name;
});
printService().register('check_encounter_type', (val) => {
    if (val == 1) {
        return 'OP';
    }
    else {
        return 'IP';
    }
});
printService().register('check_len', (arr) => {
    if (arr.length > 0) {
        return true;
    }
    else {
        return false;
    }
});

printService().register('wait',(val)=>{
console.log("wait =================>",val);
    setTimeout(()=>{
        return val;
    },1000);
});



printService().register('ifCond', (...param) => {
    let v1 = param[0];
    let operator = param[1];
    let v2 = param[2];
    let options = param[3];
    if (v1 && typeof v1 === 'string') {
        v1 = v1.toLowerCase();
    }
    if (v2 && typeof v2 === 'string') {
        v2 = v2.toLowerCase();
    }
    if (v1 && typeof v1 === 'string' && v1.indexOf('g.') > -1) {
        let varName = v1.substring(2);
        v1 = options.data.root[varName];
    }
    if (v2 && typeof v2 === 'string' && v2.indexOf('g.') > -1) {
        let varName = v2.substring(2);
        v2 = options.data.root[varName];
    }
    switch (operator) {
        case '==':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '!==':
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});

printService().register('setVariable', (...param) => {
    let varName = param[0];
    let varValue = param[1];
    let options = param[2];
    if (varName && typeof varName === 'string') {
        varName = varName.toLowerCase();
    }
    if (varName && typeof varValue === 'string' && varValue.startsWith('g.')) {
        let gk = varValue.substring(2).toLowerCase();
        varValue = options.data.root[gk];
    }
    options.data.root[varName] = varValue;
});

printService().register('getVariable', (...param) => {
    let varName = param[0];
    let options = param[1];
    if (varName && typeof varName === 'string') {
        varName = varName.toLowerCase();
    }
    if (varName.indexOf('g.') > -1) {
        varName = varName.substring(2);
    }
    return options.data.root[varName] || '';
});

printService().register('splitToLines', (...param) => {
    let response = '';
    let singleText = param[0];
    if (singleText && typeof singleText === 'string') {
        let lines = singleText.split(',');
        response = lines.join('<br>');
    }
    return response;
});

//   printService().register('barcode', (...param) => {
//       let api = require('deasync')(bwipjs.toBuffer);
//       let data = param[0];
//       let bcid = param[1];
//       bcid = bcid.name ? 'code39' : bcid;
//       try {
//           let img = api({
//               bcid: bcid, // Barcode type
//               text: data, // Text to encode
//               scale: 3, // 3x scaling factor
//               height: 10, // Bar height, in millimeters
//               includetext: true, // Show human-readable text
//               textxalign: 'center', // Always good to set this
//               textfont: 'Inconsolata', // Use your custom font
//               textsize: 13 // Font size, in points
//           });
//           let buffer = ( < Buffer > img).toString('base64');
//           return 'data:image/png;base64,' + buffer;
//       } catch (e) {
//           console.log(e);
//       }
//   });

module.exports = printService();