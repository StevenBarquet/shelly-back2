// --------------------------------------IMPORTS------------------------------------
// ---Dependencies
const fs = require('fs');
// ---Other
const sslPath = process.env.SSL_PATH || null

// -------------------------------------MAIN METHOD---------------------------------
function getCerts(){
  let certs;

  try {
    if(sslPath)
      certs = {
        cert: fs.readFileSync(`${sslPath}/fullchain.pem`),
        key: fs.readFileSync(`${sslPath}/privkey.pem`)
      };

    else
      certs = {
        cert: fs.readFileSync(`./self-signed-certs/certificate.crt`),
        key: fs.readFileSync(`./self-signed-certs/certificate.key`)
      };
    console.log('exito cert: ', certs);
  } catch (error) {
    certs = {};
    console.log('fallo cert: ', error);
  }

  return certs;
}

module.exports = getCerts;
