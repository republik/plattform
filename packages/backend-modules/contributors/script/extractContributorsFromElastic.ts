#!/usr/bin/env node
import yargs from 'yargs'

import * as fs from 'fs'
import slugify from 'slugify'
import { Client } from '@elastic/elasticsearch'
import env from '@orbiting/backend-modules-env'
import {
  Contributor,
  ElasticContributor,
  ElasticContributorKind,
  RawContributor,
  RepoData,
} from '../types'
env.config()

const ELASTIC_NODE =
  process.env.ELASTIC_URL || 'http://elastic:elastic@localhost:9200'

const elastic = new Client({
  node: ELASTIC_NODE,
})

const ES_INDEX_PREFIX = process.env.ES_INDEX_PREFIX || 'republik'

type ElasticHit = {
  _index: string
  _type: string
  _id: string
  _score: number
  _source: {
    meta: {
      repoId: string
      publishDate: Date
      creditsString: string
      contributors: ElasticContributor[]
    }
  }
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

slugify.extend({
  ä: 'ae',
  ö: 'oe',
  ü: 'ue',
  '.': '',
})

function modifiedSlugify(text: string) {
  return slugify(text.toLowerCase())
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

function convertRepoDataToContributorsList(
  repoContributors: RepoData[],
): RawContributor[] {
  return repoContributors.flatMap((repo) =>
    repo.contributors.map((c) => {
      const contributor: RawContributor = { name: c.name }
      if (c.userId) {
        contributor.user_id = c.userId
      }
      return contributor
    }),
  )
}

function deduplicateNamesAndSlugs(
  rawContributors: RawContributor[],
): Contributor[] {
  const contributorMap = new Map<string, Contributor>()
  const usedSlugs = new Set<string>()

  for (const contributor of rawContributors) {
    const name = contributor.name
    const existingContributor = contributorMap.get(name)

    const baseSlug = modifiedSlugify(name)
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

async function queryElastic(query: any): Promise<RepoData[] | undefined> {
  let repoContributors: RepoData[] = []
  try {
    console.log(`Querying elastic on ${ELASTIC_NODE}`)

    const response = await elastic.search({
      index: ES_INDEX_PREFIX + '-document-read',
      _source: [
        'meta.contributors',
        'meta.repoId',
        'meta.publishDate',
        'meta.creditsString',
      ],
      body: query,
    })

    if (response.body.hits && response.body.hits.hits) {
      repoContributors = response.body.hits.hits.map((hit: ElasticHit) => {
        if (hit._source?.meta) {
          const repo: RepoData = {
            contributors: hit._source.meta.contributors,
            repoId: hit._source.meta.repoId,
            publishDate: hit._source.meta.publishDate,
            creditsString: hit._source.meta.creditsString,
          }
          return repo
        }
        return null
      })
      console.log(
        `Retrieved ${repoContributors.length} documents from Elasticsearch.`,
      )
    } else {
      console.error('No documents found.')
      return
    }
  } catch (e) {
    console.error('Error while querying elastic: ', e)
  }
  return repoContributors
}

/*
* This script fetches contributors from elastic from published documents in the given time and saves them to json files.
* It logs contributors that should be manually checked and maybe adapted, it also saves to them to the check-[filename].json file
* To run this script, either use node-ts or run the js version of this file: 
* ❯ node build/script/extractContributorsFromElastic.js --begin 2024-01-01 --end 2024-12-31 --limit 100 --filename test
*/
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
  const rawContributors: RawContributor[] =
    convertRepoDataToContributorsList(repoData)

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

  // contributor kinds
  const contributorKinds: Set<ElasticContributorKind> = new Set(
    repoData.flatMap((repo: any) =>
      repo.contributors.flatMap((c: ElasticContributor) => c.kind),
    ),
  )
  console.log(JSON.stringify([...contributorKinds]))

  const contributorsFileName = argv.filename
    ? `${argv.filename}.json`
    : `contributors-${Date.now()}.json`

  try {
    await fs.writeFile(
      contributorsFileName,
      JSON.stringify(contributors, null, 2),
      'utf8',
      (error) => {
        if (error) {
          console.error(`Error while writing ${contributorsFileName}`)
        }
      },
    )

    console.log(`successfully saved to ${contributorsFileName}`)

    await fs.writeFile(
      `check-${contributorsFileName}`,
      JSON.stringify(toBeChecked, null, 2),
      'utf8',
      (error) => {
        if (error) {
          console.error(`Error while writing check-${contributorsFileName}`)
        }
      },
    )
    console.log(`successfully saved to check-${contributorsFileName}`)

    await fs.writeFile(
      `repos-${contributorsFileName}`,
      JSON.stringify(repoData, null, 2),
      'utf8',
      (error) => {
        if (error) {
          console.error(`Error while writing repos-${contributorsFileName}`)
        }
      },
    )
    console.log(`successfully saved to repos-${contributorsFileName}`)
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

if (require.main === module) {
  main(argv)
}

export const extractContributorsFromElasticFunctions = {
  generateUniqueSlug,
  slugIsNumbered,
  containsShortSequence,
  containsSpecialCharacters,
  convertRepoDataToContributorsList,
  deduplicateNamesAndSlugs,
}
