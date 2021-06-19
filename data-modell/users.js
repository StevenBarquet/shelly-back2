// --------------------------------------IMPORTS------------------------------------
// Dependencies
const Joi = require('joi'); // Joi is a class so uppercase
const mongoose = require('mongoose');

// ------------------------------------------------MODEL DATA BASE------------------------------------------
const userSchema = new mongoose.Schema({
  authorizedRoutes: { type: [String], required: true },
  mail: { type: String, required: true, unique: true },
  pass: { type: String, required: true },
  fullName: { type: String, required: true },
  // Perfil
  rfc: String,
  phone: String,
  otherPhone: String,
  adress: String,
  docsUrl: String,
  // Other
  isSupport: Boolean
});

const User = mongoose.model('User', userSchema)

// ------------------------------------------------MODEL DATA JOI VALIDATORS------------------------------------------

function validateUser(user){
  const schema = Joi.object({
    authorizedRoutes: Joi.array().items(
      Joi.string()
    )
      .required(),
    mail: Joi.string().min(5)
      .required(),
    pass: Joi.string().min(6)
      .required(),
    fullName: Joi.string().min(5)
      .required(),
    // Perfil
    rfc: Joi.string(),
    phone: Joi.string(),
    otherPhone: Joi.string(),
    adress: Joi.string(),
    docsUrl: Joi.string()
  })

  return schema.validate(user)
}

function validateSupportUser(user){
  const schema = Joi.object({
    authorizedRoutes: Joi.array().items(
      Joi.string()
    )
      .required(),
    mail: Joi.string().min(5)
      .required(),
    pass: Joi.string().min(6)
      .required(),
    fullName: Joi.string().min(5)
      .required(),
    // Perfil
    isSupport: Joi.boolean()
  })

  return schema.validate(user)
}

function validateUserWithID(user){
  const schema = Joi.object({
    _id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/u)
      .required(),
    authorizedRoutes: Joi.array().items(
      Joi.string()
    ),
    mail: Joi.string().min(5),
    fullName: Joi.string().min(5),
    // Perfil
    rfc: Joi.string(),
    phone: Joi.string(),
    otherPhone: Joi.string(),
    adress: Joi.string(),
    docsUrl: Joi.string(),
    // Other
    isSupport: Joi.boolean()
  })

  return schema.validate(user)
}

exports.User = User;
exports.validateUser = validateUser;
exports.validateSupportUser = validateSupportUser;
exports.validateUserWithID = validateUserWithID;
