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


### Special setup: develop on two hosts
The following setup enables to start the servers (backends and republik-frontend) on one machine (A) and access it from another (B). This can come handy if you want to develop the backend on A and the app on B.

#### Machine A (servers)
1. To resolve the hostnames add the following line to `/etc/hosts`:
```
127.0.1.1	dev.localdomain api.dev.localdomain
```

2. Adapt hostnames in the environment variables:
- in `backends/.env`
```
FRONTEND_BASE_URL=http://dev.localdomain
```
- in `backends/servers/republik/.env`
```
CORS_WHITELIST_URL=http://dev.localdomain
COOKIE_DOMAIN=dev.localdomain
PUBLIC_WS_URL_BASE=ws://api.dev.localdomain
```
- in `republik-frontend/.env`
```
API_URL=http://api.dev.localdomain/graphql
API_WS_URL=ws://api.dev.localdomain/graphql
API_ASSETS_BASE_URL=http://dev.localdomain
PUBLIC_BASE_URL=http://dev.localdomain
```

3. Run backend services with docker (in `backends/`):
```
docker-compose up
```
Despite postgres, elastic, etc. this starts a traefik load balancer, that forwards traffik from `http://dev.localdomain` to `127.0.0.1:3000` (check: [traefik.toml](.docker-config/traefik/traefik.toml))


4. Run the backend servers (in `backends/`):
```
yarn run dev
```

5. Run the frontend server (in `republik-frontend/`):
```
npm run dev
```

6. Test
You should be able to access [http://api.dev.localdomain/graphiql](http://api.dev.localdomain/graphiql) and [http://dev.localdomain](http://dev.localdomain)

#### Machine B (app)
1. To resolve the hostnames:
- Find the IP of Machine A, let's say its `192.168.1.88`
- add the following line to `/etc/hosts`:
```
192.168.1.8	dev.localdomain api.dev.localdomain
```

2. Test
You should be able to access [http://api.dev.localdomain/graphiql](http://api.dev.localdomain/graphiql) and [http://dev.localdomain](http://dev.localdomain)

## Caveats

Due to the this [bug](https://github.com/yarnpkg/yarn/issues/4964) running bin scripts from the server subfolders doesn't work. Currently the following workaround is in place: `test:prepare` of republik and publikator first does: `rm -rf node_modules/.bin && ln -s ../../../node_modules/.bin node_modules/`.

## Licensing
The source code and it's documentation is licensed under [GNU AGPLv3](LICENSE)+.
