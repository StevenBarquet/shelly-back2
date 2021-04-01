const Joi = require('@hapi/joi'); // Joi is a class so uppercase
const mongoose = require('mongoose');

//------------------------------------------------MODEL DATA BASE------------------------------------------
const orderSchema = new mongoose.Schema({
    envioTipo: {type: String, required: true},
    pagoTipo: {type: String, required: true},
    correo: {type: String, required: true},
    nombre: {type: String, required: true},
    apellido: {type: String, required: true},
    estatus: {type: String, required: true},
    telefono: String,
    guia: String,
    envioGratis: Boolean,
    total: {type: Number, required: true},
    items : [{
        marca: String,
        modelo: String,
        piezas: Number,
        disponibles: Number,
        images: {
            cover: String,
            mini: String,
            extra: [ String ]
        },
        _id : String,
        precio: Number
         }],
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
        collection_id: String
    },
    date: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema)

//------------------------------------------------MODEL DATA VALIDATORS------------------------------------------
function validateOrder(order) {
    const schema = Joi.object({
        envioTipo: Joi.string().min(3).required(),
        pagoTipo: Joi.string().min(3).required(),
        correo: Joi.string().min(3).email().required(),
        nombre: Joi.string().min(3).required(),
        apellido: Joi.string().min(3).required(),
        estatus: Joi.string().min(3).required(),
        telefono: Joi.string().empty(''),
        collection_id: Joi.string().empty(''),
        items : Joi.array().items(Joi.object({
            piezas: Joi.number().integer().required(),
            _id : Joi.string().required()
            }).required()
        ),
        domicilio: Joi.object({
            nombre: Joi.string().empty(''),
            cp: Joi.string().empty(''),
            estado: Joi.string().empty(''),
            municipio: Joi.string().empty(''),
            colonia: Joi.string().empty(''),
            calle: Joi.string().empty(''),
            exterior: Joi.string().empty(''),
            interior: Joi.string().empty(''),
            entreC1: Joi.string().empty(''),
            entreC2: Joi.string().empty(''),
            referencia: Joi.string().empty(''),
            domType: Joi.string().empty(''),
            num: Joi.string().empty('')
        })
    })

    return schema.validate(order)
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

function validateOrderWithId(order) {
    const schema = Joi.object({
        _id: Joi.string().min(3).required(),
        envioTipo: Joi.string().min(3),
        pagoTipo: Joi.string().min(3),
        correo: Joi.string().min(3).email(),
        nombre: Joi.string().min(3),
        apellido: Joi.string().min(3),
        estatus: Joi.string().min(3),
        telefono: Joi.string().empty(''),
        collection_id: Joi.string().empty(''),
        total: Joi.number(),
        items : Joi.array().items(Joi.object({
            piezas: Joi.number().integer(),
            _id : Joi.string(),
            disponibles: Joi.number(),
            precio: Joi.number(),
            marca: Joi.string().min(3),
            modelo: Joi.string().min(3),
            images: Joi.object({
                cover: Joi.string().min(3),
                mini: Joi.string().min(3),
                extra: Joi.array().items(Joi.string().min(3))
                })
            })
        ),
        domicilio: Joi.object({
            nombre: Joi.string().empty(''),
            cp: Joi.string().empty(''),
            estado: Joi.string().empty(''),
            municipio: Joi.string().empty(''),
            colonia: Joi.string().empty(''),
            calle: Joi.string().empty(''),
            exterior: Joi.string().empty(''),
            interior: Joi.string().empty(''),
            entreC1: Joi.string().empty(''),
            entreC2: Joi.string().empty(''),
            referencia: Joi.string().empty(''),
            domType: Joi.string().empty(''),
            num: Joi.string().empty('')
        })
    })

    return schema.validate(order)
}

exports.Order = Order ;
exports.validateOrder = validateOrder;
exports.validateOrderWithId = validateOrderWithId;
exports.validateProducts = validateProducts;