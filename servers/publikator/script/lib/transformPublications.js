#!/usr/bin/env node
/**
 * This lib exports a function which expects a transform func as input.
 * transform is executed with each published doc, and is expected to
 * - do nothing or modify the doc
 * - return truthy if the modification should be saved (the return value is used as commit message)
 *
 * For each doc transform returns true, the changes are saved to git and
 * the article get's republished.
 *
 * Usage example: (run from servers/publikator)
 * node script/removeDialogBoxes.js [-n [num]] [--dry]
 * -n: stop after n fixes
 * -- dry: don't commit/publish
 */
require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const Elasticsearch = require('@orbiting/backend-modules-base/lib/Elasticsearch')
const Redis = require('@orbiting/backend-modules-base/lib/Redis')
const RedisPubSub = require('@orbiting/backend-modules-base/lib/RedisPubSub')
const t = require('../../lib/t')
const Promise = require('bluebird')
const yargs = require('yargs')

const search = require('@orbiting/backend-modules-search/graphql/resolvers/_queries/search')
const commit = require('../../graphql/resolvers/_mutations/commit')
const publish = require('../../graphql/resolvers/_mutations/publish')
const { document: getRawDoc } = require('../../graphql/resolvers/Commit')

const loaderBuilders = {
  ...require('@orbiting/backend-modules-discussions/loaders'),
  ...require('@orbiting/backend-modules-documents/loaders')
}

const getContext = (payload) => {
  let loaders = {}
  const context = {
    ...payload,
    loaders,
    user: {
      name: 'Publikator-bot',
      email: 'ruggedly@project-r.construction',
      roles: ['editor', 'member']
    }
  }
  Object.keys(loaderBuilders).forEach(key => {
    loaders[key] = loaderBuilders[key](context)
  })
  return context
}

const {
  GITHUB_LOGIN,
  FRONTEND_BASE_URL
} = process.env

const argv = yargs
  .usage('Usage: $0 [-n [num]] [--dry]')
  .help()
  .version()
  .argv

const iterateESDocs = async (context, callback) => {
  let pageInfo

  do {
    const docsConnection = await search(null, {
      first: 100,
      ...(pageInfo && pageInfo.hasNextPage)
        ? { after: pageInfo.endCursor }
        : { },
      filter: {
        type: 'Document'
      },
      sort: {
        key: 'publishedAt',
        direction: 'DESC'
      },
      ignorePrepublished: true
    }, context)

    pageInfo = docsConnection.pageInfo

    await Promise.each(
      docsConnection.nodes
        .filter(node => node.type === 'Document')
        .map(node => node.entity),
      (entity) =>
        callback({ doc: entity }), // eslint-disable-line standard/no-callback-literal
      { concurrency: 1 }
    )
  } while (pageInfo && pageInfo.hasNextPage)
}

module.exports = ({ transform }) =>
  PgDb.connect().then(async pgdb => {
    console.log('running...')
    const { dry } = argv
    if (dry) {
      console.log("dry run: this won't change anything")
    }
    const stopAfterNumFixes = argv.n > 0 && argv.n
    if (stopAfterNumFixes) {
      console.log(`stop after num fixes: ${stopAfterNumFixes}`)
    }

    const context = getContext({
      pgdb,
      elastic: Elasticsearch.connect(),
      redis: Redis.connect(),
      pubsub: RedisPubSub.connect(),
      t
    })

    let numFixed = 0
    let finishNotice = false
    await iterateESDocs(context, async ({doc}) => {
      if (stopAfterNumFixes && numFixed >= stopAfterNumFixes) {
        if (!finishNotice) {
          console.log(`finish here because stopAfterNumFixes: ${stopAfterNumFixes}`)
          finishNotice = true
        }
        return
      }
      let docTransformed = await transform(doc, context, false)
      if (docTransformed) {
        console.log(`\nfixing: ${docTransformed}...`)
        console.log(`${FRONTEND_BASE_URL}${doc.meta.path}`)

        const parsedDocId = Buffer.from(doc.id, 'base64').toString('utf-8')
        const [
          repoOrg, // eslint-disable-line no-unused-vars
          repoName,
          commitId,
          versionName
        ] = parsedDocId.split('/')

        // for copied repos
        const repoId = `${GITHUB_LOGIN}/${repoName}`
        console.log(`https://github.com/${repoId}`)

        if (versionName.indexOf('prepublication') > -1) {
          console.log('encountered prepublication: skipping', parsedDocId)
          return
        }

        // get commit from github instead of ES and do the work again
        const rawDoc = await getRawDoc(
          {
            id: commitId,
            repo: { id: repoId }
          },
          { publicAssets: false },
          context
        )

        docTransformed = await transform(rawDoc, context, true)
        if (!docTransformed) {
          console.log('es <> git out of sync!', repoId)
          return
        }

        if (dry) {
          console.log('dry: no commit/publish')
        } else {
          console.log('committing...')
          const newCommit = await commit(null, {
            repoId,
            parentId: commitId,
            message: docTransformed,
            document: {
              content: rawDoc.content
            }
          }, context)

          console.log('publishing...')
          const publication = await publish(null, {
            repoId,
            commitId: newCommit.id,
            prepublication: false
          }, context)
          if (publication.unresolvedRepoIds.length > 0) {
            console.log('publication', publication)
          }
        }

        console.log('done.')
        numFixed++
      }
    })
    console.log(`fixed ${numFixed} finish!`)
  }).then(() => {
    process.exit()
  }).catch(e => {
    console.log(e)
    process.exit(1)
  })
