require('@orbiting/backend-modules-env').config()

import moment from 'moment'
import Promise from 'bluebird'
import _debug from 'debug'
import visit from 'unist-util-visit'
import { v4 } from 'uuid'
import { URL } from 'url'

import { ConnectionContext } from '@orbiting/backend-modules-types'
const {
  lib: { ConnectionContext },
} = require('@orbiting/backend-modules-base')
const {
  parse: mdastParse,
  stringify: mdastStringify,
} = require('@republik/remark-preset')

const { maybeDeclareMilestonePublished } = require('../lib/postgres')

const debug = _debug('publikator:script:extractRecommendations')

const applicationName = 'backends publikator script extractRecommendations'

const author = { name: 'Publikator Bot', email: 'tech@republik.ch' }

const handleBatch = async (rows: any[], count: number, pgdb: any) => {
  debug('handleBatch begin. rows: %i', rows?.length)

  await Promise.mapSeries(rows, async (row) => {
    const { repoId, archivedAt } = row
    debug(
      'repoId: %s (%s)',
      repoId,
      `https://publikator.republik.ch/repo/${repoId}/tree`,
    )

    if (archivedAt) {
      debug('repo archived. done')
      console.log(
        'repo archived',
        repoId,
        `https://publikator.republik.ch/repo/${repoId}/tree`,
      )
      return
    }

    const publication = await pgdb.publikator.milestones.findOne({
      repoId,
      scope: 'publication',
      'publishedAt !=': null,
      revokedAt: null,
    })
    debug('publication: %s', publication?.id)

    const isPublished = !!publication
    debug('isPublished: %o', isPublished)

    const publicationCommit =
      isPublished &&
      (await pgdb.publikator.commits.findOne({ id: publication.commitId }))
    debug('publicationCommit: %s', publicationCommit?.id)

    const latestCommit = await pgdb.publikator.commits.findOne(
      { repoId },
      { orderBy: { createdAt: 'DESC' }, limit: 1 },
    )
    debug('latestCommit: %s', latestCommit?.id)

    const hasMetaRecommendations = !!latestCommit?.meta?.recommendations
    debug('hasMetaRecommendations: %o', hasMetaRecommendations)
    if (hasMetaRecommendations) {
      debug('meta.recommendations present. done')
      console.log(
        'meta.recommendations present',
        repoId,
        `https://publikator.republik.ch/repo/${repoId}/tree`,
      )
      return
    }

    const workingCommit = publicationCommit || latestCommit
    debug('workingCommit: %s', workingCommit?.id)

    const { content, meta } = workingCommit

    if (meta.template === 'dossier') {
      debug('meta.template is "dossier". done')
      console.log(
        'meta.template is "dossier"',
        repoId,
        `https://publikator.republik.ch/repo/${repoId}/tree`,
      )
      return
    }

    if (meta.template === 'editorialNewsletter') {
      debug('meta.template is "editorialNewsletter". done')
      console.log(
        'meta.template is "editorialNewsletter"',
        repoId,
        `https://publikator.republik.ch/repo/${repoId}/tree`,
      )
      return
    }

    const mdast = { ...mdastParse(content), meta }
    const articleCollections: any = []

    visit(mdast, 'zone', (node: any, index: number, parent: any) => {
      if (node?.identifier === 'ARTICLECOLLECTION') {
        const parentChildrenLength = parent.children.length

        debug('parent.children.length: %i', parent.children.length)

        if (parentChildrenLength < 7) {
          console.log(
            'parent.children.length smaller than 7',
            repoId,
            `https://publikator.republik.ch/repo/${repoId}/tree`,
          )
        }

        if (parent.identifier !== 'CENTER') {
          throw new Error('parent.identifier !== CENTER')
        }

        const urls: string[] = []
        visit(node, 'zone', (node: any) => {
          if (node?.identifier === 'TEASER') {
            if (
              !node.data?.url &&
              node?.children?.find((child: any) => child.depth === 1)?.children
                .length
            ) {
              debug('missing url on TEASER')
              console.log(
                'missing url on TEASER',
                repoId,
                `https://publikator.republik.ch/repo/${repoId}/tree`,
              )
            }

            if (node.data?.url) {
              const parsedUrl = new URL(node.data.url)
              parsedUrl.searchParams.forEach((_, name) => {
                parsedUrl.searchParams.delete(name)
              })
              urls.push(parsedUrl.toString())
            }
          }
        })

        const ref = v4()
        node.ref = ref

        articleCollections.push({
          index,
          node,
          parentChildrenLength,
          ref,
          urls,
        })
      }
    })

    const hasArticleCollection = !!articleCollections.length
    debug('hasArticleCollection: %o', hasArticleCollection)
    if (!hasArticleCollection) {
      debug('no ARTICLECOLLECTION zone found. done')
      console.log(
        'no ARTICLECOLLECTION zone found',
        repoId,
        `https://publikator.republik.ch/repo/${repoId}/tree`,
      )
      return
    }

    const recommendations: any = []

    articleCollections
      .reverse()
      .forEach((articleCollection: any, index: number) => {
        if (!recommendations.length) {
          recommendations.unshift(articleCollection)
          return
        }

        if (
          articleCollections[index - 1]?.index ===
          articleCollection.index + 1
        ) {
          debug(
            'using multiple ARTICLECOLLECTION zones as recommendations. done',
          )
          console.log(
            'using multiple ARTICLECOLLECTION zones as recommendation',
            repoId,
            `https://publikator.republik.ch/repo/${repoId}/tree`,
          )
          recommendations.unshift(articleCollection)
          return
        }

        console.log(
          'ignoring some ARTICLECOLLECTION',
          repoId,
          `https://publikator.republik.ch/repo/${repoId}/tree`,
        )
      })

    if (!recommendations.length) {
      debug('no recommendations. done')
      console.log(
        'no recommendations',
        repoId,
        `https://publikator.republik.ch/repo/${repoId}/tree`,
      )
      return
    }

    const refs = recommendations.map((node: any) => node.ref)

    visit(mdast, 'zone', (node: any, index: number, parent: any) => {
      if (node?.identifier === 'ARTICLECOLLECTION' && refs.includes(node.ref)) {
        // unwrap into parent children
        parent.children = [
          ...parent.children.slice(0, index),
          ...parent.children.slice(index + 1),
        ]

        // revisit entry index again as children may contain an IF block
        return index
      }
    })

    mdast.meta = {}
    const markdown = mdastStringify(mdast)

    const tx = await pgdb.transactionBegin()
    debug('transaction begin')

    try {
      const commit = await tx.publikator.commits.insertAndGet({
        repoId,
        content: markdown,
        meta: {
          ...meta,
          recommendations: recommendations
            .map((recommendation: any) => recommendation.urls)
            .flat()
            .filter(Boolean),
        },
        message: 'Artikelsammlung in Meta-Block',
        author,
        ...(workingCommit && { parentIds: [workingCommit.id] }),
        createdAt: moment(workingCommit.createdAt).add(1, 'second'),
      })
      debug('inserted commit: %s', commit.id)
      console.log(
        'inserted commit',
        repoId,
        `https://publikator.republik.ch/repo/${repoId}/tree`,
      )

      if (isPublished) {
        const latestDerivative = await tx.publikator.derivatives.findOne(
          {
            commitId: workingCommit.id,
            status: 'Ready',
          },
          { orderBy: { readyAt: 'DESC' }, limit: 1 },
        )

        if (latestDerivative) {
          delete latestDerivative.id
          const derivative = await tx.publikator.derivatives.insertAndGet({
            ...latestDerivative,
            commitId: commit.id,
          })
          debug('inserted derivative: %s', derivative.id)
          console.log(
            'inserted derivative',
            repoId,
            `https://publikator.republik.ch/repo/${repoId}/tree`,
          )
        }

        const now = moment()
        const versionName = `v${+publication.name.replace(/\D/g, '') + 1}`
        const milestone = await tx.publikator.milestones.insertAndGet({
          repoId,
          commitId: commit.id,
          name: versionName,
          meta: { script: 'extractRecommendations' },
          author,
          scope: 'publication',
          scheduledAt: now,
          publishedAt: now,
        })
        debug('inserted milestone: %s (%s)', milestone.id, versionName)

        await maybeDeclareMilestonePublished(milestone, tx)

        console.log(
          'inserted milestone',
          repoId,
          `https://publikator.republik.ch/repo/${repoId}/tree`,
        )
      }

      await tx.transactionCommit()

      debug('transaction committed')
    } catch (e: any) {
      await tx.transactionRollback()
      debug('transaction rollback: %s', e?.message)
      throw e
    }
  })

  debug('handleBatch done. %i rows processed', count)
}

ConnectionContext.create(applicationName)
  .then(async (context: ConnectionContext) => {
    const { pgdb } = context

    debug('Begin')

    await pgdb
      .queryInBatches(
        { handleFn: handleBatch, size: 10 },
        `SELECT id "repoId", "archivedAt"
        FROM publikator.repos
        ORDER BY RANDOM()
        `,
      )
      .catch((e: Error) => {
        debug('Error while queryInBatches: %s', e.message)
        console.error(e)
      })

    debug('Done')

    return context
  })
  .then((context: ConnectionContext) => ConnectionContext.close(context))
  .finally(() => process.exit())
