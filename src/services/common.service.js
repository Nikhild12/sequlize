const moment = require('moment');
const db = require("../config/sequelize");
const CryptoJS = require("crypto-js");
const _ = require("lodash");
const request = require('request');
const fs = require('fs');
const bwipjs = require('bwip-js');
const handlebars = require('handlebars');
// const htmlPdf = require('html-pdf');
const momentTimezone = require('moment-timezone');
// const QRCode = require('qrcode');
const config = require('../config/config');
require("dotenv").config();

const visit_type_tbl = db.visit_type;

const commonService = () => {

    // const checkDateValid = dateToCheck => moment(moment(dateToCheck).format("YYYY-MM-DD"), "YYYY-MM-DD", true).isValid();
    const generateRandomNum = () => Math.floor(new Date().getTime() / 100);
    //   const generateRandomNum = () => Math.floor(Math.random() * (99999999999 - 10000000000) + 10000000000);
    const getVisitTypes = (visitQurey = {}) => {
        return visit_type_tbl.findAll(visitQurey);
    };
    const encryptText = (keys, value) => {
        const key = CryptoJS.enc.Utf8.parse(keys);
        const encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(value.toString()), key, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        });
        return encrypted.toString();
    };

    const decryptText = (keys, value) => {
        const key = CryptoJS.enc.Utf8.parse(keys);
        const decrypted = CryptoJS.AES.decrypt(value, key, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        });
        return decrypted.toString(CryptoJS.enc.Utf8);
    };

    const decryptArr = (encryptedArr = [], sortField = '', sortOrder = '') => {
        let decryptedArr = [];
        for (let arrIdx = 0; arrIdx < encryptedArr.length; arrIdx++) {
            const arrElem = encryptedArr[arrIdx];
            const objKeys = Object.keys(arrElem);
            let tempObj = {};
            for (let objIdx = 0; objIdx < objKeys.length; objIdx++) {
                const objElem = objKeys[objIdx];
                if (arrElem[objElem]) {
                    tempObj[objElem] = decryptText(process.env.PDS_ENCRYPTION_KEY, arrElem[objElem]);
                } else {
                    tempObj[objElem] = '';
                }
            }
            decryptedArr.push(tempObj);
        }
        return (sortField) ? _.orderBy(decryptedArr, [sortField], [(sortOrder) ? sortOrder : 'asc']) : decryptedArr;
    };
    const postRequest = async (api, headers, data) => {
        return new Promise(resolve => {
            request.post({
                uri: api,
                headers: headers,
                json: data
            },
                function (error, response, body) {
                    if (error) {
                        resolve({});
                    } else if (body) {
                        if (body.responseContent || body.responseContents || body.benefMembers) {
                            resolve(body.responseContent || body.responseContents || body.benefMembers);
                        } else {
                            resolve({});
                        }
                    } else {
                        resolve({});
                    }
                });
        });
    };

    const getFile = (filePath, encoding = null) => {
        return fs.readFileSync(filePath, encoding);
    };

    const base64Encode = (file) => {
        var bitmap = getFile(file);
        return Buffer.from(bitmap).toString('base64');
    };

    const stringToBarcode = (text, bcid = 'code128', scale = 5, height = 3, includetext = false, textxalign = 'center') => {
        return new Promise((resolve, reject) => {
            bwipjs.toBuffer({
                bcid: bcid,
                text: text,
                scale: scale,
                height: height, // Bar height, in millimeters
                includetext: includetext,
                textxalign: textxalign,
            }, function (err, png) {
                if (err) {
                    reject(err);
                } else {
                    resolve(png);
                }
            });
        });
    };

    // const stringToQrcode = async (text, width = 60, scale = 5) => {
    //     try {
    //         const generatedQr = await QRCode.toDataURL(text, {
    //             type: 'image/png',
    //             width,
    //             scale,
    //         });
    //         return generatedQr;
    //     } catch (err) {
    //         return Promise.reject(err);
    //     }
    // };

    const renderTemplate = (path, templateValues, encoding = 'utf-8') => {
        handlebars.registerPartial('facility_header', getFile(__dirname + '/../assets/templates/headers/facility_header.hbs', 'utf-8'));
        const renderedTemplate = handlebars.compile(getFile(path, encoding));
        return renderedTemplate(templateValues);
    };

    // const createPdf = (template, options) => {
    //     return new Promise((resolve, reject) => {
    //         htmlPdf.create(template, options).toBuffer((err, bufferRes) => {
    //             if (err) {
    //                 reject(err);
    //             } else {
    //                 resolve(bufferRes);
    //             }
    //         });
    //     });
    // };

    const checkIdConstants = (idVal) => {
        idVal = '' + idVal;
        if (idVal) {
            const temp = parseInt(idVal);
            if (!isNaN(temp) && (temp >= 0)) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    };

    const getJsonValue = (model = {}, path = '') => {
        if (model) {
            return _.get(model, path);
        } else {
            return '';
        }
    };

    const checkStringNotEmpty = (stringVal = '') => {
        if (stringVal && /\S/.test(stringVal)) {
            return true;
        } else {
            return false;
        }
    };

    const checkSortOrderString = (stringVal = '') => {
        if (stringVal && checkStringNotEmpty(stringVal) && ((stringVal.toLowerCase() == 'asc') || (stringVal.toLowerCase() == 'desc'))) {
            return true;
        } else {
            return false;
        }
    };

    const isBoolean = val => {
        try {
            const parsedVal = JSON.parse(val);
            return Boolean(parsedVal) === parsedVal;
        } catch (error) {
            return false;
        }
    };

    const getApplicationTypeCode = (applicationType) => {
        switch (applicationType) {
            case 'ip':
                return '005';
            case 'mobile':
                return '004';
            case 'web':
                return '003';
            case 'external':
                return '002';
            case 'internal':
                return '001';
            default:
                return '';
        }
    };

    const getPatientTypeCode = (patientType) => {
        switch (patientType) {
            case 'ip':
                return 'ip';
            case 'op':
                return 'op';
            default:
                return '';
        }
    };

    // const checkDateValid = dateVar => {
    //     if ((dateVar instanceof Date) || moment.isMoment(dateVar)) {
    //         return true;
    //     }
    //     const parsedDate = Date.parse(dateVar);
    //     return (isNaN(dateVar) && !isNaN(parsedDate));
    // };
    const checkDateValid = dateVar => {
        if ((dateVar instanceof Date) || moment.isMoment(dateVar)) {
            return true;
        }
        const parsedDate = Date.parse(dateVar);
        return (isNaN(dateVar) && !isNaN(parsedDate));
    };
    const getDate = dateValue => {
        if (dateValue && checkDateValid(dateValue)) {
            return moment(dateValue).tz("Asia/Kolkata").toDate();
        }
        return moment().tz("Asia/Kolkata").toDate();
    };

    const indiaTz = (date) => {
        if (date && checkDateValid(date)) {
            return momentTimezone.tz(moment(date).toDate(), "Asia/Kolkata");
        }
        return momentTimezone.tz(Date.now(), "Asia/Kolkata");
    };

    const utcDateTime = (dateValue = '', startOfDay = false, endOfDay = false) => {
        let parsedDate = indiaTz();
        if (dateValue) {
            parsedDate = indiaTz(dateValue);
        }
        if (startOfDay) {
            let now = indiaTz().startOf('day');
            return parsedDate.set({
                'hour': now.hour(),
                'minute': now.minute(),
                'second': now.second()
            });
        }
        if (endOfDay) {
            let endOfDayMoment = indiaTz().endOf('day');
            return parsedDate.set({
                'hour': endOfDayMoment.hour(),
                'minute': endOfDayMoment.minute(),
                'second': endOfDayMoment.second()
            });
        }
        return parsedDate;
    };
    const getDeployedState = () => {
        const statedep = {
            TN: '/assets/images/tnlogo.png',
            PUNE: '/assets/images/punelogo.png'
        };
        return statedep[config.state] ? statedep[config.state] : statedep.TN;
    };
    return {
        checkDateValid,
        generateRandomNum,
        getVisitTypes,
        encryptText,
        decryptText,
        decryptArr,
        postRequest,
        base64Encode,
        stringToBarcode,
        renderTemplate,
        getFile,
        // createPdf,
        indiaTz,
        checkIdConstants,
        getJsonValue,
        checkStringNotEmpty,
        checkSortOrderString,
        // stringToQrcode,
        isBoolean,
        getApplicationTypeCode,
        getPatientTypeCode,
        utcDateTime,
        getDate,
        getDeployedState
    };
};

module.exports = commonService();
