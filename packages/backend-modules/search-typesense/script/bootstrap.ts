#!/usr/bin/env ts-node
/**
 * Idempotently ensures both the "comments" and "users" Typesense
 * collections (and their aliases) exist. Safe to run repeatedly: it skips
 * creation for any kind whose alias already points at an existing
 * collection.
 *
 * Usage: yarn workspace @orbiting/backend-modules-search-typesense run bootstrap
 */
require('@orbiting/backend-modules-env').config()

import { getClient } from '../lib/client'
import { ALL_KINDS, ensureBootstrapped } from '../lib/collections'

const main = async () => {
  const client = getClient()

  for (const kind of ALL_KINDS) {
    const result = await ensureBootstrapped(client, kind)
    if (result.created) {
      console.log(
        `bootstrapped "${kind}": created collection "${result.collectionName}" and pointed alias "${result.aliasName}" at it`,
      )
    } else {
      console.log(
        `"${kind}" already bootstrapped: alias "${result.aliasName}" -> collection "${result.collectionName}"`,
      )
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
