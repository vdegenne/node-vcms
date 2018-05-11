# vcms

A tiny node cms (express, objection, express-session/redis, and more).  \
Though it's not really a CMS, it is intended to ease the management of application content back-end.


## Installation

```bash
yarn add vcms
# or
npm i vcms
```

## Starting a project

create `app.js` file (or whatever name you like) :

```javascript
const {start} = require('vcms');

start();
```

That is the minimum code possible for an application using `vcms`.  \
You can then run this dummy app with : `node myapp.js`.
Of course this will just start a server on default port `8000` with nothing but a `ping` route, try :

```bash
curl localhost:8000/ping
```

If it returns `pong` then it means the project has started successfully.

## Adding some routers

So far the application is boring and just "ping/pong".
The next step is to add some routes to your `vcms` application.  \
`vcms` organises routes in group of routes in files also called "routers".  \
To demonstrate this type of organisational structure, let's create `greetings.router.js` at the root where you created `app.js` in the previous section, and paste this inside :

```javascript
const {Router} = require('vcms');

const router = Router();

// GET /hello
router.get('/hello', async (req, res) => {
  res.send('hello world');
});

// GET /bye
router.get('/bye', async (req, res) => {
  res.send('bye world');
});

module.exports = router;
```

Now you have to tell your application to use this router (which provides 2 routes `/hello` and `/bye`).

Modify `app.js` :

```javascript
const {start} = require('vcms');
const greetingsRouter = require('./greetings.router');

const myrouters = {
  '/greetings': greetingsRouter
}

start({
  routers: myrouters
});
```

`myrouters` is an object containing **key**/**value**, the **key** is the base of the router (url suffix) and the **value** is the router you want to register in your app.

When you restart your application the routes `/greetings/hello` and `/greetings/bye` are reachable.

(*note: When the number of routers grow up, it's good practice to place them in a so called `routers` directory*)


## Configuration

We can create a file called `.vcms.yml` (yaml file) at the root of our project. By default, the project has a default state, the `.vcms.yml` file let you override some configuration values in the state.  \
Here's a "useless" `.vcms.yml` file. "useless" because it overrides defaults with the same values, but this way you can see what project properties you can change :

```yaml
port: 8000

database: false
session: false


db-host: localhost:5432 # assume postgresql by default
redis-host: localhost:6379

node-env: prod
```

*By default, every modules are deactivated (`false`), every connection are `localhost` , the default server listening port is `8000`, and the default node environment is `prod`.*

You can also pass most of the configuration values when you invoke your program, for instance :

```bash
node myapp.js --enable-session --redis-host 1.2.3.4:6379
```

This will override the default `localhost:6379` or the value `redis-host` if set inside the `.vcms.yml`.

### Precedence

`vcms` is aware of precedence :

defaults **<** process.env **<** .vcms.yml file **<** command-line arguments


