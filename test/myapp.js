const {start} = require('../lib/vcms');

const configFilepath = `${__dirname}/.vcms.yml`;

// start the server
start(configFilepath);
