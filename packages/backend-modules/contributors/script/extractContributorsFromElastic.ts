#!/usr/bin/env node
import yargs from 'yargs'

import * as fs from 'fs'

import { Client } from '@elastic/elasticsearch'
import env from '@orbiting/backend-modules-env'
import { slugify } from '@orbiting/backend-modules-utils'
import { Contributor } from '../types'
env.config()

const ELASTIC_NODE =
  process.env.ELASTIC_URL || 'http://elastic:elastic@localhost:9200'

const elastic = new Client({
  node: ELASTIC_NODE,
})

const ES_INDEX_PREFIX = process.env.ES_INDEX_PREFIX || 'republik'

type ElasticContributorKind = string

type ElasticContributor = {
  kind?: ElasticContributorKind
  name: string
  userId?: string
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

type ElasticRepoData = {
  repoId: string
  publishDate: Date
  creditsString: string
  contributors: ElasticContributor[]
}

type RawContributor = {
  name: string
  user_id?: string
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

function convertRepoDataToContributorsList(creditData: ElasticRepoData[]): RawContributor[] {
  return creditData.flatMap((credit) =>
    credit.contributors.map((c) => {
      const contributor: RawContributor = { name: c.name }
      if (c.userId) {
        contributor.user_id = c.userId
      }
      return contributor
    }),
  )
}

function deduplicateNamesAndSlugs(rawContributors: RawContributor[]): Contributor[] {
  const contributorMap = new Map<string, Contributor>()
  const usedSlugs = new Set<string>()

  for (const contributor of rawContributors) {
    const name = contributor.name
    const existingContributor = contributorMap.get(name)

    const baseSlug = slugify(name)
    let finalSlug: string

    // Check if the slug has already been used
    if (!usedSlugs.has(baseSlug)) {
      finalSlug = baseSlug
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

  return Array.from(contributorMap.values())
}

async function queryElastic(query: any) {
  let elasticData: ElasticRepoData[] = []
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
      elasticData = response.body.hits.hits.map((hit: ElasticHit) => {
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
        `Retrieved ${elasticData.length} documents from Elasticsearch.`,
      )
      /* const contributorKinds: Set<ElasticContributorKind> = new Set(
        creditData.flatMap((credit: any) =>
          credit.contributors.flatMap((c: ElasticContributor) => c.kind),
        ), 
      )
      console.log(contributorKinds) */
    } else {
      console.error('No documents found.')
      return
    }
  } catch (e) {
    console.error('Error while querying elastic: ', e)
  }
  return elasticData
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


  const repoData = await queryElastic(query)

  if (!repoData) {
    return
  }
  
  // convert to correct format
  const rawContributors: RawContributor[] = convertRepoDataToContributorsList(repoData)

  // deduplicate names and slugs
  const contributors: Contributor[] = deduplicateNamesAndSlugs(rawContributors)

  // check for weird stuff that should be looked at manually
  const toBeChecked = contributors.filter(
    (c) =>
      containsShortSequence(c.name) ||
      slugIsNumbered(c.slug) ||
      containsSpecialCharacters(c.name),
  )

  // store as json
  console.log('to be checked:')
  console.log(toBeChecked)

  const contributorsFileName = argv.filename
    ? `${argv.filename}.json`
    : `contributors-${Date.now()}.json`

  try {
    fs.writeFileSync(
      contributorsFileName,
      JSON.stringify(contributors, null, 2),
      'utf8',
    )
    console.log(`successfully saved to ${contributorsFileName}`)

    fs.writeFileSync(
      `check-${contributorsFileName}`,
      JSON.stringify(toBeChecked, null, 2),
      'utf8',
    )
    console.log(`successfully saved to check-${contributorsFileName}`)
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
  })
  .option('filename', {
    alias: 'f',
    type: 'string',
  }).argv

main(argv)
