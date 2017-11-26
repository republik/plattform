Republik Backend (alpha)
----------------------------

This is the grassroots repo for the new republik backend. It serves as battleground for new features and refugees camp for features from the crowdfunding. Up until now, it provides the following:

 - commenting in discussions. mocked API. work in progress
 - community page. due for refactoring from crowdfunding-backend

## Usage

### Quick start
You need to have node (8.3.0+) installed, postgres and redis running somewhere.

Boostrap your .env file.
```
PORT=3020
PUBLIC_URL=http://localhost:3020

# websocket URL and path
PUBLIC_WS_URL_BASE=ws://localhost:3020
PUBLIC_WS_URL_PATH=/graphql

SESSION_SECRET=replaceMe

# your frontend
CORS_WHITELIST_URL=http://localhost:3005

DATABASE_URL=postgres://postgres@localhost:5432/discussion

SEND_MAILS=true  # or false if you don't have mandrill at hand
MANDRILL_API_KEY=replaceMe
DEFAULT_MAIL_FROM_NAME='discussion'
DEFAULT_MAIL_FROM_ADDRESS='discussion@project-r.construction'

# leave blank for default: 127.0.0.1:6379
REDIS_URL=

# credentials to upload assets to the exoscale object store
EXO_KEY=
EXO_SECRET=
S3BUCKET=republik-staging
# where will the assets be available publicly
ASSETS_BASE_URL=https://assets.staging.republik.ch

# keyCDN access to clear cache on file uploads
# must correspond with the object store config
KEYCDN_API_KEY=
KEYCDN_ZONE_ID=
KEYCDN_ZONE_URL=

# phantomjscloud.com to render social media share images
PHANTOMJSCLOUD_API_KEY=
```

Install dependencies.
```
yarn install
```

Create and init the DB.
```
createdb -U postgres discussion
yarn run db:reset:noseeds
```

Run it.
```
yarn run dev
```

Checkout the API: `http://localhost:3020/graphiql`
- [signin](http://localhost:3020/graphiql?query=mutation%20%7BsignIn(email%3A%20%22patrick.recher%40project-r.construction%22)%20%7B%0A%20%20phrase%0A%7D%7D)
- [me](http://localhost:3020/graphiql?query=query%20%7Bme%20%7B%0A%20%20id%0A%20%20email%0A%7D%7D)


## seed comments
The mocked API is not ideal to test the pagination of the `comments` root query. Complete the following steps to get exemplary nested comments with working pagination.
- download `comments.json` from [here](https://comments-tqtwgqaery.now.sh)
- move `comments.json` to `./seeds/`
- run `node seeds/seedComments.js`
- Test with the following queries:
  - [comments](http://localhost:3020/graphiql?query=query%20getDiscussion(%24parentId%3A%20ID%2C%20%24after%3A%20String)%20%7B%0A%20%20discussions%20%7B%0A%20%20%20%20id%0A%20%20%20%20comments(first%3A%203%2C%20parentId%3A%20%24parentId%2C%20after%3A%20%24after%2C%20orderBy%3A%20HOT%2C%20orderDirection%3A%20DESC)%20%7B%0A%20%20%20%20%20%20...ConnectionInfo%0A%20%20%20%20%20%20nodes%20%7B%0A%20%20%20%20%20%20%20%20...Comment%0A%20%20%20%20%20%20%20%20comments%20%7B%0A%20%20%20%20%20%20%20%20%20%20...ConnectionInfo%0A%20%20%20%20%20%20%20%20%20%20nodes%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20...Comment%0A%20%20%20%20%20%20%20%20%20%20%20%20comments%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20...ConnectionInfo%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20nodes%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20...Comment%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20comments%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20...ConnectionInfo%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20nodes%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20...Comment%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A%0Afragment%20ConnectionInfo%20on%20CommentConnection%20%7B%0A%20%20totalCount%0A%20%20pageInfo%20%7B%0A%20%20%20%20hasNextPage%0A%20%20%20%20endCursor%0A%20%20%7D%0A%7D%0A%0Afragment%20Comment%20on%20Comment%20%7B%0A%20%20id%0A%20%20content%0A%20%20depth%0A%20%20_depth%0A%20%20createdAt%0A%20%20hottnes%0A%7D%0A&operationName=getDiscussion&variables=)
  - [more comments](http://localhost:3020/graphiql?query=query%20getDiscussion(%24parentId%3A%20ID%2C%20%24after%3A%20String)%20%7B%0A%20%20discussions%20%7B%0A%20%20%20%20id%0A%20%20%20%20comments(first%3A%203%2C%20parentId%3A%20%24parentId%2C%20after%3A%20%24after%2C%20orderBy%3A%20HOT%2C%20orderDirection%3A%20ASC)%20%7B%0A%20%20%20%20%20%20...ConnectionInfo%0A%20%20%20%20%20%20nodes%20%7B%0A%20%20%20%20%20%20%20%20...Comment%0A%20%20%20%20%20%20%20%20comments%20%7B%0A%20%20%20%20%20%20%20%20%20%20...ConnectionInfo%0A%20%20%20%20%20%20%20%20%20%20nodes%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20...Comment%0A%20%20%20%20%20%20%20%20%20%20%20%20comments%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20...ConnectionInfo%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20nodes%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20...Comment%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20comments%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20...ConnectionInfo%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20nodes%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20...Comment%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20comments%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20...ConnectionInfo%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20nodes%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20...Comment%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20comments%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20...ConnectionInfo%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20nodes%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20...Comment%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20comments%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20...ConnectionInfo%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20nodes%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20...Comment%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20comments%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20totalCount%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A%0Afragment%20ConnectionInfo%20on%20CommentConnection%20%7B%0A%20%20totalCount%0A%20%20pageInfo%20%7B%0A%20%20%20%20hasNextPage%0A%20%20%20%20endCursor%0A%20%20%7D%0A%7D%0A%0Afragment%20Comment%20on%20Comment%20%7B%0A%20%20id%0A%20%20content%0A%20%20depth%0A%20%20_depth%0A%20%20createdAt%0A%20%20hottnes%0A%7D%0A&operationName=getDiscussion&variables=%7B%0A%20%20%22after%22%3A%20%22eyJvcmRlckJ5IjoiSE9UIiwib3JkZXJEaXJlY3Rpb24iOiJERVNDIiwicGFyZW50SWQiOiJhZGQzMmUxMy1hYzIyLWU1ZGItZTMyOC01NjU5NTJkNjAwM2MiLCJhZnRlcklkIjoiMWVhNzhkZjgtNDE1Ny1mYTcwLWM5ZDYtMDU3Y2NkNDk5ZTlhIn0%3D%22%0A%7D)

## Auth
This prototype features a passwordless signin system. It's a **stripped down** version from [crowdfunding-backend](https://github.com/orbiting/crowdfunding-backend). Signin emails are sent via [Mandrill](https://mandrillapp.com) see [lib/sendMail.js](lib/sendMail.js). Set the ENV var `SEND_MAILS=false` to see emails on the console, if you don't have a mandrill key at hand.

## Licensing
The source code and it's documentation is licensed under [GNU AGPLv3](LICENSE)+.
