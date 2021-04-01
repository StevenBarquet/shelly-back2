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

module.exports = wrapDBservice;
