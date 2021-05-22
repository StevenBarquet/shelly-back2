// Expect a function that returns an object as the example

// const example = {
//     result: { data: 'payload'},
//     internalError: false
// }

// Optionally it also expect params to send to the callback function

// At the end with the express metod "res", sends the payload to the client

async function wrapDBservice(res, callback, params) {
  // do a query operation and respond
  let getSomething
  if(params) getSomething = await callback(params);
  else getSomething = await callback();

  const { internalError, result } = getSomething
  if(internalError){
    const { statusError } = result
    res.status(statusError || 400).send(result)
  } else {
    res.send(result)
  }
}

function joiCheck(res, validatedBody) {
  const { error } = validatedBody;
  if (error){
    const { details } =error
    const respond = {
      internalError: true,
      result: { errorType: `Datos erroneos: ${details[ 0 ].message}`, joiErrors: details }
    }
    res.status(400).send(respond)
  }

}

function checkParams(res, param, validator){
  if(!param){
    const respond = {
      internalError: true,
      result: { errorType: `Faltan parametros en url` }
    }
    res.status(400).send(respond)
  } else if(validator){
    const { error } = validator(param);
    if (error){
      const { details } =error
      const respond = {
        internalError: true,
        result: { errorType: `Parametro erroneo: ${details[ 0 ].message}`, joiErrors: details }
      }
      res.status(400).send(respond)
    }
  }
}

exports.wrapDBservice = wrapDBservice;
exports.joiCheck = joiCheck;
exports.checkParams = checkParams;
