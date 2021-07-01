const debug = require('debug')('app:test')

const searchProductByID = (items, id) => {
  // Busca el index de un id específico en un array con key llamada "_id"
  let found = null;
  const idFIx = typeof id === 'object' ? id.toJSON() : id;
  for (let index = 0; index < items.length; index++){
    const item = items[index];
    debug('item._id', item._id, 'id', idFIx);
    debug('typeof item._id', typeof item._id)
    debug('typeof id', typeof idFIx)
    if (item._id === idFIx){
      found = index;
      break
    }
  }
  debug('Found: ', found);
  return found;
};

function ignoreArgs(someObj, args){
  const keys = Object.keys(someObj);
  const values = Object.values(someObj);
  let newData = {};
  let doCopy = true;

  keys.forEach((key, index) => {
    args.forEach(arg => {
      if (key === arg){
        doCopy = false;
      }
    });
    newData = doCopy ? { ...newData, [key]: values[index] } : newData;
    doCopy = true;
  });
  return newData;
}

exports.searchProductByID = searchProductByID;
exports.ignoreArgs = ignoreArgs;
