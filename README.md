Discussion Backend (alpha)
----------------------------

NodeJS server that provides a GraphQL API for commenting in discussions. This is a standalone repo for easy development.

_alpha_: this API mostly serves mock data until now.

## Usage

### Quick start
You need to have node (8.3.0+) installed and postgres running somewhere.

Boostrap your .env file.
```
PORT=3020
PUBLIC_URL=http://localhost:3020

SESSION_SECRET=replaceMe

# your frontend
CORS_WHITELIST_URL=http://localhost:3005

DATABASE_URL=postgres://postgres@localhost:5432/discussion

SEND_MAILS=true  # or false if you don't have mandrill at hand
MANDRILL_API_KEY=replaceMe
DEFAULT_MAIL_FROM_NAME='discussion'
DEFAULT_MAIL_FROM_ADDRESS='discussion@project-r.construction'
```

Install dependencies.
```
npm install
```

Create and init the DB.
```
createdb -U postgres discussion
npm run db:reset:noseeds
```

Run it.
```
npm run dev
```

Checkout the API: `http://localhost:3020/graphiql`
- [signin](http://localhost:3020/graphiql?query=mutation%20%7BsignIn(email%3A%20%22patrick.recher%40project-r.construction%22)%20%7B%0A%20%20phrase%0A%7D%7D)
- [me](http://localhost:3020/graphiql?query=query%20%7Bme%20%7B%0A%20%20id%0A%20%20email%0A%7D%7D)


## Auth
This prototype features a passwordless signin system. It's a **stripped down** version from [crowdfunding-backend](https://github.com/orbiting/crowdfunding-backend). Signin emails are sent via [Mandrill](https://mandrillapp.com) see [lib/sendMail.js](lib/sendMail.js). Set the ENV var `SEND_MAILS=false` to see emails on the console, if you don't have a mandrill key at hand.

## Licensing
The source code and it's documentation is licensed under [GNU AGPLv3](LICENSE)+.
