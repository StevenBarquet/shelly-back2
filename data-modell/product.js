// --------------------------------------IMPORTS------------------------------------
// Dependencies
const Joi = require('joi'); // Joi is a class so uppercase
const mongoose = require('mongoose');

// ------------------------------------------------MODEL DATA BASE------------------------------------------
const productSchema = new mongoose.Schema({
  marca: String,
  nombre: { type: String, required: true },
  images: {
    cover: { type: String, required: true },
    mini: String,
    extra: [ String ]
  },
  costo: { type: Number, required: true },
  precioPlaza: { type: Number, required: true },
  precioOnline: { type: Number, required: true },
  disponibles: { type: Number, required: true },
  online: { type: Boolean, required: true },
  nuevo: { type: Boolean, required: true },
  descripcion: String,
  estetica: String,
  categoria:{ type: String, required: true },
  subcategoria: String,
  descuento: { type: Number, required: true },
  countVisits: Number,
  countQuestions: Number,
  countPurchases: Number,
  countLocalPurchases: Number,
  date: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema)

// ------------------------------------------------MODEL DATA JOI VALIDATORS------------------------------------------

function validateProduct(product) {
  const schema = Joi.object({
    marca: Joi.string().optional(),
    nombre: Joi.string().required(),
    images: Joi.object({
      cover: Joi.string().min(3).required(),
      mini: Joi.string().optional(),
      extra: Joi.array().optional().items(Joi.string().optional())
    }),
    costo: Joi.number().required(),
    precioPlaza: Joi.number().required(),
    precioOnline: Joi.number().required(),
    disponibles: Joi.number().required(),
    online: Joi.boolean().required(),
    nuevo: Joi.boolean().required(),
    descripcion: Joi.string().optional(),
    estetica: Joi.string().optional(),
    categoria: Joi.string().required(),
    subcategoria: Joi.string().optional(),
    descuento: Joi.number().min(0).max(99).required()
  })

  return schema.validate(product)
}

function validateProductWithId(product) {
  const schema = Joi.object({
    _id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    marca: Joi.string().optional(),
    nombre: Joi.string().required(),
    images: Joi.object({
      cover: Joi.string().min(3).required(),
      mini: Joi.string().optional(),
      extra: Joi.array().optional().items(Joi.string().optional())
    }),
    costo: Joi.number().required(),
    precioPlaza: Joi.number().required(),
    precioOnline: Joi.number().required(),
    disponibles: Joi.number().required(),
    online: Joi.boolean().required(),
    nuevo: Joi.boolean().required(),
    descripcion: Joi.string().optional(),
    estetica: Joi.string().optional(),
    categoria: Joi.string().required(),
    subcategoria: Joi.string().optional(),
    descuento: Joi.number().min(0).max(99).required()
  })

  return schema.validate(product)
}

exports.Product = Product;
exports.validateProduct = validateProduct;
exports.validateProductWithId = validateProductWithId;
