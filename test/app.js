const {start} = require('../lib/vcms');


const config = {
  configFilepath: `${__dirname}/.vcms.yml`,
  routers: {
    '/example': require('./example.router'),
    '/session': require('./session.router')
  },
  initSessionFunction: async (session) => {
    if (!session.hello) {
      session.hello = 'hello world from session'
    }
  }
}

// start the server
start(config);