const _ = require('lodash');
const multer = require('multer');
//const path = require('path');
const fs = require('file-system')
//const bodyParser = require('body-parser');


const uploadController = () => {
    /**
    * Returns jwt token if valid username and password is provided
    * @param req
    * @param res
    * @param next
    @returns {}
    */

const storage = multer.diskStorage({
    destination: async function (req, file, callback) {
       let {folder_name} = req.headers; 
       let getDir_Name = getExtension(file, folder_name);
       
       if(!fs.existsSync(getDir_Name)){
            fs.mkdirSync(getDir_Name,(err)=>{
                if(err) throw err;   
            });
        }
        callback(null, getDir_Name);
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
})

const uploadD =  multer({ storage: storage }).any();

const _upload = async(req, res) => {
    try {
        uploadD(req,res ,(err)=>{
            if(err instanceof multer.MulterError){
                res.send({status:400,message:err}); 
            }else if(err){
                res.send({status:400,message:err}); 
            }else{
                res.send({"status": 200,"files":req.files,"count":req.files.length,"message":"Files Uploaded Successfully "});
             }
        });
    }
    catch (ex) {
        res.send({ "status": 400, "message": ex.message });
    }
};


const fetch = () => {
    return new Promise((resolve,reject)=>{
        resolve('{"text":"file upload"}');
        reject("Oops something went wrong");

    });
}

fetch()
    .then(result => console.log(JSON.parse(result)))
    .catch(err => console.log(err));

return {
    upload:_upload
};
};

module.exports = uploadController();


function getExtension(file,folder_name) {
    let dir_name;
    if((/\.(gif|jpg|jpeg|tiff|png)$/i).test(file.originalname)){
        dir_name = "./src/assets/uploads/"+folder_name+"/images";
    } else if((/\.(pdf)$/i).test(file.originalname)){
        dir_name = "./src/assets/uploads/"+folder_name+"/pdf";            
    } else if((/\.(xlsx)$/i).test(file.originalname)){
        dir_name = "./src/assets/uploads/"+folder_name+"/xlsx";            
    } else if((/\.(json)$/i).test(file.originalname)){
        dir_name = "./src/assets/uploads/"+folder_name+"/json";            
    } else if((/\.(doc|docx)$/i).test(file.originalname)){
        dir_name = "./src/assets/uploads/"+folder_name+"/docx";            
    }
    return dir_name;
}