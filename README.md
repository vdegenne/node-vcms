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

We can create a file called `.vcms.yml` (yaml file) at the root of our project. By default, the project has a default state, the `.vcms.yml` file let you override some configuration values on demand. Here's a "useless" `.vcms.yml` file. "useless" because it overrides defaults with the same values, but this way you can see which project property you can change :

```yaml
port: 8000

database: false
session: false


db-host: localhost:5432 # assume postgresql by default
redis-host: localhost:6379

node-env: prod
```

**By default, every modules are deactivated (`false`), every connection are `localhost` and the default server listening port is `8000`.**

You can also pass most of the configuration when you invoke your program, for instance :

```bash
node myapp.js --redis-host 1.2.3.4:6379
```

This will override the default `localhost:6379` or the value set inside the `.vcms.yml`. Because `vcms` is aware of precedence.

### Precedence

defaults **<** process.env **<** .vcms.yml file **<** command-line arguments
