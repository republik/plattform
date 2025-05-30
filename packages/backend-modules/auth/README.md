# @orbiting/backend-modules-auth

GraphQL and [express-session](https://github.com/expressjs/session) based authentication module with basic user type and Simple [Role](lib/Roles.js) system. Currently supports the following authentication strategies:

- Passwordless email authentication

Checkout the [schema](graphql/schema.js) and [schema-types](graphql/schema-types.js).

used by:

- [publikator-backend](https://github.com/orbiting/publikator-backend)
- [republik-backend](https://github.com/orbiting/republik-backend)

## ENV

```
# where to redirect after a successful/failed signin
FRONTEND_BASE_URL=http://localhost:3010

# the url where src/auth.js will be reachable
# what to prefix the sign-in link with
PUBLIC_URL=http://localhost:3020

# NEVER DO THIS IN PROD
# signs in matching emails automatically
#AUTO_LOGIN_REGEX=^([a-zA-Z0-9._%+-]+)@test\.project-r\.construction$
```

## static-texts

This package comes with it's own messages. Edit them in [translations.js](/lib/translations.json).

## Caveats

At the moment this module expects a `_log() ` function to be present on express's request which can be used to sanitize the req before logging it in debug or error cases. If you use this module without [backend-modules-base](https://github.com/orbiting/backends/tree/master/packages/base) you can still use the function from [there](https://github.com/orbiting/backends/blob/master/packages/base/express/requestLog.js).
