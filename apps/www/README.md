# Republik Frontend

The front-end of [republik.ch](https://www.republik.ch/en).

## Usage

### Quick start

You need to have node 14+ installed.

Bootstrap your .env file:

```
cp .env.example .env
```

Install and run:

```
npm install
npm run dev
```

The example env assumes a backend running on port 5010. The backend needs to run on the same TLD for cookie sharing.

#### Setup Local Backend

See «[How To Run: Setup the Backends](https://github.com/orbiting/docs/blob/master/guides/how-to-run.md#1-setup-the-backends)».

#### Proxy Production Backend

Don't care about developing the backend? Just want to test something against our production backend? We have [yet another proxy](https://github.com/orbiting/proxy) for that:

```
PORT=5010 TARGET=https://api.republik.ch CORS_ORIGIN=http://localhost:3010 npx yaproxy
```

(Obvious )Warning: whatever you do here is for realz, if you login to your account and change things they are changed on republik.ch! 

### Testing

Run a test locally:
```
npm run tape components/Me/index.test.js
```

Run all tests:
```
npm run test
```

### Pledge

An online magazine is financed by people pledging to pay for its content. And if a crowd forms around a magazine it becomes crowdfunded. Crowdfundings have a dedicated name in the backend. You can configure the currently active one via the environment. You can only point the front end at one crowdfunding at a time.

```
CROWDFUNDING=REPUBLIK
```

Additionally you can configure `CROWDFUNDING_PLEDGE` and `CROWDFUNDING_META` crowdfundings. Both default to `CROWDFUNDING`. One controls the default sales channel and the other what is displayed on the meta page, e.g. prolongs.

```
CROWDFUNDING_PLEDGE=PRESALE
CROWDFUNDING_META=PROLONG
```

#### Payment

Payment provider configuration can be passed in via the environment. `PUBLIC_BASE_URL` is used for PostFinance and PayPal return urls.

```
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

```
EMAIL_CONTACT=contact@example.com
EMAIL_IR=ir@example.com
EMAIL_PAYMENT=payment@example.com
```

### Matomo

You can enable tracking by setting a base url and site id:

```
MATOMO_URL_BASE=https://matomo.example.com
MATOMO_SITE_ID=1
```

### Theming

Your logo, fonts and colors? See [orbiting/styleguide](https://github.com/orbiting/styleguide#theming)

#### Linking the Styleguide

Want to change code in the styleguide and preview how it looks here?

Here are the steps:

```
cd ../styleguide
npm i
# run dev before linking
npm run dev
npm link

cd ../republik-frontend
npm i
# deeply link styleguide and some peers
# and add a tmp preinstall script to unlink
npm run sg:link

# do your work

# simply run npm install to unlink
# rm the links and the tmp preinstall script
# reinstall stuff via npm
npm i
```

_Why? `glamor`, `react` and `react-dom` use singletons. And `peerDependencies` are not flattened when `npm link`ed—two versions with their own singletons end up running. While linked this way those packages are linked to the styleguide node_modules folder._

### Curtain

You can configure a curtain message, to show a teaser website.

```
CURTAIN_MESSAGE=""
```

Additionally you can configure a backdoor URL. Opening that URL sets a cookie which allows to circumvent the countdown page.

```
CURTAIN_BACKDOOR_URL=/iftah-ya-simsim
```

### Testing App Views

You can test how this front end looks in the app by adding following custom device to your browsers device emulator:

```
Width: 375
Height: 667
Type: Mobile
User Agent: iPhone RepublikApp/2.0.0
```

## License

The source code is «BSD 3-clause» licensed.
