const Joi = require("joi");

require("dotenv").config()

const envVarsSchema = Joi.object({
    NODE_ENV : Joi.string()
                .allow(["development", "production", "test", "provision"])
                .default('development'),
    PORT: Joi.number().default(7337),
    PG_DB: Joi.string()
        .default("dev_hmis_emr_25_10_2019")
        .description("test"),
    PG_PORT: Joi.number().default(3306),
    PG_HOST: Joi.string().default("192.168.1.102"),
    PG_USER: Joi.string()
        .default("sureshkumar")
        .description("root"),
    PG_PASSWORD: Joi.string()
        .default("5ureshKu3@r")
        .allow("")
        .description("test")
})
    .unknown()
    .required();

const { error, value: envVars } = Joi.validate(process.env, envVarsSchema);
if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

const config = {
    env: envVars.NODE_ENV,
    port: envVars.PORT,
    jwtSecret: envVars.JWT_SECRET,
    jwtTokenExpire: envVars.JWT_TOKEN_EXPIRE,
    mysql: {
        db: envVars.PG_DB,
        port: envVars.PG_PORT,
        host: envVars.PG_HOST,
        user: envVars.PG_USER,
        password: envVars.PG_PASSWORD,
        dialect: "mysql"
    }
}

module.exports = config