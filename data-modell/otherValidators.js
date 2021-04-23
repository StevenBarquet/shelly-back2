// --------------------------------------IMPORTS------------------------------------
// Dependencies
const Joi = require('joi'); // Joi is a class so uppercase

// ------------------------------------------------MODEL DATA JOI VALIDATORS------------------------------------------

function validatePagination(pagination) {
  const schema = Joi.object({
    pageNumber: Joi.number().integer().required(),
    pageSize: Joi.number().integer().required()
  })

  return schema.validate(pagination)
}

function validateSearch(searchObj) {
  const schema = Joi.object({
    pageNumber: Joi.number().integer().required(),
    pageSize: Joi.number().integer().required(),
    searchedValue: Joi.string().min(3).max(25),
    filters: Joi.object({
      online: Joi.boolean(),
      nuevo: Joi.boolean(),
      descuento: Joi.boolean(),
      categoria: Joi.string()
    }).optional(),
    sortBy: Joi.object({
      marca: Joi.number().integer().min(-1).max(1),
      nombre: Joi.number().integer().min(-1).max(1),
      precioOnline: Joi.number().integer().min(-1).max(1),
      countVisits: Joi.number().integer().min(-1).max(1),
      countQuestions: Joi.number().integer().min(-1).max(1),
      countPurchases: Joi.number().integer().min(-1).max(1)
    }).optional()
  })

  return schema.validate(searchObj)
}

function validateSearchOrders(searchObj) {
  const schema = Joi.object({
    pageNumber: Joi.number().integer().required(),
    pageSize: Joi.number().integer().required(),
    searchedValue: Joi.string().min(3).max(25),
    filters: Joi.object({
      finalDate: Joi.date().when('startDate', { is: Joi.date().required(), then: Joi.required(), otherwise: Joi.optional() }),
      startDate: Joi.date(),
      ventaTipo: Joi.string(),
      metodoPago: Joi.string(),
      responsableVenta: Joi.string(),
      estatus: Joi.string()
    }),
    sortBy: Joi.object({
      date: Joi.number().integer().min(-1).max(1),
      totalVenta:Joi.number().integer().min(-1).max(1),
      totalCosto:Joi.number().integer().min(-1).max(1),
      responsableVenta:Joi.number().integer().min(-1).max(1),
      estatus:Joi.number().integer().min(-1).max(1)
    }).optional()
  })

  return schema.validate(searchObj)
}

exports.validateSearch = validateSearch;
exports.validatePagination = validatePagination;
exports.validateSearchOrders = validateSearchOrders;
