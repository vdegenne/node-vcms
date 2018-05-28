# ChangeLog

## [26-05-2018] v1.7.8

* restructuration of `config.ts`.
* Providing the `StartupFunction` type to use with the `startupconfig.js` file to configure the application dynamically.
* `statics` instead of `publics` and add customizable `static` option.
* minor fixes

## [25-05-2018] v1.6.0

* Enhance `publics` configuration capabilities (RegExp support).

## [21-05-2018] v1.5.3

* Structurify the server (see `server.ts` and `Structure` interface). Which eases the testing.
* Add `destroyStructure` function to gracefully close the connections and nullify the structure.

## [21-05-2018] v1.4.0

* Improve the public directories support.
* Add compression middleware.
* Tidy `config.ts` a bit.

## [21-05-2018] v1.3.0

* Add http2 support (`http2`, `http2-key`, `http2-cert`).
* Fix some minor bugs.
* Update `README.md`.


## [18-05-2018] v1.2.0

* dissociate the initialisation of the session in the `getApp` function because it was not modular-proof and was clogging the tests.
* update `README.md`

## [17-05-2018] v1.1.4

* fixes the asynchronous initSessionFunction Middleware.

## [17-05-2018] v1.1.2

* update readme

## [16-05-2018] v1.1.0

* adding startup configuration script support.
* adding `util` test module in npm libraries.

## [15-05-2018] v1.0.6

* logging errors if any happens at start time.

## [15-05-2018] v1.0.1

* update the readme


## [15-05-2018] v1.0.0

* remove `node-env` support in configuration file (as it was prone to design weakness).
* add the `public-directory` option to the configuration file and command line argument (`--public-directory`).
* and some various fixes.
* add this changelog
