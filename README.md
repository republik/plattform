Assets Backend
---------------

This backend exposes the express middleware of [backend-modules-assets](https://github.com/orbiting/backend-modules/tree/master/packages/assets). This was previously handled by [republik-backend](https://github.com/orbiting/republik-backend) and [publikator-backend](https://github.com/orbiting/publikator-backend) themselfs but was extracted to this standalone server to be able to deploy and scale the network heavy image fetching and cpu intensive image resizing this module handles independently from the other backends. Like the other backends this server is based on [backend-modules-base](https://github.com/orbiting/backend-modules/tree/master/packages/base).

TODO: system diagram

## Usage

### Quick start
You need to have node (8.3.0+) installed and postgres running somewhere.

Boostrap your .env file.
```
PORT=3021
PUBLIC_URL=http://localhost:3021

# must be in sync with PUBLIC_URL
ASSETS_SERVER_BASE_URL=http://localhost:3021
# must be in sync with republik-backend and publikator-backend
ASSETS_HMAC_KEY=aiy3sheYoobahb4eth1ohs4aoPaezeeg


# must be in sync with republik-backend and publikator-backend
SESSION_SECRET=replaceMe

# must be in sync with republik-backend and publikator-backend
DATABASE_URL=postgres://postgres@localhost:5432/republik

# phantomjscloud.com to render social media share images
PHANTOMJSCLOUD_API_KEY=
# list urls allowed on the /render endpoint, the beginning must match
RENDER_URL_WHITELIST=https://www.republik.ch/

# GITHUB auth server images from github repos
# Follow the "Auth - Github" section of republik-backend to get these
GITHUB_LOGIN=
GITHUB_APP_ID=
GITHUB_INSTALLATION_ID=
GITHUB_APP_KEY=

# basic setup for backend-modules-auth
# see republik-backend
DEFAULT_MAIL_FROM_NAME='assets'
DEFAULT_MAIL_FROM_ADDRESS='assets@project-r.construction'
AUTH_MAIL_FROM_ADDRESS=assets@project-r.construction
FRONTEND_BASE_URL=http://localhost:3020
```

Install dependencies.
```
yarn install
```

Run it.
```
yarn run dev
```

### backend-modules
To develop [backend-modules](https://github.com/orbiting/backend-modules) first run `yarn run link` inside a local copy of the backend-modules repo then execute `yarn link @orbiting/backend-modules-xxx` here. The specified backend-module is now symlinked inside node_modules and development should work seamlessly.

## Licensing
The source code and it's documentation is licensed under [GNU AGPLv3](LICENSE)+.
