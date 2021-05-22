// -------------------------------------IMPORTS---------------------------
// Dependencies
const express = require('express');
const debug=require('debug')('app:test')
// Others
const { Order, validateOrderLocal, validateOrderLocalWithId } = require('../data-modell/orders');
const { Utility } = require('../data-modell/utility');
const { Product } = require('../data-modell/product');
const { wrapDBservice, joiCheck, checkParams } = require('./respondServices');
const { validatePagination, validateSearchOrders, isId } = require('../data-modell/otherValidators')

const router = express.Router();
// ---------------------------------------------------CONFIGURATIONS-------------------------------------
// const costoEnvio = 198;
// const envioGratisDesde = 1998

// ---------------------------------------------------ROUTES---------------------------------------------
// ------Create One------------
router.post('/ventaLocal', async (req, res)=>{
  debug('requested from: ', req.url)

  const validateBody = validateOrderLocal(req.body)
  joiCheck(res, validateBody);

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

// ------Update One------------
router.put('/editar', (req, res)=>{
  debug('requested for: ', req.originalUrl)

  const validateBody = validateOrderLocalWithId(req.body)
  joiCheck(res, validateBody);

  wrapDBservice(res, updateOneOrder, req.body);
})

// ------Delete One------------
router.delete('/borrar/:id', (req, res)=>{
  debug('requested for: ', req.originalUrl)

  const { id } = req.params
  checkParams(res, id, isId)

  wrapDBservice(res, deleteOneOrder, id);
})

// Valida que sean productos de una orden validos
router.post('/verifyProducts', (req, res)=>{
  debug('requested from: ', req.url)

  const validateBody = validateOrderLocal(req.body)
  joiCheck(res, validateBody);

  wrapDBservice(res, validateProductsDB, req.body);
})

// ----- Read One -------
router.get('/:id', (req, res)=>{
  debug('requested for: ', req.originalUrl)

  const { id } = req.params
  checkParams(res, id, isId)

  wrapDBservice(res, getOneOrder, id);
})

// ------Get all paginated------------
router.get('/todos/:pageNumber/:pageSize', (req, res)=>{
  debug('requested for: ', req.originalUrl)

  const validateBody = validatePagination(req.params)
  joiCheck(res, validateBody);

  wrapDBservice(res, getAllOrdersPaginated, req.params);
})

// ------Get products search------------
router.post('/buscar', (req, res)=>{
  debug('requested for: ', req.originalUrl)

  const validateBody = validateSearchOrders(req.body)
  joiCheck(res, validateBody);

  wrapDBservice(res, searchOrders, req.body);
})

// ----------------------------------------------MAIN METHODS---------------------------------------
async function getOneOrder(id) {
  // Trae un producto de la base de datos
  try {
    const someOrder = await Order.findById(id)
    debug('------getOneOrder-----\nsuccess\n', someOrder);
    return {
      internalError: false,
      result: someOrder
    }
  } catch (error) {
    // retorna error si no pudiste hacer busqueda del prod por id no encontrado
    debug('------getOneOrder-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, statusError: 404 }
    };
  }
}

async function createLocalOrder(data){
  // Crea una orden local, registra su utilidad y elimina inventario de los productos vendidos
  const { utility, dbProducts, items, correo, nombre, apellido, telefono, ventaTipo, responsableVenta, metodoPago, estatus, /* opcionales -> */ notaVenta, envio, domicilio, cobroAdicional } = data
  const { totalVenta, totalCosto, utilidad } = utility
  const orderData = { items, totalVenta, totalCosto, correo, nombre, apellido, telefono, ventaTipo, responsableVenta, metodoPago, estatus, /* opcionales -> */ notaVenta, envio, domicilio, cobroAdicional }

  // --Registrar Orden en DB
  const newOrder = await createAnyOrder(orderData)
  if(newOrder.internalError){
    debug('------createLocalOrder-----\nError al crear orden\n\n', newOrder.result);
    return newOrder
  }

  // --Registrar Utilidad en DB
  const utilityData = { idOrden: newOrder.result.data._id, utilidad, metodoPago }
  const utilityDBresponse = await createAnyUtility(utilityData)
  if(utilityDBresponse.internalError){
    debug('------createLocalOrder-----\nError al registrar utilidad\n\n', utilityDBresponse.result);
    return utilityDBresponse
  }

  // --Remover inventario vendido en DB y hacer incremento de contador de venta por producto
  const removeInvresponse = await removeFromInventory(dbProducts, items);
  if(removeInvresponse.internalError){
    debug('------createLocalOrder-----\nError al remover stock del inventario\n\n', removeInvresponse.result);
    return removeInvresponse
  }

  // --Retornar success de orden creada y todo lo que implica
  debug('------createLocalOrder-----\nsuccess\n');
  return {
    internalError: false,
    result: {
      status: 'success'
      // data: newOrder
    }
  };
}

async function updateOneOrder(data) {
  // Actualiza una orden en la base de datos si existe

  // Valida que todos los productos existan
  const dbProducts= await searchProductsLocal(data.items);
  if(dbProducts.length === 0 || dbProducts.length !== data.items.length)
    return(
      { internalError: true,
        result: { errorType: 'Productos no encontrados', productosValidos: dbProducts || [] }
      })

  // verifica que exista la orden
  try {
    const someOrder = await Order.findById(data._id)
    try {
      // si existe intenta hacer update de la orden
      someOrder.set({
        ...data
      })
      const result = await someOrder.save();
      debug('------updateOneOrder-----\nsuccess\n', result);
      return {
        internalError: false,
        result: { status: 'success' }
      };
    } catch (error) {
      // retorna error si no pudiste hacer update
      debug('------updateOneOrder----\nInternal error\n\n', error);
      return {
        internalError: true,
        result: { ...error, statusError: 500 }
      }
    }
  } catch (error) {
    // retorna error si no pudiste hacer busqueda de la orden por id no valido
    debug('------updateOneProduct-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, statusError: 404 }
    };

  }
}

async function deleteOneOrder(id) {
  // Elimina un producto en la base de datos si existe
  try {
    // verifica que exista el producto
    await Order.findById(id);
    try {
      // si existe intenta hacer el DELETE
      const result = await Order.deleteOne({ _id: id })
      debug('------deleteOneOrder-----\nsuccess\n', result);
      return {
        internalError: false,
        result: { status: 'success' }
      }
    } catch (error) {
      // retorna error si no pudiste hacer DELETE
      debug('------deleteOneOrder----\nInternal error\n\n', error);
      return {
        internalError: true,
        result: { ...error, statusError: 401 }
      }
    }
  } catch (error) {
    // retorna error si no pudiste hacer busqueda del prod por id no encontrado
    debug('------deleteOneOrder-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, statusError: 404 }
    };
  }
}

async function getAllOrdersPaginated(params) {
  // Trae todos los productos de la base de datos paginado
  const { pageNumber, pageSize } = params;
  const pageNumberInt = parseInt(pageNumber);
  const pageSizeInt = parseInt(pageSize);
  try {
    const order = await Order
      .find()
      .sort({ date: 1 })
      .skip((pageNumberInt-1) *  pageSizeInt)
      .limit(pageSizeInt)
    ;
    const orderCount = await Order.find().countDocuments();

    debug('------getAllOrdersPaginated-----\nsuccess\n', order);
    return {
      internalError: false,
      result: { orderCount, order }
    };
  } catch (error) {
    debug('------getAllOrdersPaginated-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, statusError: 500 }
    }
  }
}

async function searchOrders(data) {
  // Trae todos los productos que coincidan con los criterios de busqueda
  const { pageNumber, pageSize, searchedValue, filters, sortBy } = data;
  const regEx = new RegExp('.*'+searchedValue+'.*', 'i')
  const fixFilters = cleanDateTimeFilters(filters)
  const sortOrder = sortBy || { date: 1 }
  let orders; let orderCount;

  try {
    if(searchedValue){
      orders = await Order
        .find(fixFilters)
        .sort(sortOrder)
        .or([{ nombre: regEx }, { apellido: regEx }, { telefono: regEx }, { ventaTipo: regEx }, { responsableVenta: regEx }, { metodoPago: regEx }, { notaVenta: regEx }, { estatus: regEx }])
        .skip((pageNumber-1) *  pageSize)
        .limit(pageSize);

      orderCount = await Order
        .find(fixFilters)
        .sort(sortOrder)
        .or([{ apellido: regEx }, { telefono: regEx }, { ventaTipo: regEx }, { responsableVenta: regEx }, { metodoPago: regEx }, { notaVenta: regEx }, { estatus: regEx }])
        .countDocuments();
    } else{
      orders = await Order
        .find(fixFilters)
        .sort(sortOrder)
        .skip((pageNumber-1) *  pageSize)
        .limit(pageSize);

      orderCount = await Order
        .find(fixFilters)
        .sort(sortOrder)
        .countDocuments();
    }

    debug('------searchOrders-----\nsuccess\n', orders);
    return {
      internalError: false,
      result: { orderCount, orders }
    };
  } catch (error) {
    debug('------searchOrders-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, statusError: 500 }
    }
  }
}

async function validateProductsDB(data) {
  // Valida si la lista de productos existen, son válidos en la db y los costos y precios coincidan
  const products = data.items
  const { cobroAdicional } = data

  // Case: No hay productos pero si hay cobro adicional
  if(products.length === 0 && cobroAdicional && cobroAdicional.cantidad > 0){
    const utilityAdicional= {
      totalVenta: cobroAdicional.cantidad,
      totalCosto: 0,
      utilidad: cobroAdicional.cantidad
    }
    return(
      { internalError: false,
        result: { status: 'success', onlyCobroAdicional: true, dbProducts: [], utility: utilityAdicional }
      })
  }

  // Case: No hay productos ni cobro adicional
  if(products.length < 1)
    return(
      { internalError: true,
        result: { errorType: 'Sin productos o cobro adicional no se puede registrar orden', products }
      })

  // Case: Si hay productos pero ya no estan disponibles en DB
  const dbProducts= await searchProductsLocal(products);
  if(dbProducts.length === 0 || dbProducts.length !== products.length)
    return(
      { internalError: true,
        result: { errorType: 'Productos no encontrados', productosValidos: dbProducts || [] }
      })

  // Case: Si hay productos pero no hay stock de las piezas solicitadas
  const piezas= piezasVSdisponibles(products, dbProducts);
  if(piezas.length !== 0)
    return(
      { internalError: true,
        result: { errorType: 'Productos con piezas no disponibles', productosError: piezas }
      })

  // Case: Los precios o costos no coinciden en DB
  const { sumaMatch, utility } = localOrderUtilityCalculator({ ...data, dbProducts });
  if(!sumaMatch)
    return(
      { internalError: true,
        result: { errorType: 'El precio o costo de los productos no coincide con DB', productosValidos: dbProducts }
      })

  // Case: Exito
  return (
    {
      internalError: false,
      result: { status: 'success', dbProducts, utility }
    }
  )
}
// -------------------------------------------------METHODS-----------------------------------------
async function searchProductsLocal(items) {
  // valida que un array de productos coincida en DB y retorna la lista desde la DB
  const itemsIDs = items.map(item => item._id);
  try {
    // Verifica que existan los productos de la orden
    const someProducts = await Product
      .find({ _id: { $in: itemsIDs }, disponibles: { $gt: 0 } })
    return someProducts
  } catch (error) {
    debug('------No se encontraron los IDs de los productos-----\nInternal error\n\n', error);
    return []
  }
}

async function removeFromInventory(fullProducts, soldProducts) {
  // construye un array de productos con inventario descontado y lo actualiza en db
  const newFullProducts = fullProducts.map((product, index)=>{
    const { disponibles, countPurchases } =product;
    return {
      ...product.toJSON(),
      disponibles: disponibles-soldProducts[index].piezas,
      countPurchases: countPurchases?countPurchases+1: 1
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
    items,
    cobroAdicional,
    totalVenta,
    totalCosto
  } = data

  const productsCost = dbProducts.reduce((pila, product, index) => pila + (product.costo*items[index].piezas), 0);
  const productsPrice = dbProducts.reduce((pila, product, index) => pila + (product.precioPlaza*items[index].piezas), 0);
  const venta = cobroAdicional ? productsPrice + cobroAdicional.cantidad : productsPrice;
  const costo = productsCost

  // debug('venta: ', venta, ', costo: ', costo);
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

function cleanDateTimeFilters(filters) {
  if(!filters)
    return null
  const { startDate, finalDate } = filters
  if(startDate){
    const regEx ={ $gte: `${startDate}T00:00:00.000+00:00`, $lte: `${finalDate}T23:59:59.000+00:00` }
    delete filters.startDate;
    delete filters.finalDate;
    return { ...filters, date: regEx }
  }
  return filters
}

module.exports = router;
