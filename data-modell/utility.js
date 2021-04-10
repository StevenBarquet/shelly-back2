const Joi = require('@hapi/joi'); // Joi is a class so uppercase
const mongoose = require('mongoose');

// ------------------------------------------------MODEL DATA BASE------------------------------------------
const utilitySchema = new mongoose.Schema({
  idOrden: String,
  notaUtilidad: String,
  utilidad: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const Utility = mongoose.model('Utility', utilitySchema)

// ------------------------------------------------MODEL DATA VALIDATORS------------------------------------------
// Hacer validators para, venta local, preventa, venta online
function validateUtility(utility) {
  const schema = Joi.object({
    idOrden: Joi.string(),
    notaUtilidad: Joi.string(),
    utilidad: Joi.number().required()
  })

  return schema.validate(utility)
}

function validateUtilityWithId(utility) {
  const schema = Joi.object({
    _id: Joi.string().min(3).required(),
    idOrden: Joi.string(),
    notaUtilidad: Joi.string(),
    utilidad: Joi.number().required(),
    date: Joi.date()
  })

  return schema.validate(utility)
}

exports.Utility = Utility ;
exports.validateUtility = validateUtility;
exports.validateUtilityWithId = validateUtilityWithId;