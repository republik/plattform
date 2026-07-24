#!/usr/bin/env ts-node
/**
 * One-time ops step: creates the single parent search-only Typesense API key
 * that lib/scopedKey.ts derives per-request scoped keys from. Restricted to
 * the collections searchApiKey needs to search across (comments, users,
 * and articles -- the last written by a completely separate repo,
 * republik/studio, but sharing this same Typesense instance/alias naming).
 * Run script/bootstrap.ts first so all three aliases exist before this runs.
 *
 * Typesense never returns a key's secret value again after creation, so this
 * is NOT idempotent/safe to re-run blindly -- running it again mints a brand
 * new key (invalidating nothing automatically; the old key keeps working
 * until separately revoked). Run once per environment, then copy the printed
 * value into TYPESENSE_SEARCH_KEY in that environment's secrets.
 *
 * Usage: yarn workspace @orbiting/backend-modules-search-typesense run create-search-keys
 */
require('@orbiting/backend-modules-env').config()

import { getClient } from '../lib/client'
import { getAliasName } from '../lib/collections'

const main = async () => {
  const client = getClient()

  const searchKey = await client.keys().create({
    description: 'search-typesense: scoped-search parent key',
    actions: ['documents:search'],
    collections: [
      getAliasName('users'),
      getAliasName('comments'),
      getAliasName('articles'),
    ],
  })

  console.log('Created parent search-only key. Store this as an env var:\n')
  console.log(`TYPESENSE_SEARCH_KEY=${searchKey.value}`)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
