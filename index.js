// --------------------------------------IMPORTS------------------------------------
// Dependencies
const express = require('express');
const debugProd=require('debug')('app:prod')
// Middlewares
const helmet = require('helmet');
const cors = require('cors');
// Routes
const productAdminRoutes = require('./routes/productsAdmin')
const productClientRoutes = require('./routes/productsClient')
const homeServicesRoutes = require('./routes/home')
const orderRoutes = require('./routes/orders')
const analyticsRoutes = require('./routes/analytics')
const utilitiesRoutes = require('./routes/utilities')
// Otros
const startLogs= require('./configuration/startLogs')
const mongoConnect= require('./configuration/mongoConfig')
const getCerts= require('./configuration/getCerts')

// -----------------------------------CONFIG-------------------------------
const app = express();
const enviroment= process.env.NODE_ENV || 'development'
const port = process.env.PORT || 4000

mongoConnect();
startLogs(enviroment); // Just and example of posible use of configs

// -----------------------------------MIDDLEWARES-------------------------------
app.use(express.json()); // needed to read req.body
app.use(helmet()); // for security
app.use(cors()); // for security

// -----------------------------------ROUTES-------------------------------
app.use('/admin/productos/', productAdminRoutes)
app.use('/client/productos/', productClientRoutes)
app.use('/homeServices/', homeServicesRoutes)
app.use('/ordenes/', orderRoutes)
app.use('/analytics/', analyticsRoutes)
app.use('/utilities/', utilitiesRoutes)

// -----------------------------------SSL-------------------------------
const http = require('http');
const https = require('https');

const trySSL = process.env.USE_SSL || false // Set use of https from enviroment

const server = trySSL ? https : http
const options = trySSL ? getCerts(): {}; // get ssl certs if https true

// -----------------------------------SERVER-------------------------------
server
  .createServer(options, app)
  .listen(port, () => {
    debugProd('https ', trySSL, ' listening to port ' + port + '...')
  });
