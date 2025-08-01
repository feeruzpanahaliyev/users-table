const Joi = require("joi");

exports.validateUser = (data) =>
  Joi.object({
    name: Joi.string().min(2).max(30).required(),
    role: Joi.string().valid("admin", "user", "viewer").insensitive().required(),
    status: Joi.string().valid("active", "inactive").insensitive().required(),
    email: Joi.string().email().required(),
    salary: Joi.number().min(0).required(),
    id: Joi.number().integer().min(1).required(),
    __v: Joi.number().optional(),
    _id: Joi.string().optional(),
  }).validate(data);
  