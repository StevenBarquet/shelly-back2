const debug = require('debug')('app:test')

const searchProductByID = (items, id) => {
  // Busca el index de un id específico en un array con key llamada "_id"
  let found = null;
  const idFIx = typeof id === 'object' ? id.toJSON() : id;
  for (let index = 0; index < items.length; index++){
    const item = items[index];
    const fixedItemId = typeof item._id === 'object' ? item._id.toJSON() : item._id;
    if (fixedItemId === idFIx){
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
