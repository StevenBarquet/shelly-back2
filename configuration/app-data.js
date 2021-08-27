const SALT_ROUNDS = 5
exports.SALT_ROUNDS = SALT_ROUNDS

const COOKIE_EXPIRES = '6h'
exports.COOKIE_EXPIRES = COOKIE_EXPIRES

const TOKEN_NAME = 'zkwODY4MH0'
exports.TOKEN_NAME = TOKEN_NAME

const TOKEN_SECRET = 'IsInR5cCI6Ikp'
exports.TOKEN_SECRET = TOKEN_SECRET

const MOCK_HOME = {
  banners: [{ _id: '60a96d52b50d758463c705a2', imgDesk: 'https://www.mediafire.com/convkey/7cf2/ct61qu8p8kpvujxzg.jpg', imgMovil: 'https://www.mediafire.com/convkey/b456/k3piz4b6ab15r0uzg.jpg', link: 'https://github.com/StevenBarquet', visible: true }, { _id: '60a96d52b50d758463c705a3', imgDesk: 'https://www.mediafire.com/convkey/7cf2/ct61qu8p8kpvujxzg.jpg', imgMovil: 'https://www.mediafire.com/convkey/b456/k3piz4b6ab15r0uzg.jpg', text: 'Some text mlg for testing', textColor: '#2493fa', visible: false }, { _id: '60a96d52b50d758463c705a4', imgDesk: 'https://www.mediafire.com/convkey/22d8/1o70e4i2wu9r9i9zg.jpg', imgMovil: 'https://www.mediafire.com/convkey/14ef/lwapegi1cvwyojczg.jpg', text: 'Other testing text but longer because of the test porpouse and quality ensurance', textColor: '#ffffff', visible: true }, { _id: '60a96d52b50d758463c705a5', imgDesk: 'https://www.mediafire.com/convkey/da03/v0ddffwa8rlqcqgzg.jpg', imgMovil: 'https://www.mediafire.com/convkey/90dd/jlgmu644mi9gtkgzg.jpg', visible: true }, { _id: '60a96d52b50d758463c705a6', imgDesk: 'https://www.mediafire.com/convkey/9b68/lq5yrc8ckr5wsruzg.jpg', imgMovil: 'https://www.mediafire.com/convkey/51b3/12u20cbkqvoysf8zg.jpg', visible: true }],
  products: [{ _id: '60edcc88b88ab5e469cad481', porductID: '6065e76bd0f99d179a5b6fe7', 'sortIndex': 0 }, { _id: '60edcc88b88ab5e469cad482', porductID: '606618015f6dca2c8fdbffc2', 'sortIndex': 1 }, { _id: '60edcc88b88ab5e469cad483', porductID: '606618015f6dca2c8fdbffc2', 'sortIndex': 2 }, { _id: '60edcc88b88ab5e469cad484', porductID: '606618015f6dca2c8fdbffc2', 'sortIndex': 3 }],
  paragraph: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum',
  notice: 'Envíos gratis desde $1999 editado',
  paragraphImg: 'https://fjwp.s3.amazonaws.com/blog/wp-content/uploads/2016/09/26105026/bigstock-technology-gaming-entertainm-125893763-1.jpg' }
exports.MOCK_HOME = MOCK_HOME

const ADMIN_SUDO = {
  authorizedRoutes: [
    '/master/utilidadDia',
    '/master/utilidadSemana',
    '/master/utilidadMes',
    '/master/utilidadAño',
    '/master/tienda',
    '/master/adminProductos',
    '/master/addProductos',
    '/master/productInfo',
    '/master/storeCart',
    '/master/adminOrders',
    '/master/editOrder',
    '/master/clientHome',
    '/master',
    '/master/editProfile',
    '/master/adminUsers',
    '/master/createUser'
  ],
  mail: 'soporte@forgemytech.com',
  pass: process.env.ADMIN_PASS || '123456',
  fullName: 'Forge Admin',
  isSupport: true
}
exports.ADMIN_SUDO = ADMIN_SUDO

const domain = process.env.DOMAIN || 'no-domain'
const whitelist = ['http://127.0.0.1', 'https://127.0.0.1', 'http://187.190.193.222', 'https://187.190.193.222', 'http://localhost:3000', 'https://localhost:3000', `http://${domain}`, `https://${domain}`]
const CORS_OPTIONS = {
  credentials: true,
  origin(origin, callback){
    if (whitelist.indexOf(origin) !== -1){
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
exports.CORS_OPTIONS = CORS_OPTIONS

const CATALOGOS = {
  allRoutes: [
    '/master',
    '/master/utilidadDia',
    '/master/utilidadSemana',
    '/master/utilidadMes',
    '/master/utilidadAño',
    '/master/tienda',
    '/master/adminProductos',
    '/master/addProductos',
    '/master/productInfo',
    '/master/storeCart',
    '/master/adminOrders',
    '/master/clientHome',
    '/master/editProfile',
    '/master/adminUsers',
    '/master/createUser'
  ]
}
exports.CATALOGOS = CATALOGOS

const DEF_SORT_PROD_CLIENT = { countVisits: 1 }
exports.DEF_SORT_PROD_CLIENT = DEF_SORT_PROD_CLIENT