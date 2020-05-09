#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

/**
 * Script prints csv file to stdout. Data is based on GraphQL query:
 *
 */

const visit = require('unist-util-visit')
const { csvFormat } = require('d3-dsv')
const moment = require('moment')

const { lib: { ConnectionContext } } = require('@orbiting/backend-modules-base')
const { mdastToString } = require('@orbiting/backend-modules-utils')

const findAuthorIdentifiers = children => {
  const identifiers = new Set()

  visit(
    { children },
    'link',
    ({ url }) => {
      const match = url.match(/^\/~(.+)/)

      if (match) {
        identifiers.add(match[1])
      }
    }
  )

  return Array.from(identifiers)
}

ConnectionContext.create('backends statistics publicationData').then(async connections => {
  const { pgdb } = connections

  /*
  {
    documents(first: 10000) {
      totalCount
      nodes {
        content
        meta {
          publishDate
          lastPublishedAt
          title
          description
          format {
            meta {
              title
            }
            repoId
          }
          linkedDiscussion {
            id
            comments {
              totalCount
            }
          }
          ownDiscussion {
            id
            comments {
              totalCount
            }
          }
          credits
        }
        repoId
      }
    }
  }
  */
  const { data: { documents: { nodes: documentsMeta } } } = require('../data/documents-20200509-1000.json')

  const usernames = new Set()

  documentsMeta.forEach(d => {
    d.usernames = findAuthorIdentifiers(d.meta.credits)
    d.usernames.forEach(a => usernames.add(a))
  })

  const users = await pgdb.public.users.find(
    { username: Array.from(usernames) },
    { fields: ['id', 'username', 'firstName', 'lastName'] }
  )

  const comments = await pgdb.public.comments.find({ userId: users.map(u => u.id) },
    { fields: ['discussionId', 'userId'] }
  )

  const documents = documentsMeta.map(d => {
    d.users = users.filter(u => d.usernames.includes(u.username))
    d.discussion =
      (d.meta.linkedDiscussion && d.meta.linkedDiscussion.id) ||
      (d.meta.ownDiscussion && d.meta.ownDiscussion.id)

    return {
      publishDate: moment(d.meta.publishDate).format('DD.MM.YYYY'),
      lastPublishedAt: moment(d.meta.lastPublishedAt).format('DD.MM.YYYY'),
      repoId: d.repoId,
      title: d.meta.title,
      description: d.meta.description,
      credits: mdastToString({ children: d.meta.credits }),
      formatRepoId: d.meta.format && d.meta.format.repoId,
      format: d.meta.format && d.meta.format.meta.title,
      linkedAuthors: d.users.map(u => `${u.firstName} ${u.lastName}`).join(', '),
      linkedAuthorComments: comments.filter(c => c.discussionId === d.discussion && d.users.map(u => u.id).includes(c.userId)).length
    }
  })

  console.log(csvFormat(documents.filter(Boolean)))

  await ConnectionContext.close(connections)
})
