// -------------------------------------IMPORTS---------------------------
// Dependencies
const express = require('express');
const debug=require('debug')('app:test')
// Others
// const { Order, validateOrderLocal } = require('../data-modell/orders');
const { Product, validateOrderLocal } = require('../data-modell/product');
// const wrapDBService = require('../other-tools/wrapDBService');

const router = express.Router();
// ---------------------------------------------------CONFIGURATIONS-------------------------------------
// const costoEnvio = 198;
// const envioGratisDesde = 1998

// ---------------------------------------------------ROUTES---------------------------------------------
// ------Create One------------
router.post('/ventaLocal', (req, res)=>{
  debug('requested from: ', req.url)

  const { error } = validateOrderLocal(req.body)
  if(error){
    debug('Error de Joi')
    res.status(400).send({ messageError: error.details[0].message })
    return;
  }

  validateProductsDB(req.body.items);

  // wrapDBService(res, createOrder, req.body);
})

// router.post('/verifyProducts', (req, res)=>{
//   debug('requested from: ', req.url)

//   const { error } = validateProducts(req.body)
//   if(error){
//     debug('Error de Joi')
//     res.status(400).send({ messageError: error.details[0].message })
//     return;
//   }

//   wrapDBService(res, searchProducts, req.body);
// })

// -------------------------------------------------METHODS-----------------------------------------
function validateProductsDB(products) {
  const dbProducts= searchProducts(products);
  piezasVSdisponibles(products, dbProducts);
}

async function searchProducts(items) {
  const itemsIDs = items.map(item => item._id);
  try {
    // Verifica que existan los productos de la orden
    const someProducts = await Product
      .find({ _id: { $in: itemsIDs }, online: true, disponibles: { $gt: 0 } })
      .select({
        _id : 1,
        nombre: 1,
        categoria: 1,
        disponibles: 1,
        costo: 1,
        precio: 1,
        'images.cover': 1,
        'images.mini': 1
      })
    return someProducts
  } catch (error) {
    debug('------No se encontraron los IDs de los productos-----\nInternal error\n\n', error);
    return []
  }
}

function piezasVSdisponibles(itemsPiezas, itemsDisponibles) {

  const greaterThan = itemsDisponibles.filter((element, index) => itemsPiezas[index].piezas < element.disponibles);

  console.log('----->', greaterThan)
}

module.exports = router;
