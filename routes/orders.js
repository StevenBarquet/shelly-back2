// -------------------------------------IMPORTS---------------------------
// Dependencies
const express = require('express');
const debug=require('debug')('app:test')
// Others
const { Order, validateOrderLocal } = require('../data-modell/orders');
const { Utility } = require('../data-modell/utility');
const { Product } = require('../data-modell/product');
const wrapDBservice = require('./wrapDBservice');

const router = express.Router();
// ---------------------------------------------------CONFIGURATIONS-------------------------------------
// const costoEnvio = 198;
// const envioGratisDesde = 1998

// ---------------------------------------------------ROUTES---------------------------------------------
// ------Create One------------
router.post('/ventaLocal', async (req, res)=>{
  debug('requested from: ', req.url)

  const { error } = validateOrderLocal(req.body)
  if(error){
    debug('Error de Joi')
    res.status(400).send({ messageError: error.details[0].message })
    return;
  }

  const { internalError, result } = await validateProductsDB(req.body);
  if(internalError){
    debug('Error: ', result.errorType)
    res.status(400).send({ internalError, result })
  } else{
    // Si la lista de productos de la orden es válida
    const { dbProducts, utility } = result;
    wrapDBservice(res, createLocalOrder, { ...req.body, dbProducts, utility });
  }

})

router.post('/verifyProducts', (req, res)=>{
  debug('requested from: ', req.url)

  const { error } = validateOrderLocal(req.body)
  if(error){
    debug('Error de Joi')
    res.status(400).send({ messageError: error.details[0].message })
    return;
  }

  wrapDBservice(res, validateProductsDB, req.body);
})

// ----------------------------------------------MAIN METHODS---------------------------------------
async function createLocalOrder(data){
  // Crea una orden local, registra su utilidad y elimina inventario de los productos vendidos
  const { utility, dbProducts, items, correo, nombre, apellido, telefono, ventaTipo, responsableVenta, metodoPago, estatus, /* opcionales -> */ notaVenta, envio, domicilio, cobroAdicional } = data
  const { totalVenta, totalCosto, utilidad } = utility
  const orderData = { items, totalVenta, totalCosto, correo, nombre, apellido, telefono, ventaTipo, responsableVenta, metodoPago, estatus, /* opcionales -> */ notaVenta, envio, domicilio, cobroAdicional }

  const newOrder = await createAnyOrder(orderData)

  if(newOrder.internalError){
    debug('------createLocalOrder-----\nError al crear orden\n\n', newOrder.result);
    return newOrder
  }

  const utilityData = { idOrden: newOrder.result.data._id, utilidad }
  const utilityDBresponse = await createAnyUtility(utilityData)
  if(utilityDBresponse.internalError){
    debug('------createLocalOrder-----\nError al registrar utilidad\n\n', utilityDBresponse.result);
    return utilityDBresponse
  }

  const removeInvresponse = await removeFromInventory(dbProducts, items);
  if(removeInvresponse.internalError){
    debug('------createLocalOrder-----\nError al remover stock del inventario\n\n', removeInvresponse.result);
    return removeInvresponse
  }

  // remove from inventrary function

  debug('------createLocalOrder-----\nsuccess\n');
  return {
    internalError: false,
    result: {
      status: 'success'
      // data: newOrder
    }
  };
}

async function validateProductsDB(data) {
  // Valida si la lista de productos existen, son válidos en la db y los costos y precios coincidan
  const products = data.items

  const dbProducts= await searchProducts(products);
  if(dbProducts.length === 0 || dbProducts.length !== products.length)
    return(
      { internalError: true,
        result: { errorType: 'Productos no encontrados', productosValidos: dbProducts || [] }
      })

  const piezas= piezasVSdisponibles(products, dbProducts);
  if(piezas.length !== 0)
    return(
      { internalError: true,
        result: { errorType: 'Productos con piezas no disponibles', productosError: piezas }
      })

  const { sumaMatch, utility } = localOrderUtilityCalculator({ ...data, dbProducts });
  if(!sumaMatch)
    return(
      { internalError: true,
        result: { errorType: 'El precio o costo de los productos no coincide con DB', productosValidos: dbProducts }
      })

  return (
    {
      internalError: false,
      result: { dbProducts, utility }
    }
  )
}
// -------------------------------------------------METHODS-----------------------------------------
async function searchProducts(items) {
  // valida que un array de productos coincida en DB y retorna la lista desde la DB
  const itemsIDs = items.map(item => item._id);
  try {
    // Verifica que existan los productos de la orden
    const someProducts = await Product
      .find({ _id: { $in: itemsIDs }, online: true, disponibles: { $gt: 0 } })
    return someProducts
  } catch (error) {
    debug('------No se encontraron los IDs de los productos-----\nInternal error\n\n', error);
    return []
  }
}

async function removeFromInventory(fullProducts, soldProducts) {
  // construye un array de productos con inventario descontado y lo actualiza en db
  const newFullProducts = fullProducts.map((product, index)=>{
    return {
      ...product.toJSON(),
      disponibles: product.disponibles-soldProducts[index].piezas
    }
  })

  try {
    const dbUpdatedProducts = await Product.bulkWrite(
      newFullProducts.map(product =>({
        updateOne: {
          filter: { _id: product._id },
          update: { $set: product }
        }
      }))
    )
    debug('------removeFromInventory-----\nsuccess\n', dbUpdatedProducts);
    return {
      internalError: false,
      result: { status: 'success', data: dbUpdatedProducts }
    }
  } catch (error) {
    debug('------removeFromInventory-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, statusError: 401 }
    }
  }
}

function piezasVSdisponibles(itemsPiezas, itemsDisponibles) {
  // retorna [] si todos las piezas de la lista de producto se encuentran disponibles en inventario
  // si no retorna la lista de productos que sobrepasan el inventario
  const greaterThan = itemsPiezas.filter((element, index) => itemsDisponibles[index].disponibles < element.piezas);

  return greaterThan
}

function localOrderUtilityCalculator(data){
  // Calcula la utilidad, costos y venta, además valida que los precios y costos coincidan en DB
  const {
    dbProducts,
    cobroAdicional,
    totalVenta,
    totalCosto
  } = data

  const productsCost = dbProducts.reduce((pila, product) => pila + product.costo, 0);
  const productsPrice = dbProducts.reduce((pila, product) => pila + product.precioPlaza, 0);
  const venta = cobroAdicional ? productsPrice + cobroAdicional.cantidad : productsPrice;
  const costo = productsCost

  if(totalVenta === venta && totalCosto === costo){
    return     {
      sumaMatch: true,
      utility: {
        totalVenta: venta,
        totalCosto: costo,
        utilidad: venta - costo
      }
    }
  }
  return     {
    sumaMatch: false
  }

}

async function createAnyOrder(data){
  // Crea una nueva orden en db
  const orden = new Order(data);
  try {
    const newOrder = await  orden.save();
    debug('------createAnyOrder-----\nsuccess\n', newOrder);
    return {
      internalError: false,
      result: { status: 'success', data: newOrder }
    }
  } catch (error) {
    debug('------createAnyOrder-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, statusError: 401 }
    }
  }
}

async function createAnyUtility(data){
  // registra nueva utilidad en db
  const utilidad = new Utility(data);
  try {
    const newUtility = await  utilidad.save();
    debug('------createAnyUtility-----\nsuccess\n', newUtility);
    return {
      internalError: false,
      result: { status: 'success', data: newUtility }
    }
  } catch (error) {
    debug('------createAnyUtility-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, statusError: 401 }
    }
  }
}

module.exports = router;
