# vcms

a tiny node cms (express, objection/pgsql, express-session/redis, and more...)


## Installation

```bash
yarn add vcms
# or
npm i vcms
```

Then we need to create a configuration file `.vcms.yml` at the root of the project. Here's the minimum content of `.vcms.yml` :

```yaml
```

Yes right, it can be empty. If the file is empty or if it just doesn't exist, `vcms` will initialize a default state.

But let see a more decorated `.vcms.yml` file to understand what are defaults :

```yaml
database: true # default : false
session: true # default: false

dev:
  port: 3001 # default: 8000

prod:
  port: 8080 # default: 8000
  db-host: 1.2.3.4:5432 # default: localhost:5432
```

By default, every modules are deactivated (`false`), every connection are `localhost` and the default server listening port is `8000`.
