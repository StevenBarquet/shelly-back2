const config = require('config');
const debug=require('debug')('app:prod')

function startLogs(enviroment){
  debug('------------ Backend dunning as: ', enviroment, '------------\n\n');

  debug('App name: ', config.get('name'));
  debug('App mail: ', config.get('mail.user'), '\n');

}

module.exports = startLogs;
