#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const visit = require('unist-util-visit')
const isUuid = require('is-uuid')
const { csvFormat } = require('d3-dsv')

const Elasticsearch = require('@orbiting/backend-modules-base/lib/Elasticsearch')
const { getIndexAlias } = require('@orbiting/backend-modules-search/lib/utils')
const { mdastToString } = require('@orbiting/backend-modules-utils')

const elastic = Elasticsearch.connect()

const run = async () => {
  const params = {
    index: getIndexAlias('document', 'read'),
    scroll: '5s',
    size: 100,
    _source: ['meta', 'content'],
    body: {
      query: { term: { '__state.published': true } }
    }
  }

  const faultyLinks = []

  for await (const hit of Elasticsearch.scroll(elastic, params)) {
    const { meta, content } = hit._source

    visit(content, 'zone', node => {
      if (node.identifier === 'TITLE') {
        const credits = node.children.filter(n => n.type === 'paragraph')[1]

        if (credits && credits.children) {
          credits.children
            .filter(c => c.type === 'link')
            .forEach(link => {
              const isTooShort = !link.url || link.url.length < 3
              const handle = link.url.match(/\/~(.+)/)
              const maybeProfile = !!handle
              const maybeUserId = !!handle && isUuid.v4(handle[1])

              const error =
                (isTooShort && 'Link leer oder zu kurz') ||
                (maybeProfile && !maybeUserId && 'Link ungültige Profil-URL')

              if (error) {
                faultyLinks.push({
                  republikUrl: `https://www.republik.ch${meta.path}`,
                  publikatorUrl: `https://publikator.republik.ch/repo/${meta.repoId}/tree`,
                  string: mdastToString(link),
                  url: link.url,
                  error
                })
              }
            })
        }
      }
    })
  }

  await elastic.close()

  console.log(csvFormat(faultyLinks))
}

run().catch(e => { throw e })
