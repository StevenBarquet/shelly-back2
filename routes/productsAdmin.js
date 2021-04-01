// -------------------------------------IMPORTS---------------------------
// Dependencies
const express = require('express');

const router = express.Router();
const debug=require('debug')('app:test')
// Others
const { Product, validateProduct, validateProductWithId } = require('../data-modell/product');
const wrapDBservice = require('./wrapDBservice');

// ---------------------------------------------------ROUTES---------------------------------------------
// ------Create One------------
router.post('/registrar', (req, res)=>{
  debug('requested for: ', req.originalUrl)

  // debug('\n----muere aquí-----\n')

  const validateBody = validateProduct(req.body)
  if(validateBody.error){
    res.status(400).send(validateBody.error)
    return;
  }

  wrapDBservice(res, createOneProduct, req.body);
})

// ------Read All ------------
router.get('/todos', (req, res)=>{
  debug('requested for: ', req.originalUrl)
  wrapDBservice(res, getAllProducts);
})

// ----- Read One -------
router.get('/:id', (req, res)=>{
  debug('requested for: ', req.originalUrl)

  const itemId = req.params.id
  if(!itemId){
    res.status(400).send({ error: 'There is no ID for search' })
    return;
  }

  wrapDBservice(res, getOneProduct, itemId);
})

// ------Update One------------
router.put('/editar', (req, res)=>{
  debug('requested for: ', req.originalUrl)

  const validateBody = validateProductWithId(req.body)
  if(validateBody.error){
    res.status(400).send(validateBody.error)
    return;
  }

  wrapDBservice(res, updateOneProduct, req.body);
})

// ------Delete One------------
router.delete('/borrar/:id', (req, res)=>{
  debug('requested for: ', req.originalUrl)

  const itemId = req.params.id
  if(!itemId){
    res.status(400).send({ error: 'There is no ID for delete' })
    return;
  }

  wrapDBservice(res, deleteOneProduct, itemId);
})

// ------Get products count------------
// ------Get all paginated------------

// -------------------------------------------------QUERYS-----------------------------------------

async function createOneProduct(data) {
// Crea un nuevo producto en la base de datos
  const course = new Product({ ...data });
  try {
    const result = await  course.save();
    debug('------createOneProduct-----\nsuccess\n', result);
    return {
      internalError: false,
      result: { status: 'success', data: result }
    };
  } catch (error) {
    debug('------createOneProduct-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, statusError: 401 }
    }
  }
}

async function getAllProducts() {
// Trae todos los productos de la base de datos
  try {
    const products = await Product.find();
    debug('------getAllProducts-----\nsuccess\n', products);
    return {
      internalError: false,
      result: products
    };
  } catch (error) {
    debug('------getAllProducts-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, statusError: 500 }
    }
  }
}

async function getOneProduct(id) {
// Trae un producto de la base de datos
  try {
    const someProduct = await Product.findById(id)
    debug('------getOneProduct-----\nsuccess\n', someProduct);
    return {
      internalError: false,
      result: someProduct
    }
  } catch (error) {
    // retorna error si no pudiste hacer busqueda del prod por id no encontrado
    debug('------getOneProduct-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, statusError: 404 }
    };
  }
}

async function updateOneProduct(data) {
// Actualiza un producto en la base de datos si existe
  try {
    // verifica que exista el producto
    const someProduct = await Product.findById(data._id)
    try {
      // si existe intenta hacer update del producto
      someProduct.set({
        ...data
      })
      const result = await someProduct.save();
      debug('------updateOneProduct-----\nsuccess\n', result);
      return {
        internalError: false,
        result: { status: 'success' }
      };
    } catch (error) {
      // retorna error si no pudiste hacer update
      debug('------updateOneProduct----\nInternal error\n\n', error);
      return {
        internalError: true,
        result: { ...error, statusError: 500 }
      }
    }
  } catch (error) {
    // retorna error si no pudiste hacer busqueda del prod por id no valido
    debug('------updateOneProduct-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, statusError: 404 }
    };

  }
}
async function deleteOneProduct(id) {
// Elimina un producto en la base de datos si existe
  try {
    // verifica que exista el producto
    await Product.findById(id);
    try {
      // si existe intenta hacer el DELETE
      const result = await Product.deleteOne({ _id: id })
      debug('------deleteOneProduct-----\nsuccess\n', result);
      return {
        internalError: false,
        result: { status: 'success' }
      }
    } catch (error) {
      // retorna error si no pudiste hacer DELETE
      debug('------deleteOneProduct----\nInternal error\n\n', error);
      return {
        internalError: true,
        result: { ...error, statusError: 500 }
      }
    }
  } catch (error) {
    // retorna error si no pudiste hacer busqueda del prod por id no encontrado
    debug('------deleteOneProduct-----\nInternal error\n\n', error);
    return {
      internalError: true,
      result: { ...error, statusError: 404 }
    };
  }
}

module.exports = router;
