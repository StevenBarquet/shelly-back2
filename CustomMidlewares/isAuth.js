/* eslint-disable max-lines-per-function */

// --------------------------------------IMPORTS------------------------------------
// Dependencies
const debug = require('debug')('app:others');
const { verify, sign } = require('jsonwebtoken');
// Others
const { TOKEN_NAME, TOKEN_SECRET, COOKIE_EXPIRES } = require('../configuration/app-data')

function isAuth(req, res, next){
  const { cookie } = req.headers
  validateCookie(cookie, res, next)
}

function validateCookie(reqCookies, res, next){
  if (!reqCookies){
    debug('------validateCookie-----\nInternal error: Petición sin credenciales');
    const result = { badCredentials: true, errorType: 'Peticion sin credenciales' }
    res.status(400).send(result)
  } else {
    const tokenData = searchCookie(reqCookies);
    if (tokenData.internalError){
      res.status(400).send(tokenData.result)
    } else {
      const token = isValidToken(tokenData.result.authToken)
      if (!token){
        debug('------validateCookie-----\nInternal error: Token inválido');
        const result = { badCredentials: true, errorType: 'Credenciales erroneas o sesion expirada' }
        res.status(400).send(result)
      } else {
        debug('------validateCookie-----\nsuccess: Credenciales validas\n');
        setRefreshToken(token, res)
        return next();
      }
    }
  }
}

function searchCookie(cookies){
  const cookiesArray = cookies.split(';');
  for (let index = 0; index < cookiesArray.length; index++){
    let cookie = cookiesArray[index];
    cookie = cookie.trim();
    const { authToken, reqTokenName } = getCookieData(cookie);
    if (isValidTokenName(reqTokenName)){
      debug('------searchCookie-----\nsuccess: Token loclizado\n');
      return {
        internalError: false,
        result: { status: 'success', authToken }
      }
    }
  }
  debug('------searchCookie-----\nInternal error: Token no loclizado');
  return {
    internalError: true,
    result: { badCredentials: true, errorType: 'Token no loclizado' }
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

function isValidToken(someToken){
  try {
    const payload = verify(someToken, TOKEN_SECRET)
    // Console.log('Decoded token before refresh:\n', payload);
    return payload
  } catch (err){
    debug('\n---Error validating token---\n:', err)
    return null
  }
}

function setRefreshToken(decodedToken, res){
  const { userId, mail, authorizedRoutes, fullName } = decodedToken
  const tokenData = { userId, mail, authorizedRoutes, fullName }
  const refreshToken = sign(tokenData, TOKEN_SECRET, { expiresIn: COOKIE_EXPIRES })
  res.cookie(TOKEN_NAME, refreshToken);
  debug('Refresh token set')
}

module.exports = isAuth