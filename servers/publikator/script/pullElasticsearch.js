require('@orbiting/backend-modules-env').config()

const redis = require('@orbiting/backend-modules-base/lib/redis')
const PgDb = require('@orbiting/backend-modules-base/lib/pgdb')
const elasticsearch = require('elasticsearch')

const mdastToString = require('mdast-util-to-string')
const {
  graphql: { resolvers: {
    queries: {
      documents: getDocuments
    }
  }},
  lib: { meta: { getStaticMeta } }
} = require('@orbiting/backend-modules-documents')
const util = require('util')

const elastic = new elasticsearch.Client({
  host: 'localhost:9200'
  // log: 'trace'
})

const INDEX = 'documents'

PgDb.connect().then(async pgdb => {
  await elastic.ping({
    requestTimeout: 1000
  })

  await elastic.indices.delete({
    index: INDEX,
    ignoreUnavailable: true
  })

  await elastic.indices.create({
    index: INDEX,
    body: documentIndex
  })

  const context = {
    redis,
    pgdb,
    user: {
      name: 'publikator-pullredis',
      email: 'ruggedly@republik.ch',
      roles: [ 'editor' ]
    }
  }
  // if no arguments are given, getDocuments returns all
  const documents = await getDocuments(null, {}, context)
    .then(docs => docs.nodes
      .map(d => {
        /* if(d.content.meta.path !== '/2018/01/19/daniels-testserien-master') {
          return null
        }
        */
        const content = d.content
        const meta = {
          ...d.content.meta,
          ...getStaticMeta(d)
        }
        // const content = Document.content(d, {}, context)
        // const meta = Document.meta(d, {}, context)
        const seriesMaster = typeof meta.series === 'string'
          ? meta.series
          : null
        const series = typeof meta.series === 'object'
          ? meta.series
          : null
        if (series) {
          series.episodes.forEach(e => {
            if (e.publishDate === '') {
              e.publishDate = null
            }
          })
        }
        return {
          id: d.id,
          body: {
            meta: {
              ...meta,
              repoId: `https://github.com/${d.repoId}`,
              series,
              seriesMaster,
              authors: meta.credits && meta.credits
                .filter(c => c.type === 'link')
                .map(a => a.children[0].value)
            },
            contentString: mdastToString(content),
            content
          }
        }
      })
      .filter(d => d !== null)
    )

  for (let doc of documents) {
    console.log(doc.body.meta.path, doc.body.meta.title)
    console.log(util.inspect(doc.body.meta, {depth: null}))
    console.log('--------------------------------')
    await elastic.create({
      index: INDEX,
      type: 'document',
      ...doc
    })
  }
}
).then(() => {
  process.exit()
}).catch(e => {
  console.log(e)
  process.exit(1)
})

const keywordPartial = {
  fields: {
    keyword: {
      type: 'keyword',
      ignore_above: 256
    }
  }
}
const documentIndex = {
  aliases: {},
  mappings: {
    document: {
      properties: {
        contentString: {
          type: 'text'
        },
        content: {
          type: 'object',
          dynamic: false,
          enabled: false
        },
        meta: {
          properties: {
            title: {
              type: 'text'
            },
            description: {
              type: 'text'
            },
            publishDate: {
              type: 'date'
            },
            repoId: {
              type: 'keyword'
            },
            slug: {
              type: 'text',
              ...keywordPartial
            },
            path: {
              type: 'text',
              ...keywordPartial
            },
            feed: {
              type: 'boolean'
            },
            authors: {
              type: 'text',
              ...keywordPartial
            },
            dossier: {
              type: 'keyword'
            },
            format: {
              type: 'keyword'
            },
            kind: {
              type: 'keyword'
            },
            template: {
              type: 'keyword'
            },
            discussionId: {
              type: 'keyword'
            },
            seriesMaster: {
              type: 'keyword'
            },
            series: {
              properties: {
                episodes: {
                  properties: {
                    document: {
                      type: 'keyword'
                    },
                    image: {
                      type: 'keyword'
                    },
                    label: {
                      type: 'text',
                      ...keywordPartial
                    },
                    publishDate: {
                      type: 'date'
                    },
                    title: {
                      type: 'text',
                      ...keywordPartial
                    }
                  }
                },
                title: {
                  type: 'text',
                  ...keywordPartial
                }
              }
            },
            audioSource: {
              properties: {
                mp3: {
                  type: 'keyword'
                },
                aac: {
                  type: 'keyword'
                },
                ogg: {
                  type: 'keyword'
                }
              }
            },
            color: {
              type: 'keyword'
            }
          }
        }
      }
    }
  }
}
