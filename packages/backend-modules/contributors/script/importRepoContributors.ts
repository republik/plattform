#!/usr/bin/env node
import { PgDb } from '@orbiting/backend-modules-base/lib'
import { Client } from '@elastic/elasticsearch'

import env from '@orbiting/backend-modules-env'
env.config()

import {
  ContributionKind,
  ContributorRow,
  ElasticContributor,
  RepoContributor,
  RepoData,
} from '../types'
import { ContributorsRepo } from '../lib/ContributorsRepo'
import { normalizeContributionKind } from './normalizeContributionKind'
import yargs from 'yargs'

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

type Args = {
  limit: number
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

function maybeFindContributor(
  dbContributors: ContributorRow[],
  contributor: ElasticContributor,
): { dbContributor?: ContributorRow; toCheck?: boolean } {
  // try to find by exact name
  const nameMatches = dbContributors.filter(
    (dbContributor) => dbContributor.name === contributor.name,
  )
  if (nameMatches.length === 1) {
    // one found
    const dbContributor = nameMatches[0]
    // check if userIDs match
    if (isUserIdsMismatch(dbContributor.user_id, contributor.userId)) {
      return { dbContributor, toCheck: true }
    }
    return { dbContributor }
  } else if (nameMatches.length > 1) {
    // more than one found, try to match by userId, otherwise undefined
    if (contributor.userId) {
      const userIdMatch = findByUserId(nameMatches, contributor.userId)
      return { dbContributor: userIdMatch }
    }
    return { toCheck: true }
  } else {
    // none found, try to find by approximate name
    const approxMatches = dbContributors.filter((dbContributor) =>
      contributor.name.includes(dbContributor.name),
    )
    if (approxMatches.length === 1) {
      // approximate name finds a single contributor
      return { dbContributor: approxMatches[0], toCheck: true }
    } else if (approxMatches.length > 1) {
      if (contributor.userId) {
        const userIdMatch = findByUserId(approxMatches, contributor.userId)
        // check if userIds don't match
        const toCheck = isUserIdsMismatch(
          contributor.userId,
          userIdMatch?.user_id,
        )
        return { dbContributor: userIdMatch, toCheck }
      }
    }
  }
  return { toCheck: true }
}

function findByUserId(nameMatches: ContributorRow[], userId: string) {
  return nameMatches.find((c) => c.user_id === userId)
}

function isUserIdsMismatch(userId1?: string, userId2?: string): boolean {
  return !!userId1 && !!userId2 && userId1 !== userId2
}

/*  
* Import repoContributors from elastic into DB. Contributors must already exist in DB for this to work.
* This script takes all repos that don't yet have contributors associated, 
* fetches the credits and contributors from elastic and tries to find the matching contributors in the DB by name.
* To run this script, either use node-ts or run the js version of this file: 
* ❯ node build/script/importRepoContributors.js --limit 100
*/
async function main(args: Args) {
  const pgdb = await PgDb.connect({
    applicationName: 'Import repoContributors',
  })
  const dbRepo = new ContributorsRepo(pgdb)

  // fetch all repos which have no contributors in the table
  const emptyRepos = await dbRepo.getReposWithoutContributors()

  if (!emptyRepos?.length) {
    console.log(
      'All repos have associated contributors. Nothing to do, exiting',
    )
    return
  }

  // fetch those repos from elastic
  const query = {
    query: {
      bool: {
        filter: [
          {
            term: {
              '__state.published': true,
            },
          },
          {
            terms: {
              'meta.repoId': emptyRepos,
            },
          },
        ],
      },
    },
    size: args.limit
  }
  const repoData: RepoData[] | undefined = await queryElastic(query)

  if (!repoData?.length) {
    console.log(
      'No documents on elastic found for repos without contributors in DB:',
    )
    console.log(emptyRepos)
    return
  }

  const dbContributors: ContributorRow[] = await dbRepo.findAllContributors()

  // look up contributor names, guess (and flag) where no exact matches are found
  const repoContributors: RepoContributor[] = []
  const reposToCheck: {
    repoData: RepoData
    contributorToCheck: ElasticContributor
    dbContributor?: ContributorRow
  }[] = []
  repoData.forEach((repo) => {
    repo.contributors.forEach((contributor) => {
      // find contributor
      const { dbContributor, toCheck } = maybeFindContributor(
        dbContributors,
        contributor,
      )

      // needs to be checked manually
      if (toCheck) {
        reposToCheck.push({
          repoData: repo,
          contributorToCheck: contributor,
          dbContributor,
        })
      }

      // normalize contribution kind
      const kinds: ContributionKind[] = normalizeContributionKind(
        contributor.kind,
      )

      if (dbContributor) {
        // add one repoContribution for each kind (some can be "text and audio" or similar)
        // add the elastic kind as display text
        kinds.forEach((kind) => {
          const repoContributorToInsert: RepoContributor = {
            contributorId: dbContributor.id,
            repoId: repo.repoId,
            kind: kind,
            displayText: contributor.kind,
          }
          repoContributors.push(repoContributorToInsert)
        })
      }
    })
  })

  // insert records
  const inserted = await dbRepo.insertRepoContributors(repoContributors)
  console.log(`Inserted ${inserted.length} repoContributors`)

  console.log(`Entries to check: `)
  console.log(reposToCheck)

  await PgDb.disconnect(pgdb)
}

if (require.main === module) {
  const args = yargs.option('limit', {
      alias: 'l',
      type: 'number',
      default: 20000,
      description: 'Limit number of repos to be fetched from elastic',
    }).argv as Args
  main(args)
}

