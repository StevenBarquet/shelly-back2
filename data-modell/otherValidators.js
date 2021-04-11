// --------------------------------------IMPORTS------------------------------------
// Dependencies
const Joi = require('joi'); // Joi is a class so uppercase

// ------------------------------------------------MODEL DATA JOI VALIDATORS------------------------------------------

function validatePagination(pagination) {
  const schema = Joi.object({
    pageNumber: Joi.number().required(),
    pageSize: Joi.number().required()
  })

  return schema.validate(pagination)
}

function validateSearch(searchObj) {
  const schema = Joi.object({
    pageNumber: Joi.number().required(),
    pageSize: Joi.number().required(),
    searchedValue: Joi.string().min(3).max(20),
    filters: Joi.object({
      marca: Joi.string().optional(),
      online: Joi.boolean().optional(),
      nuevo: Joi.boolean().optional(),
      categoria: Joi.string().optional()
    }).optional(),
    sortBy: Joi.object({
      marca: Joi.number().optional(),
      nombre: Joi.number().optional(),
      precioOnline: Joi.number().optional()
    }).optional()
  })

  return schema.validate(searchObj)
}

function validateSearchOrders(searchObj) {
  const schema = Joi.object({
    pageNumber: Joi.number().required(),
    pageSize: Joi.number().required(),
    searchedValue: Joi.string().min(3).max(20),
    filters: Joi.object({
      finalDate: Joi.date().when('startDate', { is: Joi.date().required(), then: Joi.required(), otherwise: Joi.optional() }),
      startDate: Joi.date(),
      ventaTipo: Joi.string().optional(),
      metodoPago: Joi.string().optional(),
      responsableVenta: Joi.string().optional(),
      estatus: Joi.string().optional()
    }).optional(),
    sortBy: Joi.object({
      date: Joi.date().optional(),
      totalVenta: Joi.number().optional(),
      totalCosto: Joi.number().optional(),
      responsableVenta: Joi.string().optional(),
      estatus: Joi.string().optional()
    }).optional()
  })

  return schema.validate(searchObj)
}

exports.validateSearch = validateSearch;
exports.validatePagination = validatePagination;
exports.validateSearchOrders = validateSearchOrders;
