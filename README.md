# @orbiting/backends

This repo contains all the backend code in use at Republik. For easier development the previously separate repos [republik-backend](https://github.com/orbiting/republik-backend), [publikator-backend](https://github.com/orbiting/publikator-backend), [assets-backend](https://github.com/orbiting/assets-backend) and [backend-modules](https://github.com/orbiting/backend-modules) where merged into this monorepo.

## Components

This repo is devided between `servers` and `packages`.
- **servers:** this directory contains runnable servers
- **packages:** contains code shared between the servers

TODO: system diagram

## Usage

### ENVs

In development environment variables are loaded from `./.env`, `../../.env` (in this order, relative to node's cwd). This is done with the help of [backend-modules-env](packages/env) and enables you to define a `.env` file at the root of this repo for common variables and also store server specific envs at `servers/*/.env`. `./.env` takes precedence over `../../.env` because existing env variables are never overwritten.
No ENV variabeles are loaded from any file in production, you yourself are responsible to set all required ENVs in the production environment.

Checkout [.env.example](.env.example), [servers/republik/.env.example](servers/republik/.env.example), [servers/publikator/.env.example](servers/publikator/.env.example), [servers/assets/.env.example](servers/assets/.env.example) for which ENVs are required and their descriptions. Check the packages' README for further config options.

At the moment many ENV variables are required for the servers to just run. We are in the process of improving this and deactivate affected functions if ENVs are missing, to provide a smother way of trying out our code.


### Quick start

- You must have node (8.3.0+) installed, postgres and redis running somewhere.
- Copy the `.env.example` files to `.env` (root and server) and adapt them to your needs.
- Install dependencies with `yarn install`
- Run it: `yarn run dev`

The last command kicks on [foreman](https://github.com/strongloop/node-foreman) which then launches all the servers locally.

## Caveats

Due to the this [bug](https://github.com/yarnpkg/yarn/issues/4964) running bin scripts from the server subfolders doesn't work. Currently the following workaround is in place: `test:prepare` of republik and publikator first does: `rm -rf node_modules/.bin && ln -s ../../../node_modules/.bin node_modules/`.

## Licensing
The source code and it's documentation is licensed under [GNU AGPLv3](LICENSE)+.
