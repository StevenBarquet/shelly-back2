// -------------------------------------IMPORTS---------------------------
// Dependencies
const express = require('express');
const debug=require('debug')('app:test')
// Others
const { Product } = require('../data-modell/product');
const { validatePagination, validateSearch } = require('../data-modell/otherValidators')
const wrapDBservice = require('./wrapDBservice');

const router = express.Router();

// ---------------------------------------------------ROUTES---------------------------------------------
// ------Read All ------------
router.get('/all', (req, res)=>{
  debug('requested for: ', req.originalUrl)
  wrapDBservice(res, getAllProducts);
})

// ----- Read One -------
router.get('/:id', (req, res)=>{
  debug('requested for: ', req.originalUrl)

  const itemId = req.params.id
  if(!itemId){
    res.status(400).send({ error: 'There is no ID for search' })
    return;
  }

  wrapDBservice(res, getOneProduct, itemId);
})

// ------Get all paginated------------
router.get('/todos/:pageNumber/:pageSize', (req, res)=>{
  debug('requested for: ', req.originalUrl)

  const validateBody = validatePagination(req.params)
  if(validateBody.error){
    res.status(400).send(validateBody.error)
    return;
  }

  // res.send({ status: 'success', data:  req.params })
  wrapDBservice(res, getAllProductsPaginated, req.params);
})

// ------Get all paginated with category------------

// ------Search------------
router.post('/buscar', (req, res)=>{
  debug('requested for: ', req.originalUrl)

  const validateBody = validateSearch(req.body)
  if(validateBody.error){
    res.status(400).send(validateBody.error)
    return;
  }

  // res.send({ status: 'success', data:  req.params })
  wrapDBservice(res, searchProducts, req.body);
})

// -------------------------------------------------QUERYS-----------------------------------------

async function getAllProducts() {
// Trae todos los productos de la base de datos
  try {
    const products = await Product
      .find({ online: true, disponibles: { $gt: 0 } }) // Trae todos los productos marcados para venta online y con disponibilidad mayor a 0
      .select({ _id: 1, nombre: 1, precioOnline: 1, disponibles: 1, categoria: 1, subcategoria: 1, images: 1 }) ;
    debug('------getAllProducts-----\nsuccess\n', products);
    return {
      internalError: false,
      result: products
    };
  } catch (error) {
    debug('------getAllProducts-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, statusError: 500 }
    }
  }
}

async function getAllProductsPaginated(params) {
  // Trae todos los productos de la base de datos paginado
  const { pageNumber, pageSize } = params;
  const pageNumberInt = parseInt(pageNumber);
  const pageSizeInt = parseInt(pageSize);
  try {
    const products = await Product
      .find()
      .sort({ nombre: 1 })
      .select({ _id: 1, nombre: 1, precioOnline: 1, disponibles: 1, categoria: 1, subcategoria: 1, images: 1 })
      .skip((pageNumberInt-1) *  pageSizeInt)
      .limit(pageSizeInt)
    ;
    const productCount = await Product.find().count();

    debug('------getAllProducts-----\nsuccess\n', products);
    return {
      internalError: false,
      result: { productCount, products }
    };
  } catch (error) {
    debug('------getAllProducts-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, statusError: 500 }
    }
  }
}

async function searchProducts(data) {
  // Trae todos los productos que coincidan con los criterios de busqueda
  const { pageNumber, pageSize, searchedValue, filters } = data;
  const regEx = new RegExp('.*'+searchedValue+'.*', 'i')
  let products; let productCount;

  try {
    if(searchedValue){
      products = await Product
        .find(filters)
        .select({ _id: 1, nombre: 1, precioOnline: 1, disponibles: 1, categoria: 1, subcategoria: 1, images: 1 })
        .or([{ nombre: regEx }, { marca: regEx }, { categoria: regEx }, { subcategoria: regEx }, { descripcion: regEx }])
        .skip((pageNumber-1) *  pageSize)
        .limit(pageSize);

      productCount = await Product
        .find(filters)
        .select({ _id: 1, nombre: 1, precioOnline: 1, disponibles: 1, categoria: 1, subcategoria: 1, images: 1 })
        .or([{ nombre: regEx }, { marca: regEx }, { categoria: regEx }, { subcategoria: regEx }, { descripcion: regEx }])
        .count();
    } else{
      products = await Product
        .find(filters)
        .select({ _id: 1, nombre: 1, precioOnline: 1, disponibles: 1, categoria: 1, subcategoria: 1, images: 1 })
        .skip((pageNumber-1) *  pageSize)
        .limit(pageSize);

      productCount = await Product
        .find(filters)
        .select({ _id: 1, nombre: 1, precioOnline: 1, disponibles: 1, categoria: 1, subcategoria: 1, images: 1 })
        .count();
    }

    debug('------getAllProducts-----\nsuccess\n', products);
    return {
      internalError: false,
      result: { productCount, products }
    };
  } catch (error) {
    debug('------getAllProducts-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, statusError: 500 }
    }
  }
}

async function getOneProduct(id) {
// Trae un producto de la base de datos
  try {
    const someProduct = await Product.findById(id).select({ _id: 1, nombre: 1, precioOnline: 1, disponibles: 1, categoria: 1, subcategoria: 1, images: 1 });
    debug('------getOneProduct-----\nsuccess\n', someProduct);
    return {
      internalError: false,
      result: someProduct
    }
  } catch (error) {
    // retorna error si no pudiste hacer busqueda del prod por id no encontrado
    debug('------getOneProduct-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, statusError: 404 }
    };
  }
}

module.exports = router;
