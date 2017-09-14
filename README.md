haku-backend [![Build Status](https://travis-ci.org/orbiting/haku-backend.svg?branch=master)](https://travis-ci.org/orbiting/haku-backend) [![Coverage Status](https://coveralls.io/repos/github/orbiting/haku-backend/badge.svg?branch=APIrefactor)](https://coveralls.io/github/orbiting/haku-backend?branch=APIrefactor)
------------

Haku is a cms prototype: edit files on github with [slate](https://github.com/ianstormtaylor/slate).

Works best with: [haku-frontend](https://github.com/orbiting/haku-frontend)

The trello board tracking it's tasks: https://trello.com/b/kbO2DOci/haku


## Usage

### Quick start
You need to have node (8.3.0+) installed, postgres and redis running somewhere.

Boostrap your .env file.
```
PORT=3004
PUBLIC_URL=http://localhost:3004

SESSION_SECRET=replaceMe

# your URL of haku-frontend
CORS_WHITELIST_URL=http://localhost:3005

DATABASE_URL=postgres://postgres@localhost:5432/haku

# leave blank for default: 127.0.0.1:6379
REDIS_URL=

SEND_MAILS=true  # or false if you don't have mandrill
MANDRILL_API_KEY=replaceMe
DEFAULT_MAIL_FROM_NAME='haku'
DEFAULT_MAIL_FROM_ADDRESS='haku@project-r.construction'

# Follow Auth - Github below to get this
GITHUB_ACCESS_TOKEN=

# The github user/organization under which all repos are held
GITHUB_LOGIN=orbiting

# URL which proxies assets from github
PUBLIC_ASSETS_URL=http://localhost:3004/assets

# optional: filter for the repos query (repo name must contain term)
REPOS_NAME_FILTER=article-
```

Install dependencies.
```
npm install
```

Create a seeds file by copying `seeds/seeds.example.json` to `seeds/seeds.json` and adapting it to your needs. The seeds are read by the npm scripts `db:seed` or `db:reset`.

Create and init the DB.
```
createdb -U postgres haku
npm run db:reset
```

Run it.
```
npm run dev
```

Checkout the API: `http://localhost:3004/graphiql`
- [signin](http://localhost:3004/graphiql?query=mutation%20%7BsignIn(email%3A%20%22patrick.recher%40project-r.construction%22)%20%7B%0A%20%20phrase%0A%7D%7D)
- [me](http://localhost:3004/graphiql?query=query%20%7Bme%20%7B%0A%20%20id%0A%20%20email%0A%7D%7D)


## Auth
This prototype features a passwordless signin system. It's a **stripped down** version from [crowdfunding-backend](https://github.com/orbiting/crowdfunding-backend) and not suitable for production use (no real random words, no geo location, etc.). Signin emails are sent via [Mandrill](https://mandrillapp.com) see [lib/sendMail.js](lib/sendMail.js). Set the ENV var `SEND_MAILS=false` to see emails on the console, if you don't have a mandrill key at hand.

### Github
To interact with repositories this API talks to Github.
After trialing *Sign in with GitHub* for all cms-users and authenticating calls to github with the individual user's token, we decided not to go this way and instead opted for a simpler solution (for now): give birth to a github "bot" user, create a [Personal Access Token](https://github.com/settings/tokens) for this user and authenticate all calls with its token. This solution allows for simpler user onboarding and scaling up on our side and makes the application code simpler.

Setup:
- Create a github user
- Get a [Personal Access Token](https://github.com/settings/tokens) for this user and provide it as ENV variable.

## Licensing
The source code and it's documentation is licensed under [GNU AGPLv3](LICENSE)+.
