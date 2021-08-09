/* eslint-disable max-lines-per-function */
// -------------------------------------IMPORTS---------------------------
// Dependencies
const express = require('express');
const debug = require('debug')('app:test')
// Others
const { Home } = require('../data-modell/home');
const { wrapDBservice } = require('./respondServices');

const router = express.Router();

// ---------------------------------------------------ROUTES---------------------------------------------
// ------Read Home index 0 for clients ------
router.get('/getHome', (req, res) => {
  debug('requested for: ', req.originalUrl)
  wrapDBservice(res, getHomeClient);
})
// -------------------------------------------------QUERYS-----------------------------------------
async function getHomeClient(){
  // Trae todos los productos de la base de datos
  try {
    const fullHome = await Home
      .find()
      .sort({ sortIndex: 1 });

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
function bannerFilter(homeObj){
  const { banners } = homeObj;
  if (banners && banners.length > 0){
    const newBanners = banners.filter(element => element.visible === true)
    return { ...homeObj.toJSON(), banners: newBanners }
  }

  return homeObj
}

module.exports = router;
