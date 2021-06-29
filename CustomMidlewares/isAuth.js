/* eslint-disable max-lines-per-function */

// --------------------------------------IMPORTS------------------------------------
// Dependencies
const debug = require('debug')('app:others');
const { verify, sign } = require('jsonwebtoken');
// Others
const { TOKEN_NAME, TOKEN_SECRET } = require('../configuration/app-data')

function isAuth(req, res, next){
  const { cookie } = req.headers
  validateCookie(cookie, res, next)
}

function validateCookie(reqCookie, res, next){
  if (!reqCookie){
    debug('------validateCookie-----\nInternal error: Petición sin credenciales');
    const result = { badCredentials: true, errorType: 'Peticion sin credenciales' }
    res.status(400).send(result)
  } else {
    const { authToken, reqTokenName } = getCookieData(reqCookie);
    if (isInvalidTokenName(reqTokenName)){
      debug('------validateCookie-----\nInternal error: Nombre de token erroneo');
      const result = { badCredentials: true, errorType: 'Credenciales erroneas o sesion expirada' }
      res.status(400).send(result)
    } else {
      const token = isValidToken(authToken)
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

function getCookieData(reqCookie){
  const { length: lengthName } = TOKEN_NAME
  const { length } = reqCookie

  const result = {
    authToken: reqCookie.substring(lengthName + 1, length),
    reqTokenName: reqCookie.substring(0, lengthName)
  }

  return result
}

function isInvalidTokenName(tokenName){
  if (tokenName && tokenName === TOKEN_NAME){
    return false
  }
  return true
}

function isValidToken(someToken){
  try {
    const payload = verify(someToken, TOKEN_SECRET)
    debug('Token: ', payload);
    return payload
  } catch (err){
    debug('\n---Error validating token---\n:')
    return null
  }
}

function setRefreshToken(decodedToken, res){
  const { userId, mail, authorizedRoutes, fullName } = decodedToken
  const tokenData = { userId, mail, authorizedRoutes, fullName }
  const refreshToken = sign(tokenData, TOKEN_SECRET, { expiresIn: '30min' })
  res.cookie(TOKEN_NAME, refreshToken);
  debug('Refresh token set')
}

module.exports = isAuth