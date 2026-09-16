#!/usr/bin/env ts-node
/**
 * One-time ops step: creates the parent search-only Typesense API keys that
 * lib/scopedKey.ts derives per-request scoped keys from. Run script/bootstrap.ts
 * first so all three aliases exist before this runs.
 *
 * The `collections` list on each key below is the ENTIRE privacy boundary for
 * search. Derived scoped keys carry no document filter at all -- they only add
 * an expiry (see lib/scopedKey.ts) -- so anything a key can reach, a browser
 * holding a scoped key derived from it can search. Do not widen either list
 * casually.
 *
 * Two parent keys exist today:
 * - TYPESENSE_SEARCH_KEY: comments + users + articles, for the `member` and
 *   `admin` tiers.
 * - TYPESENSE_SEARCH_KEY_PUBLIC: users + articles only (no comments), for the
 *   `public` tier (unauthenticated callers, and logged-in callers without the
 *   `member` role) -- comments are not public.
 *
 * PARENT_KEY_ENV_BY_TIER in lib/scopedKey.ts is what maps each tier to its
 * parent key. A future admin-only collection would follow the same pattern:
 * mint a third parent key over the wider list, store it as
 * TYPESENSE_SEARCH_KEY_ADMIN, and point the `admin` tier at it there. That --
 * not a per-tier `filter_by` -- is how tiers get different visibility.
 *
 * Typesense never returns a key's secret value again after creation, so this
 * is NOT idempotent/safe to re-run blindly -- running it again mints brand
 * new keys (invalidating nothing automatically; the old keys keep working
 * until separately revoked). Run once per environment, then copy the printed
 * values into TYPESENSE_SEARCH_KEY and TYPESENSE_SEARCH_KEY_PUBLIC in that
 * environment's secrets.
 *
 * Usage: yarn workspace @orbiting/backend-modules-search-typesense run create-search-keys
 */
require('@orbiting/backend-modules-env').config()

import { getClient } from '../lib/client'
import { getAliasName } from '../lib/collections'

const main = async () => {
  const client = getClient()

  const searchKey = await client.keys().create({
    description:
      'search-typesense: scoped-search parent key (comments, users, articles)',
    actions: ['documents:search'],
    collections: [
      getAliasName('users'),
      getAliasName('comments'),
      getAliasName('articles'),
    ],
  })

  const publicSearchKey = await client.keys().create({
    description:
      'search-typesense: scoped-search parent key, public tier (no comments)',
    actions: ['documents:search'],
    collections: [getAliasName('users'), getAliasName('articles')],
  })

  console.log('Created parent search-only keys. Store these as env vars:\n')
  console.log(`TYPESENSE_SEARCH_KEY=${searchKey.value}`)
  console.log(`TYPESENSE_SEARCH_KEY_PUBLIC=${publicSearchKey.value}`)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
