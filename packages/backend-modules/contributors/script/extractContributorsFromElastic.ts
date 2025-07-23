#!/usr/bin/env node
import yargs from 'yargs'

import * as fs from 'fs'

import { Client } from '@elastic/elasticsearch'
import env from '@orbiting/backend-modules-env'
import { slugify } from '@orbiting/backend-modules-utils'
env.config()

const ELASTIC_NODE = process.env.ELASTIC_URL || 'http://elastic:elastic@localhost:9200'

const elastic = new Client({
  node: ELASTIC_NODE,
})

const ES_INDEX_PREFIX = process.env.ES_INDEX_PREFIX || 'republik'

type ElasticContributorKind =
  | 'Text'
  | 'voice'
  | 'Illustration'
  | 'Translation'
  | 'Photos'
  | 'Bilder'
  | string

type ElasticContributor = {
  kind?: ElasticContributorKind
  name: string
  userId?: string
}

type Contributor = {
  name: string
  slug: string
  bio?: string
  image?: string
  prolitteris_id?: string
  prolitteris_first_name?: string
  prolitteris_last_name?: string
  gender?: 'm' | 'f' | 'd' | 'na'
  user_id?: string
}

type ElasticHit = {
  _index: string
  _type: string
  _id: string
  _score: number
  _source: {
    meta: {
      repoId: string
      credits?: {
        children: unknown[]
        type: 'mdast' | null
      }
      publishDate: Date
      creditsString: string
      contributors: ElasticContributor[]
    }
  }
}

type CreditData = {
  repoId: string
  publishDate: Date
  creditsString: string
  contributors: ElasticContributor[]
}

function generateUniqueSlug(
  baseSlug: string,
  existingSlugs: Set<string>,
): string {
  let uniqueSlug = baseSlug
  let counter = 1
  while (existingSlugs.has(uniqueSlug)) {
    uniqueSlug = `${baseSlug}-${counter}`
    counter++
  }
  return uniqueSlug
}

function slugIsNumbered(text: string): boolean {
  const numberedRegex = /-(\d+)$/i
  return numberedRegex.test(text)
}

function containsShortSequence(text: string): boolean {
  const words = text.split(/[^\p{L}\p{N}]+/u).filter((word) => word.length > 0)
  return words.some((word) => word.length >= 1 && word.length <= 3)
}

function containsSpecialCharacters(text: string): boolean {
  const specialCharRegex = /[^\p{L}\p{N}\s-]/u
  return specialCharRegex.test(text)
}

async function main(argv: any) {
  // get contributors from elastic
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
              '__state.published': {
                value: true,
              },
            },
          },
        ],
      },
    },
    _source: false,
    size: limit,
  }

  let creditData: CreditData[] = []

  try {
    console.log(`Querying elastic on ${ELASTIC_NODE}`)

    const response = await elastic.search({
      index: ES_INDEX_PREFIX + '-document-read',
      _source: [
        'meta.repoId',
        'meta.contributors',
        'meta.publishDate',
        'meta.creditsString',
      ],
      body: query,
    })

    if (response.body.hits && response.body.hits.hits) {
      creditData = response.body.hits.hits.map((hit: ElasticHit) => {
        if (hit._source?.meta) {
          const repoId = hit._source.meta.repoId
          const publishDate = hit._source.meta.publishDate
          const creditsString = hit._source.meta.creditsString
          const contributors = hit._source.meta.contributors
          return { repoId, publishDate, creditsString, contributors }
        }
        return null
      })
      console.log(
        `Retrieved ${creditData.length} documents from Elasticsearch.`,
      )
      /* const contributorKinds: Set<ElasticContributorKind> = new Set(
        creditData.flatMap((credit: any) =>
          credit.contributors.flatMap((c: ElasticContributor) => c.kind),
        ), 
      )
      console.log(contributorKinds) */
    } else {
      console.log('No documents found.')
      return
    }
  } catch (e) {
    console.error('Error while querying elastic: ', e)
  }

  // convert to correct format
  const rawContributors: Contributor[] = creditData.flatMap((credit) =>
    credit.contributors.map((c) => {
      const contributor: Contributor = { name: c.name, slug: slugify(c.name) }
      if (c.userId) {
        contributor.user_id = c.userId
      }
      return contributor
    }),
  )

  // deduplicate names and slugs
  const contributorMap = new Map<string, Contributor>()
  const usedSlugs = new Set<string>()

  for (const contributor of rawContributors) {
    const name = contributor.name
    const existingContributor = contributorMap.get(name)

    const baseSlug = slugify(name)

    let finalSlug: string

    // Check if the input contributor already has a slug and if it's unique
    if (contributor.slug && !usedSlugs.has(contributor.slug)) {
      finalSlug = contributor.slug
    } else {
      // Generate a unique slug based on the base slug
      finalSlug = generateUniqueSlug(baseSlug, usedSlugs)
    }

    // check if contributor with that name already exists, if necessary add userId
    if (existingContributor) {
      if (contributor.user_id && !existingContributor.user_id) {
        existingContributor.user_id = contributor.user_id
      }
      usedSlugs.add(finalSlug)
    } else {
      contributorMap.set(name, {
        name: name,
        slug: finalSlug,
        user_id: contributor.user_id,
      })
      usedSlugs.add(finalSlug)
    }
  }

  const contributors = Array.from(contributorMap.values())

  // check for weird stuff that should be looked at manually
  const toBeChecked = contributors.filter(
    (c) =>
      containsShortSequence(c.name) ||
      slugIsNumbered(c.slug) ||
      containsSpecialCharacters(c.name),
  )

  // store as json
  console.log('to be checked:')
  console.log(JSON.stringify(toBeChecked))

  const time = Date.now()

  const constributorFileName = `contributors-${time}.json`
  const toBeCheckedFileName = `check-${time}.json`

  try {
    fs.writeFileSync(
      constributorFileName,
      JSON.stringify(contributors, null, 2),
      'utf8',
    )
    console.log(`successfully saved to ${constributorFileName}`)

    fs.writeFileSync(
      toBeCheckedFileName,
      JSON.stringify(toBeChecked, null, 2),
      'utf8',
    )
    console.log(`successfully saved to ${toBeCheckedFileName}`)
  } catch (error) {
    console.error(`Error saving data: ${error}`)
  }
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
