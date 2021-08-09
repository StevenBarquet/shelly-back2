/* eslint-disable max-lines-per-function */
// -------------------------------------IMPORTS---------------------------
// Dependencies
const express = require('express');
const debug = require('debug')('app:test')
// Others
const { Order } = require('../data-modell/orders');
const { wrapDBservice, joiCheck } = require('./respondServices');
const { validateSearchUtility } = require('../data-modell/otherValidators');

const router = express.Router();

// ---------------------------------------------------ROUTES---------------------------------------------
// ------Get products search------------
router.post('/buscar', (req, res) => {
  debug('requested for: ', req.originalUrl)

  const validateBody = validateSearchUtility(req.body)
  joiCheck(res, validateBody);

  wrapDBservice(res, searchOrders, req.body);
})
// -------------------------------------------------QUERYS-----------------------------------------
async function searchOrders(data){
  // Trae todos los productos que coincidan con los criterios de busqueda
  const { searchedValue, filters, sortBy } = data;
  const regEx = new RegExp(`.*${searchedValue}.*`, 'iu')
  const fixFilters = cleanDateTimeFilters(filters)
  const sortOrder = sortBy || { date: 1 }
  const selectValues = { _id: 1, totalVenta: 1, totalCosto: 1, utility: 1, disponibles: 1, date: 1, responsableVenta: 1, ventaTipo: 1 }
  let orders = []; let orderCount = 0;

  try {
    if (searchedValue){
      orders = await Order
        .find(fixFilters)
        .sort(sortOrder)
        .select(selectValues)
        .or([{ nombre: regEx }, { apellido: regEx }, { telefono: regEx }, { ventaTipo: regEx }, { notaVenta: regEx }])

      orderCount = await Order
        .find(fixFilters)
        .sort(sortOrder)
        .select(selectValues)
        .or([{ apellido: regEx }, { telefono: regEx }, { ventaTipo: regEx }, { notaVenta: regEx }])
        .countDocuments();
    } else {
      orders = await Order
        .find(fixFilters)
        .sort(sortOrder)
        .select(selectValues)

      orderCount = await Order
        .find(fixFilters)
        .sort(sortOrder)
        .select(selectValues)
        .countDocuments();
    }

    debug('------searchOrders-----\nsuccess\n', orders);
    return {
      internalError: false,
      result: { orderCount, orders }
    };
  } catch (error){
    debug('------searchOrders-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, errorType: 'Error al buscar ordenes en DB', statusError: 500 }
    }
  }
}
// -------------------------------------------------METHODS-----------------------------------------
function cleanDateTimeFilters(filters){
  if (!filters){
    return null
  }
  const { startDate, finalDate } = filters
  if (startDate){
    const regEx = { $gte: `${startDate}T00:00:00.000+00:00`, $lte: `${finalDate}T23:59:59.000+00:00` }
    delete filters.startDate;
    delete filters.finalDate;
    return { ...filters, date: regEx }
  }
  return filters
}

module.exports = router;