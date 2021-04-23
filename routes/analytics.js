// -------------------------------------IMPORTS---------------------------
// Dependencies
const express = require('express');
const debug=require('debug')('app:test')
// Others
const { Product } = require('../data-modell/product');
const wrapDBservice = require('./wrapDBservice');

const router = express.Router();

// ---------------------------------------------------ROUTES---------------------------------------------
// ------Counter Update Visits------------
router.put('/visitsCounter/:id', (req, res)=>{
  debug('requested for: ', req.originalUrl)

  const itemId = req.params.id
  if(!itemId){
    res.status(400).send({ error: 'There is no ID for delete' })
    return;
  }

  wrapDBservice(res, updateSomeCount, { id: itemId, incrValue: { countVisits: 1 } });
})
// ------Counter Update Questions------------
router.put('/questionCounter/:id', (req, res)=>{
  debug('requested for: ', req.originalUrl)

  const itemId = req.params.id
  if(!itemId){
    res.status(400).send({ error: 'There is no ID for delete' })
    return;
  }

  wrapDBservice(res, updateSomeCount, { id: itemId, incrValue: { countQuestions: 1 } });
})
// ------Counter Update Purchases------------
router.put('/purchasesCounter/:id', (req, res)=>{
  debug('requested for: ', req.originalUrl)

  const itemId = req.params.id
  if(!itemId){
    res.status(400).send({ error: 'There is no ID for delete' })
    return;
  }

  wrapDBservice(res, updateSomeCount, { id: itemId, incrValue: { countPurchases: 1 } });
})

// -------------------------------------------------QUERYS-----------------------------------------
// updateVisits
async function updateSomeCount(data) {
  const { id, incrValue } = data
  // Elimina un producto en la base de datos si existe
  try {
    // verifica que exista el producto
    await Product.findById(id);
    try {
      // si existe intenta hacer el Update del contador
      const result = await Product.findOneAndUpdate({ _id: id }, { $inc : incrValue })
      debug('------updateVisits-----\nsuccess\n', result);
      return {
        internalError: false,
        result: { status: 'success' }
      }
    } catch (error) {
      // retorna error si no pudiste hacer UPDATE
      debug('------updateVisits----\nInternal error\n\n', error);
      return {
        internalError: true,
        result: { ...error, statusError: 401 }
      }
    }
  } catch (error) {
    // retorna error si no pudiste hacer busqueda del prod por id no encontrado
    debug('------updateVisits-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, statusError: 404 }
    };
  }
}

module.exports = router;
