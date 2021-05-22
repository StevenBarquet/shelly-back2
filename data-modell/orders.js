const Joi = require('joi'); // Joi is a class so uppercase
const mongoose = require('mongoose');

// ------------------------------------------------MODEL DATA BASE------------------------------------------
const orderSchema = new mongoose.Schema({
  // Client Data (optional)
  correo: String,
  nombre: String,
  apellido: String,
  telefono: Number,
  rfc: String,
  domicilio: {
    nombre: String,
    cp: String,
    estado: String,
    municipio: String,
    colonia: String,
    calle: String,
    exterior: String,
    interior: String,
    entreC1: String,
    entreC2: String,
    referencia: String,
    domType: String,
    num: String,
    numAlterno: String
  },
  // Products Data (optional)
  items : [{
    categoria: String,
    nombre: String,
    piezas: Number,
    disponibles: Number,
    images: {
      cover: String,
      mini: String
    },
    _id : String,
    costo: Number,
    precio: Number
  }],
  cobroAdicional: {
    concepto: String,
    cantidad: Number
  },
  // Shipping Data
  envio: {
    tipo: String,
    responsable: String,
    costo: Number,
    nota: String,
    guia: [{ link: String, codigo: String }]
  },
  // Purchase Data (optional)
  ventaTipo: { type: String, required: true }, // local 133, fb, página, etc
  responsableVenta: { type: String, required: true }, // empleado, gerente o cliente
  metodoPago: String,
  notaVenta: String,
  estatus: { type: String, required: true },
  totalVenta: { type: Number, required: true },
  totalCosto: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema)

// ------------------------------------------------MODEL DATA VALIDATORS------------------------------------------

function validateOrderLocal(order) {
  const schema = Joi.object({
    // Client Data (optional)
    correo: Joi.string(),
    nombre: Joi.string(),
    apellido: Joi.string(),
    telefono: Joi.string(),
    domicilio: Joi.object({
      nombre: Joi.string(),
      cp: Joi.string(),
      estado: Joi.string(),
      municipio: Joi.string(),
      colonia: Joi.string(),
      calle: Joi.string(),
      exterior: Joi.string(),
      interior: Joi.string(),
      entreC1: Joi.string(),
      entreC2: Joi.string(),
      referencia: Joi.string(),
      domType: Joi.string(),
      num: Joi.string(),
      numAlterno: Joi.string()
    }),
    // Products Data (optional)
    items : Joi.array().items(
      Joi.object({
        categoria: Joi.string(),
        nombre: Joi.string(),
        piezas: Joi.number().integer(),
        disponibles: Joi.number().integer().required(),
        images: Joi.object({
          cover: Joi.string(),
          mini: Joi.string()
        }),
        _id : Joi.string().required(),
        costo: Joi.number().required(),
        precio: Joi.number().required()
      })).required(),
    cobroAdicional: Joi.object({
      concepto: Joi.string(),
      cantidad: Joi.number()
    }),
    // Shipping Data
    envio: Joi.object({
      tipo: Joi.string(),
      responsable: Joi.string(),
      costo: Joi.number(),
      nota: Joi.string(),
      guia: Joi.array().items(
        Joi.object({
          link: Joi.string(),
          codigo: Joi.string()
        }))
    }),
    // Purchase Data (optional)
    ventaTipo: Joi.string().required(),
    responsableVenta: Joi.string().required(),
    metodoPago: Joi.string().required(),
    notaVenta: Joi.string(),
    estatus: Joi.string().required(),
    totalVenta: Joi.number().required(),
    totalCosto: Joi.number().required()
  })

  return schema.validate(order, { abortEarly: false })
}

function validateOrderLocalWithId(order) {
  const schema = Joi.object({
    // Client Data (optional)
    _id: Joi.string().min(3).required(),
    correo: Joi.string(),
    nombre: Joi.string(),
    apellido: Joi.string(),
    telefono: Joi.string(),
    domicilio: Joi.object({
      nombre: Joi.string(),
      cp: Joi.string(),
      estado: Joi.string(),
      municipio: Joi.string(),
      colonia: Joi.string(),
      calle: Joi.string(),
      exterior: Joi.string(),
      interior: Joi.string(),
      entreC1: Joi.string(),
      entreC2: Joi.string(),
      referencia: Joi.string(),
      domType: Joi.string(),
      num: Joi.string(),
      numAlterno: Joi.string()
    }),
    // Products Data (optional)
    items : Joi.array().items(
      Joi.object({
        categoria: Joi.string(),
        nombre: Joi.string(),
        piezas: Joi.number().integer(),
        disponibles: Joi.number().integer().required(),
        images: Joi.object({
          cover: Joi.string(),
          mini: Joi.string()
        }),
        _id : Joi.string().required(),
        costo: Joi.number().required(),
        precio: Joi.number().required()
      })).required(),
    cobroAdicional: Joi.object({
      concepto: Joi.string(),
      cantidad: Joi.number()
    }),
    // Shipping Data
    envio: Joi.object({
      tipo: Joi.string(),
      responsable: Joi.string(),
      costo: Joi.number(),
      nota: Joi.string(),
      guia: Joi.array().items(
        Joi.object({
          link: Joi.string(),
          codigo: Joi.string()
        }))
    }),
    // Purchase Data (optional)
    ventaTipo: Joi.string().required(),
    responsableVenta: Joi.string().required(),
    metodoPago: Joi.string().required(),
    notaVenta: Joi.string(),
    estatus: Joi.string().required(),
    totalVenta: Joi.number().required(),
    totalCosto: Joi.number().required(),
    date: Joi.date().required()
  })

  return schema.validate(order, { abortEarly: false })
}

function validateProducts(order) {
  const schema = Joi.object({
    items : Joi.array().items(Joi.object({
      piezas: Joi.number().integer().required(),
      _id : Joi.string().required()
    }).required()
    )
  })

  return schema.validate(order)
}

exports.Order = Order ;
exports.validateOrderLocal = validateOrderLocal;
exports.validateOrderLocalWithId = validateOrderLocalWithId;
exports.validateProducts = validateProducts;
