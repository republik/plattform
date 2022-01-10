# @orbiting/backend-modules-databroom

> "Wouldn't the world be a cleaner place if we gave blind people brooms instead of canes?"

— Nick Thune

## Overview

This pacakge provides tooling to keep tables tidy. It deletes obsolete or expired data. Actions are split into "jobs":
- postgres/accessEvents: Deletes event rows older than 90 days
- postgres/consents: Sets attribute `ip` to `null` if row is older than 365 days
- postgres/mailLog: Deletes data in attribute `info` but `message.subject` and `template` in rows older than 90 days
- postgres/paymentsLog: Deletes event rows older than 90 days

Databroom is either used as a scheduler (each day at 3am UTC) or as script ("manual").

For Postgres data, databroom is using a query stream and "on data" handler.

## Manual

(Run `yarn` to compile TypeScript files.)

Check what databroom would do:

    node script/run.js --dry-run --verbose


Run databroom:

    node script/run.js --no-dry-run --verbose


As to avoid overpowering data sources, script runs with `nice` option. If not in dry-run-mode, it would only touch a limited amount of rows. Run databroom without `nice` option:

    node script/run.js --no-dry-run --no-nice --verbose

Depending on how often and how old your data is, it might take a while until completed.

## Development

### Manual

1. Run `yarn run tsc -w` to re-compile changed files.
2. Run script at will (or with `nodemon`):

       node script/run.js --no-dry-run --no-nice --verbose

### Scheduler

Scheduler requires backends server.

1. Set `DATABROOM_SCHEDULER=true` in environment file.
2. Run `yarn run dev` in backends root folder.
