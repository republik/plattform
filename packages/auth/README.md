# @orbiting/backend-modules-auth

Passwordless email authentication and basic user type for graphql. Sessions based on cookies by [express-session](https://github.com/expressjs/session). Simple [Role](lib/Roles.js) system.

Checkout the [schema](graphql/schema.js) and [schema-types](graphql/schema-types.js).

used by:
- [publikator-backend](https://github.com/orbiting/publikator-backend)
- [republik-backend](https://github.com/orbiting/republik-backend)

## ENV
```
# where to send auth mails from
AUTH_MAIL_FROM_ADDRESS="kontakt@republik.ch"

# where to redirect after a successful/failed signin
FRONTEND_BASE_URL=http://localhost:3010


# optional

# name of the mandrill template to use for signin emails
# see seeds/email_templates/
# If undefined a simple text email will be sent
# see lib/signin.js
AUTH_MAIL_TEMPLATE_NAME=republik_signin

# overwrite api/signin/mail/subject
AUTH_MAIL_SUBJECT=sign in link

# the url where src/auth.js will be reachable
# what to prefix the sign-in link with
PUBLIC_URL=http://localhost:3020

# if truthy, @test.project-r.construction mail addresses get automatically
# signedin and no mail is sent (used for automated testing)
AUTO_LOGIN=1
```

## static-texts
This package comes with it's own messages. You may want run `yarn run translations` to refresh it from the gsheet configured in [package.json](package.json) or change it manually in [translations.js](/lib/translations.json).

## Caveats
At the moment this module expects a `_log() ` function to be present on express's request which can be used to sanitize the req before logging it in debug or error cases. If you use this module without [backend-modules-base](https://github.com/orbiting/backends/tree/master/packages/base) you can still use the function from [there](https://github.com/orbiting/backends/blob/master/packages/base/express/requestLog.js).
