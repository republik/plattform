Crowdfunding Admin [![Build Status](https://travis-ci.org/orbiting/crowdfunding-admin.svg?branch=master)](https://travis-ci.org/orbiting/crowdfunding-admin) [![Coverage Status](https://coveralls.io/repos/github/orbiting/crowdfunding-admin/badge.svg?branch=master)](https://coveralls.io/github/orbiting/crowdfunding-admin?branch=master)
-----------------

## Usage

### Quick start
You need to have node (8.3.0+) installed, postgres and redis running somewhere.

Boostrap your .env file.
```
PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
PORT=3003
BASIC_AUTH_PASS=
BASIC_AUTH_USER=
BASIC_AUTH_REALM=
LOCALE=en-US
API_AUTHORIZATION_HEADER=
API_BASE_URL=http://localhost:3020

SG_COLORS=
SG_FONT_FAMILIES=
SG_FONT_FACES=
SG_LOGO_PATH=
SG_LOGO_VIEWBOX=
SG_BRAND_MARK_PATH=
SG_BRAND_MARK_VIEWBOX=
```

Install dependencies.
```
yarn install
```

Run local admin frontend:

```
yarn run dev
```

Run republik-backend (assuming you have a local git repository of the republik-backend in ../republik-backend).

```
open new terminal tab.
cd ../republik-backend
yarn run dev
```

## Licensing
The source code and it's documentation is licensed under [GNU AGPLv3](LICENSE)+.
