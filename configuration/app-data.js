const SALT_ROUNDS = 5
exports.SALT_ROUNDS = SALT_ROUNDS

const TOKEN_NAME = 'zkwODY4MH0'
exports.TOKEN_NAME = TOKEN_NAME

const TOKEN_SECRET = 'IsInR5cCI6Ikp'
exports.TOKEN_SECRET = TOKEN_SECRET

const MOCK_HOME = {
  banners: [
    {
      imgDesk: 'https://png.pngtree.com/thumb_back/fw800/back_our/20190620/ourmid/pngtree-business-desktop-banner-image_167746.jpg',
      imgMovil: 'https://blog.creatopy.com/wp-content/uploads/2019/05/Standard-Banner-Sizes-2.png',
      text: 'Some text for testing purpuses',
      textColor: 'DarkBlue',
      link: 'https://github.com/StevenBarquet',
      visible: true
    }
  ],
  products: [
    {
      porductID: '6065e76bd0f99d179a5b6fe7',
      sortIndex: 0
    }, {
      porductID: '606618015f6dca2c8fdbffc2',
      sortIndex: 1
    }
  ],
  sortIndex: 0,
  paragraph: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum',
  notice: 'Envíos gratis desde $1999'
}
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