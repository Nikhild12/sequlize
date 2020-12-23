const multer = require("multer");
const fs = require("fs");

const config = require('../config/config');

const middleware = () => {
    const multerupload = (destinationPath) => {
        let { writeFilePath } = createFolder(destinationPath);
        return multer({ //multer settings
            storage: multer.diskStorage({ //multers disk storage settings
                destination: function (req, file, cb) {
                    cb(null, writeFilePath); //image storage path
                },
                filename: function (req, file, cb) {
                    fs.exists(writeFilePath + '/' + file.originalname, function (fileExist) { // checks file existence
                        if (fileExist) {
                            let orgFileName = file.originalname.split(".");
                            cb(null, orgFileName[0].replace(/ /g, '') + "-" + Date.now() + "." + orgFileName[1]); // if efile exists appending date
                        } else {
                            cb(null, file.originalname);
                        }
                    });
                }
            })
        });
    };

    const multerDynamicUpload = (destinationPath) => {
        //console.log('\n destinationPath...',destinationPath);
        
        let { writeFilePath } = createFolder(destinationPath);
        //console.log('writeFilePath', writeFilePath);
        return multer.diskStorage({ //multers disk storage settings
            destination: function (req, file, cb) {
                let { folder_name } = req.body;
                //console.log('\n folder...', folder_name);

                if (folder_name) {
                   // console.log('\n writeFilePath...', writeFilePath);
                    destinationPath = writeFilePath + ('/' + folder_name);
                    //console.log('\n after destinationPath...', destinationPath);
                    if (!fs.existsSync(destinationPath)) {
                        fs.mkdirSync(destinationPath, (err) => {
                            if (err) throw err;
                        });
                    }
                }
                cb(null, destinationPath); //image storage path
            },
            filename: function (req, file, cb) {
                //cb(null, file.originalname);
                fs.exists(destinationPath + '/' + file.originalname, function (fileExist) { // checks file existence
                    if (fileExist) {
                        let orgFileName = file.originalname.split(".");
                        cb(null, orgFileName[0].replace(/ /g, '') + "-" + Date.now() + "." + orgFileName[1]); // if efile exists appending date
                    } else {
                        cb(null, file.originalname);
                    }
                });
            }
        });
    };

    return {
        multerupload,
        multerDynamicUpload
    };
};

module.exports = middleware();


function createFolder(destinationPath) {
    const fileServerPath = ((process.platform === 'linux') ? config.fileServerPath : config.fileServerPath.slice(1));
    const filePath = fileServerPath + config.serverStoragePath + destinationPath;
    const fileExists = fs.existsSync(filePath);
    const splitFilePath = "" ; //(process.platform === 'linux') ?
        // filePath.slice(fileServerPath.length).split('/') : filePath.split('/');
    let writeFilePath = '';
    if (!fileExists) {
        for (const iterator of splitFilePath) {
            if (iterator) {
                if (writeFilePath) {
                    writeFilePath += ('/' + iterator);
                } else {
                    writeFilePath = iterator;
                }
                if (process.platform === 'linux') {
                    if (!fs.existsSync(fileServerPath + '/' + writeFilePath)) {
                        fs.mkdirSync(fileServerPath + '/' + writeFilePath);
                    }
                } else {
                    if (!fs.existsSync(writeFilePath)) {
                        fs.mkdirSync(writeFilePath);
                    }
                }
            }
        }
    } else {
        writeFilePath = filePath;
    }
    if (process.platform === 'linux') {
        if (!('' + writeFilePath).startsWith(config.fileServerPath)) {
            writeFilePath = config.fileServerPath + '/' + writeFilePath;
        }
    }
    destinationPath = writeFilePath;
    return { destinationPath, writeFilePath };
}