# vcms

A tiny node cms (express, objection, express-session/redis, and more)


## Installation

```bash
yarn add vcms
# or
npm i vcms
```

## Starting a project

create a `myapp.js` file :

```javascript
const {start} = require('vcms');

start();
```

That is the minimum code that you can write to make a `vcms` application. Run using `node myapp.js`. Of course this will just start a server on default port `8000` with nothing but a `ping` route :

```bash
curl localhost:8000/ping
```

Try this, if it returns `pong` then it means the project has started successfully.
It is noot very interesting for now but you can add some routers later on. But let see how to configure a bit the environment.

## Configuration

We can create a file called `.vcms.yml` (yaml file) at the root of our project. By default, the project has a default state, the `.vcms.yml` file let you override some configuration values in the state. Here's a "useless" `.vcms.yml` file. "useless" because it overrides defaults with the same values, but this way you can see what project properties you can change :

```yaml
port: 8000

database: false
session: false


db-host: localhost:5432 # assume postgresql by default
redis-host: localhost:6379

node-env: prod
```

**By default, every modules are deactivated (`false`), every connection are `localhost` , the default server listening port is `8000`, and the default node environment is `prod`.**

You can also pass most of the configuration values when you invoke your program, for instance :

```bash
node myapp.js --redis-host 1.2.3.4:6379
```

This will override the default `localhost:6379` or the value `redis-host` if set inside the `.vcms.yml`.

### Precedence

`vcms` is aware of precedence :

defaults **<** process.env **<** .vcms.yml file **<** command-line arguments


## Routers

So far the application is boring and just ping/pong. `vcms` best usage is to define group of routes in file called "routers". To demonstrate, let's create `example.router.js` at the root of the project and let's copy/paste the following snippet inside :

```javascript
const {Router} = require('vcms');

const router = Router();

// GET /hello
router.get('/hello', (req, res) => {
  res.send('hello world');
});

// GET /bye
router.get('/bye', (req, res) => {
  res.send('bye world');
});

module.exports = router;
```

and modify `myapp.js` to register the previous created router :

```javascript
const {start, registerRouter} = require('vcms');
const exampleRouter = require('./example.router');

registerRouter('/example', exampleRouter);

start();
```

When you restart your application the routes `/example/hello` and `/example/bye` are accessibles.

(*note: When the number of routers grow up, it's good practice to place them in a so called `routers` directory*)
