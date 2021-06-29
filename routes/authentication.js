/* eslint-disable max-lines-per-function */
// -------------------------------------IMPORTS---------------------------
// Dependencies
const express = require('express');
const debug = require('debug')('app:test');
const bcrypt = require('bcrypt');
// Others
const { User, validateLogin } = require('../data-modell/users');
const { wrapDBwithCredentials, wrapDBTakeOffCredentials, joiCheck } = require('./respondServices');

const router = express.Router();

// ---------------------------------------------------ROUTES---------------------------------------------
// ------Create One------------
router.post('/login', (req, res) => {
  debug('requested for: ', req.originalUrl)

  const validateBody = validateLogin(req.body)
  if (joiCheck(res, validateBody)){
    wrapDBwithCredentials(res, doLogin, req.body);
  }
})

// ------Create One------------
router.get('/logout', (req, res) => {
  debug('requested for: ', req.originalUrl)

  wrapDBTakeOffCredentials(res, doLogout);
})

// --------------------------------------------MAIN QUERYS/FUNCTIONS------------------------------------
function doLogout(){
  debug('------doLogout-----\nsuccess\n');
  return {
    internalError: false,
    result: { status: 'success' }
  }

}
async function doLogin(data){

  // Si hay errores al buscar correo
  const userExist = await searchByMail(data)
  if (userExist.internalError){
    return { internalError: userExist.internalError, result: userExist.result }
  }

  // Buscar el correo
  if (!userExist.internalError && userExist.result.users.length !== 1){
    return { internalError: true, result: { errorType: 'Usuario o contraseña incorrectos', statusError: 400 } }
  }

  // Validar password
  const dbUser = userExist.result.users[0]
  const credentials = await isValidPass(data, dbUser)
  if (credentials.internalError){
    return { internalError: credentials.internalError, result: credentials.result }
  }

  // Traer catalogo de usuarios
  const allUserNames = await getAllUserNames();
  if (allUserNames.internalError){
    return { internalError: allUserNames.internalError, result: allUserNames.result }
  }

  // Instalar access token y notificar success
  return { internalError: credentials.internalError, result: credentials.result }
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
    debug('------searchByMail-----\nInternal error: Contraeña incorrecta\n', error);
    return {
      internalError: true,
      result: { ...error, errorType: 'Usuario o contraseña incorrectos', statusError: 400 }
    }
  }
}

async function getAllUserNames(){
  try {
    const someUsers = await User.find({ isSupport: { $exists: false } }).select({ fullName: 1 });
    debug('------getAllUserNames-----\nsuccess\n', someUsers);
    return {
      internalError: false,
      result: { status: 'success', users: someUsers }
    }
  } catch (error){
    debug('------getAllUserNames-----\nInternal error: Error al traer usuarios de DB\n', error);
    return {
      internalError: true,
      result: { ...error, errorType: 'Error al traer usuarios de DB', statusError: 400 }
    }
  }
}
// ----------------------------------------------AUX FUNCTIONS--------------------------------------

async function isValidPass(reqUser, dbUser){
  try {
    const { pass: reqPass } = reqUser
    const { pass: dbPass, _id, fullName, authorizedRoutes, mail } = dbUser

    const passMatch = await bcrypt.compare(reqPass, dbPass)
    if (!passMatch){
      debug('------isValidPass-----\nInternal error: Password no coincide\n', passMatch);
      return {
        internalError: true,
        result: { errorType: 'Usuario o contraseña incorrectos', statusError: 400 }
      }
    }
    debug('------isValidPass-----\nsuccess\n', passMatch);
    return {
      internalError: false,
      result: { status: 'success', tokenData: { _id, fullName, authorizedRoutes, mail } }
    }
  } catch (error){
    debug('------isValidPass-----\nInternal error\n', error);
    return {
      internalError: true,
      result: { ...error, errorType: 'Error al encryptar password', statusError: 404 }
    }
  }
}

module.exports = router;
