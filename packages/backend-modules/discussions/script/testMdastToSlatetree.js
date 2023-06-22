#!/usr/bin/env node
/**
 * Script to test utils' mdastToSlatetree on all comment records.
 *
 * It walks through all records one by one and will print a warning or
 * throw an error if something is off.
 *
 * Usage:
 * packages/backend-modules/discussions/script/testMdastToSlatetree.js
 */
require('@orbiting/backend-modules-env').config()
const {
  lib: { ConnectionContext },
} = require('@orbiting/backend-modules-base')
const mdastToSlatetree = require('@orbiting/backend-modules-utils/slate/mdastToSlatetree')
const { parse } = require('@republik/remark-preset')

const { FRONTEND_BASE_URL } = process.env

const applicationName = 'backends discussions script migrateToSlatetree'

const sql = `
SELECT id, "discussionId", content
FROM comments
`

const handleFn = (rows, count, pgdb) => {
  rows.forEach((row) => {
    try {
      console.log(
        row.id,
        `${FRONTEND_BASE_URL}/dialog?id=${row.discussionId}&t=article&focus=${row.id}`,
      )

      const mdast = parse(row.content)
      // console.log(JSON.stringify(mdast, null, 2))

      mdastToSlatetree(mdast)
      // const slatetree = mdastToSlatetree(mdast)
      // console.log(JSON.stringify(slatetree, null, 2))
    } catch (e) {
      console.error(e)
    }
  })
}

ConnectionContext.create(applicationName)
  .then(async (context) => {
    console.log('Begin...')

    const { pgdb } = context

    await pgdb.queryInBatches({ handleFn }, sql)

    console.log('Done.')

    return context
  })
  .then((context) => ConnectionContext.close(context))
