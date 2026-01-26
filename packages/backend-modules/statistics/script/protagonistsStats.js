#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const { Client } = require('@elastic/elasticsearch')

const yargs = require('yargs')

const ELASTIC_NODE =
  process.env.ELASTIC_URL || 'http://elastic:elastic@localhost:9200'

const elastic = new Client({
  node: ELASTIC_NODE,
})

const OLLAMA_API_URL =
  process.env.OLLAMA_API_URL || 'http://localhost:11434/api/chat'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2-vision:11b'
const ELASTIC_INDEX = 'republik-document-read'

function getPrompt(content) {
  return `
The following text is an article in an online medium. I want to find out who the named protagonists and experts mentioned
in the articles are and what their presumed genders are, because I want to do an analysis of the gender balance in the articles
of that medium. Please only include named people. Make a list of JSON objects with who the protagonists and cited experts are,
and what you assume to be their genders. Use male, female, non-binary, not applicable, or unknown for gender.
Respond in a JSON object of the shape \`\`\`{ protagonists: [ { name: "name of the person", assumed_gender: "assumed gender
of the person" }]} \`\`\`

This is the article: ${content}
`
}

/*
 * Use for sending a prompt to an Ollama LLM model for each article in the specified timeframe, to find out an articles protagonists and their gender.
 * Modify the prompt, elastic query filter, and expected JSON object shape from the LLM as needed.
 * Limit: max number of articles, default is 10
 * begin, end: start and end date of published articles in the format '2025-12-31'
 * Usage example: node protagonistsStats.js --limit 100 --begin 2025-01-01 --end 2025-02-01
 */

function getStats(llmReponse) {
  const responseObject = JSON.parse(llmReponse)
  const genders = responseObject.protagonists.map((p) => p.assumed_gender)
  const stats = genders.reduce(function (prev, cur) {
    prev[cur] = (prev[cur] || 0) + 1
    return prev
  }, {})
  stats.total = genders.length
  return stats
}

async function main(argv) {
  const limit = argv.limit
  const beginDate = argv.begin
  const endDate = argv.end

  const query = {
    query: {
      bool: {
        filter: [
          {
            range: {
              'meta.publishDate': {
                gte: beginDate, // + interval, // 1M = Last 1 Month
                lte: endDate,
              },
            },
          },
          {
            term: {
              'meta.template': 'article',
            },
          },
          {
            term: {
              '__state.published': {
                value: true,
              },
            },
          },
        ],
        must_not: [
          {
            prefix: {
              'meta.repoId': 'republik/bab',
            },
          },
          {
            prefix: {
              'meta.repoId': 'republik/wdwww',
            },
          },
        ],
      },
    },
    script_fields: {
      content_string_field: {
        script: {
          lang: 'painless',
          source: "return params['_source']['contentString'];",
        },
      },
      repo_id_field: {
        script: {
          lang: 'painless',
          source: "return params['_source']['meta']['repoId'];",
        },
      },
      publish_date_field: {
        script: {
          lang: 'painless',
          source: "return params['_source']['meta']['publishDate'];",
        },
      },
    },
    _source: false,
    size: limit,
  }

  let documentsContent = []
  try {
    console.log('Querying elastic...')
    const response = await elastic.search({
      index: ELASTIC_INDEX,
      body: query,
    })

    if (response.hits?.hits) {
      documentsContent = response.hits.hits
        .map((hit) => {
          if (hit.fields?.content_string_field?.[0]) {
            const publishedAt = hit.fields.publish_date_field[0]
            const repoId = hit.fields.repo_id_field[0]
            const content = hit.fields.content_string_field[0]
            return { publishedAt, repoId, content }
          }
          return null
        })
        .filter((content) => content !== null)
      console.log(
        `Retrieved ${documentsContent.length} documents from Elasticsearch.`,
      )
    } else {
      console.log('No documents found.')
      return
    }
  } catch (error) {
    console.error('Error querying Elasticsearch:', error)
    return
  }

  // process with ollama
  console.log(
    `Sending ${documentsContent.length} documents to ollama using the model ${OLLAMA_MODEL}...`,
  )

  const results = []
  const statsOnly = []

  for (const { publishedAt, repoId, content } of documentsContent) {
    const prompt = getPrompt(content)
    try {
      console.log(`Sending prompt for ${repoId}...`)
      const requestBody = {
        model: OLLAMA_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant designed to output JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        stream: false, // immediate answer
        format: {
          type: 'object',
          properties: {
            protagonists: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                  },
                  assumed_gender: {
                    type: 'string',
                  },
                },
                required: ['name', 'assumed_gender'],
              },
            },
          },
          required: ['protagonists'],
        },
        options: {
          num_ctx: 8192,
          seed: 5,
          temperature: 0.3,
          top_k: 40,
          top_p: 0.9,
        },
      }

      const response = await fetch(OLLAMA_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        let errorBodyText
        try {
          errorBodyText = await response.text()
        } catch (e) {
          console.log('Failed to read error body from Ollama response', e)
        }
        throw new Error(
          `Ollama API request failed with status ${response.status}: ${errorBodyText}`,
        )
      }

      const data = await response.json()

      if (data?.message?.content) {
        const stats = getStats(data.message.content)
        results.push({
          publishedAt: publishedAt,
          repoId: repoId,
          ollamaResponse: JSON.parse(data.message.content),
          stats: stats,
        })
        statsOnly.push({
          publishedAt: publishedAt,
          repoId: repoId,
          male: stats.male || 0,
          female: stats.female || 0,
          total: stats.total || 0,
        })
      } else {
        console.log('Ollama response data was empty or malformed.')
        results.push({
          repoId: repoId,
          ollamaResponse: '',
          error: 'Empty or malformed Ollama response data',
        })
      }
    } catch (error) {
      console.error(`Error calling Ollama for document: ${error.message}`)
      results.push({
        repoId: repoId,
        ollamaResponse: '',
        error: error.message,
      })
    }
  }

  // print result (saving to a csv directly would probably be better)
  console.log('-----------------')

  console.log(JSON.stringify(results))

  console.log('-----------------')

  console.log(JSON.stringify(statsOnly))

  console.log('-----------------')

  const male = results.map((r) => r.stats?.male || 0).reduce((a, b) => a + b, 0)
  const female = results
    .map((r) => r.stats?.female || 0)
    .reduce((a, b) => a + b, 0)
  const protagonists = results
    .map((r) => r.stats?.total || 0)
    .reduce((a, b) => a + b, 0)

  console.log(
    `total: ${results.length} documents, ${protagonists} protagonists, ${male} male, ${female} female`,
  )

  console.log('-----------------')

  console.log('Done.')
}

const argv = yargs
  .option('begin', {
    alias: 'b',
    type: 'string',
  })
  .option('end', {
    alias: 'e',
    type: 'string',
  })
  .option('limit', {
    alias: 'l',
    type: 'number',
    default: 10,
  }).argv

main(argv)
