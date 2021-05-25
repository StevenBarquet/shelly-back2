const config = require('config');
const mongoose = require('mongoose');
const debugProd=require('debug')('app:prod')

async function mongoConnect(){
  // Mongo conect to base
  try {
    await mongoose.connect(config.get('mongoDB'), { useNewUrlParser: true, useFindAndModify:true, useUnifiedTopology: true }) // return a promise
    debugProd(`Conected to ${config.get('mongoDB')}...`)
  } catch (err) {
    debugProd('Couldnt connect because:\n', err)
  }finally {
    debugProd('Connection finished...')
  }
}

module.exports = mongoConnect;
