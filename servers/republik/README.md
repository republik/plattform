Republik Backend
-----------------

This is the successor to [crowdfunding-backend](https://github.com/orbiting/republik-backend) and still under heavy development.

Depends on modules from: [backend-modules](https://github.com/orbiting/backend-modules)

## Usage

### Quick start
You need to have node (8.3.0+) installed, postgres and redis running somewhere.

Boostrap your .env file.
Boostrap your .env file (see [.env.example](.env.example)).

Install dependencies.
```
yarn install
```

#### DB
To begin from a fresh DB, some more manual steps are required. We hope to improve the initial setup of this repo in the future.
First checkout [crowdfunding-backend](https://github.com/orbiting/crowdfunding-backend) and follow it's quicksteps to initialize the DB and seed it.
After that's done follow the steps below.


If you are migrating from [crowdfunding-backend](https://github.com/orbiting/crowdfunding-backend):

Copy the `/postgres` to `/republik` to not touch the local crowdfunding db. This script will not work on heroku obviously.
```
node script/launch/copy_CF_DB.js [YOUR_PG_USERNAME]
```

```
psql postgres://YOUR_PG_USERNAME@localhost:5432/republik -c "ALTER TYPE \"paymentType\" ADD VALUE IF NOT EXISTS 'MEMBERSHIP_PERIOD' AFTER 'PLEDGE'"
yarn run launch
```
`yarn run launch` does the following:
 - migrates the DB to match republik-backends expectations (`yarn run db:migrate:up`)
 - activates memberships and generates membershipPeriods `node script/launch/activateMemberships.js`
 - inserts the LAUNCH crowdfunding with the monthly membership `node script/launch/add_launch_data.js`

Hint: `yarn run launch:local [YOUR_PG_USERNAME]` is a shortcut for the 3 commands above.


Run it.
```
yarn run dev
```

Checkout the API: `http://localhost:5000/graphiql`
- [signin](http://localhost:5000/graphiql?query=mutation%20%7BsignIn(email%3A%20%22patrick.recher%40project-r.construction%22)%20%7B%0A%20%20phrase%0A%7D%7D)
- [me](http://localhost:5000/graphiql?query=query%20%7Bme%20%7B%0A%20%20id%0A%20%20email%0A%7D%7D)

### Usage with Docker

You can start the whole stack with docker-compose in production mode:
```
  docker-compose build && docker-compose up
  open http://localhost:8080/graphiql
```

If you just want to start redis & postgres for local development:
```
  docker-compose up -d redis postgres
  yarn run dev
```

## Seed: crowdfunding

To quickly get up and running with a working crowdfunding backend, please follow this crazy path to populate the database. We will (maybe) come up with something more convenient in the future.

```
  dropdb republik
  createdb republik
```

edit `script/db-migrate-all.js` and comment out the path "migrations".

```
  yarn run db:migrate:up
  psql postgres://YOUR_USERNAME@localhost:5432/republik -c "ALTER TABLE companies add column title TEXT"
  psql postgres://YOUR_USERNAME@localhost:5432/republik -c "ALTER TYPE \"paymentType\" ADD VALUE IF NOT EXISTS 'MEMBERSHIP_PERIOD' AFTER 'PLEDGE'"
```

revert the changes to `script/db-migrate-all.js`

```
  yarn run db:migrate:up
```

now import the seed data from `seeds/crowdfunding.sql`:

```
  psql -u YOUR_USERNAME -d republik -f seeds/crowdfunding.sql
```

...or use the test data instead:

```
  DATABASE_URL=postgres://YOUR_USERNAME@localhost:5432/republik-test node seeds/seedCrowdfundings.js
```




## Seed: comments
The mocked API is not ideal to test the pagination of the `comments` root query. Complete the following steps to get exemplary nested comments with working pagination.
- download `comments.json` from [here](https://comments-tqtwgqaery.now.sh)
- move `comments.json` to `./seeds/`
- run `node seeds/seedComments.js`
- Test with the following queries:
  - [comments](http://localhost:5000/graphiql?query=query%20getDiscussion(%24parentId%3A%20ID%2C%20%24after%3A%20String)%20%7B%0A%20%20discussions%20%7B%0A%20%20%20%20id%0A%20%20%20%20comments(first%3A%203%2C%20parentId%3A%20%24parentId%2C%20after%3A%20%24after%2C%20orderBy%3A%20HOT%2C%20orderDirection%3A%20DESC)%20%7B%0A%20%20%20%20%20%20...ConnectionInfo%0A%20%20%20%20%20%20nodes%20%7B%0A%20%20%20%20%20%20%20%20...Comment%0A%20%20%20%20%20%20%20%20comments%20%7B%0A%20%20%20%20%20%20%20%20%20%20...ConnectionInfo%0A%20%20%20%20%20%20%20%20%20%20nodes%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20...Comment%0A%20%20%20%20%20%20%20%20%20%20%20%20comments%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20...ConnectionInfo%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20nodes%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20...Comment%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20comments%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20...ConnectionInfo%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20nodes%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20...Comment%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A%0Afragment%20ConnectionInfo%20on%20CommentConnection%20%7B%0A%20%20totalCount%0A%20%20pageInfo%20%7B%0A%20%20%20%20hasNextPage%0A%20%20%20%20endCursor%0A%20%20%7D%0A%7D%0A%0Afragment%20Comment%20on%20Comment%20%7B%0A%20%20id%0A%20%20content%0A%20%20depth%0A%20%20_depth%0A%20%20createdAt%0A%20%20hotness%0A%7D%0A&operationName=getDiscussion&variables=)
  - [more comments](http://localhost:5000/graphiql?query=query%20getDiscussion(%24parentId%3A%20ID%2C%20%24after%3A%20String)%20%7B%0A%20%20discussions%20%7B%0A%20%20%20%20id%0A%20%20%20%20comments(first%3A%203%2C%20parentId%3A%20%24parentId%2C%20after%3A%20%24after%2C%20orderBy%3A%20HOT%2C%20orderDirection%3A%20ASC)%20%7B%0A%20%20%20%20%20%20...ConnectionInfo%0A%20%20%20%20%20%20nodes%20%7B%0A%20%20%20%20%20%20%20%20...Comment%0A%20%20%20%20%20%20%20%20comments%20%7B%0A%20%20%20%20%20%20%20%20%20%20...ConnectionInfo%0A%20%20%20%20%20%20%20%20%20%20nodes%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20...Comment%0A%20%20%20%20%20%20%20%20%20%20%20%20comments%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20...ConnectionInfo%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20nodes%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20...Comment%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20comments%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20...ConnectionInfo%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20nodes%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20...Comment%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20comments%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20...ConnectionInfo%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20nodes%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20...Comment%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20comments%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20...ConnectionInfo%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20nodes%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20...Comment%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20comments%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20...ConnectionInfo%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20nodes%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20...Comment%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20comments%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20totalCount%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A%0Afragment%20ConnectionInfo%20on%20CommentConnection%20%7B%0A%20%20totalCount%0A%20%20pageInfo%20%7B%0A%20%20%20%20hasNextPage%0A%20%20%20%20endCursor%0A%20%20%7D%0A%7D%0A%0Afragment%20Comment%20on%20Comment%20%7B%0A%20%20id%0A%20%20content%0A%20%20depth%0A%20%20_depth%0A%20%20createdAt%0A%20%20hotness%0A%7D%0A&operationName=getDiscussion&variables=%7B%0A%20%20%22after%22%3A%20%22eyJvcmRlckJ5IjoiSE9UIiwib3JkZXJEaXJlY3Rpb24iOiJERVNDIiwicGFyZW50SWQiOiJhZGQzMmUxMy1hYzIyLWU1ZGItZTMyOC01NjU5NTJkNjAwM2MiLCJhZnRlcklkIjoiMWVhNzhkZjgtNDE1Ny1mYTcwLWM5ZDYtMDU3Y2NkNDk5ZTlhIn0%3D%22%0A%7D)

## Testing

Boostrap your .test.env file. Only non-existing env variables in that file will get set by .env
```
DATABASE_URL=postgres://postgres@localhost:5432/republik-test
STRIPE_PLATFORM=COMPANY_ONE
STRIPE_CONNECTED_ACCOUNTS=COMPANY_TWO

STRIPE_ACCOUNT_ID_COMPANY_ONE=
STRIPE_SECRET_KEY_COMPANY_ONE=
STRIPE_ACCOUNT_ID_COMPANY_TWO=
STRIPE_SECRET_KEY_COMPANY_TWO=
```

Run tests.
```
yarn run test
```

# Jest examples

```
yarn test
´´´

Or run with watcher which reruns test on file changes:

```
yarn test:dev
```

Or have human readable coverage generated into `<rootDir>/coverage`

```
yarn test:cover
```

## Licensing
The source code and it's documentation is licensed under [GNU AGPLv3](LICENSE)+.
