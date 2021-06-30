/* eslint-disable max-lines-per-function */
// -------------------------------------IMPORTS---------------------------
// Dependencies
const express = require('express');
const debug = require('debug')('app:test');
const bcrypt = require('bcrypt');
const { decode } = require('jsonwebtoken');
// Others
const { User, validateUser, validateUserWithID, validateRoute } = require('../data-modell/users');
const { wrapDBservice, joiCheck, checkParams } = require('./respondServices');
const { isId } = require('../data-modell/otherValidators');
const { SALT_ROUNDS, TOKEN_NAME } = require('../configuration/app-data')

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

// ------Read All SU------------
router.get('su/all', (req, res) => {
  debug('requested for: ', req.originalUrl)
  wrapDBservice(res, getAllUsersSU);
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

// ------Verify Token and Route Access------------
router.post('/routeAuth', (req, res) => {
  debug('requested for: ', req.originalUrl)

  const { cookie } = req.headers
  const validateBody = validateRoute(req.body)
  if (joiCheck(res, validateBody)){
    wrapDBservice(res, validateRouteFromToken, { ...req.body, cookie });
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

async function getAllUsersSU(){
  // Trae todos los productos de la base de datos
  try {
    const users = await User.find()
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
    if (someUser){
      debug('------getOneUser-----\nsuccess\n', someUser);
      return {
        internalError: false,
        result: { status: 'success', user: someUser }
      }
    }
    debug('------getOneUser-----\nInternal error\n\n', someUser);
    return {
      internalError: true,
      result: { errorType: 'Usuario no existente en DB', statusError: 404 }
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

function validateRouteFromToken(data){
  const { cookie, route } = data
  const tokenData = getTokenData(cookie)
  const { authorizedRoutes } = tokenData
  const isAuthorizedRoute = authorizedRoutes.indexOf(route)

  if (isAuthorizedRoute !== -1){
    debug('------validateRouteFromToken-----\nsuccess\n', route, '\n', authorizedRoutes);
    return {
      internalError: false,
      result: { status: 'success', authorizedRoutes }
    }
  }
  debug('------validateRouteFromToken-----\nRuta no autorizada\n', route, '\n', authorizedRoutes);
  return {
    internalError: true,
    result: { errorType: 'Ruta no autorizada', badCredentials: true, statusError: 404 }
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

function getTokenData(cookies){
  const token = searchToken(cookies)
  const decodedToken = decode(token)
  return decodedToken;
}

function searchToken(cookies){
  const cookiesArray = cookies.split(';');
  for (let index = 0; index < cookiesArray.length; index++){
    let cookie = cookiesArray[index];
    cookie = cookie.trim();
    const { authToken, reqTokenName } = getCookieData(cookie);
    if (isValidTokenName(reqTokenName)){
      debug('------searchToken-----\nsuccess: Token loclizado\n');
      return authToken
    }
  }
}

function getCookieData(reqCookie){
  const { length: lengthName } = TOKEN_NAME
  const { length } = reqCookie

  const result = {
    authToken: reqCookie.substring(lengthName + 1, length),
    reqTokenName: reqCookie.substring(0, lengthName)
  }

  return result
}

function isValidTokenName(tokenName){
  if (tokenName && tokenName === TOKEN_NAME){
    return true
  }
  return false
}

module.exports = router;
