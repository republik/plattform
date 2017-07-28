HAKU
----

Haku is a cms prototype.

The trello board tracking it's tasks: https://trello.com/b/kbO2DOci/haku


## Usage

### Quick start
You need to have node (8+) installed and postgres running somewhere.

Boostrap your .env file.
```
PORT=3004
PUBLIC_URL=http://localhost:3004

SESSION_SECRET=replaceMe

# your URL of haku-frontend
CORS_WHITELIST_URL=http://localhost:3005

DATABASE_URL=postgres://postgres@localhost:5432/haku

SEND_MAILS=true  # or false if you don't have mandrill
MANDRILL_API_KEY=replaceMe
DEFAULT_MAIL_FROM_NAME='haku'
DEFAULT_MAIL_FROM_ADDRESS='haku@project-r.construction'

# Follow Auth - Github below to get these
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

Install dependencies.
```
npm install
```

Setup the DB.
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

- [sign in to github](http://localhost:3004/auth/github/signin?callbackPath=graphiql)


## Auth
This prototype features a passwordless signin system. It's a **stripped down** version from [crowdfunding-backend](https://github.com/orbiting/crowdfunding-backend) and not suitable for production use (no real random words, no geo location, etc.). Signin emails are sent via [Mandrill](https://mandrillapp.com) see [lib/sendMail.js](lib/sendMail.js). Set the ENV var `SEND_MAILS=false` to see emails on the console, if you don't have a mandrill key at hand.

### Github
To interact with repositories this API talks to Github.
Go to [Github Applications](https://github.com/settings/applications/new), register a new one and copy `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` to your .env.

In order to gain full access (internal and github) users must (see query list above):
- first signIn via graphQL mutation
- open [/auth/github/signin?callbackPath=graphiql](http://localhost:3004/auth/github/signin?callbackPath=graphiql)
- authorize haku on their github page, afterwards they get redirected back, and the github token is stored in the DB, the server is ready to make requests on the user's behalf.


## Licensing
The source code and it's documentation is licensed under [GNU AGPLv3](LICENSE)+.
