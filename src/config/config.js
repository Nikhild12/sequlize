const Joi = require("joi");

require("dotenv").config()

const envVarsSchema = Joi.object({
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