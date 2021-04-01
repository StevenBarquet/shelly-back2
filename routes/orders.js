//-------------------------------------IMPORTS---------------------------
// Dependencies
const express = require('express');  
const router = express.Router();
const debug=require('debug')('app:test')
// Others
const {Order, validateOrder, validateOrderWithId, validateProducts} = require('../data-modell/orders');
const {Product} = require('../data-modell/product');
const wrapDBService = require('../other-tools/wrapDBService');
const generadorMP = require('../other-tools/mercadoPay');
const sendOrderMail = require('../other-tools/sendOrderMail');
const sendPayNotification = require('../other-tools/sendPayNotification');

//---------------------------------------------------CONFIGURATIONS-------------------------------------
const costoEnvio = 198;
const envioGratisDesde = 1998

//---------------------------------------------------ROUTES---------------------------------------------
//------Create One------------
router.post('/registrar', (req,res)=>{
    debug('requested from: ', req.url)

    const { error } = validateOrder(req.body)
    if(error){
        debug('Error de Joi')
        res.status(400).send({messageError: error.details[0].message})
        return;
    }

    wrapDBService( res, createOrder, req.body );
})

router.post('/verifyProducts', (req,res)=>{
    debug('requested from: ', req.url)

    const { error } = validateProducts(req.body)
    if(error){
        debug('Error de Joi')
        res.status(400).send({messageError: error.details[0].message})
        return;
    }

    wrapDBService( res, searchProducts, req.body );
})


//------Read All------------
router.get('/todos', (req,res)=>{
    debug('requested from: ', req.url)

    wrapDBService( res, getAllOrders, req.body );
})

// ----- Read One -------
router.get('/master/:id', (req, res)=>{
    debug('requested from: ', req.url)

    const itemId = req.params.id
    if(!itemId){
        res.status(400).send( {error: 'There is no ID for read'} );
        return;
    }

    wrapDBService( res, getOneOrder, itemId );
})
// ----- Read One Public -------
router.get('/:id', (req, res)=>{
    debug('requested from: ', req.url)

    const itemId = req.params.id
    if(!itemId){
        res.status(400).send( {error: 'There is no ID for read'} );
        return;
    }

    wrapDBService( res, getOneOrderPublic, itemId );
})

//------Update One------------
router.put('/editar', (req, res)=>{
    debug('requested from: ', req.url)

    const { error } = validateOrderWithId(req.body)
    if(error){
        debug('Error de Joi')
        res.status(400).send({messageError: error.details[0].message})
        return;
    }

    wrapDBService( res, updateOneOrder, req.body );
})

//------Update Pre-confirm pay------------
router.put('/pagado/:id/', (req, res)=>{
    debug('requested from: ', req.url)

    const itemId = req.params.id
    if(!itemId){
        res.status(400).send( {error: 'There is no ID for delete'} );
        return;
    }

    wrapDBService( res, updateOneOrderPrePay, itemId );
})

//------Delete One------------
router.delete('/borrar/:id', (req, res)=>{
    debug('requested from: ', req.url)

    const itemId = req.params.id
    if(!itemId){
        res.status(400).send( {error: 'There is no ID for delete'} );
        return;
    }

    wrapDBService( res, deleteOneOrder, itemId );
})

//-------------------------------------------------METHODS-----------------------------------------
async function searchProducts(data) {
    const { items } = data;
    const itemsIDs = items.map( item => item._id );
    try {
    // Verifica que existan los productos de la orden
        let someProducts = await Product
        .find({ _id: { $in: itemsIDs}})
        .select({
            _id : 1,
            marca: 1,
            modelo: 1,
            disponibles: 1,
            precio: 1
        })
        return {
            internalError: false,
            result: { someProducts, status: 'success' }
        }
    } catch (error) {
        debug('------No se encontraron los IDs de los productos-----\nInternal error\n\n', error);
        return {
            internalError: true,
            result: { ...error, statusError: 500 }
        }
    }
}

async function createOrder(data) {
//Crea una nueva orden en la base de datos
    const { envioTipo, pagoTipo, correo, nombre, apellido, estatus, telefono, items, domicilio} = data;

        let flagListError = false
        let total=0;
        // en total se calcula la suma de los productos en getProductos

        const someProducts = await mapItems(items);

        async function mapItems(reqItems) {
            const products = []
            for (let i = 0; i < reqItems.length; i++) {
                const result = await getProducts(reqItems[i]._id, reqItems[i].piezas)
                products.push(result)
            }

            return products;
        }

        async function getProducts(id, piezas) {
            // trae los productos uno por uno y verifica si existen y son válidos
            try {
                const someProduct = await Product
                .findById(id)
                .select({
                    _id : 1,
                    marca: 1,
                    modelo: 1,
                    disponibles: 1,
                    precio: 1,
                    images: 1
                })

                let invalidProduct = false;
                let newProduct = {};
                if(!someProduct || piezas > someProduct.disponibles){
                    debug('Es invalido para ',id,': ', someProduct)
                    invalidProduct = true;
                    flagListError = true
                    newProduct = someProduct ? 
                            { 
                            _id: someProduct._id, 
                            piezas, 
                            disponibles: someProduct.disponibles,
                            errorType: 'inventario' 
                        } 
                          : 
                        { _id: id, errorType: 'invalido' }
                } else {
                    // Si es válido
                    total = total + (piezas * someProduct.precio )
                    newProduct = someProduct;
                    newProduct = { ...newProduct._doc, piezas}
                }

                return { 
                    invalidProduct, 
                    someProduct: newProduct
                }
            } catch (err) {
                return { 
                    invalidProduct: true, 
                    someProduct: { _id: id, errorType: 'invalido' }
                }
            }
        }

        const errorList = notValidProducts( flagListError, someProducts );
        if (errorList){
            return {
                internalError: true,
                result: errorList
            }
        }

        function notValidProducts( flag, products) {
            if( flag ){
                const result =  {
                                 error: 'Hay productos no validos en la lista',
                                 products
                            }
                return result
            }
            return false
        }

        const  newItems = someProducts.map(product => product.someProduct);
        // En newItems están los productos sin errores de la orden

        const newOrder = {items: newItems, total, envioTipo, pagoTipo, correo, nombre, apellido, estatus, telefono, domicilio}

        let order;
        if(total>envioGratisDesde && envioTipo === 'paqueteria') 
            order = new Order({...newOrder, envioGratis: true});
        else 
            order = new Order({...newOrder});

        try {
        // intenta guardar orden en la base de datos
            const result = await order.save();
            try {
                await sendOrderMail(result._id, result.correo) // envía notificación de compra por correo
                if(result.pagoTipo === 'online'){
                    try {
                    const newTotal = result.envioGratis ? result.total: (result.total + costoEnvio);
                    const idPreference = await generadorMP(result._id, newTotal) // Genera el id-preference de mercado-pago
                    return {
                        internalError: false,
                        result: { idPreference, status: 'success' }
                    }; 
                    } catch (error) {
                        debug('------No se creo MP ID-----\nInternal error\n\n', error);
                        return {
                            internalError: true,
                            result: { ...error, statusError: 500 }
                        }
                    }
                } else{
                    return {
                        internalError: false,
                        result: { orderID: result._id, status: 'success' }
                    }; 
                }
            } catch (error) {
                debug('------No se envió correo-----\nInternal error\n\n', error);
                return {
                    internalError: true,
                    result: { ...error, statusError: 500 }
                }
            }
        } catch (error) {
            debug('------No se creo orden-----\nInternal error\n\n', error);
            return {
                internalError: true,
                result: { ...error, statusError: 500 }
            }
            
        }
}

async function getAllOrders() {
//Trae todos los productos de la base de datos
    try {
        const someOrders = await Order.find();
        debug('Entra query get: ', someOrders)
        return {
            internalError: false,
            result: someOrders
        };
    } catch (error) {
        debug('------getAllsomeOrders-----\nInternal error\n\n', error);
        return {
            internalError: true,
            result: { ...error, statusError: 500 }
        }
    }
}

async function getOneOrder(id) {
//Trae un producto de la base de datos
    try {
        const someOrder = await Order.findById(id)
        debug('------getOneOrder-----\n', someOrder);
        return {
            internalError: false,
            result: someOrder
        }
    } catch (error) {
        // retorna error si no pudiste hacer busqueda del prod por id no encontrado
        debug('------ID no valido-----\nInternal error\n\n', error);
        return {
            internalError: true,
            result: { error: 'ID not found', statusError: 404 }
        };
    }
}

async function getOneOrderPublic(id) {
    //Trae un producto de la base de datos
        try {
            const someOrder = await Order
            .findById(id)
            .select({ 
                envioTipo: 1,
                pagoTipo: 1,
                estatus: 1 
                })
            debug('------getOneOrder-----\n', someOrder);
            return {
                internalError: false,
                result: someOrder
            }
        } catch (error) {
            // retorna error si no pudiste hacer busqueda del prod por id no encontrado
            debug('------ID no valido-----\nInternal error\n\n', error);
            return {
                internalError: true,
                result: { error: 'ID not found', statusError: 404 }
            };
        }
    }

async function updateOneOrder(data) {
//Actualiza un producto en la base de datos si existe
    try {
            // verifica que exista el producto
            const someOrder = await Order.findById(data._id)
            try {
                // si existe intenta hacer update del producto
                    // así aseguramos enviar a la base sólo estos datos
                    someOrder.set({
                        ...data
                    })
                    const result = await someOrder.save();
                    debug('-> updateOneOrder: Success');
                    return {
                        internalError: false,
                        result: { status: 'success' }
                    };
            } catch (error) {
                // retorna error si no pudiste hacer update
                debug('------Error: no se pudo hacer update de la orden----\nInternal error\n\n', error);
                return {
                    internalError: true,
                    result: { ...error, statusError: 500 }
                }
            }
    } catch (error) {
        // retorna error si no pudiste hacer busqueda del prod por id no valido
        debug('------Error: no se encontró id de orden-----\nInternal error\n\n', error);
        return {
            internalError: true,
            result: { ...error, statusError: 404 }
        };

    }
}

async function updateOneOrderPrePay(id) {
//Actualiza un producto en la base de datos si existe
    try {
            // verifica que exista el orden
            const someOrder = await Order.findById(id)
            try {
            // si existe intenta hacer update del producto
                // si el estatus ya se había actualizado termina solicitud
                if(someOrder.estatus === 'pago:Pre-Confirmado'){
                    return {
                        internalError: false,
                        result: { status: 'Already pre-confirmed' }
                    };
                }
                    someOrder.set({
                        estatus: 'pago:Pre-Confirmado'
                    })
                    debug('------>', someOrder)
                    const result = await someOrder.save();
                    // reducir inventario:
                    
                    const { items } = someOrder;

                    //Necesita optimizaión
                    items.forEach( async item => {
                        try {
                            await Product.findByIdAndUpdate(
                                item._id,
                                {$inc: { disponibles: (-item.piezas)} },
                                { new: true }
                            ) 
                        } catch (error) {
                            debug('------Error al hacer update de productos disponibles----\nInternal error\n\n', error);
                            return {
                                internalError: true,
                                result: { ...error, statusError: 500 }
                            }
                        }
                    });
                    await sendPayNotification( id ) // envía notificación de compra por correo
                    debug('-> updateOneOrderPrePay: Success');
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
        debug('------aaaaaaaah es este-----\nInternal error\n\n', error);
        return {
            internalError: true,
            result: { ...error, statusError: 404 }
        };

    }
}

async function deleteOneOrder(id) {
//Elimina un producto en la base de datos si existe
    try {
    // verifica que exista el producto
        await Order.findById(id);
        try {
            // si existe intenta hacer el DELETE
            const result = await Order.deleteOne({_id: id})
            debug('------removeQuery-----\n', result);
            return {
                internalError: false,
                result: { status: 'success' }
            }
        } catch (error) {
            // retorna error si no pudiste hacer DELETE
            debug('------deleteOneOrder----\nInternal error\n\n', error);
            return {
                internalError: true,
                result: { ...error, statusError: 500 }
            }
        }
    } catch (error) {
        // retorna error si no pudiste hacer busqueda del prod por id no encontrado
        debug('------ID no valido-----\nInternal error\n\n', error);
        return {
            internalError: true,
            result: { ...error, statusError: 404 }
        };
    }
}

module.exports = router;
