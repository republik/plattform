#!/usr/bin/env node
/**
 * Script to migrate content__markdown to Slates nodes.
 *
 * Takes a while.
 *
 * Usage:
 * packages/backend-modules/discussions/script/migrateMarkdownToSlate.js
 */
require('@orbiting/backend-modules-env').config()

const Promise = require('bluebird')

const {
  lib: { ConnectionContext },
} = require('@orbiting/backend-modules-base')
const mdastToSlatetree = require('@orbiting/backend-modules-utils/slate/mdastToSlatetree')
const {
  remark: { parse },
} = require('@orbiting/backend-modules-utils')

const applicationName = 'backends discussions script migrateToSlatetree'

const sql = `
SELECT id, "discussionId", content__markdown
FROM comments
WHERE
  content__markdown IS NOT NULL
  AND "slatedAt" IS NULL
`

const createHandleFn = (tx) => (rows, count, pgdb) =>
  Promise.mapSeries(rows, async (row) => {
    const mdast = parse(row.content__markdown)
    const content = mdastToSlatetree(mdast)

    await tx.public.comments.updateOne(
      { id: row.id },
      { content, slatedAt: new Date() },
    )
  }).then(() => {
    console.log('%d comments migrated', count)
  })

ConnectionContext.create(applicationName)
  .then(async (context) => {
    console.log('Begin...')

    const { pgdb } = context

    // Disable trigger for session
    await pgdb.query(`SET session_replication_role = replica`)

    const tx = await pgdb.transactionBegin()

    try {
      await pgdb.queryInBatches(
        { handleFn: createHandleFn(tx), size: 100 },
        sql,
      )
      await tx.transactionCommit()
    } catch (e) {
      await tx.transactionRollback()
      console.error(e)
    }

    console.log('Done.')

    return context
  })
  .then((context) => ConnectionContext.close(context))
