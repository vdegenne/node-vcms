const {start} = require('../lib/vcms');

const configFilepath = `${__dirname}/.vcms.yml`;

console.log(configFilepath);

// start the server
start(configFilepath);
