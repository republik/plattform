#!/usr/bin/env node
const debug = require('debug')('auth:script:checkTokens')
const ndjson = require('ndjson')
const Promise = require('bluebird')
const path = require('path')
const fs = require('fs')
const yargs = require('yargs')
const { tsvFormatRow } = require('d3-dsv')

const argv = yargs
  .option('path', {
    required: true,
    coerce: (input) => path.resolve('./', input),
  })
  .option('tsv', {
    boolean: true,
    default: false,
  }).argv

debug('args: %o', argv)

require('@orbiting/backend-modules-env').config()

const {
  lib: { ConnectionContext },
} = require('@orbiting/backend-modules-base')

const applicationName = 'backends auth script checkTokens'

ConnectionContext.create(applicationName)
  .then(async (context) => {
    debug('begin')

    const { pgdb } = context

    await new Promise((resolve, reject) => {
      const logFilePath = argv.path

      const ndjsonTransform = ndjson
        .parse({ strict: false })
        .on('error', (e) => {
          debug('ndjson error "%s" in %s', e.message)
          console.log(
            JSON.stringify({
              error: e.message,
              transformer: 'ndjson',
            }),
          )

          resolve()
        })

      let batch = []

      const processBatch = async () => {
        debug('process batch (%i)', batch.length)

        const rows = await pgdb.public.tokens.find(
          {
            payload: batch
              .map(({ token }) => token?.replace(/\x00/g, '0x00')) // eslint-disable-line no-control-regex
              .filter(Boolean),
            expireAction: 'authorize',
          },
          { fields: ['email', 'payload'] },
        )

        batch.forEach((json) => {
          const row = rows.find((row) => row.payload === json.token)

          if (!row) {
            // console.log(JSON.stringify({ ...json, result: 'payload lost' }))
            // debug('payload missing: %o', json)
            return
          }

          if (row.email.toLowerCase() !== json.email?.toLowerCase()) {
            debug(
              'mismatch: payload: %s\t expected: %s\tactual: %s',
              row.payload,
              row.email,
              json.email,
            )
            if (argv.tsv) {
              console.log(
                tsvFormatRow(
                  Object.values({
                    ...json,
                    result: 'mismatch',
                    emailToken: row.email,
                  }),
                ),
              )
            } else {
              console.log(
                JSON.stringify({
                  ...json,
                  result: 'mismatch',
                  emailToken: row.email,
                }),
              )
            }
          }
        })

        batch = []
      }

      const stream = fs
        .createReadStream(logFilePath)
        .pipe(ndjsonTransform)
        .on('data', async (json) => {
          try {
            stream.pause()

            batch.push(json)

            if (batch.length >= 1000) {
              await processBatch()
            }

            stream.resume()

            // console.log(json, row)
          } catch (e) {
            debug('data error', e)
            reject(e)
          } finally {
            stream.resume()
          }
        })

      stream.on('end', async () => {
        if (batch.length) {
          await processBatch()
        }

        debug('done %s', logFilePath)
        return resolve()
      })

      stream.on('error', reject)
    })

    return context
  })
  .then((context) => ConnectionContext.close(context))
