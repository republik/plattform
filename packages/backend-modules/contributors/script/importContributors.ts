#!/usr/bin/env node
import yargs from 'yargs'
import * as fs from 'fs'
import { PgDb } from '@orbiting/backend-modules-base/lib'
import { slugify } from '@orbiting/backend-modules-utils'

import { ContributorsRepo } from '../lib/ContributorsRepo'
import { Contributor } from '../types'

import env from '@orbiting/backend-modules-env'
env.config()

interface Args {
  file: string
}

function loadFile(path: string): Contributor[] {
  try {
    const content = fs.readFileSync(path, 'utf8')

    const contributors: Contributor[] = JSON.parse(content)
    console.log(`${contributors.length} contributors successfully loaded`)
    return contributors
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.error(`Error: File "${path}" not found`)
    } else {
      console.error(`Error loading data: ${error}`)
    }
    throw error
  }
}

async function main(argv: Args) {
  const filename = argv.file
  const contributors: Contributor[] = loadFile(filename)

  const pgdb = await PgDb.connect({
    applicationName: 'Import script for contributors',
  })
  const repo = new ContributorsRepo(pgdb)

  const userIds = contributors
    .map((c) => c.user_id)
    .filter((id) => !!id) as string[]

  // find existing contributors
  const contributorNames = contributors.map((c) => c.name)
  const contributorsinDb = await repo.findContributorsByName(contributorNames)

  let newContributors: Contributor[]
  let contributorsToPossiblyUpdate: Contributor[]

  if (contributorsinDb?.length) {
    const namesInDb = contributorsinDb.map((c) => c.name)
    newContributors = contributors.filter((c) => !namesInDb.includes(c.name))

    // find existing contributors but with missing userId, where the same name with a userID exsists now
    contributorsToPossiblyUpdate = contributors.filter(
      (c) =>
        c.user_id &&
        !!contributorsinDb.find((cdb) => cdb.name === c.name && !cdb.user_id),
    )
  } else {
    newContributors = contributors
    contributorsToPossiblyUpdate = []
  }

  // log contributors which might need an update
  console.log(
    `there are ${contributorsToPossiblyUpdate.length} contributors in the DB that might be possible to connect with userIds:`,
  )
  console.log(JSON.stringify(contributorsToPossiblyUpdate))

  if (!newContributors?.length) {
    console.log('No new contributors to update, not doing anything')
    await PgDb.disconnect(pgdb)
    return
  }

  // load profile data from db

  const userRows = await repo.findUsersById(userIds)

  if (userRows?.length) {
    const userMap = new Map(userRows.map((user) => [user.id, user]))

    newContributors.forEach((c) => {
      if (c.user_id) {
        const user = userMap.get(c.user_id)

        if (!user) {
          console.log(`no user found for id ${c.user_id}, name ${c.name}`)
          c.user_id = undefined
          return
        }

        // profile info
        c.bio = user.biography || undefined
        c.image = user.portraitUrl || undefined
        c.prolitteris_id = user.prolitterisId || undefined
        c.prolitteris_first_name = user.firstName
        c.prolitteris_last_name = user.lastName

        // also get genders from google sheet?
        if (user.gender) {
          switch (user.gender) {
            case 'weiblich':
              c.gender = 'f'
              break
            case 'männlich':
              c.gender = 'm'
              break
            default:
              c.gender = 'd'
          }
        }
      }
    })
  }

  // insert into db

  // check and update slugs
  const newSlugs = newContributors.map((c) => c.slug)
  const slugsToUpdate = await repo.findExistingSlugs(newSlugs)
  if (slugsToUpdate?.length) {
    contributors
      .filter((c) => slugsToUpdate.includes(c.slug))
      .forEach(async (c) => {
        const baseSlug = slugify(c.name)
        const newSlug = await repo.findUniqueSlug(baseSlug)
        c.slug = newSlug
      })
  }

  const inserted = await repo.insertContributors(newContributors)
  console.log(`successfully inserted ${inserted.length} contributors`)

  await PgDb.disconnect(pgdb)
}

const argv = yargs.option('file', {
  alias: 'f',
  type: 'string',
  demandOption: true,
  description: 'Path to the contributors JSON file',
}).argv as Args

main(argv)
