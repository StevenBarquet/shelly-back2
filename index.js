// --------------------------------------IMPORTS------------------------------------
// Dependencies
const express = require('express');
const config = require('config');
const mongoose = require('mongoose');
const debugProd=require('debug')('app:prod')
// Middlewares
const helmet = require('helmet');
const cors = require('cors');
// Routes
const productAdminRoutes = require('./routes/productsAdmin')
// Otros
const startLogs= require('./configuration/startLogs')

// -----------------------------------CONFIG-------------------------------
const app = express();
const enviroment= process.env.NODE_ENV || 'development'
const port = process.env.PORT || 4000

// Mongo conect to base
mongoose.connect(config.get('mongoDB'), { useNewUrlParser: true, useFindAndModify:true, useUnifiedTopology: true }) // return a promise
  .then(()=>debugProd(`'Conected to ${config.get('mongoDB')}...`))
  .catch(err=> debugProd('Couldnt connect because:\n', err))

startLogs(enviroment); // Just and example of posible use of configs

// -----------------------------------MIDDLEWARES-------------------------------
app.use(express.json()); // needed to read req.body
app.use(helmet()); // for security
app.use(cors()); // for security

// -----------------------------------ROUTES-------------------------------
app.use('/admin/productos/', productAdminRoutes)
// app.use('/ordenes', ordersRoutes)

// -----------------------------------SSL-------------------------------
const http = require('http');
const https = require('https');
const fs = require('fs');

let optionsSSL

try {
  optionsSSL = {
    key: fs.readFileSync('./certificates/certificate.key'),
    cert: fs.readFileSync('./certificates/certificate.crt')
  };
} catch (error) {
  optionsSSL = {};
}

const trySSL = process.env.USE_SSL || false // Set use of https from enviroment

const server = trySSL ? https : http
const options = trySSL ? optionsSSL : {}

// -----------------------------------SERVER-------------------------------
server
  .createServer(options, app)
  .listen(port, () => {
    debugProd('https ', trySSL, ' listening to port ' + port + '...')
  });
