# @orbiting/backend-modules-auth

GraphQL and [express-session](https://github.com/expressjs/session) based authentication module with basic user type and Simple [Role](lib/Roles.js) system. Currently supports the following authentication strategies:

- Passwordless email authentication
- SMS Code challenge
- TOTP Code challenge

Supports 2FA and allows SMS & TOTP to be used as second factor authentication providers.

Checkout the [schema](graphql/schema.js) and [schema-types](graphql/schema-types.js).

used by:
- [publikator-backend](https://github.com/orbiting/publikator-backend)
- [republik-backend](https://github.com/orbiting/republik-backend)

## 2-Factor-Auhentication Flow

Before 2FA can be enabled on a user, at least one of the SMS or TOTP providers need to get setup.

SMS:
1. updateMe (not part of the auth package) to store the user's phone number in the database, the phone number will get tagged as unverified and a code to verify the phone number is sent as short message to the new phone number.
2. sendPhoneNumberVerificationCode to have Twilio send a code to the number stored on the user.
3. verifyPhoneNumber to verify the phone number through the code that got sent by short message, will tag the user's phone number as verified

TOTP:
1. initTOTPSharedSecret will generate a new random shared secret, store it in the database and return it via mutation response
2. validateTOTPSharedSecret will succeed if the client was able to generate the correct TOTP for the current time and shared secret and tag the shared secret as verified.

Activate 2FA:
- updateTwoFactorAuthentication enabled=true will activate 2FA for a specific type of challenge if prerequisits are met, the call will fail if there is no verified TOTP shared secret and no verified phone number stored in the database at that point.

Login with 2FA:
- signIn starts the login process with the email authentication provider in place which in turn sends a token via e-mail to the user.
- unauthorizedSession will get called with the e-mail address and the token sent through e-mail to retrieve information about the session. This Session object can have multiple tokenTypes as result. If that's the case, the user can only authorize the session with a second factor.
- startChallenge starts backend processes needed to login with a certain tokenType, for SMS, the short message with the code needed to authorize the second factor will be sent only after calling this mutation.
- authorizeSession authenticates the session if first and second factor payloads are validated by the auth system. The session will now get linked to the user, the user is now finally logged in.

As soon as 2FA is enabled, updatePhoneNumber and updateEmail calls will fail until 2FA is disabled again, so users cannot lock out themselves from logging in.

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
