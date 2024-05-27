# Construction

Construction site for Project R

## Development

Boostrap the `.env` file:
```
PORT=4000
PUBLIC_BASE_URL=http://localhost:4000
API_BASE_URL=http://localhost:3004

META_ROBOTS=noindex

SUBSCRIBE_SECRET=
MANDRILL_API_KEY=
MAILCHIMP_API_KEY=
MAILCHIMP_LIST_ID=
MAILCHIMP_INTEREST_ID=

PIWIK_URL_BASE=
PIWIK_SITE_ID=
```

Install dependencies
```
npm install
```

Run the app
```
npm run dev
```
Access the website under: http://localhost:4000

#### Basic Auth

Provide the following .env variables to enable HTTP basic auth:

```
BASIC_AUTH_USER=
BASIC_AUTH_PASS=
BASIC_AUTH_REALM=
```

## Assets

Assets are hosted on s3.

You'll need an `~/.s3cfg` with your keys:
```
[default]
access_key = X
secret_key = X
use_https = True
```

Run `make upload-assets` to upload them via [s3cmd](http://s3tools.org/s3cmd).
