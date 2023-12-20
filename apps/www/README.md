# Republik Frontend

The front-end of [republik.ch](https://www.republik.ch/en).

## Usage

### Quick start

Bootstrap your .env file:

```text
cp .env.example .env
```

### GraphQL code generation

When working in the Next.js app-dir located in `src/app`, the type for the queries written in `src/app/*` are automatically generated.
The generation is done based on the persisted schema files located in `./graphql/*.schema.graphql`.

| Schema file | Query folder |
| ----------- | ------------ |
| `./graphql/republik-api.schema.graphql` | `src/app/graphql/republik-api/**/*.(ts|graphql|gql)` |
| `./graphql/dato-cms.schema.graphql` | `src/app/graphql/cms/**/*.(ts|graphql|gql)` |

In order to update the schema files run `yarn gql:schema`, which then refetches the schema from the backend and DatoCMS and persists it in the schema files.
This has to be done manually whenever the backend schema changes.


#### Authentication environment variables

Check the readme inside the root-folder of the mono-repo, on how to setup the env-variables for the authentication to work correctly.

### Pledge

An online magazine is financed by people pledging to pay for its content. And if a crowd forms around a magazine it becomes crowdfunded. Crowdfundings have a dedicated name in the backend. You can configure the currently active one via the environment. You can only point the front end at one crowdfunding at a time.

```text
CROWDFUNDING=REPUBLIK
```

Additionally you can configure `CROWDFUNDING_PLEDGE` and `CROWDFUNDING_META` crowdfundings. Both default to `CROWDFUNDING`. One controls the default sales channel and the other what is displayed on the meta page, e.g. prolongs.

```text
CROWDFUNDING_PLEDGE=PRESALE
CROWDFUNDING_META=PROLONG
```

#### Payment

Payment provider configuration can be passed in via the environment. `PUBLIC_BASE_URL` is used for PostFinance and PayPal return urls.

```text
PUBLIC_BASE_URL=https://example.com

STRIPE_PUBLISHABLE_KEY=pk_x

PF_PSPID=
PF_FORM_ACTION=https://e-payment.postfinance.ch/ncol/test/orderstandard.asp

PAYPAL_FORM_ACTION=https://www.sandbox.paypal.com/cgi-bin/webscr
PAYPAL_BUSINESS=
PAYPAL_DONATE_LINK=
```

#### Email

Configure at which email address you're available for general questions, investor relations and payment issues:

```text
EMAIL_CONTACT=contact@example.com
EMAIL_IR=ir@example.com
EMAIL_PAYMENT=payment@example.com
```

### Matomo

You can enable tracking by setting a base url and site id:

```text
MATOMO_URL_BASE=https://matomo.example.com
MATOMO_SITE_ID=1
```

### Theming

Your logo, fonts and colors? See [orbiting/styleguide](https://github.com/orbiting/styleguide#theming)

### Curtain

You can configure a curtain message, to show a teaser website.

```text
CURTAIN_MESSAGE=""
```

Additionally you can configure a backdoor URL. Opening that URL sets a cookie which allows to circumvent the countdown page.

```text
CURTAIN_BACKDOOR_URL=/iftah-ya-simsim
```

### Testing App Views

You can test how this front end looks in the app by adding following custom device to your browsers device emulator:

```text
Width: 375
Height: 667
Type: Mobile
User Agent: iPhone RepublikApp/2.0.0
```

## License

The source code is «BSD 3-clause» licensed.
