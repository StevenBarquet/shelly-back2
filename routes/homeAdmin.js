/* eslint-disable max-lines-per-function */
// -------------------------------------IMPORTS---------------------------
// Dependencies
const express = require('express');
const debug = require('debug')('app:test')
// Others
const { Home, validateHomeWithID } = require('../data-modell/home');
const { isId } = require('../data-modell/otherValidators');
const { wrapDBservice, joiCheck, checkParams } = require('./respondServices');

const router = express.Router();

// ---------------------------------------------------ROUTES---------------------------------------------
// ------Read Home index 0 ------------
router.get('/getHome', (req, res) => {
  debug('requested for: ', req.originalUrl)
  wrapDBservice(res, getHome);
})
// ------Update One------------
router.put('/editar', (req, res) => {
  debug('requested for: ', req.originalUrl)

  const validateBody = validateHomeWithID(req.body)
  if (joiCheck(res, validateBody)){
    wrapDBservice(res, updateHome, req.body);
  }
})

// ------Delete One------------
router.delete('/borrar/:id', (req, res) => {
  debug('requested for: ', req.originalUrl)

  const { id } = req.params
  if (checkParams(res, id, isId)){
    wrapDBservice(res, deleteOneHome, id);
  }

})
// -------------------------------------------------QUERYS-----------------------------------------

async function getHome(){
  // Trae todos los productos de la base de datos
  try {
    const homes = await Home
      .find()
    try {
      debug('------getAllHome-----\nsuccess\n', homes);
      return {
        internalError: false,
        result: homes[0]
      };
    } catch (error){
      debug('------getAllHome-----\nInternal error\n\n', error);
      return {
        internalError: true,
        result: { ...error, errorType: 'Error al traer home[0] de DB', statusError: 500 }
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

async function updateHome(data){
// Actualiza un producto en la base de datos si existe
  try {
    // Verifica que exista el producto
    const someHome = await Home.findById(data._id)
    debug('------someHome-----\ntest\n', someHome);
    try {
      // Si existe intenta hacer update del producto
      someHome.set({
        ...data
      })
      const result = await someHome.save();
      debug('------updateHome-----\nsuccess\n', result);
      return {
        internalError: false,
        result: { status: 'success' }
      };
    } catch (error){
      // Retorna error si no pudiste hacer update
      debug('------updateHome----\nUpdate error\n\n', error);
      return {
        internalError: true,
        result: { ...error, errorType: 'Error al actualizar el home en DB', statusError: 500 }
      }
    }
  } catch (error){
    // Retorna error si no pudiste hacer busqueda del prod por id no valido
    debug('------updateHome-----\nHome no encontrado\n\n', error);
    return {
      internalError: true,
      result: { ...error, errorType: 'Error al traer el home de DB', statusError: 404 }
    };

  }
}
async function deleteOneHome(id){
// Elimina un producto en la base de datos si existe
  try {
    // Verifica que exista el producto
    await Home.findById(id);
    try {
      // Si existe intenta hacer el DELETE
      const result = await Home.deleteOne({ _id: id })
      debug('------deleteOneHome-----\nsuccess\n', result);
      return {
        internalError: false,
        result: { status: 'success' }
      }
    } catch (error){
      // Retorna error si no pudiste hacer DELETE
      debug('------deleteOneHome----\nInternal error\n\n', error);
      return {
        internalError: true,
        result: { ...error, errorType: 'Error al borrar home de DB', statusError: 401 }
      }
    }
  } catch (error){
    // Retorna error si no pudiste hacer busqueda del prod por id no encontrado
    debug('------deleteOneHome-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, errorType: 'Error al traer el home de DB', statusError: 404 }
    };
  }
}

module.exports = router;
