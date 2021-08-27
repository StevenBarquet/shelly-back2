/* eslint-disable no-undefined */
/* eslint-disable max-lines-per-function */
// -------------------------------------IMPORTS---------------------------
// Dependencies
const express = require('express');
const debug = require('debug')('app:test')
// Others
const { Product, validateProduct, validateProductWithId } = require('../data-modell/product');
const { validatePagination, validateSearch, isId } = require('../data-modell/otherValidators')
const { wrapDBservice, joiCheck, checkParams } = require('./respondServices');

const router = express.Router();

// ---------------------------------------------------ROUTES---------------------------------------------
// ------Create One------------
router.post('/registrar', (req, res) => {
  debug('requested for: ', req.originalUrl)

  const validateBody = validateProduct(req.body)
  if (joiCheck(res, validateBody)){
    wrapDBservice(res, createOneProduct, req.body);
  }
})

// ------Read All ------------
router.get('/all', (req, res) => {
  debug('requested for: ', req.originalUrl)
  wrapDBservice(res, getAllProducts);
})

// ------Read All ------------
router.get('/all/inventory', (req, res) => {
  debug('requested for: ', req.originalUrl)
  wrapDBservice(res, getAllProductsInventory);
})

// ----- Read One -------
router.get('/:id', (req, res) => {
  debug('requested for: ', req.originalUrl)

  const { id } = req.params
  if (checkParams(res, id, isId)){
    wrapDBservice(res, getOneProduct, id);
  }

})

// ------Update One------------
router.put('/editar', (req, res) => {
  debug('requested for: ', req.originalUrl)

  const validateBody = validateProductWithId(req.body)
  if (joiCheck(res, validateBody)){
    wrapDBservice(res, updateOneProduct, req.body);
  }

})

// ------Delete One------------
router.delete('/borrar/:id', (req, res) => {
  debug('requested for: ', req.originalUrl)

  const { id } = req.params
  if (checkParams(res, id, isId)){
    wrapDBservice(res, deleteOneProduct, id);
  }

})

// ------Get all paginated------------
router.get('/todos/:pageNumber/:pageSize', (req, res) => {
  debug('requested for: ', req.originalUrl)

  const validateBody = validatePagination(req.params)
  if (joiCheck(res, validateBody)){
    wrapDBservice(res, getAllProductsPaginated, req.params);
  }
})

// ------Get products search------------
router.post('/buscar', (req, res) => {
  debug('requested for: ', req.originalUrl)

  const validateBody = validateSearch(req.body)
  if (joiCheck(res, validateBody)){
    wrapDBservice(res, searchProducts, req.body);
  }

})

// -------------------------------------------------QUERYS-----------------------------------------

async function createOneProduct(data){
// Crea un nuevo producto en la base de datos
  const course = new Product({ ...data });
  try {
    const result = await course.save();
    debug('------createOneProduct-----\nsuccess\n', result);
    return {
      internalError: false,
      result: { status: 'success', data: result }
    };
  } catch (error){
    debug('------createOneProduct-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, errorType: 'Error al crear producto en DB', statusError: 401 }
    }
  }
}

async function getAllProducts(){
// Trae todos los productos de la base de datos
  try {
    const products = await Product.find();
    debug('------getAllProducts-----\nsuccess\n', products);
    return {
      internalError: false,
      result: products
    };
  } catch (error){
    debug('------getAllProducts-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, errorType: 'Error al traer productos de DB', statusError: 500 }
    }
  }
}

async function getAllProductsInventory(){
  // Trae todos los productos de la base de datos
  try {
    const products = await Product.find()
      .select({ _id: 1, nombre: 1, costo: 1, precioOnline: 1, precioPlaza: 1, disponibles: 1, categoria: 1, countPurchases: 1 });
    debug('------getAllProductsInventory-----\nsuccess\n', products);
    return {
      internalError: false,
      result: products
    };
  } catch (error){
    debug('------getAllProductsInventory-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, errorType: 'Error al traer productos de DB', statusError: 500 }
    }
  }
}

async function getAllProductsPaginated(params){
  // Trae todos los productos de la base de datos paginado
  const { pageNumber, pageSize } = params;
  const pageNumberInt = parseInt(pageNumber, 10);
  const pageSizeInt = parseInt(pageSize, 10);
  try {
    const products = await Product
      .find()
      .sort({ nombre: 1 })
      .skip((pageNumberInt - 1) * pageSizeInt)
      .limit(pageSizeInt);
    const productCount = await Product.find().count();

    debug('------getAllProducts-----\nsuccess\n', products);
    return {
      internalError: false,
      result: { productCount, products }
    };
  } catch (error){
    debug('------getAllProducts-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, errorType: 'Error al traer productos de DB', statusError: 500 }
    }
  }
}

function fixFilters(filters){
  const { descuento } = filters
  if (descuento === undefined){
    return filters
  }
  if (descuento){
    return { ...filters, descuento: { $ne: 0 } }
  }
  return { ...filters, descuento: 0 }
}

async function searchProducts(data){
  // Trae todos los productos que coincidan con los criterios de busqueda
  const { pageNumber, pageSize, searchedValue, filters, sortBy } = data;
  const regEx = new RegExp(`.*${searchedValue}.*`, 'iu')
  const sortOrder = sortBy || { nombre: 1 }
  let products = []; let productCount = 0;
  const newFilters = fixFilters(filters);

  try {
    if (searchedValue){
      products = await Product
        .find(newFilters)
        .sort(sortOrder)
        .or([{ nombre: regEx }, { marca: regEx }, { categoria: regEx }, { subcategoria: regEx }, { descripcion: regEx }])
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize);

      productCount = await Product
        .find(newFilters)
        .sort(sortOrder)
        .or([{ nombre: regEx }, { marca: regEx }, { categoria: regEx }, { subcategoria: regEx }, { descripcion: regEx }])
        .countDocuments();
    } else {
      products = await Product
        .find(newFilters)
        .sort(sortOrder)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize);

      productCount = await Product
        .find(newFilters)
        .sort(sortOrder)
        .countDocuments();
    }

    debug('------searchProducts-----\nsuccess\n');
    return {
      internalError: false,
      result: { productCount, products }
    };
  } catch (error){
    debug('------searchProducts-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, errorType: 'Error al traer productos de DB', statusError: 500 }
    }
  }
}

async function getOneProduct(id){
// Trae un producto de la base de datos
  try {
    const someProduct = await Product.findById(id)
    debug('------getOneProduct-----\nsuccess\n', someProduct);
    return {
      internalError: false,
      result: someProduct
    }
  } catch (error){
    // Retorna error si no pudiste hacer busqueda del prod por id no encontrado
    debug('------getOneProduct-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, errorType: 'Error al traer producto de DB', statusError: 404 }
    };
  }
}

async function updateOneProduct(data){
// Actualiza un producto en la base de datos si existe
  try {
    // Verifica que exista el producto
    const someProduct = await Product.findById(data._id)
    try {
      // Si existe intenta hacer update del producto
      someProduct.set({
        ...data
      })
      const result = await someProduct.save();
      debug('------updateOneProduct-----\nsuccess\n', result);
      return {
        internalError: false,
        result: { status: 'success' }
      };
    } catch (error){
      // Retorna error si no pudiste hacer update
      debug('------updateOneProduct----\nInternal error\n\n', error);
      return {
        internalError: true,
        result: { ...error, errorType: 'Error al actualizar producto en DB', statusError: 500 }
      }
    }
  } catch (error){
    // Retorna error si no pudiste hacer busqueda del prod por id no valido
    debug('------updateOneProduct-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, errorType: 'Error al buscar producto en DB', statusError: 404 }
    };

  }
}

async function deleteOneProduct(id){
// Elimina un producto en la base de datos si existe
  try {
    // Verifica que exista el producto
    await Product.findById(id);
    try {
      // Si existe intenta hacer el DELETE
      const result = await Product.deleteOne({ _id: id })
      debug('------deleteOneProduct-----\nsuccess\n', result);
      return {
        internalError: false,
        result: { status: 'success' }
      }
    } catch (error){
      // Retorna error si no pudiste hacer DELETE
      debug('------deleteOneProduct----\nInternal error\n\n', error);
      return {
        internalError: true,
        result: { ...error, errorType: 'Error al borrar producto en DB', statusError: 401 }
      }
    }
  } catch (error){
    // Retorna error si no pudiste hacer busqueda del prod por id no encontrado
    debug('------deleteOneProduct-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, errorType: 'Error al buscar producto en DB', statusError: 404 }
    };
  }
}

module.exports = router;
