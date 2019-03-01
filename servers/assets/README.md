Assets Backend
---------------

This is a lightweight, fast nodejs-express server for asset proxying and image manipulation (resizing, greyscaling, webp format transformation). It streams assets from other urls, from s3 buckets, out of github repos and can render via external servers.

Check the [README](https://github.com/orbiting/backends/tree/master/packages/assets/README.md) of [backend-modules-assets](https://github.com/orbiting/backends/tree/master/packages/assets) which contains all the relevant code.

## Republik
This backend exposes the express middleware of [backend-modules-assets](https://github.com/orbiting/backends/tree/master/packages/assets). This was previously handled by [republik-backend](https://github.com/orbiting/republik-backend) and [publikator-backend](https://github.com/orbiting/publikator-backend) themselfs but was extracted to this standalone server to be able to deploy and scale the network heavy image fetching and cpu intensive image resizing independently from the other backends. UnLike the other backends this server does not support auth and depends on express directly.

## Usage

### Quick start
You need to have node (8.3.0+) installed and postgres running somewhere.

Boostrap your .env file (copy [.env.example](.env.example)).
Also see [backend-modules-assets README](https://github.com/orbiting/backends/tree/master/packages/assets/README.md)

The following ENVs have a dependency to other servers:
```
# must be in sync with PUBLIC_URL
ASSETS_SERVER_BASE_URL=http://localhost:3021
# must be in sync with republik-backend and publikator-backend
ASSETS_HMAC_KEY=aiy3sheYoobahb4eth1ohs4aoPaezeeg

# GITHUB auth server images from github repos
# Follow the "Auth - Github" section of republik-backend to get these
GITHUB_LOGIN=
GITHUB_APP_ID=
GITHUB_INSTALLATION_ID=
GITHUB_APP_KEY=

# base url used on /frontend
FRONTEND_BASE_URL=http://localhost:3010

# whiteliste buckets with regions for /s3
AWS_BUCKET_WHITELIST=republik-assets:eu-central-1
```

Install dependencies.
```
yarn install
```

Run it.
```
yarn run dev
```

## Licensing
The source code and it's documentation is licensed under [GNU AGPLv3](LICENSE)+.
