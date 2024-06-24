# apps/api

The API server for managing articles, user data, and subscriptions.

## Requirements

- Node.js 20
- Postgres 14
- Redis
- Elasticsearch

All of these dependencies are provided by the Docker Compose file in the root of the monorepo.

Simply run `docker compose up` in the root of the monorepo.

## How to run

### In DEV

- Make sure you ran `yarn install` in the root of the monorepo.
- Start the required external services with `docker compose up`.
- Run `yarn dev:setup` for seeding the database and Elasticsearch.
- Run `yarn dev` for running all apps.

The GraphQL API is available on `localhost:5010/graphql`, and a GraphQL client can be found on `localhost:5010/graphql`.

## Configuration

### Local transactional E-Mail testing

As part of the Docker Compose setup, a MailHog container is started. This container
can be used to test the correct formatting of transactional emails.

```bash
SEND_MAILS=true
SEND_MAILS_TAGS='dev'
SEND_MAILS_REGEX_FILTERS='^([a-zA-Z0-9._%+-]+)@republik\.(ch|test)$' # allow any email ending in @republik.ch or republik.test
SEND_MAILS_NODEMAILER_TEMPLATE_REGEX='^.+'
SEND_MAILS_NODEMAILER_CONNECTION_URL='smtp://user:password@127.0.0.1:1025'
SEND_MAILS_SUBJECT_PREFIX='Test Local'
```
