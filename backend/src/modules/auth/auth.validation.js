const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid('CLIENT', 'FREELANCER').required(),
  companyName: Joi.when('role', {
    is: 'CLIENT',
    then: Joi.string().allow('', null),
    otherwise: Joi.forbidden(),
  }),
  description: Joi.when('role', {
    is: 'CLIENT',
    then: Joi.string().allow('', null),
    otherwise: Joi.forbidden(),
  }),
  firstName: Joi.when('role', {
    is: 'FREELANCER',
    then: Joi.string().allow('', null),
    otherwise: Joi.forbidden(),
  }),
  lastName: Joi.when('role', {
    is: 'FREELANCER',
    then: Joi.string().allow('', null),
    otherwise: Joi.forbidden(),
  }),
  bio: Joi.when('role', {
    is: 'FREELANCER',
    then: Joi.string().allow('', null),
    otherwise: Joi.forbidden(),
  }),
  hourlyRate: Joi.when('role', {
    is: 'FREELANCER',
    then: Joi.number().min(0).allow(null),
    otherwise: Joi.forbidden(),
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

module.exports = {
  registerSchema,
  loginSchema,
};

