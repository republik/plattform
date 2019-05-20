Publikator Backend
------------------

Publikator is a cms prototype: edit files on github with [slate](https://github.com/ianstormtaylor/slate).

Works best with: [publikator-frontend](https://github.com/orbiting/publikator-frontend)

Depends on modules from: [backend-modules](https://github.com/orbiting/backend-modules)

## Usage

### Quick start
You need to have node (8.3.0+) installed, postgres and redis running somewhere.

Boostrap your .env file (see [.env.example](.env.example)).

Install dependencies.
```
yarn install
```

Create a seeds file by copying [seeds.example.json](https://github.com/orbiting/backend-modules/blob/master/packages/auth/seeds/seeds.example.json)
to `seeds/seeds.json` and adapting it to your needs. The seeds are read by the scripts `db:seed` or `db:reset`.

Create and init the DB.
```
createdb -U postgres publikator
yarn run db:reset
```

Run it.
```
yarn run dev
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

## Email Tracking

You can add our own open beacon to newsletters by setting following environment variables:

```
PIWIK_URL_BASE=https://piwik.example.com
PIWIK_SITE_ID=1
```

_MailChimp tracking is automatically disabled when creating a new campaign._

## Embeds

The `embed` root query depends on 3rd party API calls and in order for them to work, you have to create apps on the respective platforms and put your credentials into your `.env` file.

#### Youtube

Create a new app: https://console.developers.google.com
In the dashboard, select "Library" on the right, then search for and add the **YouTube Data API v3** to your services.

Now select "Credentials" on the right and add the key to your `.env`:

```
YOUTUBE_APP_KEY=[your-key]
```

#### Vimeo

Create a new app here: https://developer.vimeo.com/.
Now select your new app and in the menu above the icon, click on authentication. Now you add to your `.env`:

```
VIMEO_APP_KEY=[The hash from field "Client Identifier"]
VIMEO_APP_SECRET=[The hash from field "Client Secret"]
```

#### Twitter

Create a new app here: https://apps.twitter.com/ and select it.
Go to section "Keys and Access Tokens" and add to your `.env`:

```
TWITTER_APP_KEY=[The hash from field "Consumer Key (API Key)"]
TWITTER_APP_SECRET=[The hash from field "Consumer Secret (API Secret)"]
```

## HowTo's

### Union Types

With `graphql-tools` you cannot use actual union types. Instead define arbitrary types with interfaces.

Instead of
```
type A {

}

type B {

}

union C = A | B

type Query {
  getC(): C!
}
```

you do

```
interface C {

}

type A implements C {

}

type B implements C {

}

type Query {
  getC(): C!
}
```

Queries work exactly the same as they would with actual union types.
[Source](https://www.apollographql.com/docs/graphql-tools/resolvers.html#Unions-and-interfaces)


## Licensing
The source code and it's documentation is licensed under [GNU AGPLv3](LICENSE)+.
