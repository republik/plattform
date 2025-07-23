#!/usr/bin/env node
import yargs from 'yargs'
import * as fs from 'fs'
import { PgDb } from '@orbiting/backend-modules-base/lib'

import { ContributorsRepo } from '../lib/ContributorsRepo'
import { Contributor } from '../types'

import env from '@orbiting/backend-modules-env'
env.config()

interface Args {
  file: string;
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
  const contributors = loadFile(filename)

  // load profile data from db
  const userIds = contributors
    .map((c) => c.user_id)
    .filter((id) => !!id) as string[]

  const pgdb = await PgDb.connect({
    applicationName: 'Import script for contributors',
  })
  const repo = new ContributorsRepo(pgdb)
  const userRows = await repo.findUsersById(userIds)

  if (userRows?.length) {
    const userMap = new Map(userRows.map((user) => [user.id, user]))

    contributors.forEach((c) => {
      if (userRows && c.user_id) {
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
  const inserted = await repo.insertContributors(contributors)
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
