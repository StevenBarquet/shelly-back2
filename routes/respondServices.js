// Expect a function that returns an object as the example

// Const example = {
//     Result: { data: 'payload'},
//     InternalError: false
// }

// Optionally it also expect params to send to the callback function

// At the end with the express metod "res", sends the payload to the client

// Dependencys
const { sign } = require('jsonwebtoken');
// Others
const { TOKEN_SECRET, TOKEN_NAME } = require('../configuration/app-data')

async function wrapDBservice(res, callback, params){
  // Do a query operation and respond
  let getSomething = {}
  if (params){
    getSomething = await callback(params);
  } else {
    getSomething = await callback();
  }

  const { internalError, result } = getSomething
  if (internalError){
    const { statusError } = result
    const { errorType } = result
    const genMessage = 'Error de operacion en el servidor'
    res.status(statusError || 400).send({ ...result, errorType: errorType || genMessage })
  } else {
    res.send(result)
  }
}

async function wrapDBwithCredentials(res, callback, params){
  // Do a query operation and respond
  let getSomething = {}
  if (params){
    getSomething = await callback(params);
  } else {
    getSomething = await callback();
  }

  const { internalError, result } = getSomething
  if (internalError){
    const { statusError } = result
    const { errorType } = result
    const genMessage = 'Error de operacion en el servidor'
    res.status(statusError || 400).send({ ...result, errorType: errorType || genMessage })
  } else {
    const { tokenData } = result
    const accessToken = sign(tokenData, TOKEN_SECRET, { expiresIn: '2h' })
    res.cookie(TOKEN_NAME, accessToken);
    res.send(result)
  }
}

async function wrapDBTakeOffCredentials(res, callback, params){
  // Do a query operation and respond
  let getSomething = {}
  if (params){
    getSomething = await callback(params);
  } else {
    getSomething = await callback();
  }

  const { internalError, result } = getSomething
  if (internalError){
    const { statusError } = result
    const { errorType } = result
    const genMessage = 'Error de operacion en el servidor'
    res.status(statusError || 400).send({ ...result, errorType: errorType || genMessage })
  } else {
    res.cookie(TOKEN_NAME, '');
    res.send(result)
  }
}

function joiCheck(res, validatedBody){
  const { error } = validatedBody;
  if (error){
    const { details } = error
    const result = { errorType: `Datos erroneos: ${details[0].message}`, joiErrors: details }
    res.status(400).send(result)
    return false
  }
  return true
}

function checkParams(res, param, validator){
  if (!param){
    const result = { errorType: 'Faltan parametros en url' }
    res.status(400).send(result)
    return false
  } else if (validator){
    const { error } = validator(param);
    if (error){
      const { details } = error
      const result = { errorType: `Parametro erroneo: ${details[0].message}`, joiErrors: details }
      res.status(400).send(result)
      return false
    }
  }
  return true
}

exports.wrapDBservice = wrapDBservice;
exports.wrapDBwithCredentials = wrapDBwithCredentials;
exports.wrapDBTakeOffCredentials = wrapDBTakeOffCredentials;
exports.joiCheck = joiCheck;
exports.checkParams = checkParams;
