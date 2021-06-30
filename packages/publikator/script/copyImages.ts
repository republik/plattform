require('@orbiting/backend-modules-env').config()

import yargs from 'yargs'
import Promise from 'bluebird'
import fetch from 'node-fetch'
import moment from 'moment'
import _debug from 'debug'

const { parse: mdastParse } = require('@orbiting/remark-preset')

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
import { ConnectionContext } from '@orbiting/backend-modules-types'

import { Repo } from '../loaders/Repo'
import { Commit } from '../loaders/Commit'

const debug = _debug('publikator:script:copyImages')

const fetchToBlob = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      throw Error(
        `Unable to fetch url "${url}" (HTTP Status Code: ${res.status})`,
      )
    }

    return res.buffer()
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
      console.error(e.message, originUrl)
      return false
    }
  }
}

const argv: { origin: string; after: moment.Moment; concurrency: number } =
  yargs
    .option('origin', {
      description: 'Publicly accessible URL to fetch images from',
      required: true,
      default:
        'https://assets.republik.space/s3/republik-assets/repos/republik',
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
    }).argv

const applicationName = 'backends publikator script copyImages'

ConnectionContext.create(applicationName)
  .then(async (context: ConnectionContext) => {
    const { pgdb } = context

    const repos = await pgdb.query(
      `
        SELECT
          DISTINCT ON ("repoId")
          "repoId" "id"
        FROM publikator.commits
        WHERE "createdAt" >= :after
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
        const { content, meta } = commit

        const mdast = { ...mdastParse(content), meta }

        await Promise.all([
          processRepoImageUrlsInContent(mdast, add),
          processRepoImageUrlsInMeta(mdast, add),
          processEmbedImageUrlsInContent(mdast, add),
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
