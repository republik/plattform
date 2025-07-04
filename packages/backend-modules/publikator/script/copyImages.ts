/// <reference lib="dom" />
require('@orbiting/backend-modules-env').config()

import { ConnectionContext } from '@orbiting/backend-modules-types'
import Promise from 'bluebird'
import _debug from 'debug'
import moment from 'moment'
import yargs from 'yargs'
import { Commit } from '../lib/types'

import { Repo } from '../loaders/Repo'

const { parse: mdastParse } = require('@republik/remark-preset')

const {
  lib: { ConnectionContext },
} = require('@orbiting/backend-modules-base')
const {
  lib: {
    Repo: { isImageUploaded, uploadImage },
  },
} = require('@orbiting/backend-modules-assets')
const {
  lib: {
    process: {
      processRepoImageUrlsInContent,
      processRepoImageUrlsInMeta,
      processEmbedImageUrlsInContent,
    },
  },
} = require('@orbiting/backend-modules-documents')

const debug = _debug('publikator:script:copyImages')

const fetchToBlob = (url: string) =>
  fetch(url)
    .then((res) => {
      if (!res.ok) {
        throw Error(
          `Unable to fetch url "${url}" (HTTP Status Code: ${res.status})`,
        )
      }

      return res.arrayBuffer()
    })
    .then((arrayBuffer) => {
      return Buffer.from(arrayBuffer)
    })

interface Image {
  path: string
}

const createAdd = (imagePaths: Set<string>) => {
  return function add(url: string) {
    const match = url.match(/^(?<path>images\/.+)\?size=.+$/)

    if (match?.groups?.path) {
      imagePaths.add(match.groups.path)
    }
  }
}

const createMaybeUpload = (repoId: string, origin: string) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, name] = repoId.split('/')

  return async function maybeUpload(path: string) {
    const image: Image = { path }

    if (await isImageUploaded(repoId, image)) {
      debug('found %s (%s)', image.path, repoId)
      return
    }

    debug('fetch and upload %s (%s)', image.path, repoId)

    const originUrl = [origin, name, image.path].join('/')

    try {
      const blob = await fetchToBlob(originUrl)
      return uploadImage(repoId, { ...image, blob })
    } catch (e) {
      // swallow error purposfully
      console.error(
        'maybeUpload error',
        e instanceof Error ? e.message : e,
        originUrl,
      )
      return false
    }
  }
}

const argv = yargs
  .option('origin', {
    description: 'Publicly accessible URL to fetch images from',
    required: true,
    default: 'https://assets.republik.space/s3/republik-assets/repos/republik',
  })
  .option('after', {
    description: 'Check commits created after this date',
    required: true,
    default: moment().subtract(30, 'days'),
    coerce: moment,
  })
  .option('concurrency', {
    description: 'Concurrent image handler',
    required: true,
    default: 10,
  })
  .parseSync()

const applicationName = 'backends publikator script copyImages'

ConnectionContext.create(applicationName)
  .then(async (context: ConnectionContext) => {
    const { pgdb } = context

    const repos = await pgdb.query(
      `
        SELECT DISTINCT
        ON ("repoId")
          "repoId" "id"
        FROM publikator.commits
        WHERE "createdAt" >= : after
        ORDER BY "repoId", "createdAt" DESC
      `,
      { after: argv.after },
    )

    debug('%i repos found', repos.length)

    await Promise.each(repos, async (repo: Repo) => {
      const repoId = repo.id

      const commits: Commit[] = await pgdb.publikator.commits.find(
        { repoId: repo.id, 'createdAt >=': argv.after },
        { orderBy: { createdAt: 'DESC' } },
      )
      debug('%i commits found (%s)', commits.length, repoId)

      const imagePaths: Set<string> = new Set()
      const add = createAdd(imagePaths)
      const maybeUpload = createMaybeUpload(repoId, argv.origin)

      await Promise.each(commits, async (commit: Commit) => {
        const { type, meta } = commit

        const content = {
          ...(commit.content || mdastParse(commit.content__markdown)),
          meta,
        }

        await Promise.all([
          processRepoImageUrlsInContent(content, add),
          processRepoImageUrlsInMeta(content, add),
          processEmbedImageUrlsInContent(content, add),
        ])
      })
      debug('%i image paths found (%s)', imagePaths.size, repoId)

      await Promise.map(imagePaths, maybeUpload, {
        concurrency: argv.concurrency,
      })
    }).catch((e) => {
      console.error(e.message)
    })

    console.log('Done.')

    return context
  })
  .then((context: ConnectionContext) => ConnectionContext.close(context))
