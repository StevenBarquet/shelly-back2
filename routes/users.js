/* eslint-disable max-lines-per-function */
// -------------------------------------IMPORTS---------------------------
// Dependencies
const express = require('express');
const debug = require('debug')('app:test');
const bcrypt = require('bcrypt');
// Others
const { User, validateUser, validateUserWithID } = require('../data-modell/users');
const { wrapDBservice, joiCheck, checkParams } = require('./respondServices');
const { isId } = require('../data-modell/otherValidators');
const { SALT_ROUNDS } = require('../configuration/app-data')

const router = express.Router();

// ---------------------------------------------------ROUTES---------------------------------------------
// ------Create One------------
router.post('/registrar', (req, res) => {
  debug('requested for: ', req.originalUrl)

  const validateBody = validateUser(req.body)
  if (joiCheck(res, validateBody)){
    wrapDBservice(res, registerNewUser, req.body);
  }
})

// ------Read All ------------
router.get('/all', (req, res) => {
  debug('requested for: ', req.originalUrl)
  wrapDBservice(res, getAllUsers);
})

// ----- Read One -------
router.post('/one', (req, res) => {
  debug('requested for: ', req.originalUrl)

  const { id } = req.body
  if (checkParams(res, id, isId)){
    wrapDBservice(res, getOneUser, id);
  }
})

// ------Update One------------
router.put('/editar', (req, res) => {
  debug('requested for: ', req.originalUrl)

  const validateBody = validateUserWithID(req.body)
  if (joiCheck(res, validateBody)){
    wrapDBservice(res, updateOneUser, req.body);
  }
})

// ------Delete One------------
router.delete('/borrar', (req, res) => {
  debug('requested for: ', req.originalUrl)

  const { id } = req.body
  if (checkParams(res, id, isId)){
    wrapDBservice(res, deleteOneUsers, id);
  }
})

// --------------------------------------------MAIN QUERYS/FUNCTIONS------------------------------------
async function registerNewUser(data){

  // Si hay errores al buscar correo
  const userExist = await searchByMail(data)
  if (userExist.internalError){
    return { internalError: userExist.internalError, result: userExist.result }
  }

  // Verificar correo no registrado
  if (!userExist.internalError && userExist.result.users.length > 0){
    return { internalError: true, result: { errorType: 'El usuario ya está registrado', statusError: 400 } }
  }

  // Hash pass
  const userWithCryptedPass = await whithCryptedPassword(data)
  if (userWithCryptedPass.internalError){
    return { internalError: userWithCryptedPass.internalError, result: userWithCryptedPass.result }
  }

  // Registar nuevo usuario ó retornar error al registrar
  const dbResult = await createOneUser(userWithCryptedPass.result.newUser)
  return { internalError: dbResult.internalError, result: dbResult.result }
}

async function createOneUser(data){
  const user = new User(data);
  try {
    const dbResult = await user.save();
    debug('------createOneUser-----\nsuccess\n', dbResult);
    return {
      internalError: false,
      result: { status: 'success', data: dbResult }
    };
  } catch (error){
    debug('------createOneUser-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, errorType: 'Error al crear usuario en DB', statusError: 401 }
    }
  }
}

async function getAllUsers(){
// Trae todos los productos de la base de datos
  try {
    const publicFields = {
      _id: 1,
      authorizedRoutes: 1,
      mail: 1,
      fullName: 1
    }
    const users = await User.find({ isSupport: { $exists: false } }).select(publicFields);
    debug('------getAllusers-----\nsuccess\n', users);
    return {
      internalError: false,
      result: { status: 'success', users }
    };
  } catch (error){
    debug('------getAllusers-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, errorType: 'Error al traer usuarios de DB', statusError: 400 }
    }
  }
}

async function getOneUser(id){
// Trae un producto de la base de datos
  try {
    const publicFields = { _id: 1, authorizedRoutes: 1, mail: 1, fullName: 1, rfc: 1, phone: 1, otherPhone: 1, adress: 1, docsUrl: 1 }
    const someUser = await User.findById(id).select(publicFields)
    debug('------getOneUser-----\nsuccess\n', someUser);
    return {
      internalError: false,
      result: { status: 'success', user: someUser }
    }
  } catch (error){
    debug('------getOneUser-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, errorType: 'Error al traer usuario de DB', statusError: 404 }
    };
  }
}

async function updateOneUser(data){
// Actualiza un producto en la base de datos si existe
  try {
    // Verifica que exista el producto
    const someUser = await User.findById(data._id)
    try {
      // Si existe intenta hacer update del producto
      someUser.set({
        ...someUser,
        ...data
      })
      const result = await someUser.save();
      debug('------updateOneUser-----\nsuccess\n', result);
      return {
        internalError: false,
        result: { status: 'success' }
      };
    } catch (error){
      // Retorna error si no pudiste hacer update
      debug('------updateOneUser----\nInternal error\n\n', error);
      return {
        internalError: true,
        result: { ...error, errorType: 'Error al actualizar usuario en DB', statusError: 500 }
      }
    }
  } catch (error){
    // Retorna error si no pudiste hacer busqueda del prod por id no valido
    debug('------updateOneUser-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, errorType: 'Error al buscar usuario en DB', statusError: 404 }
    };

  }
}

async function deleteOneUsers(id){
// Elimina un producto en la base de datos si existe
  try {
    // Verifica que exista el producto
    await User.findById(id);
    try {
      // Si existe intenta hacer el DELETE
      const result = await User.deleteOne({ _id: id })
      debug('------deleteOneUsers-----\nsuccess\n', result);
      return {
        internalError: false,
        result: { status: 'success' }
      }
    } catch (error){
      // Retorna error si no pudiste hacer DELETE
      debug('------deleteOneUsers----\nInternal error\n\n', error);
      return {
        internalError: true,
        result: { ...error, errorType: 'Error al borrar usuario en DB', statusError: 401 }
      }
    }
  } catch (error){
    // Retorna error si no pudiste hacer busqueda del prod por id no encontrado
    debug('------deleteOneUsers-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, errorType: 'Error al buscar usuario en DB', statusError: 404 }
    };
  }
}
// ----------------------------------------------AUX QUERYS--------------------------------------
async function searchByMail(data){
  const { mail } = data;
  const regEx = new RegExp(`.*${mail}.*`, 'iu')
  try {
    const someUsers = await User.find({ mail: regEx })
    debug('------searchByMail-----\nsuccess\n', someUsers);
    return {
      internalError: false,
      result: { status: 'success', users: someUsers }
    }
  } catch (error){
    debug('------searchByMail-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, errorType: 'Error al encryptar password', statusError: 404 }
    }
  }
}

// ----------------------------------------------AUX FUNCTIONS--------------------------------------

async function whithCryptedPassword(user){
  try {
    const { pass } = user
    const salt = await bcrypt.genSalt(SALT_ROUNDS)
    const hashed = await bcrypt.hash(pass, salt)
    debug('------whithCryptedPassword-----\nsuccess\n', hashed);
    return {
      internalError: false,
      result: { status: 'success', newUser: { ...user, pass: hashed } }
    }
  } catch (error){
    debug('------whithCryptedPassword-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, errorType: 'Error al encryptar password', statusError: 404 }
    }
  }
}

module.exports = router;