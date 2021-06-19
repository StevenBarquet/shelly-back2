/* eslint-disable max-lines-per-function */
// -------------------------------------IMPORTS---------------------------
// Dependencies
const express = require('express');
const debug = require('debug')('app:test')
// Others
const { Home, validateHome, validateHomeWithID } = require('../data-modell/home');
const { isId } = require('../data-modell/otherValidators');
const { wrapDBservice, joiCheck, checkParams } = require('./respondServices');

const router = express.Router();
const mockHome = {
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

// ---------------------------------------------------ROUTES---------------------------------------------
// ------initializate------------
router.post('/initializate', (req, res) => {
  debug('requested for: ', req.originalUrl)

  const validateBody = validateHome(mockHome)
  if (joiCheck(res, validateBody)){
    wrapDBservice(res, startHome, mockHome);
  }
})

// ------Read All ------------
router.get('/all', (req, res) => {
  debug('requested for: ', req.originalUrl)
  wrapDBservice(res, getAllHome);
})
// ------Read Home index 0 ------------
router.get('/getHome', (req, res) => {
  debug('requested for: ', req.originalUrl)
  wrapDBservice(res, getHome);
})
// ------Read Home index 0 for clients ------
router.get('/getHomePublic', (req, res) => {
  debug('requested for: ', req.originalUrl)
  wrapDBservice(res, getHomeClient);
})
// ------Update One------------
router.put('/editar', (req, res) => {
  debug('requested for: ', req.originalUrl)

  const validateBody = validateHomeWithID(req.body)
  if (joiCheck(res, validateBody)){
    wrapDBservice(res, updateHome, req.body);
  }
})

// ------Delete One------------
router.delete('/borrar/:id', (req, res) => {
  debug('requested for: ', req.originalUrl)

  const { id } = req.params
  if (checkParams(res, id, isId)){
    wrapDBservice(res, deleteOneHome, id);
  }

})
// -------------------------------------------------QUERYS-----------------------------------------

async function startHome(data){
// Crea un nuevo Home en la base de datos
  const course = new Home({ ...data });
  try {
    const result = await course.save();
    debug('------startHome-----\nsuccess\n', result);
    return {
      internalError: false,
      result: { status: 'success', data: result }
    };
  } catch (error){
    debug('------startHome-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, errorType: 'Error al crear home en DB', statusError: 401 }
    }
  }
}

async function getAllHome(){
// Trae todos los home de la base de datos
  try {
    const products = await Home.find().sort({ sortIndex: 1 });
    debug('------getAllHome-----\nsuccess\n', products);
    return {
      internalError: false,
      result: products
    };
  } catch (error){
    debug('------getAllHome-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, errorType: 'Error al traer todos los home de DB', statusError: 500 }
    }
  }
}

async function getHome(){
  // Trae todos los productos de la base de datos
  try {
    const homes = await Home
      .find()
      .sort({ sortIndex: 1 });

    try {
      debug('------getAllHome-----\nsuccess\n', homes);
      return {
        internalError: false,
        result: homes[0]
      };
    } catch (error){
      debug('------getAllHome-----\nInternal error\n\n', error);
      return {
        internalError: true,
        result: { ...error, errorType: 'Error al traer home[0] de DB', statusError: 500 }
      }
    }
  } catch (error){
    debug('------getAllHome-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, errorType: 'Error al traer el home de DB', statusError: 500 }
    }
  }
}

async function getHomeClient(){
  // Trae todos los productos de la base de datos
  try {
    const fullHome = await Home
      .find()
      .sort({ sortIndex: 1 });

    try {
      debug('------getAllHome-----\nsuccess\n', fullHome);
      const filtredHome = bannerFilter(fullHome[0])
      return {
        internalError: false,
        result: filtredHome
      };
    } catch (error){
      debug('------getAllHome-----\nInternal error\n\n', error);
      return {
        internalError: true,
        result: { ...error, errorType: 'Error al traer el home[0] filtred de DB', statusError: 500 }
      }
    }
  } catch (error){
    debug('------getAllHome-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, errorType: 'Error al traer el home de DB', statusError: 500 }
    }
  }
}

async function updateHome(data){
// Actualiza un producto en la base de datos si existe
  try {
    // Verifica que exista el producto
    const someHome = await Home.findById(data._id)
    debug('------someHome-----\ntest\n', someHome);
    try {
      // Si existe intenta hacer update del producto
      someHome.set({
        ...data
      })
      const result = await someHome.save();
      debug('------updateHome-----\nsuccess\n', result);
      return {
        internalError: false,
        result: { status: 'success' }
      };
    } catch (error){
      // Retorna error si no pudiste hacer update
      debug('------updateHome----\nUpdate error\n\n', error);
      return {
        internalError: true,
        result: { ...error, errorType: 'Error al actualizar el home en DB', statusError: 500 }
      }
    }
  } catch (error){
    // Retorna error si no pudiste hacer busqueda del prod por id no valido
    debug('------updateHome-----\nHome no encontrado\n\n', error);
    return {
      internalError: true,
      result: { ...error, errorType: 'Error al traer el home de DB', statusError: 404 }
    };

  }
}
async function deleteOneHome(id){
// Elimina un producto en la base de datos si existe
  try {
    // Verifica que exista el producto
    await Home.findById(id);
    try {
      // Si existe intenta hacer el DELETE
      const result = await Home.deleteOne({ _id: id })
      debug('------deleteOneHome-----\nsuccess\n', result);
      return {
        internalError: false,
        result: { status: 'success' }
      }
    } catch (error){
      // Retorna error si no pudiste hacer DELETE
      debug('------deleteOneHome----\nInternal error\n\n', error);
      return {
        internalError: true,
        result: { ...error, errorType: 'Error al borrar home de DB', statusError: 401 }
      }
    }
  } catch (error){
    // Retorna error si no pudiste hacer busqueda del prod por id no encontrado
    debug('------deleteOneHome-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, errorType: 'Error al traer el home de DB', statusError: 404 }
    };
  }
}

function bannerFilter(homeObj){
  const { banners } = homeObj;
  if (banners && banners.length > 0){
    const newBanners = banners.filter(element => element.visible === true)
    return { ...homeObj.toJSON(), banners: newBanners }
  }

  return homeObj
}

module.exports = router;
