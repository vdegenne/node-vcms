[![npm](https://img.shields.io/npm/v/vcms.svg)](https://www.npmjs.com/package/vcms)

# vcms

a tiny node cms (express, objection, express-session/redis, and more).  \
Though it's not really a CMS, it is intended to ease the management of application content back-end.


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

Add `startupconfig.js` , and write the following :

```javascript
const {start} = require('vcms');

start({
  routers: {
    '/greetings': require('./greetings.router')
  }
});
```

When you restart your application the routes `/greetings/hello` and `/greetings/bye` should be accessibles.

*note: When the number of routers grow up, it's good practice to place them in a so called `routers` directory and then write the app like :*
```javascript

start({
  routers: {
    '/greetings': require('./routers/greetings.router'),
    '/api/user': require('./routers/users.router'),
    '/api/articles': require('./routers/articles.router')
  }
});
```



### **middlewares**

You can use middlewares if you need to perform actions before the routers are reached.

```javascript
start({
  ...
  middlewares: [
    (req, res, next) => {
      console.log('hello from middleware');
      next();
    },
    async (req, res, next) => {
      console.log('another middlware');
      next();
    }
  ]
});
```

(*note: middlewares are executed before the routers*).


## Configuration

One particularity of `vcms` is that it has a default state and this state can be customized almost entirely. There is three ways of modifying the state :

* using environment variables.
* using a `.vcms.yml` configuration file.
* using command-line arguments.

The precedence is expressed in the order of the list above. For instance the command-line `--port` argument will override `port` property in the configuration file.
Here are the possible options :

- **NODE ENVIRONMENT** :
  - environment variable:  `NODE_ENV` (e.g. `NODE_ENV=dev`)
  - *default*: `prod`
  - *possible values*: `prod`, `dev` or `test`
  - description: Only available as an environment variable. It is used to load environmental specific option from the configuration file (see *"Configuration file"* section)

- **PORT**:
  - environment variable:   `PORT` (e.g. `PORT=8080`)
  - configuration file:     `port` (e.g. `port: 8080`)
  - command-line argument:  `--port` or `-p` (e.g. `-p 8080`)
  - *default*: `8000`
  - description: Listening port of the application.

- **PUBLIC DIRECTORY**:
  - environment variable:   `PUBLIC_DIRECTORY` (e.g. `PUBLIC_DIRECTORY=public/build/default`)
  - configuration file:     `public-directory` (e.g. `public-directory: public/build/default`)
  - command-line argument:  `--public-directory` (e.g. `--public-directory "public/build/default"`)
  - *default*: `public`
  - description: directory containing static files to serve.

- **LOCAL HOSTNAME**:
  - environment variable:   `LOCAL_HOSTNAME` (e.g. `LOCAL_HOSTNAME=myapp.mydomain.local`)
  - configuration file:     `local-hostname` (e.g. `local-hostname: myapp.mydomain.local`)
  - command-line argument:  `--local-hostname` or `-h` (e.g. `--local-hostname myapp.mydomain.local`)
  - *default*: `localhost`
  - description: Local hostname of your local application. It's recommended to use a hostname when using inter-domain cookies or proxy so informations can be shared between urls and applications.

- **DATABASE**:
  - environment variable:   `DATABASE_REQUIRED` (e.g. `DATABASE_REQUIRED=true`)
  - configuration file:     `database` (e.g. `database: true`)
  - command-line argument:  `--enable-database` or `-d` (e.g. `--enable-database`)
  - *default*: `false`
  - *possible values*: `true` or `false`
  - description: Should activate the database support or not.

- **SESSION**:
  - environment variable:   `SESSION_REQUIRED` (e.g. `SESSION_REQUIRED=true`)
  - configuration file:     `session` (e.g. `session: true`)
  - command-line argument:  `--enable-session` or `-s` (e.g. `--enable-session`)
  - *default*: `false`
  - *possible values*: `true` or `false`
  - description: Should activate the session support or not.

- **SESSION COOKIE DOMAIN**:
  - environment variable:   `SESSION_COOKIE_DOMAIN` (e.g. `SESSION_COOKIE_DOMAIN=.mydomain.local`)
  - configuration file:     `session-cookie-domain` (e.g. `session-cookie-domain: .mydomain.local`)
  - command-line argument:  `--session-cookie-domain` or `-s` (e.g. `--session-cookie-domain ".mydomain.local"`)
  - *default*: `localhost`
  - description: If the session support is activated, the main session cookie will use this domain for inter-domain session communication.

You also have :
- **DB TYPE**, **DB HOST**, **DB PORT**, **DB NAME**, **DB USER**, **DB PASSWORD** ...when the database support is activated
- **REDIS HOST** ...when the session support is activated


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


## notes

- If you want to know more about this framework, please contact me.
- You can propose some PRs on the related github if you want to contribute to this mini project. I'll be more than willing.
