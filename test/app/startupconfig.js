
exports.default = async () => {
  let config = {};

  config.configFilepath = `${__dirname}/.vcms.yml`;

  config.routers = {'/api': require('./api.router')};

  config.initSessionFunction = async (session) => {
    if (!session.hello) {
      session.hello = 'hello world from session'
    }
  };

  // config.middlewares = [(req, res, next) => {
  //   console.log(`asking for ${req.url} (log from user-defined middleware)`);
  //   next();
  // }];

  config.publics = [
    {route: /\/hello/, serve: 'test/app/public'},
    {route: '/statics', serve: 'test/app/public'}
  ];

  return config;
}
