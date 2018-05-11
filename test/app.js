const {start} = require('../lib/vcms');

const routers = {
  '/example': require('./example.router')
}


// start the server
start(`${__dirname}/.vcms.yml`, routers);
