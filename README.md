[![npm](https://img.shields.io/npm/v/vcms.svg)](https://www.npmjs.com/package/vcms)

<h2 align="center"><img src="https://raw.githubusercontent.com/vdegenne/node-vcms/master/logo.png" width="110"><br></h2>
<p  align="center"><strong>A tiny node cms (express, objection, express-session/redis, and more)</strong></p>

## Installation

```bash
yarn add vcms
# or
npm i vcms
```

## Starting a project

create `app.js` (or whichever name you like) :

```javascript
const {start} = require('vcms');
start();
```

That is the minimum code possible for an application using `vcms`.  \
You can run this dummy app using : `node app.js`.
This will just start a server on default port `8000` with nothing but a `ping` route :

```bash
curl localhost:8000/ping
```

If this request returns `"pong"` then it means the server has started successfully.

## Adding some routers

So far our application is boring, does nothing but just "ping/pong".  \
The next step is to add some routes to our `vcms` application.  \
`vcms` organises packs of routes in files also called "routers".  \
To demonstrate this type of organisational structure, let's create `greetings.router.js` in the same directory where we created `app.js` and add this content :

```javascript
const {Router} = require('vcms');

const router = Router();

router.get('/hello', async (req, res) => {
  res.send('hello world')
});

router.get('/bye', async (req, res) => {
  res.send('bye world')
});

module.exports = router;
```

Now we have to tell our application to use this router (which provides 2 routes `/hello` and `/bye`).

Let's create `startupconfig.js` , and write the following :

```javascript
module.exports = (config) => {

  config.routers = {
    '/greetings': require('./greetings.router');
  }

  return config;
}
```

It is important that this file is called `startupconfig.js` here (or `startupconfig.ts` for typescript) because the framework will try to find this file in order to init the application.  \
There is just few requirements, the script needs to return a function. This function has one argument `config` which represents the default configuration, and finally the function needs to return this `config` object or an object satisfying the `VcmsOptions` interface.  \
Here is an example using ESNext version to make it more clear :

```typescript
import {StartupFunction, VcmsOptions} from 'vcms';
import {greetingsRouter} from './routers/greetings.router';

export default async (config: VcmsOptions) => {
  /**
   * config.node_env contains the current NODE_ENV if it was set
   * or is equal to 'prod' as a default
   */
  switch (config.node_env) {
    case 'dev':
      config.db_host = 'localhost:5432'; // shorthand
      // config.db_host will be 'localhost'
      // config.db_port will be 5432
      break;

    case 'prod':
      config.db_host = '1.2.3.4';
      config.db_port = 5433;
      break;
  }

  // routers
  config.routers = {
    '/greetings': greetingsRouter
  }

  // http2 example
  config.http2 = true;
  config.http2_cert = process.cwd() + '/server.crt';
  config.http2_key = process.cwd() + '/server.key';


  return config;
}
```

When we restart our application the routes `/greetings/hello` and `/greetings/bye` should be accessibles.  \
Think about the `startupconfig` script as a middleware we can use to rewrite most of application internal configurations.


*The `startupconfig.js` file is the dynamic way to configure the application. Proceed reading the next chapter to see how to configure the application statically.*



## Static Configuration

One particularity of `vcms` is that it has a default state and this state can be customized almost entirely.  \
In the previous section we saw how to configure the application dynamically (say the behavior defined with some code). There is also a static way that precedes the dynamic one. There is three ways of modifying the state statically :

* using a `.vcms.yml` configuration file.
* using environment variables.
* using command-line arguments.

The precedence is performed in the order of the list above. For instance the command-line `--port` argument will override `port` property in the configuration file.

### Using command-line arguments

```bash
# Command-Line Arguments
node app.js --port/-p <number> \
            --local-hostname/-h <string> \
            --database/-d [ --db-type <string> \
                            --db-host <string> \
                            --db-port <number> \
                            --db-name <string> \
                            --db-user <string>
                            --db-password <string> ] \
            --session/-s [ --redis-host <string> ] \
            --session-cookie-domain <string> \
            --http2 [ --http2-key <string> \
                      --http2-cert <string> ]
```


All properties are optionals. Between brackets are the properties that are specifics to the property before hand, for instance `--db-type` is only considered by the application if `--database` has been set.

## Configuration options

| Name                  | Type      | Possible values       | Default     | Description                                                                                                                                                                       |
|-----------------------|-----------|-----------------------|-------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Node Environment      | `string`  | `test`, `dev`, `prod` | `prod`      | Only available as an environmental variable. It is used to load environment-specific options from the configuration file (see *"Configuration File"* section).                    |
| Port                  | `number`  | *                     | 8000        | Listening port of the application.                                                                                                                                                |
| Public Directory      | `string`  | *                     | `public`    | Directory containing static files to serve.                                                                                                                                       |
| Local Hostname        | `string`  | *                     | `localhost` | Local hostname of the local application. It's recommended to use a hostname when using inter-domain cookies or proxy so informations can be shared between urls and applications. |
| Database              | `boolean` | `false`/`true`        | `false`     | Specify if the database support should be enabled or not.                                                                                                                         |
| Session               | `boolean` | `false`/`true`        | `false`     | Specify if the session support should be enabled or not.                                                                                                                          |
| Session Cookie Domain | `string`  | *                     | `localhost` | If the session support is enabled, the main session cookie will use this value as its accessibility scope.                                                                        |

You also have :
- **DB_TYPE**, **DB_HOST**, **DB_PORT**, **DB_NAME**, **DB_USER**, **DB_PASSWORD** ...when the database support is activated
- **REDIS_HOST** ...when the session support is activated


## Configuration file

We can create a file called `.vcms.yml` (yaml file) at the root of our project.

```yaml
port: 3000
local-hostname: hello.app.local

database: true
db-host: localhost:5432

session: false

prod:
  port: 8080
  db-host: 1.2.3.4:5433
  public-directory: public/build
```


## Environmental Variables Equivalent

```bash
# Environmental Variables Version
NODE_ENV
PORT
PUBLIC_DIRECTORY
LOCAL_HOSTNAME
DATABASE
SESSION
SESSION_COOKIE_DOMAIN
HTTP2_REQUIRED
HTTP2_KEY
HTTP2_CERT
```

## notes

- If you want to know more about this framework, please contact me.
- You can propose some PRs on the related github if you want to contribute to this mini project. I'll be more than willing.
