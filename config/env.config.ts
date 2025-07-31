import { ConfigModuleOptions } from '@nestjs/config';
import * as Joi from 'joi';

export const envConfig: ConfigModuleOptions = {
  isGlobal: true,
  validationSchema: Joi.object({
    DB_HOST: Joi.string().default('localhost'),
    DB_PORT: Joi.number().default(5432),
    DB_USERNAME: Joi.string().default('user123'),
    DB_PASSWORD: Joi.string().default('password123'),
    DB_NAME: Joi.string().default('spaceryder'),
    REDIS_HOST: Joi.string().default('localhost'),
    REDIS_PORT: Joi.number().default(6379),
    PORT: Joi.number().default(3000),
  }),
};