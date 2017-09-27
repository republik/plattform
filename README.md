# Publikator Frontend

A CMS prototype: an Editor implemented with [Slate](https://github.com/ianstormtaylor/slate) and saving content on GitHub via an API.

Development code names: Mauka, Haku

## Usage

### Quick start

This frontend needs an API, provided by [publikator-backend](https://github.com/orbiting/publikator-backend), running on the same TLD (for cookie sharing).

Install and run:
```
npm install
npm run dev
```

### Environment

You can use a git-excluded `.env` file in development:

```
PORT=3005

API_BASE_URL=http://localhost:3004/graphql
API_WS_BASE_URL=ws://localhost:3004/graphql
```

### Piwik

You can enable tracking by setting a base url and site id:

```
PIWIK_URL_BASE=https://piwik.example.com
PIWIK_SITE_ID=1
```

### Theming

Your logo, fonts and colors? See [orbiting/styleguide](https://github.com/orbiting/styleguide#theming)

## License

The source code is «BSD 3-clause» licensed.
