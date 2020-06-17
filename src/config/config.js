const Joi = require("joi");

require("dotenv").config({ path: __dirname + '/../../.env' });

const envVarsSchema = Joi.object({
  PG_DB_LOGGING: Joi.string().default(0),
  WSO2_LOG_URL: Joi.string().default('http://localhost:7327/api/logger/insertLog'),

  NODE_ENV: Joi.string()
    .allow(["development", "production", "test", "provision"])
    .default("development"),
  PORT: Joi.number().default(3000),
  JWT_SECRET: Joi.string()
    .default("GREAT!@!#$$%@%$SFA")
    .description("JWT Secret required to sign"),
  JWT_TOKEN_EXPIRE: Joi.string()
    .default("1d")
    .description("JWT Token Expired in Days"),
  PG_DB: Joi.string()
    .default("sfa")
    .description("test"),
  PG_PORT: Joi.number().default(5432),
  // SMTP_PORT: Joi.number().default(1337),
  PG_HOST: Joi.string().default("127.0.0.1"),
  PG_USER: Joi.string()
    .default("root")
    .description("root"),
  PG_PASSWORD: Joi.string()
    .default("root")
    .allow("")
    .description("test"),
  wso2_lisUrl: Joi.string(),
  wso2RmisUrl: Joi.string(),
  wso2InvestUrl: Joi.string(),
  wso2InvUrl: Joi.string(),
  wso2AppUrl: Joi.string()
})
  .unknown()
  .required();

const { error, value: envVars } = Joi.validate(process.env, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  //Logging - 19_02_2020
  logging: envVars.PG_DB_LOGGING,
  wso2_logurl: envVars.WSO2_LOG_URL,
  requestDate: new Date(),
  //Logging - 19_02_2020
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  jwtSecret: envVars.JWT_SECRET,
  jwtTokenExpire: envVars.JWT_TOKEN_EXPIRE,
  username: envVars.USER_NAME_URL,
  mysql: {
    db: envVars.PG_DB,
    port: envVars.PG_PORT,
    host: envVars.PG_HOST,
    user: envVars.PG_USER,
    password: envVars.PG_PASSWORD,
    dialect: "mysql"
  },
  
  fileServerPath: envVars.FILE_SERVER_PATH,
  serverStoragePath: envVars.SERVER_STORAGE_PATH,
  addAllPrescriptionDetails:
    envVars.BASE_URL + envVars.INVENTORY_CONTEXT_PATH + envVars.ADD_PRESCRIPION,
  addAllLabDetails:
    envVars.BASE_URL + envVars.LAB_CONTEXT_PATH + envVars.ADD_LAB,
  deleteLabDetails:
    envVars.BASE_URL + envVars.LAB_CONTEXT_PATH + envVars.DELETE_PATH,
  addAllRadialogyDetails:
    envVars.BASE_URL + envVars.RADIALOGY_CONTEXT_PATH + envVars.ADD_RADIALOGY,
  deleteRadialogyDetails:
    envVars.BASE_URL + envVars.RADIALOGY_CONTEXT_PATH + envVars.DELETE_PATH,
  addALLInvestDetails:
    envVars.BASE_URL + envVars.INVEST_CONTEXT_PATH + envVars.ADD_INVEST,
  deleteInvestDetails:
    envVars.BASE_URL + envVars.INVEST_CONTEXT_PATH + envVars.DELETE_PATH,
  deletePrescriptionDetails:
    envVars.BASE_URL + envVars.INVENTORY_CONTEXT_PATH + envVars.DELETE_PRESCRIPTION,
  wso2InvUrl: envVars.wso2InvUrl,
  wso2LisUrl: envVars.wso2_lisUrl,
  wso2RmisUrl: envVars.wso2RmisUrl,
  wso2InvestUrl: envVars.wso2InvestUrl,
  wso2AppUrl: envVars.wso2AppUrl,
  serverName: envVars.SERVER_NAME
};
module.exports = config;
