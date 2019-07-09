# @orbiting/backends [![Build Status](https://travis-ci.org/orbiting/backends.svg?branch=master)](https://travis-ci.org/orbiting/backends) [![Coverage Status](https://coveralls.io/repos/github/orbiting/backends/badge.svg?branch=master)](https://coveralls.io/github/orbiting/backends?branch=master)

This repo contains all the backend code in use at Republik. For easier development the previously separate repos [republik-backend](https://github.com/orbiting/republik-backend), [publikator-backend](https://github.com/orbiting/publikator-backend), [assets-backend](https://github.com/orbiting/assets-backend) and [backend-modules](https://github.com/orbiting/backend-modules) where merged into this monorepo.

For a guide on how to start the the frontends see: [docs/how-to-run](https://github.com/orbiting/docs/blob/master/guides/how-to-run.md)

## Components

This repo is devided between `servers` and `packages`.
- **servers:** this directory contains runnable servers
- **packages:** contains code shared between the servers


## How to run / Development

### 1. Clone
```
git clone git@github.com:orbiting/backends.git && cd backends
```

### 2. Prerequisites

You must have Node.js (10+), yarn, docker and docker-compose installed (alternatively to docker you can install the external services natively).

- [Node.js with nvm](https://github.com/nvm-sh/nvm#install--update-script)
- [yarn](https://yarnpkg.com/en/docs/install)
- [docker](https://docs.docker.com/install/)
- [docker-compose](https://docs.docker.com/compose/install/)


#### Docker
The included [docker-compose.yml](docker-compose.yml) starts all external-services. Currently that's: postgresql, redis, elasticsearch (and kibana).
The data is persisted in `./docker-data/`.

```
docker-compose up [-d]
```

##### Postgresql in docker
We recommend you install the postgresql client tools on your machine to interact with the database. The tests scripts also depend on the clients being installed.
```
# linux
sudo apt install postgresql-client-10
```

When postgresql in running in docker client tools like `psql` or `createdb`/`dropdb` don't automatically connect to it. They try to access postgresql via a local socket, when instead you want them to connect via network to localhost. To make your life easier, you can add the following environment variables to `~/.bashrc` / `~/.zshrc` so the client tools connect to localhost per default.
```
export PGHOST=127.0.0.1
export PGUSER=postgres
```

#### alternativ: install natively
<details><summary>show more</summary>
<p>
As an alternative to docker(-compose) you can install the external-services natively:

On macOS with [homebrew](https://brew.sh/):
```
brew install postgresql redis nvm elasticsearch
nvm install 12
nvm alias default 12
npm install -g yarn@1.16
brew services start postgresql
brew services start redis
brew services start elasticsearch
```
</p>
</details>

#### Docker Kibana accessing an native Elasticsearch

```bash
docker run -p 5601:5601 -e ELASTICSEARCH_HOSTS=http://host.docker.internal:9200 docker.elastic.co/kibana/kibana-oss:6.7.0
```

Note:
- Elasticsearch and Kibana versions must match, ckeck ES version at `http://localhost:9200/`
- `ELASTICSEARCH_HOSTS` must be accessible [within docker](https://nickjanetakis.com/blog/docker-tip-65-get-your-docker-hosts-ip-address-from-in-a-container).

### 2. ENVs

Copy the `.env.example` files to `.env` (in root and server/\*/). The default values should be enough to get started.
```
cp .env.example .env
cp servers/republik/.env.example servers/republik/.env
cp servers/publikator/.env.example servers/publikator/.env
cp servers/assets/.env.example servers/assets/.env
```

### 3. Install

```
yarn install
```

### 4. Initialize

```
createdb republik
yarn run db:migrate:up
yarn run db:seed
```

### 5. Run

```
yarn run dev
```

This kicks on [foreman](https://github.com/strongloop/node-foreman) which then launches all the servers locally.
All servers greets you with `Cannot GET /` on the root route. The API servers have a graphical API explorer available at `/graphiql`:

- [Republik API on port 5000](http://localhost:5000/graphiql)
- [Publikator API on port 5010](http://localhost:5010/graphiql)
- [Assets server on port 5020](http://localhost:5020/)

### Next steps

#### more about ENVs

In development environment variables are loaded from `./.env`, `../../.env` (in this order, relative to node's cwd). This is done with the help of [backend-modules-env](packages/env) and enables you to define a `.env` file at the root of this repo for common variables and also store server specific envs at `servers/*/.env`. `./.env` takes precedence over `../../.env` because existing env variables are never overwritten.
No ENV variabeles are loaded from any file in production, you yourself are responsible to set all required ENVs in the production environment.

Checkout [.env.example](.env.example), [servers/republik/.env.example](servers/republik/.env.example), [servers/publikator/.env.example](servers/publikator/.env.example), [servers/assets/.env.example](servers/assets/.env.example) for which ENVs are required and their descriptions. Check the packages' README for further config options.


You will quickly run into errors and limitations if you run with the example envs. You probably want to do the following three rather soon:

1. [Setup GitHub](servers/publikator#github)
    - `GITHUB_*` in the root `.env`
2. MailChimp and Mandrill
    - `MAILCHIMP_URL`, `MAILCHIMP_API_KEY`, `MANDRILL_API_KEY` in the root `.env`
    - `MAILCHIMP_*` in `servers/republik/.env` (less important)
3. S3 Bucket
    - `AWS_*` in the root `.env`


### Special setup: develop on two hosts
The following setup enables to start the servers (backends and republik-frontend) on one machine (A) and access it from another (B). This can come handy if you want to develop the backend on A and the app on B (where B can be a physical device).

Please not that due to how "Docker for Mac" works (docker is run in a hidden VM), it's not possible to bind containers to the host's network-interface, therefore this setup only works on linux.

#### Machine A (servers)
1. Get the IP of your machine in the local network, use it in the next step as `LOCAL_IP`
```
ip addr
```

2. Adapt hostnames in the environment variables:
- in `backends/.env`
```
FRONTEND_BASE_URL=http://republik.test
ASSETS_SERVER_BASE_URL=http://assets.republik.test

LOCAL_IP=192.168.1.88
```
- in `backends/servers/republik/.env`
```
CORS_WHITELIST_URL=http://republik.test
COOKIE_DOMAIN=.republik.test
```
- in `republik-frontend/.env`
```
API_URL=http://api.republik.test/graphql
API_WS_URL=ws://api.republik.test/graphql
API_ASSETS_BASE_URL=http://republik.test
PUBLIC_BASE_URL=http://republik.test
```


3. Start the DNS-Server and reverse proxy:
```
docker-compose -f docker-compose-test-network.yml up [-d]
```
- bind: You now have a DNS server running locally. It resolves all requests of `*.republik.test` to `LOCAL_IP`.
- traefik: routes requests based on SNI (check: [traefik.toml](.docker-config/traefik/traefik.toml))
  - `http://republik.test` -> `http://localhost:3010`
  - `http://api.republik.test` -> `http://localhost:5000`


4. Run backend services with docker (in `backends/`):
```
docker-compose up [-d]
```

5. Refresh published articles, due to changed `ASSETS_SERVER_BASE_URL` (in `backends/`):
```
yarn run pull:elasticsearch
redis-cli
> FLUSHALL
```

6. Run the backend servers (in `backends/`):
```
yarn run dev
```

7. Run the frontend server (in `republik-frontend/`):
```
npm run dev
```

8. Test
You should be able to access [http://api.republik.test/graphiql](http://api.republik.test/graphiql) and [http://republik.test](http://republik.test)

#### Machine B (app)
1. To resolve the hostnames:
- Find the IP of Machine A, let's say its `192.168.1.88`
- change your network config to use this IP as your DNS resolver.

2. Adapt hostnames in the environment variables (in `app/.env.dev`):
```
API_URL=http://api.republik.test/graphql
API_WS_URL=ws://api.republik.test/graphql
FRONTEND_BASE_URL=http://republik.test
```

3. Test

You should be able to access [http://api.republik.test/graphiql](http://api.republik.test/graphiql) and [http://republik.test](http://republik.test)


4. Setup simulators/emulators

At least the android emulator doesn't use the hosts dns resolver
- configure the DNS resolver manually (see step 1) inside the simulator
- test in the webbrowser that [http://republik.test](http://republik.test) is accessible.
- run the app as usual (in `app/`)
```
yarn run run-android
```

## Licensing
The source code and it's documentation is licensed under [GNU AGPLv3](LICENSE)+.
