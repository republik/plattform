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

You can use a git-excluded `.env` file in development.

Bootstrap your .env file:

```
cp .env.example .env
```

Make sure to adapt `GITHUB_ORG` to the `GITHUB_LOGIN` used in the backend env.

### MATOMO

You can enable tracking by setting a base url and site id:

```
MATOMO_URL_BASE=https://matomo.example.com
MATOMO_SITE_ID=1
```

### Theming

Your logo, fonts and colors? See [orbiting/styleguide](https://github.com/orbiting/styleguide#theming)

#### Linking the Styleguide

Want to change code in the styleguide and preview how it looks and behaves here?

Here are the steps:

```
cd ../styleguide
npm i
npm link

cd ../publikator-frontend
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

### Templates

You can limit the available templates:

```
TEMPLATES=newsletter,neutrum
```

Default is all.

### Repo Prefix

You can prefix all repos name on creation:

```
REPO_PREFIX=newsletter-
```

Default is none.

Will be combined with template specific prefixes.

## License

The source code is «BSD 3-clause» licensed.
