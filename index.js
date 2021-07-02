// --------------------------------------IMPORTS------------------------------------
// Dependencies
const express = require('express');
const debugProd = require('debug')('app:prod')
// Middlewares
const helmet = require('helmet');
const cors = require('cors');
const isAuth = require('./CustomMidlewares/isAuth')
// Routes
const productAdminRoutes = require('./routes/productsAdmin')
const productClientRoutes = require('./routes/productsClient')
const homeAdminServicesRoutes = require('./routes/homeAdmin')
const homeClientServicesRoutes = require('./routes/homeClient')
const orderRoutes = require('./routes/orders')
const analyticsRoutes = require('./routes/analytics')
const usersRoutes = require('./routes/crudUsers')
const authRoutes = require('./routes/authentication')
const initRoutes = require('./routes/initializate')
const utilitiesRoutes = require('./routes/utilities')
// Otros
const startLogs = require('./configuration/startLogs')
const mongoConnect = require('./configuration/mongoConfig')
const getCerts = require('./configuration/getCerts')
const { CORS_OPTIONS } = require('./configuration/app-data')

// -----------------------------------CONFIG-------------------------------
const app = express();
const enviroment = process.env.NODE_ENV || 'development'
const port = process.env.PORT || 4000

mongoConnect();
startLogs(enviroment); // Just and example of posible use of configs

// -----------------------------------MIDDLEWARES-------------------------------
app.use(express.json()); // Needed to read req.body
app.use(helmet()); // For security
app.use(cors(CORS_OPTIONS)); // For security

// -----------------------------------ROUTES-------------------------------
app.use('/admin/productos/', isAuth, productAdminRoutes)
app.use('/client/productos/', productClientRoutes)
app.use('/admin/home/', isAuth, homeAdminServicesRoutes)
app.use('/client/home/', homeClientServicesRoutes)
app.use('/ordenes/', isAuth, orderRoutes)
app.use('/analytics/', isAuth, analyticsRoutes)
app.use('/users/', isAuth, usersRoutes)
app.use('/authentication/', authRoutes)
app.use('/init/', initRoutes)
app.use('/utilities/', isAuth, utilitiesRoutes)


// -----------------------------------SSL-------------------------------
const http = require('http');
const https = require('https');

const trySSL = process.env.USE_SSL || false // Set use of https from enviroment

const server = trySSL ? https : http
const options = trySSL ? getCerts() : {}; // Get ssl certs if https true

// -----------------------------------SERVER-------------------------------
server
  .createServer(options, app)
  .listen(port, () => {
    debugProd('https ', trySSL, ` listening to port ${port}...`)
  });
