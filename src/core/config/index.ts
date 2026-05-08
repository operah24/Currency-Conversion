import * as dotenv from 'dotenv';
import * as joi from 'joi';

dotenv.config();

// validating environment variables
const schema = joi
  .object({
    PORT: joi.number().required(),
    NODE_ENV: joi
      .string()
      .valid('development', 'production', 'staging', 'local')
      .required(),
    // database configs
    DB_HOST: joi.string().required(),
    DB_USERNAME: joi.string().required(),
    DB_PASSWORD: joi.string().required(),
    DB_DATABASE: joi.string().required(),
    DB_PORT: joi.number().port().required().default(5432),
    DATABASE_LOGGING: joi
      .boolean()
      .truthy('TRUE')
      .truthy('true')
      .falsy('FALSE')
      .falsy('false')
      .default(false),
    CURRENCY_RATES_API_URL: joi.string().required(),
  })
  .unknown()
  .required();

const { error, value: envVars } = schema.validate(process.env);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const config = {
  port: {
    http: envVars.PORT,
  },
  NODE_ENV: envVars.NODE_ENV,
  db: {
    port: envVars.DB_PORT,
    host: envVars.DB_HOST,
    username: envVars.DB_USERNAME,
    password: envVars.DB_PASSWORD,
    name: envVars.DB_DATABASE,
    logging: envVars.DATABASE_LOGGING,
  },
  currencyRatesApiUrl: envVars.CURRENCY_RATES_API_URL,
};
