/* eslint-disable max-lines-per-function */
// --------------------------------------IMPORTS------------------------------------
// Dependencies
const Joi = require('joi'); // Joi is a class so uppercase
const mongoose = require('mongoose');

// ------------------------------------------------MODEL DATA BASE------------------------------------------
const homeSchema = new mongoose.Schema({
  banners: [
    {
      imgDesk: { type: String, required: true },
      imgMovil: String,
      text: String,
      textColor: String,
      link: String,
      visible: { type: Boolean, required: true }
    }
  ],
  products: [
    {
      porductID: { type: String, required: true },
      sortIndex: { type: Number, required: true }
    }
  ],
  paragraph: { type: String, required: true },
  paragraphImg: { type: String, required: true },
  notice: String,
  location: String
});

const Home = mongoose.model('Home', homeSchema)

// ------------------------------------------------MODEL DATA JOI VALIDATORS------------------------------------------

function validateHome(home){
  const schema = Joi.object({
    banners: Joi.array().items(
      Joi.object({
        _id: Joi.string().min(3),
        imgDesk: Joi.string().min(3)
          .required(),
        imgMovil: Joi.string().min(3)
          .required(),
        text: Joi.string().optional(),
        textColor: Joi.string(),
        link: Joi.string().optional(),
        visible: Joi.boolean().required()
      })
    ),
    products: Joi.array().items(
      Joi.object({
        porductID: Joi.string().min(3)
          .required(),
        sortIndex: Joi.number().required()
      })
    ),
    paragraph: Joi.string().min(3)
      .required(),
    paragraphImg: Joi.string().min(3)
      .required(),
    notice: Joi.string().min(3)
      .max(100),
    location: Joi.string().min(3)
      .max(100)
  })

  return schema.validate(home)
}

function validateHomeWithID(home){
  const schema = Joi.object({
    _id: Joi.string().min(3)
      .required(),
    banners: Joi.array().items(
      Joi.object({
        _id: Joi.string().min(3),
        imgDesk: Joi.string().min(3)
          .required(),
        imgMovil: Joi.string().min(3)
          .required(),
        text: Joi.string().optional(),
        textColor: Joi.string(),
        link: Joi.string().optional(),
        visible: Joi.boolean().required()
      })
    ),
    products: Joi.array().items(
      Joi.object({
        porductID: Joi.string().min(3)
          .required(),
        sortIndex: Joi.number().required()
      })
    ),
    paragraph: Joi.string().min(3)
      .required(),
    paragraphImg: Joi.string().min(3)
      .required(),
    notice: Joi.string().min(3)
      .max(100),
    location: Joi.string().min(3)
      .max(100)
  })

  return schema.validate(home)
}

function validateProductsIds(params){
  const schema = Joi.object({
    products: Joi.array().max(12)
      .items(
        Joi.object({
          _id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/u),
          porductID: Joi.string().min(3)
            .required(),
          sortIndex: Joi.number().required()
        })
      )
  })

  return schema.validate(params)
}

exports.Home = Home;
exports.validateHome = validateHome;
exports.validateHomeWithID = validateHomeWithID;
exports.validateProductsIds = validateProductsIds;
