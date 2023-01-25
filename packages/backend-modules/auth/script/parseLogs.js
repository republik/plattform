#!/usr/bin/env node
const aws = require('aws-sdk')
const debug = require('debug')('auth:script:parseLogs')
const zlib = require('zlib')
const ndjson = require('ndjson')
const Promise = require('bluebird')
const dayjs = require('dayjs')
const yargs = require('yargs')

const argv = yargs
  .option('from', {
    coerce: dayjs,
    default: dayjs().subtract(30, 'day'),
  })
  .option('to', {
    coerce: dayjs,
    default: dayjs(),
  })
  .option('bucket', {
    default: 'projectr-logdna',
  })
  .option('concurrency', {
    default: 10,
  })
  .help()
  .version().argv

debug('args: %o', argv)

const base64u = require('@orbiting/backend-modules-base64u')

require('@orbiting/backend-modules-env').config()

const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = process.env

aws.config.update({
  region: AWS_REGION,
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
})

const s3 = new aws.S3({
  apiVersion: '2018-01-15',
})

const processObject = async (objectRef) => {
  debug('process %s', objectRef.Key)

  await new Promise((resolve, reject) => {
    const gunzipTransform = zlib.createGunzip().on('error', (e) => {
      debug('gunzip error "%s" in %s', e.message, objectRef.Key)
      console.log(
        JSON.stringify({
          error: e.message,
          transformer: 'gunzip',
          objectRef: objectRef.Key,
        }),
      )

      resolve()
    })

    const ndjsonTransform = ndjson.parse({ strict: false }).on('error', (e) => {
      debug('ndjson error "%s" in %s', e.message, objectRef.Key)
      console.log(
        JSON.stringify({
          error: e.message,
          transformer: 'ndjson',
          objectRef: objectRef.Key,
        }),
      )

      resolve()
    })

    const stream = s3
      .getObject({
        Key: objectRef.Key,
        Bucket: argv.bucket,
      })
      .createReadStream()
      .pipe(gunzipTransform)
      .pipe(ndjsonTransform)
      .on('data', (json) => {
        try {
          const { timestamp } = json._source || json

          const path = json._source?.path || json._source?._path || json.path

          if (path?.match(/\/mitteilung/)) {
            const { searchParams } = new URL(path, 'https://www.republik.ch')

            const email = searchParams.get('email')
            const token = searchParams.get('token')

            const params = {
              email:
                (email && base64u.match(email) && base64u.decode(email)) ||
                email,
              token,
            }

            // debug('path: %s (%s)', path, timestamp)
            console.log(JSON.stringify({ timestamp, path, ...params }))
          }

          // stream.resume()
        } catch (e) {
          debug('data error "%s": %o', e.message, json)
          resolve()
        }
      })

    stream.on('end', async () => {
      debug('done %s', objectRef.Key)
      return resolve()
    })

    stream.on('error', reject)
  })
}

const run = async () => {
  let truncated = true
  let marker = null

  /* await processObject({
    Key: 'year=2022/month=11/day=03/e24aec0776.2022-11-03.2100.json.gz',
  })
  return */

  debug('fetch listObjects (marker: %s)', marker)

  while (truncated) {
    debug('listObjects')
    const response = await s3
      .listObjects({
        Bucket: argv.bucket,
        Marker: marker,
        MaxKeys: 100,
      })
      .promise()

    debug('response.Contents[]: %i', response.Contents?.length)

    await Promise.map(
      response.Contents.filter((objectRef) => {
        const isAfter = dayjs(objectRef.LastModified).isAfter(argv.from)
        const isBefore = dayjs(objectRef.LastModified).isBefore(argv.to)

        return isAfter && isBefore
      }),
      processObject,
      { concurrency: argv.concurrency },
    )

    truncated = response.IsTruncated

    if (truncated) {
      marker = response.Contents.slice(-1)[0].Key
    }
  }
}

run()
