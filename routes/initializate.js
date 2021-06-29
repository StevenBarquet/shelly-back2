/* eslint-disable max-lines-per-function */
// -------------------------------------IMPORTS---------------------------
// Dependencies
const express = require('express');
const debug = require('debug')('app:test');
const bcrypt = require('bcrypt');
// Others
const { Home, validateHome } = require('../data-modell/home');
const { User, validateSupportUser } = require('../data-modell/users');
const { wrapDBservice, joiCheck } = require('./respondServices');
const { SALT_ROUNDS, ADMIN_SUDO, MOCK_HOME } = require('../configuration/app-data')

const router = express.Router();

// ---------------------------------------------------ROUTES---------------------------------------------
// ------Create One init------------
router.get('/su/registrar/init', (req, res) => {
  debug('requested for: ', req.originalUrl)

  const validateBody = validateSupportUser(ADMIN_SUDO)
  if (joiCheck(res, validateBody)){
    wrapDBservice(res, registerNewUser, ADMIN_SUDO);
  }
})

// ------initializate------------
router.get('/shome/initializate', (req, res) => {
  debug('requested for: ', req.originalUrl)

  const validateBody = validateHome(MOCK_HOME)
  if (joiCheck(res, validateBody)){
    wrapDBservice(res, startHome, MOCK_HOME);
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

async function startHome(data){
  // Validar no más de un home registradp
  const isSingle = await validateSingleHome()
  if (isSingle.internalError){
    return {
      internalError: true,
      result: isSingle.result
    }
  }
  // Crear home en DB
  const home = new Home({ ...data });
  try {
    const result = await home.save();
    debug('------startHome-----\nsuccess\n', result);
    return {
      internalError: false,
      result: { status: 'success', data: result }
    };
  } catch (error){
    debug('------startHome-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, errorType: 'Error al crear home en DB', statusError: 401 }
    }
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

async function validateSingleHome(){
  try {
    const homeArray = await Home.find();
    if (homeArray.length >= 1){
      debug('------validateSingleHome-----\nInternal error: Multiples home en DB\n', homeArray);
      return {
        internalError: true,
        result: { errorType: 'Multiples home en DB', statusError: 404 }
      }
    }
    debug('------validateSingleHome-----\nsuccess\n', homeArray);
    return {
      internalError: false,
      result: { status: 'success' }
    }
  } catch (error){
    debug('------validateSingleHome-----\nError al buscar homeArray en DB\n\n', error);
    return {
      internalError: true,
      result: { ...error, errorType: 'Error al buscar home en DB', statusError: 404 }
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
