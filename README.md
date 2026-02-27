# Republik Plattform

The platform that powers republik.ch. A tailored solution for a membership based online magazine.

## Contributions and issues

If you are a Republik reader (thank you!) and you have any issues or feature requests, please do kindly direct them to [our support team](mailto:kontakt@republik.ch). 
Unfortunately we can also not currently accept external contributions to our codebase, as we are a small team and want to keep our focus on improving and maintaining the product for all of our readers. Thank you for your interest in case you were considering it, we are impressed. 

## What's inside?

This turborepo uses [Yarn](https://classic.yarnpkg.com/lang/en/) as a package manager. It includes the following apps and packages:

### Apps

- `www`: providing the public frontend
- `publikator`: providing publication management interface
- `admin`: providing the customer management interface
- `api`: providing the graphql api
- `assets`: fetching, compressing and resizing assets

The frontends are Next.js apps, the backends use Express.js.

### Packages

- `styleguide`: a React component library shared by all frontends and used by the `api` to render newsletters
- `backend-modules/*`: packages used by the `api` and `assets` server
- `mdast/*`: packages used to work with mdast (previously in it's own [monorepo](https://github.com/orbiting/mdast))
- `eslint-config-*`: multiple eslint configurations which are used accross our apps
- `nextjs-apollo-client`: a reusable Nextjs / Apollo Client setup
- `tsconfig`: a package to store shared typescript configurations
- `icons`: A package to make SVG-files available as react.js components to be used across our frontends.

All packages and apps support [TypeScript](https://www.typescriptlang.org/) and plain ECMAScript.

### Licenses

The logo and fonts are the property of their owners (logo—Project R, GT America—GrilliType and Rubis—Nootype), and may not be reproduced without permission.

The `www`, `publikator` app and `styleguide` are BSD-3-Clause licensed. The `api`, `assets` app and all `backend-modules` are AGPL-3.0 licensed. See respective license files in subfolders.

### Utilities

This turborepo has some additional tools already setup for you:

- [ESLint](https://eslint.org/) for code linting
- [Jest](https://jestjs.io) test runner for all things JavaScript
- [Prettier](https://prettier.io) for code formatting

## Setup

To get started you'll need:

- yarn v1.22
- Node.js v24
- Docker

### Env

All apps and the styleguide provide an `.env.example`, the provided default values should be enough to get started:

```bash
cp apps/www/.env.example apps/www/.env
cp apps/publikator/.env.example apps/publikator/.env
cp apps/admin/.env.example apps/admin/.env

cp apps/api/.env.example apps/api/.env
cp apps/assets/.env.example apps/assets/.env
```

<details><summary>Migrating from Individual Repos</summary>
<p>

You may copyover your environment from the individual repos with one manual edit:

```bash
cp ../republik-frontend/.env apps/www/.env
cp ../publikator-frontend/.env apps/publikator/.env
cp ../republik-admin-frontend/.env apps/admin/.env

cp ../styleguide/.env packages/styleguide/.env

cp ../backends/.env apps/api/.env
echo "PORT=5010" >> apps/api/.env

cp ../backends/servers/assets/.env apps/assets/.env
```

</p>
</details>
For more about the available env variables see the individual readme of the apps.

### Setup authentication environment

#### Authentication cookie

The `COOKIE_NAME` env-variable can be defined in `apps/api` and `apps/www`. It's crucial that the value defined in the apps/www file matches the one of the API that you're developing against.
If these two env-variables don't match, www will be stuck in a redirection loop when trying to open the URL `/`.

### Database Setup

```bash
docker compose up
```

```bash
yarn install
yarn build
yarn dev:setup
```

### Develop

To develop all apps and packages, run the following command:

```bash
docker compose up
```

And in a second shell

```bash
yarn dev
```

Please be patient on boot. It might take a minute for everything to compile and a few nodemon restarts before everything runs smoothly.

### Only run certain apps while developing

If you don't want all apps to run when using the `dev` script, you can use the `filter` flag.
(see the [Turborepo documentation](https://turbo.build/repo/docs/reference/command-line-reference#--filter))
For example if you only want to run the republik frontend run `yarn dev --filter=@orbiting/www-app`.

In most cases you have certain dependencies that should be run as well, for example the styleguide if you're developing in the frontend. In that case simply append `...` directly after the filter, to ensure that the additionally to the filtered app, all dependencies are executed as well. (For example in www run: `yarn dev --filter=@orbiting/www-app...`)

For start only frontend and api use:

```bash
yarn dev --filter=@orbiting/www-app... --filter=@orbiting/api-app...
```


### Commit Message Format

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

You can use `yarn commit` to generate a message via an interactive prompt.

**Types**

Always changelog relevant: `feat`, `fix`, `perf`
Others: `docs`, `chore`, `style`, `refactor`, `test`

Scope is optional.

> The body should include the motivation for the change and contrast this with previous behavior.

> The footer should contain any information about Breaking Changes and is also the place to reference GitHub issues that this commit Closes.

### Yaproxy

Don't care about developing the backend? Just want to test something against our production backend? We have yet another proxy for that:

```
# terminal 1
yarn yaproxy
# terminal 2
yarn dev:www
```

(Obvious )Warning: whatever you do here is for realz, if you login to your account and change things they are changed on republik.ch!


## Deployment

The environment variable `SERVER` is used to determine which app to build and run on deploy. If `SERVER` is missing the api app is run.

A `heroku-prebuild` script runs `scripts/prune.sh` which runs `turbo prune` with the correct scope and moved the pruned apps and packages to the root directory.

A `heroku-postbuild` script is used to add a `Procfile` for running the scheduler on heroku for the `api` app.
