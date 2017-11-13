Publikator Backend [![Build Status](https://travis-ci.org/orbiting/publikator-backend.svg?branch=master)](https://travis-ci.org/orbiting/publikator-backend) [![Coverage Status](https://coveralls.io/repos/github/orbiting/publikator-backend/badge.svg?branch=master)](https://coveralls.io/github/orbiting/publikator-backend?branch=master)
------------------

Publikator is a cms prototype: edit files on github with [slate](https://github.com/ianstormtaylor/slate).

Works best with: [publikator-frontend](https://github.com/orbiting/publikator-frontend)

## Usage

### Quick start
You need to have node (8.3.0+) installed, postgres and redis running somewhere.

Boostrap your .env file.
```
PORT=3004
PUBLIC_URL=http://localhost:3004

SESSION_SECRET=replaceMe

# your URL of publikator-frontend
CORS_WHITELIST_URL=http://localhost:3005

DATABASE_URL=postgres://postgres@localhost:5432/publikator

# leave blank for default: 127.0.0.1:6379
REDIS_URL=

SEND_MAILS=true  # or false if you don't have mandrill
MANDRILL_API_KEY=replaceMe
DEFAULT_MAIL_FROM_NAME='publikator'
DEFAULT_MAIL_FROM_ADDRESS='publikator@project-r.construction'


# The github user/organization under which all repos are held
GITHUB_LOGIN=orbiting

# Follow the "Auth - Github" section below to get these
GITHUB_APP_ID=
GITHUB_INSTALLATION_ID=
GITHUB_APP_KEY=


# Auth keys for the embedding endpoint.

# Twitter App Stuff

TWITTER_APP_KEY='T8Dr1U9T0nzgpUJXeTnDZKOS9'
TWITTER_APP_SECRET='dcR8nPleW6EdnETyuiGwuCF1SjF1zw0ut3lJixBcx3jh3W8NjJ'

# Vimeo App Stuff

VIMEO_APP_KEY='4ad78746244447702eecd6a71b82ad80494899fd'
VIMEO_APP_SECRET='YbEFbtOemCgI0G6d5u7pNhZs4qetxa0mbk1DtSa4f0/yUf+YthRRRD66JeZ8L1Y5StxGklJ6FQPvV0ybCCA7euHuD13xNupSRqqEsVEa+QcUDE6zl+E+CwPh1NRdxUaE'

# Youtube App Stuff

YOUTUBE_APP_KEY='AIzaSyC4oBJ0nY44xXTP6rZXiCbB7Q0M37nUVQE'

# optional: filter for the repos query (repo name must contain term)
REPOS_NAME_FILTER=article-

# URL which proxies assets from github
PUBLIC_ASSETS_URL=http://localhost:3004/assets
```

Install dependencies.
```
npm install
```

Create a seeds file by copying `seeds/seeds.example.json` to `seeds/seeds.json` and adapting it to your needs. The seeds are read by the npm scripts `db:seed` or `db:reset`.

Create and init the DB.
```
createdb -U postgres publikator
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
This server acts and authenticates as a [GitHub-App](https://developer.github.com/apps/building-integrations/setting-up-a-new-integration/about-integrations/#github-apps). Despite the claim of GitHub, GitHub-Apps are also compatible to the GraphQL v4 API.

You need to setup a new GitHub-App and install it to at least one organization / account. Follow the steps below or [Read more](https://developer.github.com/apps/building-integrations/setting-up-and-registering-github-apps/).

Setup (for dev environment):
- [Create a GitHub-App](https://developer.github.com/apps/building-integrations/setting-up-and-registering-github-apps/registering-github-apps/).
  - As the "Homepage URL" set `http://localhost:3004`.
  - On the permissions page set "Read & write" for the following sections and leave the rest on "No access".
    - Repository administration
    - Commit statuses
    - Repository contents
- [Download the private key](https://developer.github.com/apps/building-integrations/setting-up-and-registering-github-apps/registering-github-apps/#generating-a-private-key). This key needs to be supplied as `GITHUB_APP_KEY` ENV var. Open the file in your favorite editor, replace newlines with `@` (literally), replace whitespaces (such as in "-END RSA PRIVATE KEY-") with `\ ` (escaped whitespace) and copy the content to your .env. This is needed due to the [limitations with encryption keys by travis](https://docs.travis-ci.com/user/encryption-keys#Note-on-escaping-certain-symbols).
- On the page of your new GitHub-App you also find the **ID**. This values needs to be provided as `GITHUB_APP_ID` env var.
- [Install the GitHub-App](https://help.github.com/articles/installing-an-app-in-your-organization/) in your organization. On the page of the installation (settings -> Installed GitHub Apps -> App) copy the last part of the URL (e.g `41809`), it needs to be provided as `GITHUB_INSTALLATION_ID` env var.

## Licensing
The source code and it's documentation is licensed under [GNU AGPLv3](LICENSE)+.
