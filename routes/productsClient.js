/* eslint-disable no-undefined */
/* eslint-disable max-lines-per-function */
// -------------------------------------IMPORTS---------------------------
// Dependencies
const express = require('express');
const debug = require('debug')('app:test')
// Others
const { Product } = require('../data-modell/product');
const { validatePagination, validateSearch, isId } = require('../data-modell/otherValidators')
const { wrapDBservice, joiCheck, checkParams } = require('./respondServices');
const { DEF_SORT_PROD_CLIENT } = require('../configuration/app-data');

const router = express.Router();

// ---------------------------------------------------ROUTES---------------------------------------------
// ------Read All ------------
router.get('/all', (req, res) => {
  debug('requested for: ', req.originalUrl)
  wrapDBservice(res, getAllProducts);
})

// ----- Read One -------
router.get('/:id', (req, res) => {
  debug('requested for: ', req.originalUrl)

  const { id } = req.params
  if (checkParams(res, id, isId)){
    wrapDBservice(res, getOneProduct, id);
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

// ------Get all paginated with category------------

// ------Search------------
router.post('/buscar', (req, res) => {
  debug('requested for: ', req.originalUrl)

  const validateBody = validateSearch(req.body)
  if (joiCheck(res, validateBody)){
    wrapDBservice(res, searchProducts, req.body);
  }

})

// -------------------------------------------------QUERYS-----------------------------------------

async function getAllProducts(){
// Trae todos los productos de la base de datos
  try {
    const products = await Product
      .find({ online: true, disponibles: { $gt: 0 } }) // Trae todos los productos marcados para venta online y con disponibilidad mayor a 0
      .select({ _id: 1, nombre: 1, precioOnline: 1, disponibles: 1, categoria: 1, images: 1 });
    debug('------getAllProducts-----\nsuccess\n', products);
    return {
      internalError: false,
      result: products
    };
  } catch (error){
    debug('------getAllProducts-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, errorType: 'Error al traer el productos de DB', statusError: 500 }
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
      .select({ _id: 1, nombre: 1, precioOnline: 1, disponibles: 1, categoria: 1, images: 1 })
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
      result: { ...error, errorType: 'Error al traer el productos de DB', statusError: 500 }
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
  const sortOrder = sortBy || DEF_SORT_PROD_CLIENT
  const selectValues = { _id: 1, nombre: 1, precioOnline: 1, descuento: 1, disponibles: 1, categoria: 1, 'images.cover': 1 }
  let products = []; let productCount = 0;
  const newFilters = fixFilters({ ...filters, disponibles: { $gt: 0 } });

  try {
    if (searchedValue){
      products = await Product
        .find(newFilters)
        .sort(sortOrder)
        .select(selectValues)
        .or([{ nombre: regEx }, { marca: regEx }, { categoria: regEx }, { subcategoria: regEx }])
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize);

      productCount = await Product
        .find(newFilters)
        .sort(sortOrder)
        .select(selectValues)
        .or([{ nombre: regEx }, { marca: regEx }, { categoria: regEx }, { subcategoria: regEx }])
        .countDocuments();
    } else {
      products = await Product
        .find(newFilters)
        .sort(sortOrder)
        .select(selectValues)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize);

      productCount = await Product
        .find(newFilters)
        .sort(sortOrder)
        .select(selectValues)
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
      result: { ...error, errorType: 'Error al traer el productos de DB', statusError: 500 }
    }
  }
}

async function getOneProduct(id){
// Trae un producto de la base de datos
  try {
    const someProduct = await Product.findById(id).select({ _id: 1, descripcion: 1, nombre: 1, precioOnline: 1, disponibles: 1, categoria: 1, images: 1, marca: 1, nuevo: 1, estetica: 1 });
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
      result: { ...error, errorType: 'Error al traer el producto de DB', statusError: 404 }
    };
  }
}

module.exports = router;
