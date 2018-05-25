
exports.default = async () => {
  let config = {};

  config.configFilepath = `${__dirname}/.vcms.yml`;
  routers = {
    '/example': require('./example.router'),
    '/session': require('./session.router')
  };

  config.initSessionFunction = async (session) => {
    if (!session.hello) {
      session.hello = 'hello world from session'
    }
  };

  config.middlewares = [(req, res, next) => {
    console.log(`asking for ${req.url} (log from user-defined middleware)`);
    next();
  }];

  config.publics = [{route: /\/hello/, serve: 'public/world'}];

  return config;
}
