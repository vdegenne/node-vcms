
exports.default = {
  configFilepath: `${__dirname}/.vcms.yml`,
  routers: {
    '/example': require('./example.router'),
    '/session': require('./session.router')
  },
  initSessionFunction: async (session) => {
    if (!session.hello) {
      session.hello = 'hello world from session'
    }
  },
  middlewares: [
    (req, res, next) => {
      console.log(`asking for ${req.url} (log from user-defined middleware)`);
      next();
    }
  ]
};
