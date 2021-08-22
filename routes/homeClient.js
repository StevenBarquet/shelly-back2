/* eslint-disable max-lines-per-function */
// -------------------------------------IMPORTS---------------------------
// Dependencies
const express = require('express');
const debug = require('debug')('app:test')
// Others
const { Home, validateProductsIds } = require('../data-modell/home');
const { Product } = require('../data-modell/product');
const { wrapDBservice, joiCheck } = require('./respondServices');

const router = express.Router();

// ---------------------------------------------------ROUTES---------------------------------------------
// ------Read Home index 0 for clients -------
router.get('/getHome', (req, res) => {
  debug('requested for: ', req.originalUrl)
  wrapDBservice(res, getHomeClient);
})

// ------ Get Home Products ------
router.post('/getProducts', (req, res) => {
  debug('requested for: ', req.originalUrl)

  const validateBody = validateProductsIds(req.body)
  if (joiCheck(res, validateBody)){
    wrapDBservice(res, getHomeProducts, req.body);
  }
})

// -------------------------------------------------QUERYS-----------------------------------------
async function getHomeClient(){
  // Trae todos los productos de la base de datos
  try {
    const fullHome = await Home
      .find()

    try {
      debug('------getAllHome-----\nsuccess\n', fullHome);
      const filtredHome = bannerFilter(fullHome[0])
      return {
        internalError: false,
        result: filtredHome
      };
    } catch (error){
      debug('------getAllHome-----\nInternal error\n\n', error);
      return {
        internalError: true,
        result: { ...error, errorType: 'Error al traer el home[0] filtred de DB', statusError: 500 }
      }
    }
  } catch (error){
    debug('------getAllHome-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, errorType: 'Error al traer el home de DB', statusError: 500 }
    }
  }
}
async function getHomeProducts(data){
  const ids = data.products.map(element => element.porductID)
  debug('\nids\n', ids);
  // Trae todos los productos de la base de datos
  try {
    const selectedProps = { _id: 1, nombre: 1, precioOnline: 1, disponibles: 1, categoria: 1, 'images.cover': 1, descuento: 1 }
    const products = await Product.find({
      '_id': { $in: ids }
    }).select(selectedProps)
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
// ------------------------------------------------AUX-METHOD------------------------------------------
function bannerFilter(homeObj){
  const { banners } = homeObj;
  if (banners && banners.length > 0){
    const newBanners = banners.filter(element => element.visible === true)
    return { ...homeObj.toJSON(), banners: newBanners }
  }

  return homeObj
}

module.exports = router;
